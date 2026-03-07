
from fastapi import APIRouter, HTTPException
from app.services.memory_service import store_memory
from app.vector.faiss_index import memory_store
from datetime import datetime

router = APIRouter()

@router.post("/memory")
def add_memory(data: dict):
    text = data.get("text", "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")
    reminder_time = data.get("reminder_time")
    reminder_email = data.get("reminder_email")
    # Parse reminder_time if provided
    if reminder_time:
        try:
            reminder_time = datetime.fromisoformat(reminder_time)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid reminder_time format. Use ISO format.")
    else:
        reminder_time = None
    return store_memory(text, reminder_time, reminder_email)


@router.get("/memories")
def get_memories():
    """Return all stored memories for timeline display."""
    return [{"text": m, "timestamp": None} for m in memory_store]