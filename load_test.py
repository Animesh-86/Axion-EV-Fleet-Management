import paho.mqtt.client as mqtt
import time
import json
import random
import threading

BROKER = "localhost"
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
        payload = {
            "vehicleId": f"EV-LOAD-{vehicle_id:03d}",
            "timestamp": int(time.time() * 1000),
            "battery": {
                "soc": round(random.uniform(20.0, 95.0), 1),
                "temperature": round(random.uniform(25.0, 42.0), 1),
                "voltage": round(random.uniform(380.0, 410.0), 1),
                "current": round(random.uniform(-50.0, 150.0), 1)
            },
            "motor": {
                "rpm": int(random.uniform(0, 8000)),
                "temperature": round(random.uniform(30.0, 65.0), 1)
            },
            "gps": {
                "latitude": round(37.7749 + random.uniform(-0.05, 0.05), 6),
                "longitude": round(-122.4194 + random.uniform(-0.05, 0.05), 6),
                "speed": round(random.uniform(0, 120.0), 1)
            },
            "network": {
                "signalStrength": int(random.uniform(-85, -50)),
                "packetLoss": round(random.uniform(0, 2.0), 1),
                "latency": int(random.uniform(10, 50))
            }
        }
        client.publish(f"{TOPIC_BASE}/{payload['vehicleId']}", json.dumps(payload), qos=1)
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
