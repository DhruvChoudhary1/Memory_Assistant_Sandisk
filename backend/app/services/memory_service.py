from app.services.embedding_service import generate_embedding
from app.vector.faiss_index import add_vector
from app.db.database import SessionLocal
from app.db.models import Memory
from datetime import datetime

def store_memory(text, reminder_time=None, reminder_email=None):
    embedding = generate_embedding(text)
    add_vector(embedding, text)

    db = SessionLocal()
    try:
        memory = Memory(
            text=text,
            created_at=datetime.utcnow(),
            reminder_time=reminder_time,
            reminder_email=reminder_email
        )
        db.add(memory)
        db.commit()
        db.refresh(memory)
        return {"status": "memory stored", "id": memory.id}
    finally:
        db.close()