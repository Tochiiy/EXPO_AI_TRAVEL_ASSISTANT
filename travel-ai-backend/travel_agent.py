import os
import requests
from typing import TypedDict, Annotated, List, Literal, Optional
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph.message import add_messages
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver

from llm_config import open_llm, cerebras_llm

load_dotenv()

Agent_1_llm = cerebras_llm(temperature=0.0)
Agent_2_llm = open_llm(temperature=0.7)
# Agent_1 is for structured data extraction (factual, less creative)
# Agent_2 is for client communication and itinerary generation (more creative)



class TravelState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]

    origin: str
    destination: str
    outbound_date: str
    return_date: str

    flight_options: List[str]
    hotel_options: List[str]
    final_itinerary: str

    user_approved: bool
    is_travel_request: bool
# The TravelState holds the entire conversation and extracted travel details.



class TravelDetails(BaseModel):
    origin: str = Field(default="Unknown")
    destination: str = Field(default="Unknown")
    outbound_date: str = Field(default="Unknown")
    return_date: str = Field(default="Unknown")

# The TravelDetails model defines the structured output we want from Agent_1 when extracting travel information from the conversation.
#  It defaults to "Unknown" for any missing details.

class TravelIntent(BaseModel):
    is_travel_request: bool = False

# The TravelIntent model defines the structured output for determining if the user's message is a travel planning request.
#  It defaults to False, meaning if the model is unsure, it will assume it's not a travel request.
smart_agent = Agent_1_llm.with_structured_output(TravelDetails)
intent_agent = Agent_1_llm.with_structured_output(TravelIntent)



def intent_node(state: TravelState):
    messages = state.get("messages", [])
    user_msg = messages[-1].content if messages else ""

    result = intent_agent.invoke(
        f"Is this a travel planning request?\nUser: {user_msg}"
    )

    return {"is_travel_request": result.is_travel_request}
# The intent_node uses the intent_agent to analyze the latest user message and determine if it's a travel planning request. 
# It updates the state with a boolean "is_travel_request" that will guide the flow of the conversation.

def intent_router(state: TravelState) -> Literal["ask_client", "inquires"]:
    if not state.get("is_travel_request"):
        return "ask_client"
    return "inquires"
# The intent_router checks the "is_travel_request" flag in the state. If it's False, it routes to "ask_client" to handle non-travel requests.
# If it's True, it routes to "inquires" to extract travel details and continue with the planning process.

def client_inquiries_extraction_node(state: TravelState):
    messages = state.get("messages", [])
    conversation = "\n".join([m.content for m in messages])

    data = smart_agent.invoke(
        f"""
Extract travel info.

Return Unknown if missing.

Conversation:
{conversation}
"""
    )

    return {
        "origin": data.origin,
        "destination": data.destination,
        "outbound_date": data.outbound_date,
        "return_date": data.return_date,
    }

# The client_inquiries_extraction_node uses the smart_agent to analyze the entire conversation and extract structured travel details (origin, destination, outbound date, return date).
# It updates the state with these details, which will be used in subsequent nodes to search for flights and hotels.



def ask_client_node(state: TravelState):
    messages = state.get("messages", [])
    user_msg = messages[-1].content if messages else ""

    prompt = f"""
You are a travel assistant.

User said:
{user_msg}

If casual, respond naturally.
Then offer help planning travel.
"""

    response = Agent_2_llm.invoke(prompt)

    return {"messages": [AIMessage(content=response.content)]}

# The ask_client_node is triggered when the intent_router determines that the user's message is not a travel request.
# It uses Agent_2 to generate a natural response that offers help with travel planning, and updates the state with this response message. 
# This allows the agent to engage the user and potentially guide them towards making a travel request.


def require_approval_node(state: TravelState):
    print("Waiting for user approval...")
    return {}

# The require_approval_node is a placeholder that simulates waiting for user approval before proceeding with flight searches.
# In a real implementation, this could involve sending a message to the user and waiting for their response before moving forward in the state graph.
def fetch_live_google_flights(origin, dest, out_date, return_date=None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Missing API key"]

    if not origin or not dest or not out_date:
        return ["Missing travel details"]

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

        results = []
        for f in flights[:3]:
            airline = f.get("flights", [{}])[0].get("airline", "Unknown")
            price = f.get("price", "N/A")
            link = f.get("shareable_url", "https://www.google.com/flights")

            results.append(f"{airline}: ${price} - [Book Flight]({link})")

        return results

    except Exception as e:
        return [f"Flight error: {str(e)}"]

# The fetch_live_google_flights function interacts with the SerpAPI to fetch live flight options based on the provided origin, destination, outbound date, and optional return date.
# It constructs the API request, handles the response, and formats the flight options into a list of strings that include the airline, price, and a booking link. 
# If there are any issues (like missing details or API errors), it returns an appropriate message.

def fetch_live_google_hotels(q, check_in, check_out=None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Missing API key"]

    if not q or not check_in:
        return ["Missing hotel details"]

    url = (
        f"https://serpapi.com/search.json?engine=google_hotels"
        f"&q={q}&check_in_date={check_in}"
        f"&currency=USD&hl=en"
        f"&api_key={api_key}"
    )

    if check_out and check_out.lower() != "unknown":
        url += f"&check_out_date={check_out}"

    try:
        res = requests.get(url, timeout=10)
        data = res.json()

        props = data.get("properties", [])
        if not props:
            return ["No hotels found"]

        results = []
        for h in props[:3]:
            name = h.get("name", "Hotel")
            rate = h.get("rate_per_night", {}).get("lowest", "N/A")
            link = h.get("link", "https://www.google.com/travel/hotels")

            results.append(f"{name}: {rate}/night - [Book Hotel]({link})")

        return results

    except Exception as e:
        return [f"Hotel error: {str(e)}"]
# The fetch_live_google_hotels function interacts with the SerpAPI to fetch live hotel options based on the provided query (usually the destination), check-in date, and optional check-out date.
# It constructs the API request, handles the response, and formats the hotel options into a list of strings that include the hotel name, rate per night, and a booking link.
# Similar to the flight function, it also handles errors and missing details gracefully by returning appropriate messages

def flight_search_node(state: TravelState):
    print("Searching flights...")

    return {
        "flight_options": fetch_live_google_flights(
            state.get("origin"),
            state.get("destination"),
            state.get("outbound_date"),
            state.get("return_date"),
        )
    }

# The flight_search_node is responsible for fetching flight options based on the travel details extracted earlier. 
# It calls the fetch_live_google_flights function with the relevant parameters from the state and updates the state with the retrieved flight options. 
# This node is triggered after the user has approved the travel details and is ready to see flight options.


def hotel_search_node(state: TravelState):
    print("Searching hotels...")

    return {
        "hotel_options": fetch_live_google_hotels(
            state.get("destination"),
            state.get("outbound_date"),
            state.get("return_date"),
        )
    }


def itinerary_node(state: TravelState):
    prompt = f"""
Create a short travel itinerary.

Flights:
{state.get('flight_options')}

Hotels:
{state.get('hotel_options')}
"""

    response = Agent_2_llm.invoke(prompt)

    return {
        "final_itinerary": response.content,
        "messages": [AIMessage(content=response.content)],
    }
# The hotel_search_node fetches hotel options based on the destination and travel dates, similar to the flight search node.

def logical_router_after_inquires(state: TravelState) -> Literal[
    "ask_client",
    "require_approval",
    "flights",
]:
    origin = (state.get("origin") or "").strip().lower()
    dest = (state.get("destination") or "").strip().lower()
    date = (state.get("outbound_date") or "").strip().lower()

    missing = {"unknown", "", "none", "null"}

    if origin in missing or dest in missing or date in missing:
        return "ask_client"

    if not state.get("user_approved"):
        return "require_approval"

    return "flights"

# The logical_router_after_inquires checks the extracted travel details for any missing or "unknown" values.
#  If any critical information is missing, it routes back to "ask_client" to clarify with the user.
# If all details are present but the user has not yet approved the travel plan, it routes to "require_approval" to simulate waiting for user confirmation before proceeding to search for flights.

builder = StateGraph(TravelState)

builder.add_node("intent", intent_node)
builder.add_node("ask_client", ask_client_node)
builder.add_node("inquires", client_inquiries_extraction_node)
builder.add_node("require_approval", require_approval_node)
builder.add_node("flights", flight_search_node)
builder.add_node("hotels", hotel_search_node)
builder.add_node("itinerary", itinerary_node)

builder.add_edge(START, "intent")

builder.add_conditional_edges(
    "intent",
    intent_router,
    {
        "ask_client": "ask_client",
        "inquires": "inquires",
    },
)

builder.add_conditional_edges(
    "inquires",
    logical_router_after_inquires,
    {
        "ask_client": "ask_client",
        "require_approval": "require_approval",
        "flights": "flights",
    },
)

builder.add_edge("ask_client", END)
builder.add_edge("require_approval", "flights")
builder.add_edge("flights", "hotels")
builder.add_edge("hotels", "itinerary")
builder.add_edge("itinerary", END)

# The state graph is constructed with nodes representing different stages of the conversation and travel planning process.
# Edges define the flow between these stages, with conditional edges allowing for dynamic routing based on the user's input and the extracted information.

memory = MemorySaver()

travel_app = builder.compile(
    checkpointer=memory,
    interrupt_before=["require_approval"],
)

# The travel_app is the compiled state graph that can be executed with a given TravelState.
# The MemorySaver is used as a checkpointer to save the state of the conversation at each node, allowing for persistence and potential debugging or analysis of the conversation flow.