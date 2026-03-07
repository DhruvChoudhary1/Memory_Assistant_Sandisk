from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.memory_routes import router as memory_router
from app.api.chat_routes import router as chat_router
from app.db.database import init_db
from app.services.reminder_worker import start_reminder_thread

app = FastAPI(title="Memory OS")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # during development allow all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize DB and start reminder thread on startup
@app.on_event("startup")
def on_startup():
    init_db()
    start_reminder_thread()

# Include API routes
app.include_router(memory_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"message": "Memory OS Backend Running"}