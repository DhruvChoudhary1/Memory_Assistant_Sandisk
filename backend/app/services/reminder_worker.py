# Background task to check for due reminders and send emails
import time
from datetime import datetime
from app.db.database import SessionLocal
from app.db.models import Memory
from app.services.email_service import send_reminder_email
import threading

def reminder_worker():
    while True:
        db = SessionLocal()
        try:
            now = datetime.utcnow()
            # Find memories with due reminders
            due = db.query(Memory).filter(
                Memory.reminder_time != None,
                Memory.reminder_email != None,
                Memory.reminder_time <= now
            ).all()
            for mem in due:
                # Send email
                send_reminder_email(
                    mem.reminder_email,
                    'Memory Reminder',
                    f'Reminder for your memory: "{mem.text}"'
                )
                # Remove reminder so it is not sent again
                mem.reminder_time = None
                db.commit()
        finally:
            db.close()
        time.sleep(60)  # Check every minute

def start_reminder_thread():
    t = threading.Thread(target=reminder_worker, daemon=True)
    t.start()
