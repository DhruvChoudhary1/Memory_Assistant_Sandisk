# SQLAlchemy models for Memory with reminder support
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Memory(Base):
	__tablename__ = 'memories'
	id = Column(Integer, primary_key=True, autoincrement=True)
	text = Column(String, nullable=False)
	created_at = Column(DateTime)
	reminder_time = Column(DateTime, nullable=True)
	reminder_email = Column(String, nullable=True)
