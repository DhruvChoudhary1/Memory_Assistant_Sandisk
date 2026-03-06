import os
import traceback
from typing import List, Optional
from google import genai
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# --- Load .env file ---
load_dotenv()

# --- Configuration ---
class Settings(BaseSettings):
    GEMINI_API_KEY: str
    MODEL_NAME: str = "gemini-flash-latest"

settings = Settings()
print("Loaded GEMINI_API_KEY:", settings.GEMINI_API_KEY)

# --- Initialization ---
try:
    if settings.GEMINI_API_KEY:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        # Debugging: verify connectivity
        # models = client.models.list()  # Uncomment if you want to list models
        print(f"Connected. Target Model: {settings.MODEL_NAME}")
    else:
        print("Warning: GEMINI_API_KEY not found.")
        client = None
except Exception as e:
    print(f"Initialization Error: {e}")
    client = None

# --- Core Logic ---

def _fallback_answer(query: str, memories: List[str]) -> str:
    """
    Provides a graceful exit if the API is down or memories are missing.
    """
    if not memories:
        return (
            f"I couldn't find any stored memories related to '{query}'. "
            "Try adding some context first."
        )
    
    joined = "\n- ".join(memories[:3])
    return (
        "Note: I'm currently in offline mode. Based on your records, I found:\n"
        f"{joined}\n\nDoes this help answer your question?"
    )

def generate_answer(query: str, raw_memories: List[str]) -> str:
    """
    Generates a response using Gemini 3.1 Flash based on retrieved context.
    """
    if not client:
        return _fallback_answer(query, raw_memories)

    # 1. Context Preparation (RAG)
    # In a real app, 'raw_memories' would come from a Vector DB search
    context_text = "\n".join([f"• {m}" for m in raw_memories[:10]])
    
    # 2. Define the Persona & Task
    system_instr = (
        "You are a helpful Personal Memory Assistant. Your goal is to answer "
        "questions using ONLY the provided memories. If the answer isn't in the "
        "memories, say you don't know—do not hallucinate facts."
    )

    # 3. Execution
    try:
        response = client.models.generate_content(
            model=settings.MODEL_NAME,
            config={
                "system_instruction": system_instr,
                "temperature": 0.3, # Lower temperature for factual accuracy
            },
            contents=f"User Question: {query}\n\nRelevant Memories:\n{context_text}"
        )

        if response.text:
            return response.text
        
        return "I processed the request, but couldn't generate a text response."

    except Exception as e:
        print(f"\n[Gemini API Error]\n{e}")
        # traceback.print_exc() # Uncomment for deep debugging
        return _fallback_answer(query, raw_memories)

# --- Execution Example ---
if __name__ == "__main__":
    # Mock data that would normally come from your database
    user_query = "Where did I leave my spare house keys?"
    retrieved_memories = [
        "I put the spare keys in the blue ceramic jar on the kitchen counter on Oct 12.",
        "The kitchen was remodeled last year.",
        "I gave a set of keys to neighbor Sarah for emergencies."
    ]

    result = generate_answer(user_query, retrieved_memories)
    
    print("-" * 30)
    print(f"QUERY: {user_query}")
    print(f"AI RESPONSE:\n{result}")
    print("-" * 30)