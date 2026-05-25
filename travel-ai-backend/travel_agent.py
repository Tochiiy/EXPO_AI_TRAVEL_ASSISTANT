import os
import requests
from typing import TypedDict, Annotated, List, Literal, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain_openai import ChatOpenAI
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

load_dotenv()
from llm_config import open_llm, cerebras_llm

Agent_1_llm = cerebras_llm(temperature=0.0)
Agent_2_llm = open_llm(temperature=0.7)

# --- STATE & SCHEMA ---
class TravelState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    origin: Optional[str]
    destination: Optional[str]
    outbound_date: Optional[str]
    return_date: Optional[str]
    flight_options: List[str]
    hotel_options: List[str]
    final_itinerary: str
    user_approved: bool

class TravelDetails(BaseModel):
    origin: str = Field(default="Unknown")
    destination: str = Field(default="Unknown")
    outbound_date: str = Field(default="Unknown")
    return_date: str = Field(default="Unknown")

smart_agent = Agent_1_llm.with_structured_output(TravelDetails)

# --- TOOLS ---
def fetch_live_google_flights(origin: str, dest: str, out_date: str, return_date: str = None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key: return ["Flight search requires API key."]
    url = f"https://serpapi.com/search.json?engine=google_flights&departure_id={origin}&arrival_id={dest}&outbound_date={out_date}&api_key={api_key}"
    if return_date and return_date.lower() != "unknown": url += f"&return_date={return_date}"
    try:
        data = requests.get(url).json()
        best_flights = data.get("best_flights", [])
        return [f"{f.get('flights', [{}])[0].get('airline', 'N/A')}: ${f.get('price', 'N/A')}" for f in best_flights[:3]]
    except: return ["Error fetching flights."]

def fetch_live_google_hotels(q: str, check_in: str):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key: return ["Hotel search requires API key."]
    url = f"https://serpapi.com/search.json?engine=google_hotels&q={q}&check_in_date={check_in}&api_key={api_key}"
    try:
        data = requests.get(url).json()
        props = data.get("properties", [])
        return [f"{h.get('name', 'Hotel')}: {h.get('rate_per_night', {}).get('lowest', 'N/A')}" for h in props[:3]]
    except: return ["Error fetching hotels."]

# --- NODES ---
def client_inquiries_extraction_node(state: TravelState):
    user_msg = state['messages'][-1].content
    # Agent 1 identifies if this is travel-related or just chat
    prompt = f"Analyze: '{user_msg}'. If travel-related, extract origin, destination, dates. If chat, return 'Unknown' for all."
    data = smart_agent.invoke(prompt)
    return {"origin": data.origin, "destination": data.destination, "outbound_date": data.outbound_date, "return_date": data.return_date}

def ask_client_node(state: TravelState):
    
    response = Agent_2_llm.invoke(f"User said: {state['messages'][-1].content}. Keep it friendly.")
    return {"messages": [AIMessage(content=response.content)]}

def flight_search_node(state: TravelState):
    flights = fetch_live_google_flights(state.get("origin", "LHR"), state.get("destination", "AMS"), state.get("outbound_date", "2026-06-01"))
    return {"flight_options": flights}

def hotel_search_node(state: TravelState):
    hotels = fetch_live_google_hotels(state.get("destination", "AMS"), state.get("outbound_date", "2026-06-01"))
    return {"hotel_options": hotels}

def itinerary_node(state: TravelState):
    f = state.get('flight_options') or ["No flights found"]
    h = state.get('hotel_options') or ["No hotels found"]
    prompt = f"Write final itinerary for {state.get('destination')}. Flights: {f}. Hotels: {h}."
    response = Agent_2_llm.invoke(prompt)
    return {"final_itinerary": response.content, "messages": [AIMessage(content=response.content)]}

# --- GRAPH ---
builder = StateGraph(TravelState)
builder.add_node("inquires", client_inquiries_extraction_node)
builder.add_node("ask_client", ask_client_node)
builder.add_node("require_approval", lambda s: {"user_approved": True}) 
builder.add_node("flights", flight_search_node)
builder.add_node("hotels", hotel_search_node)
builder.add_node("itinerary", itinerary_node)

builder.add_edge(START, "inquires")


def router(state: TravelState):
    if state.get("destination") == "Unknown": return "ask_client"
    if not state.get("user_approved"): return "require_approval"
    return "flights"

builder.add_conditional_edges("inquires", router, {"ask_client": "ask_client", "require_approval": "require_approval", "flights": "flights"})
builder.add_edge("ask_client", END)
builder.add_edge("require_approval", "flights")
builder.add_edge("flights", "hotels")
builder.add_edge("hotels", "itinerary")
builder.add_edge("itinerary", END)


memory = MemorySaver()
travel_app = builder.compile(checkpointer=memory)