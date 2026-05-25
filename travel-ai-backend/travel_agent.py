import os
import requests
from typing import TypedDict, Annotated, List, Optional, Literal
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, AIMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()

from llm_config import open_llm, cerebras_llm

Agent_1_llm = cerebras_llm(temperature=0.0)
Agent_2_llm = open_llm(temperature=0.7)


# ---------------- STATE ----------------
class TravelState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    origin: Optional[str]
    destination: Optional[str]
    outbound_date: Optional[str]
    return_date: Optional[str]
    flight_options: List[str]
    hotel_options: List[str]
    final_itinerary: Optional[str]
    user_approved: bool
    is_travel_request: Optional[bool]


# ---------------- SCHEMAS ----------------
class TravelDetails(BaseModel):
    origin: str = "Unknown"
    destination: str = "Unknown"
    outbound_date: str = "Unknown"
    return_date: str = "Unknown"


class TravelIntent(BaseModel):
    is_travel_request: bool = False


smart_agent = Agent_1_llm.with_structured_output(TravelDetails)
intent_agent = Agent_1_llm.with_structured_output(TravelIntent)


# ---------------- SAFE API TOOLS ----------------
def fetch_live_google_flights(origin: str, dest: str, out_date: str, return_date: str = None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Missing SERPAPI_API_KEY"]

    if not origin or not dest or not out_date:
        return ["Incomplete travel details for flight search"]

    url = (
        f"https://serpapi.com/search.json?engine=google_flights"
        f"&departure_id={origin}&arrival_id={dest}"
        f"&outbound_date={out_date}&currency=USD&hl=en"
        f"&api_key={api_key}"
    )

    if return_date and return_date.lower() != "unknown":
        url += f"&return_date={return_date}"

    try:
        res = requests.get(url, timeout=10)
        data = res.json()

        flights = data.get("best_flights", [])
        if not flights:
            return ["No flights found"]

        return [
            f"{f.get('flights', [{}])[0].get('airline','Unknown')}: ${f.get('price','N/A')}"
            for f in flights[:3]
        ]

    except Exception as e:
        return [f"Flight API error: {str(e)}"]


def fetch_live_google_hotels(q: str, check_in: str, check_out: str = None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Missing SERPAPI_API_KEY"]

    if not q or not check_in:
        return ["Incomplete hotel search details"]

    url = (
        f"https://serpapi.com/search.json?engine=google_hotels"
        f"&q={q}&check_in_date={check_in}"
        f"&currency=USD&hl=en&api_key={api_key}"
    )

    if check_out and str(check_out).lower() != "unknown":
        url += f"&check_out_date={check_out}"

    try:
        res = requests.get(url, timeout=10)
        data = res.json()

        hotels = data.get("properties", [])
        if not hotels:
            return ["No hotels found"]

        return [
            f"{h.get('name','Hotel')}: {h.get('rate_per_night', {}).get('lowest','N/A')}"
            for h in hotels[:3]
        ]

    except Exception as e:
        return [f"Hotel API error: {str(e)}"]


# ---------------- NODES ----------------
def intent_node(state: TravelState):
    msg = state["messages"][-1].content if state.get("messages") else ""

    result = intent_agent.invoke(
        f"Is this a travel planning request?\nUser: {msg}"
    )

    return {"is_travel_request": result.is_travel_request}


def client_inquiries_extraction_node(state: TravelState):
    msg = state["messages"][-1].content

    data = smart_agent.invoke(
        f"Extract travel info. If missing, return Unknown.\nMessage: {msg}"
    )

    return {
        "origin": data.origin or "Unknown",
        "destination": data.destination or "Unknown",
        "outbound_date": data.outbound_date or "Unknown",
        "return_date": data.return_date or "Unknown",
    }


def ask_client_node(state: TravelState):
    msg = state["messages"][-1].content if state.get("messages") else ""

    prompt = f"""
You are a friendly travel assistant.

User message:
{msg}

If it's casual conversation, respond normally.
Then ask how you can help with travel planning.
"""

    response = Agent_2_llm.invoke(prompt)

    return {"messages": [AIMessage(content=response.content)]}


def flight_search_node(state: TravelState):
    flights = fetch_live_google_flights(
        state.get("origin"),
        state.get("destination"),
        state.get("outbound_date"),
        state.get("return_date"),
    )
    return {"flight_options": flights}


def hotel_search_node(state: TravelState):
    hotels = fetch_live_google_hotels(
        q=state.get("destination"),
        check_in=state.get("outbound_date"),
        check_out=state.get("return_date"),
    )
    return {"hotel_options": hotels}


def itinerary_node(state: TravelState):
    flights = state.get("flight_options") or []
    hotels = state.get("hotel_options") or []

    prompt = f"""
Create a simple travel itinerary.

Flights:
{flights}

Hotels:
{hotels}
"""

    response = Agent_2_llm.invoke(prompt)

    return {
        "final_itinerary": response.content,
        "messages": [AIMessage(content=response.content)],
    }


# ---------------- ROUTERS ----------------
def route_after_intent(state: TravelState) -> Literal["ask_client", "extract"]:
    if not state.get("is_travel_request"):
        return "ask_client"
    return "extract"


def route_after_extraction(state: TravelState) -> Literal["ask_client", "flights"]:

    origin = (state.get("origin") or "").strip().lower()
    dest = (state.get("destination") or "").strip().lower()
    date = (state.get("outbound_date") or "").strip().lower()

    missing = {"unknown", "", "none", "null"}

    if origin in missing or dest in missing or date in missing:
        return "ask_client"

    return "flights"


# ---------------- GRAPH ----------------
builder = StateGraph(TravelState)

builder.add_node("intent", intent_node)
builder.add_node("ask_client", ask_client_node)
builder.add_node("extract", client_inquiries_extraction_node)
builder.add_node("flights", flight_search_node)
builder.add_node("hotels", hotel_search_node)
builder.add_node("itinerary", itinerary_node)

builder.add_edge(START, "intent")

builder.add_conditional_edges(
    "intent",
    route_after_intent,
    {
        "ask_client": "ask_client",
        "extract": "extract",
    },
)

builder.add_conditional_edges(
    "extract",
    route_after_extraction,
    {
        "ask_client": "ask_client",
        "flights": "flights",
    },
)

builder.add_edge("ask_client", END)
builder.add_edge("flights", "hotels")
builder.add_edge("hotels", "itinerary")
builder.add_edge("itinerary", END)


travel_app = builder.compile(checkpointer=MemorySaver())