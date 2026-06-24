import paho.mqtt.client as mqtt
import time
import json
import random
import threading
from datetime import datetime

import os

BROKER = os.getenv("BROKER_HOST", "localhost")
PORT = 1883
TOPIC_BASE = "axion/telemetry"
VEHICLE_COUNT = 100

def simulate_vehicle(vehicle_id):
    client = mqtt.Client(f"load_test_vid_{vehicle_id}")
    try:
        client.connect(BROKER, PORT, 60)
    except Exception as e:
        print(f"Failed to connect vehicle {vehicle_id}: {e}")
        return

    print(f"Vehicle {vehicle_id} connected. Starting telemetry transmission...")
    while True:
        timestamp = datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%SZ')
        payload = {
            "vehicle_id": f"fleet-a-{vehicle_id:03d}",
            "vendor": "LoadTesting",
            "timestamp": timestamp,
            "telemetry": {
                "speed_kmph": round(random.uniform(0, 120.0), 1),
                "battery_soc_pct": round(random.uniform(20.0, 95.0), 1),
                "battery_temp_c": round(random.uniform(25.0, 42.0), 1),
                "motor_temp_c": round(random.uniform(30.0, 65.0), 1),
                "ambient_temp_c": round(random.uniform(15.0, 35.0), 1),
                "odometer_km": round(random.uniform(1000, 50000), 1)
            }
        }
        client.publish(f"{TOPIC_BASE}/{payload['vehicle_id']}", json.dumps(payload), qos=1)
        time.sleep(random.uniform(0.5, 2.0))

if __name__ == "__main__":
    print(f"Starting Phase 8 Load Simulation across {VEHICLE_COUNT} concurrent EV nodes...")
    threads = []
    for i in range(1, VEHICLE_COUNT + 1):
        t = threading.Thread(target=simulate_vehicle, args=(i,), daemon=True)
        threads.append(t)
        t.start()

    try:
        while True:
            time.sleep(10)
            print(f"Load Simulation active. Transmitting high-throughput MQTT telemetry across {VEHICLE_COUNT} nodes...")
    except KeyboardInterrupt:
        print("Load simulation terminated.")
