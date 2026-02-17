from sqlalchemy import create_engine, Column, String, JSON, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DATABASE_URL = "sqlite:///./nexus_evaluations.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class EvaluationRecord(Base):
    __tablename__ = "evaluations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    test_cases = Column(JSON)
    bot_metrics = Column(JSON)
    summaries = Column(JSON)
    leaderboard = Column(JSON)
    winner = Column(String)

class MetricCache(Base):
    __tablename__ = "metric_cache"
    # hash of (query, response, contexts, ground_truth)
    cache_key = Column(String, primary_key=True, index=True)
    metrics = Column(JSON) # stored RAGMetrics data
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)
