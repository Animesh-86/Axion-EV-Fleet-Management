from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
import pandas as pd
from typing import List
from pydantic import BaseModel

from database import get_db, TelemetryHistory
from ml_service import ml_service

app = FastAPI(
    title="Axion ML Predictive Analytics Service",
    description="Real-time predictive intelligence layer for EV battery depletion and thermal runaway detection using XGBoost and Isolation Forests.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BatteryPredictionResponse(BaseModel):
    predictedDepletionHours: float
    confidence: float

class TemperaturePredictionResponse(BaseModel):
    anomalyRisk: str
    predictedPeakC: float

class FleetRiskItem(BaseModel):
    vehicleId: str
    riskScore: float

class RetrainResponse(BaseModel):
    status: str
    samples_processed: int = 0
    reason: str = ""

@app.get("/ml/v1/predict/{vehicleId}/battery", response_model=BatteryPredictionResponse)
def predict_battery(vehicleId: str, db: Session = Depends(get_db)):
    """Predicts remaining operational hours until battery depletion reaches critical SOC threshold (15%)."""
    # Fetch latest records for this vehicle to extract current SOC and historical trajectory
    records = db.query(TelemetryHistory).filter(TelemetryHistory.vehicle_id == vehicleId).order_by(TelemetryHistory.time.desc()).limit(20).all()
    
    if not records:
        # Provide default heuristic response if database records are not yet present for this specific vehicle
        return BatteryPredictionResponse(predictedDepletionHours=4.5, confidence=0.60)
        
    df = pd.DataFrame([{
        "time": r.time,
        "battery_soc": r.battery_soc,
        "battery_temp": r.battery_temp,
        "speed": r.speed
    } for r in records])

    current_soc = records[0].battery_soc if records[0].battery_soc is not None else 70.0
    res = ml_service.predict_battery_depletion(current_soc=current_soc, records=df)
    return BatteryPredictionResponse(**res)

@app.get("/ml/v1/predict/{vehicleId}/temperature", response_model=TemperaturePredictionResponse)
def predict_temperature(vehicleId: str, db: Session = Depends(get_db)):
    """Detects early stage thermal runaway anomaly risk and forecasts upcoming peak battery temperature."""
    records = db.query(TelemetryHistory).filter(TelemetryHistory.vehicle_id == vehicleId).order_by(TelemetryHistory.time.desc()).limit(20).all()
    
    if not records:
        return TemperaturePredictionResponse(anomalyRisk="LOW", predictedPeakC=38.5)

    df = pd.DataFrame([{
        "time": r.time,
        "battery_temp": r.battery_temp
    } for r in records])

    res = ml_service.predict_temperature_anomaly(records=df)
    return TemperaturePredictionResponse(**res)

@app.get("/ml/v1/fleet/risk-ranking", response_model=List[FleetRiskItem])
def get_fleet_risk_ranking(db: Session = Depends(get_db)):
    """Aggregates all active vehicles across the fleet and returns an ordered list ranked by absolute risk score."""
    latest_per_vehicle = (
        db.query(
            TelemetryHistory.vehicle_id.label("vehicle_id"),
            func.max(TelemetryHistory.time).label("max_time"),
        )
        .group_by(TelemetryHistory.vehicle_id)
        .subquery()
    )

    latest_records = (
        db.query(TelemetryHistory)
        .join(
            latest_per_vehicle,
            (TelemetryHistory.vehicle_id == latest_per_vehicle.c.vehicle_id)
            & (TelemetryHistory.time == latest_per_vehicle.c.max_time),
        )
        .all()
    )

    v_map = {}
    for r in latest_records:
        if r.vehicle_id not in v_map:
            v_map[r.vehicle_id] = r

    if not v_map:
        # Fallback array if table is empty
        return [
            FleetRiskItem(vehicleId="v001", riskScore=0.15),
            FleetRiskItem(vehicleId="v002", riskScore=0.22),
            FleetRiskItem(vehicleId="v003", riskScore=0.08),
        ]

    rankings = []
    for v_id, r in v_map.items():
        # Compute multi-factor continuous risk score mapping:
        # High battery temp, low SOC, critical health states yield higher risk scores
        score = 0.10
        if r.battery_temp and r.battery_temp > 45.0:
            score += 0.40 + (r.battery_temp - 45.0) * 0.05
        elif r.battery_temp and r.battery_temp > 38.0:
            score += 0.20
            
        if r.battery_soc and r.battery_soc < 20.0:
            score += 0.30
        elif r.battery_soc and r.battery_soc < 35.0:
            score += 0.15

        if r.health_state == "CRITICAL":
            score += 0.40
        elif r.health_state == "DEGRADED":
            score += 0.20

        score = min(0.99, round(score, 2))
        rankings.append(FleetRiskItem(vehicleId=v_id, riskScore=score))

    rankings.sort(key=lambda x: x.riskScore, reverse=True)
    return rankings

@app.post("/ml/v1/retrain", response_model=RetrainResponse)
def trigger_retraining(db: Session = Depends(get_db)):
    """Triggers autonomous background retraining of both ML prediction weights on live telemetry dumps."""
    all_records = db.query(TelemetryHistory).order_by(TelemetryHistory.time.desc()).limit(5000).all()
    if not all_records:
        return RetrainResponse(status="skipped", reason="No historical telemetry available in database to perform retraining.")

    df = pd.DataFrame([{
        "vehicle_id": r.vehicle_id,
        "time": r.time,
        "battery_soc": r.battery_soc,
        "battery_temp": r.battery_temp,
        "speed": r.speed
    } for r in all_records])

    res = ml_service.retrain_models(full_telemetry_df=df)
    if res["status"] == "success":
        return RetrainResponse(status="success", samples_processed=res.get("samples_processed", len(df)))
    else:
        return RetrainResponse(status="skipped", reason=res.get("reason", "Unknown reason"))

@app.get("/health")
def health_check():
    return {"status": "UP"}
