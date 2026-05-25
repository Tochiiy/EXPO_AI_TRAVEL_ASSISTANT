import os
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI

load_dotenv()


def get_cerebras(temperature: float = 0.0):
    return ChatOpenAI(
        model="llama3.1-8b", 
        openai_api_base="https://api.cerebras.ai/v1",
        openai_api_key=os.environ.get("CEREBRAS_API_KEY"),
        temperature=temperature
    )


def get_openrouter(temperature: float = 0.7):
    return ChatOpenAI(
        model="openrouter/free", 
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        temperature=temperature,
        default_headers={
            "HTTP-Referer": "https://expo-travelai.vercel.app",
            "X-Title": "ExpoTravel.AI"
        }
    )



def cerebras_llm(temperature: float = 0.0):
    """Feeds Agent 1"""
    return get_cerebras(temperature)

def open_llm(temperature: float = 0.7):
    """Feeds Agent 2"""
    return get_openrouter(temperature)