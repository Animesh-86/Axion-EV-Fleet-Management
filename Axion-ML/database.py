import os
from sqlalchemy import create_engine, Column, String, Float, Integer, DateTime
from sqlalchemy.orm import declarative_base, sessionmaker

raw_url = os.getenv("AXION_TSDB_URL", "postgresql://axion:password@localhost:5433/axion_ts")
if raw_url.startswith("jdbc:"):
    raw_url = raw_url.replace("jdbc:", "")

if raw_url.startswith("postgresql://"):
    raw_url = raw_url.replace("postgresql://", "postgresql+psycopg2://")

SQLALCHEMY_DATABASE_URL = raw_url

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class TelemetryHistory(Base):
    __tablename__ = "telemetry_history"

    time = Column(DateTime(timezone=True), primary_key=True)
    vehicle_id = Column(String(50), primary_key=True)
    battery_soc = Column(Float)
    battery_temp = Column(Float)
    motor_temp = Column(Float)
    speed = Column(Float)
    health_score = Column(Integer)
    health_state = Column(String(20))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
