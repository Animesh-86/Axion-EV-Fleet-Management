import os
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest, RandomForestRegressor
import xgboost as xgb

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

BATTERY_MODEL_PATH = os.path.join(MODEL_DIR, "battery_depletion.pkl")
TEMP_MODEL_PATH = os.path.join(MODEL_DIR, "temp_anomaly.pkl")
PEAK_TEMP_MODEL_PATH = os.path.join(MODEL_DIR, "peak_temp.pkl")

class MLPredictionService:
    def __init__(self):
        self.battery_model = None
        self.temp_anomaly_model = None
        self.peak_temp_model = None
        self._load_or_initialize_models()

    def _load_or_initialize_models(self):
        """Loads models from disk if present, otherwise trains default starting heuristic models."""
        try:
            if os.path.exists(BATTERY_MODEL_PATH):
                self.battery_model = joblib.load(BATTERY_MODEL_PATH)
            else:
                self._train_default_battery_model()

            if os.path.exists(TEMP_MODEL_PATH) and os.path.exists(PEAK_TEMP_MODEL_PATH):
                self.temp_anomaly_model = joblib.load(TEMP_MODEL_PATH)
                self.peak_temp_model = joblib.load(PEAK_TEMP_MODEL_PATH)
            else:
                self._train_default_temp_models()
        except Exception as e:
            print(f"Error loading models, initializing defaults: {e}")
            self._train_default_battery_model()
            self._train_default_temp_models()

    def _train_default_battery_model(self):
        """Trains a baseline XGBoost regressor using synthesized physical expectations."""
        # Features: drain_rate (% per hour), speed (km/h), temp (C)
        # Target: hours until 15% SOC remaining
        np.random.seed(42)
        n_samples = 500
        drain_rate = np.random.uniform(2.0, 25.0, n_samples)
        speed = np.random.uniform(0.0, 120.0, n_samples)
        temp = np.random.uniform(10.0, 50.0, n_samples)
        
        # Simple physical approximation: hours = (current_soc - 15) / drain_rate. Assuming average current soc around 70%
        target_hours = (70.0 - 15.0) / drain_rate
        # Add thermal penalty
        target_hours -= (temp - 25.0) * 0.02
        target_hours = np.clip(target_hours, 0.1, 20.0)

        X = pd.DataFrame({"drain_rate": drain_rate, "speed": speed, "temp": temp})
        y = target_hours

        model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1)
        model.fit(X, y)
        self.battery_model = model
        joblib.dump(model, BATTERY_MODEL_PATH)

    def _train_default_temp_models(self):
        """Trains an IsolationForest for anomaly detection and RandomForest for peak temperature prediction."""
        np.random.seed(42)
        n_samples = 500
        # Features: recent_temp_slope (C/min), current_temp (C), ambient_temp (C)
        temp_slope = np.random.normal(0.1, 0.5, n_samples)
        current_temp = np.random.normal(35.0, 8.0, n_samples)
        ambient_temp = np.random.normal(25.0, 5.0, n_samples)

        X = pd.DataFrame({
            "temp_slope": temp_slope,
            "current_temp": current_temp,
            "ambient_temp": ambient_temp
        })

        # Isolation Forest for anomalies
        iso_forest = IsolationForest(contamination=0.1, random_state=42)
        iso_forest.fit(X)
        self.temp_anomaly_model = iso_forest
        joblib.dump(iso_forest, TEMP_MODEL_PATH)

        # Random Forest for peak temp prediction
        # Heuristic target: current + slope * 30 mins + random variance
        peak_targets = current_temp + np.maximum(0, temp_slope) * 30.0 + np.random.normal(2.0, 1.0, n_samples)
        rf_regressor = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
        rf_regressor.fit(X, peak_targets)
        self.peak_temp_model = rf_regressor
        joblib.dump(rf_regressor, PEAK_TEMP_MODEL_PATH)

    def predict_battery_depletion(self, current_soc: float, records: pd.DataFrame) -> dict:
        """Predicts remaining hours until SOC reaches 15%."""
        if records.empty or len(records) < 2:
            # Fallback heuristic if insufficient history
            drain_rate = 5.0  # default 5% per hour
            speed = 45.0
            temp = 30.0
            confidence = 0.60
        else:
            records = records.sort_values("time")
            # Calculate actual drain rate over history
            soc_diff = records["battery_soc"].iloc[0] - records["battery_soc"].iloc[-1]
            time_diff_hours = (records["time"].iloc[-1] - records["time"].iloc[0]).total_seconds() / 3600.0
            drain_rate = soc_diff / time_diff_hours if time_diff_hours > 0 else 5.0
            drain_rate = max(0.5, min(drain_rate, 50.0))
            speed = records["speed"].mean()
            temp = records["battery_temp"].mean()
            # More data points yield higher prediction confidence
            confidence = min(0.95, 0.60 + len(records) * 0.02)

        if current_soc <= 15.0:
            return {"predictedDepletionHours": 0.0, "confidence": confidence}

        X_input = pd.DataFrame({
            "drain_rate": [drain_rate],
            "speed": [speed],
            "temp": [temp]
        })
        
        base_hours = float(self.battery_model.predict(X_input)[0])
        # Scale remaining hours dynamically based on actual current SOC versus the standard 70% model baseline
        scale_factor = (current_soc - 15.0) / (70.0 - 15.0)
        predicted_hours = max(0.1, round(base_hours * scale_factor, 2))

        return {
            "predictedDepletionHours": predicted_hours,
            "confidence": round(confidence, 2)
        }

    def predict_temperature_anomaly(self, records: pd.DataFrame, ambient_temp: float = 25.0) -> dict:
        """Predicts risk level of thermal runaway and future peak temperature."""
        if records.empty or len(records) < 2:
            current_temp = 35.0
            temp_slope = 0.05
        else:
            records = records.sort_values("time")
            current_temp = records["battery_temp"].iloc[-1]
            temp_diff = records["battery_temp"].iloc[-1] - records["battery_temp"].iloc[0]
            time_diff_min = (records["time"].iloc[-1] - records["time"].iloc[0]).total_seconds() / 60.0
            temp_slope = temp_diff / time_diff_min if time_diff_min > 0 else 0.05

        X_input = pd.DataFrame({
            "temp_slope": [temp_slope],
            "current_temp": [current_temp],
            "ambient_temp": [ambient_temp]
        })

        # Isolation forest returns -1 for anomaly, 1 for normal
        anomaly_pred = self.temp_anomaly_model.predict(X_input)[0]
        # Also score function gives negative values for anomalies
        anomaly_score = self.temp_anomaly_model.score_samples(X_input)[0]

        predicted_peak = float(self.peak_temp_model.predict(X_input)[0])
        predicted_peak = round(max(current_temp, predicted_peak), 1)

        # Classify risk mapping based on score and current temp/slope
        if anomaly_pred == -1 or current_temp > 50.0 or temp_slope > 1.0:
            risk = "HIGH"
        elif current_temp > 42.0 or temp_slope > 0.4:
            risk = "MEDIUM"
        else:
            risk = "LOW"

        return {
            "anomalyRisk": risk,
            "predictedPeakC": predicted_peak
        }

    def retrain_models(self, full_telemetry_df: pd.DataFrame) -> dict:
        """Retrains machine learning weights based on live database extracts."""
        if len(full_telemetry_df) < 50:
            return {"status": "skipped", "reason": "Insufficient overall dataset size for robust offline retraining."}
            
        # Group by vehicle to calculate robust sample trajectories
        battery_data = []
        temp_data = []

        for v_id, group in full_telemetry_df.groupby("vehicle_id"):
            group = group.sort_values("time")
            if len(group) < 5:
                continue
            
            socs = group["battery_soc"].values
            temps = group["battery_temp"].values
            speeds = group["speed"].values
            times = pd.to_datetime(group["time"])

            # Compute features over sub-windows
            for i in range(len(group) - 5):
                window = group.iloc[i:i+5]
                dt_hours = (window["time"].iloc[-1] - window["time"].iloc[0]).total_seconds() / 3600.0
                if dt_hours <= 0:
                    continue
                drain = (window["battery_soc"].iloc[0] - window["battery_soc"].iloc[-1]) / dt_hours
                if drain > 0:
                    battery_data.append({
                        "drain_rate": drain,
                        "speed": window["speed"].mean(),
                        "temp": window["battery_temp"].mean(),
                        "target_hours": max(0.1, (window["battery_soc"].iloc[-1] - 15.0) / drain)
                    })

                dt_min = dt_hours * 60.0
                slope = (window["battery_temp"].iloc[-1] - window["battery_temp"].iloc[0]) / dt_min
                temp_data.append({
                    "temp_slope": slope,
                    "current_temp": window["battery_temp"].iloc[-1],
                    "ambient_temp": 25.0, # default ambient assumption
                    "target_peak": window["battery_temp"].max() + max(0, slope) * 15.0
                })

        if len(battery_data) > 20:
            b_df = pd.DataFrame(battery_data)
            model = xgb.XGBRegressor(n_estimators=100, max_depth=4, learning_rate=0.1)
            model.fit(b_df[["drain_rate", "speed", "temp"]], b_df["target_hours"])
            self.battery_model = model
            joblib.dump(model, BATTERY_MODEL_PATH)

        if len(temp_data) > 20:
            t_df = pd.DataFrame(temp_data)
            X_t = t_df[["temp_slope", "current_temp", "ambient_temp"]]
            iso = IsolationForest(contamination=0.1, random_state=42)
            iso.fit(X_t)
            self.temp_anomaly_model = iso
            joblib.dump(iso, TEMP_MODEL_PATH)

            rf = RandomForestRegressor(n_estimators=50, max_depth=5, random_state=42)
            rf.fit(X_t, t_df["target_peak"])
            self.peak_temp_model = rf
            joblib.dump(rf, PEAK_TEMP_MODEL_PATH)

        return {"status": "success", "samples_processed": len(full_telemetry_df)}

ml_service = MLPredictionService()
