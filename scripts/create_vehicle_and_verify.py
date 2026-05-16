#!/usr/bin/env python3
import requests
import time
import sys

BACKEND = "http://localhost:8080"

def register_admin():
    url = f"{BACKEND}/api/v1/auth/register"
    body = {"username": "demo_admin", "password": "demo", "role": "ADMIN"}
    try:
        r = requests.post(url, json=body, timeout=5)
        r.raise_for_status()
        return r.json().get("token")
    except Exception as e:
        print("Register failed or already exists; attempting login fallback")
        # Try to login instead
        try:
            login_url = f"{BACKEND}/api/v1/auth/login"
            lr = requests.post(login_url, json={"username": body["username"], "password": body["password"]}, timeout=5)
            lr.raise_for_status()
            return lr.json().get("token")
        except Exception as le:
            print("Login fallback failed:", le)
            return None

def create_vehicle(token, vid="demo-001"):
    url = f"{BACKEND}/api/v1/admin/vehicles"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    body = {"id": vid, "profile": "sedan_standard", "scenario": "normal", "registerWithSimulator": True}
    r = requests.post(url, json=body, headers=headers, timeout=5)
    r.raise_for_status()
    return r.json()

def poll_for_predictions(token, vid="demo-001", timeout=30):
    url = f"{BACKEND}/api/v1/vehicles/{vid}"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    start = time.time()
    while time.time() - start < timeout:
        try:
            r = requests.get(url, headers=headers, timeout=5)
            if r.status_code == 200:
                data = r.json()
                preds = data.get("predictions")
                if preds:
                    print("Predictions available:", preds)
                    return True
                else:
                    print("No predictions yet; telemetry present?", bool(data.get("telemetry")))
            else:
                print("Vehicle not available yet (status)", r.status_code)
        except Exception as e:
            print("Polling error:", e)
        time.sleep(2)
    return False

def main():
    token = register_admin()
    if token is None:
        print("Could not register admin; ensure you have an admin token and set it via environment or modify script.")
    try:
        res = create_vehicle(token)
        print("Create response:", res)
    except Exception as e:
        print("Create vehicle failed:", e)
        sys.exit(1)

    ok = poll_for_predictions(token)
    if not ok:
        print("Timed out waiting for predictions. Check ML service and simulator logs.")
        sys.exit(2)
    print("Smoke test succeeded: vehicle created and predictions observed.")

if __name__ == '__main__':
    main()
