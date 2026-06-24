#!/usr/bin/env python3
import requests
import yaml
import sys
import os

BACKEND = "http://localhost:8080"

def register_admin():
    url = f"{BACKEND}/api/v1/auth/register"
    body = {"username": "demo_admin", "password": "demo", "role": "ADMIN"}
    try:
        r = requests.post(url, json=body, timeout=5)
        r.raise_for_status()
        return r.json().get("token")
    except Exception as e:
        print("Register failed; attempting login fallback")
        try:
            login_url = f"{BACKEND}/api/v1/auth/login"
            lr = requests.post(login_url, json={"username": body["username"], "password": body["password"]}, timeout=5)
            lr.raise_for_status()
            return lr.json().get("token")
        except Exception as le:
            print("Login fallback failed:", le)
            return None

def create_vehicle(token, vid, profile="sedan_standard", scenario="normal"):
    url = f"{BACKEND}/api/v1/admin/vehicles"
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    body = {
        "id": vid, 
        "profile": profile, 
        "scenario": scenario, 
        "registerWithSimulator": False # Sim is already running them natively
    }
    try:
        r = requests.post(url, json=body, headers=headers, timeout=5)
        r.raise_for_status()
        print(f"Registered {vid}")
    except Exception as e:
        print(f"Failed to register {vid}: {e}")

def main():
    token = register_admin()
    if token is None:
        print("Failed to get auth token. Exiting.")
        sys.exit(1)

    yaml_path = os.path.join(os.path.dirname(__file__), '..', 'Axion-Simulator', 'config', 'fleet.yaml')
    with open(yaml_path, "r") as f:
        config = yaml.safe_load(f)

    # Manual list
    for v_conf in config.get("vehicles", []):
        create_vehicle(token, v_conf.get("id"), v_conf.get("profile", "sedan_standard"), v_conf.get("scenario", "normal"))

    # Auto generate list
    for gen in config.get("auto_generate", []):
        prefix = gen.get("prefix", "auto")
        start = gen.get("start", 1)
        count = gen.get("count", 10)
        profile = gen.get("profile", "sedan_standard")
        scenario = gen.get("scenario", "normal")
        for i in range(start, start + count):
            vid = f"{prefix}-{i:03d}"
            create_vehicle(token, vid, profile, scenario)

if __name__ == "__main__":
    main()
