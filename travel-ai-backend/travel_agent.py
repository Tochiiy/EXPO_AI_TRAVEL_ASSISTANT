import os
import requests
import json
from typing import TypedDict, Annotated, List, Literal
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

# STATE AND SCHEMA DEFINITION ---
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

class TravelDetails(BaseModel):
    origin: str = Field(description="The starting city or airport IATA code (e.g., LHR for London). Return 'Unknown' if not mentioned.")
    destination: str = Field(description="The destination city or airport IATA code (e.g., GRU for Brazil/Sao Paulo). Return 'Unknown' if not mentioned.")
    outbound_date: str = Field(description="The departure date in YYYY-MM-DD format (Assume year is 2026). Return 'Unknown' if not mentioned.")
    return_date: str = Field(description="The return date in YYYY-MM-DD format. Return 'Unknown' if not mentioned.")

smart_agent = Agent_1_llm.with_structured_output(TravelDetails)

# -LIVE FLIGHT TOOL ---
def fetch_live_google_flights(origin: str, dest: str, out_date: str, return_date: str = None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Error: SERPAPI_API_KEY is missing from .env"]

    url = f"https://serpapi.com/search.json?engine=google_flights&departure_id={origin}&arrival_id={dest}&outbound_date={out_date}&currency=USD&hl=en&api_key={api_key}"
    if return_date and return_date.lower() != "unknown":
        url += f"&return_date={return_date}"

    try:
        response = requests.get(url)
        data = response.json()
        best_flights = data.get("best_flights", [])
        if not best_flights:
            return ["No flights found for these dates/routes."]

        formatted_results = []
        for f in best_flights[:3]:
            airline = f.get("flights", [{}])[0].get("airline", "Unknown Airline")
            price = f.get("price", "Price unavailable")
            booking_link = f.get("shareable_url", "https://www.google.com/flights")
            formatted_results.append(f"{airline}: ${price} - [Book Flight]({booking_link})")
        return formatted_results
    except Exception as e:
        return ["Error fetching live flights."]

# -- LIVE HOTEL TOOL ---
def fetch_live_google_hotels(q: str, check_in: str, check_out: str = None):
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        return ["Error: SERPAPI_API_KEY is missing from .env"]

    print(f"🏨 Fetching live hotels for '{q}' from {check_in}...")
    # Using SerpApi's Google Hotels engine
    url = f"https://serpapi.com/search.json?engine=google_hotels&q={q}&check_in_date={check_in}&currency=USD&hl=en&api_key={api_key}"
    if check_out and check_out.lower() != "unknown":
        url += f"&check_out_date={check_out}"

    try:
        response = requests.get(url)
        data = response.json()
        properties = data.get("properties", [])
        if not properties:
            return ["No hotel accommodations found for these specifications."]

        formatted_hotels = []
        # Grab top 3 hotel properties
        for h in properties[:3]:
            name = h.get("name", "Unknown Accommodation")
            rate = h.get("rate_per_night", {}).get("lowest", "Price unavailable")
            hotel_link = h.get("link", "https://www.google.com/travel/hotels")
            formatted_hotels.append(f"{name}: {rate}/night - [View Property & Book]({hotel_link})")
        return formatted_hotels
    except Exception as e:
        print(f"Live hotel fetch error: {e}")
        return ["Error fetching real-time hotel availability."]

# --- 4. NODE DEFINITIONS ---
def client_inquiries_extraction_node(state: TravelState):
    print("\n Scanning and analyzing user conversation...")
    prompt = f"Analyze the conversation and extract the travel origin, destination, and exact dates in YYYY-MM-DD format.\nConversation: {state['messages']}"
    inquiries_data = smart_agent.invoke(prompt)
    return {
        "origin": inquiries_data.origin,
        "destination": inquiries_data.destination, 
        "outbound_date": inquiries_data.outbound_date,
        "return_date": inquiries_data.return_date
    }
def ask_client_node(state: TravelState):
    print("\n🤖 [Agent]: Conversing with client....")
    
    # Grab the actual message the user just typed!
    user_msg = state['messages'][-1].content
    origin = state.get("origin", "Unknown")
    dest = state.get("destination", "Unknown")
    out_date = state.get("outbound_date", "Unknown")

    prompt = f"""
    You are a friendly, conversational travel assistant. 
    The user just said: "{user_msg}"
    
    We are tracking their trip details. Current info: 
    - Origin: {origin}
    - Destination: {dest}
    - Dates: {out_date}
    
    INSTRUCTIONS:
    1. If the user is just saying hello, asking a general question, or making casual conversation, respond naturally to their message FIRST. Then, ask how you can help them plan a trip.
    2. If the user is actively trying to plan a trip but is missing information, ask them specifically for the missing details.
    3. Be warm and helpful. Do NOT make up any travel details.
    """ 
    response = Agent_2_llm.invoke(prompt)
    return {"messages": [AIMessage(content=response.content)]}


def require_approval_node(state: TravelState):
    print("\n🛑 [Security]: User approved. Bypassing pause for the rest of the session.")
    return {}


def flight_search_node(state: TravelState):
    print(f"\n✈️ [Flight Search]: Executing live API call...")
    live_flights = fetch_live_google_flights(
        origin=state.get("origin"),
        dest=state.get("destination"),
        out_date=state.get("outbound_date"),
        return_date=state.get("return_date")
    )
    return {"flight_options": live_flights}

def hotel_search_node(state: TravelState):
    print(f"\n🏨 [Hotel Search]: Executing live API call...")
    # Use the extracted destination property to find localized properties
    live_hotels = fetch_live_google_hotels(
        q=state.get("destination"),
        check_in=state.get("outbound_date"),
        check_out=state.get("return_date")
    )
    return {"hotel_options": live_hotels}

def itinerary_node(state: TravelState):
    print("\n [Analyzer]: Writing the final itinerary...")
    prompt = f"""
    Write a short, comprehensive travel itinerary for {state.get('destination')} from {state.get('outbound_date')} to {state.get('return_date')}.
    
    CRITICAL STRUCTURE REQUIREMENT:
    You MUST output the data using strict markdown with DOUBLE NEWLINES (\n\n) between every section and list item so it formats cleanly.
    
    ### Available Flights
    {state.get('flight_options')}
    
    ### Recommended Accommodations
    {state.get('hotel_options')}
    
    Preserve all Markdown links exactly as provided.
    """
    response = Agent_2_llm.invoke(prompt)
    return {"final_itinerary": response.content, "messages": [AIMessage(content=response.content)]}

def logical_router_after_inquires(state: TravelState) -> Literal["ask_client", "flights"]:
    origin = state.get("origin", "").strip().lower()
    dest = state.get("destination", "").strip().lower()
    out_date = state.get("outbound_date", "").strip().lower()
    missing_words = ["unknown", "unspecified", "none", "null", ""]

    if origin in missing_words or dest in missing_words or out_date in missing_words:
        return "ask_client"
    
    if not state.get("user_approved"):
        print("\n [Router]: First-time search detected. Pausing for user approval.")
        return "require_approval"
    print("\n [Router]: Session already approved! Bypassing directly to live search.")
    return "flights"

# --- 5. BUILD THE CONNECTED GRAPH ---
builder = StateGraph(TravelState)
builder.add_node("inquires", client_inquiries_extraction_node)
builder.add_node("ask_client", ask_client_node)
builder.add_node("require_approval", require_approval_node) 
builder.add_node("flights", flight_search_node)
builder.add_node("hotels", hotel_search_node)
builder.add_node("itinerary", itinerary_node)

builder.add_edge(START, "inquires")

#  The Conditional Router
builder.add_conditional_edges(
    "inquires", 
    logical_router_after_inquires,
    {
        "ask_client": "ask_client",
        "require_approval": "require_approval",
        "flights": "flights"
    }
)

builder.add_edge("ask_client", END)

# Connect the approval node to the flight search!
builder.add_edge("require_approval", "flights")

builder.add_edge("flights", "hotels")
builder.add_edge("hotels", "itinerary")
builder.add_edge("itinerary", END)

memory = MemorySaver()

# Ensure it pauses at require_approval!
travel_app = builder.compile(checkpointer=memory, interrupt_before=["require_approval"])