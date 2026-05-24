import os
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_google_genai import ChatGoogleGenerativeAI

load_dotenv()


def get_cerebras(temperature: float = 0.0):
    """ Direct Cerebras API (Blazing Fast Llama 3)"""
    return ChatOpenAI(
        model="llama3.1-8b", 
        openai_api_base="https://api.cerebras.ai/v1",
        openai_api_key=os.environ.get("CEREBRAS_API_KEY"),
        temperature=temperature
    )

def get_openrouter(temperature: float = 0.7):
    """🟠 OpenRouter API (Ready for Production)"""
    return ChatOpenAI(
        model="openrouter/free", 
        openai_api_base="https://openrouter.ai/api/v1",
        openai_api_key=os.environ.get("OPENAI_API_KEY"),
        temperature=temperature
    )

def get_gemini(temperature: float = 0.7):
    """🔵 Google Gemini API (Ready for Production)"""
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-latest",
        google_api_key=os.environ.get("GOOGLE_API_KEY"),
        temperature=temperature
    )


def cerebras_llm(temperature: float = 0.0):

    return get_cerebras(temperature)

def open_llm(temperature: float = 0.7):

    return get_cerebras(temperature)