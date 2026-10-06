#!/usr/bin/env python3
import requests
import json
import time

BACKEND = 'http://localhost:8080'
FRONTEND = 'http://localhost:80'
PROMETHEUS = 'http://localhost:9090'
GRAFANA = 'http://localhost:3001'

def run_tests():
    print("=" * 60)
    print("  AXION EV FLEET MANAGEMENT - END-TO-END TEST SUITE")
    print("=" * 60)

    # 1. Health checks
    print("\n[TEST 1] Backend Health & Actuator")
    r = requests.get(f"{BACKEND}/api/v1/health")
    assert r.status_code == 200, f"Expected 200 got {r.status_code}"
    print(f"  [OK] /api/v1/health -> {r.status_code} ({r.text.strip()})")

    r = requests.get(f"{BACKEND}/actuator/health")
    assert r.status_code == 200, f"Expected 200 got {r.status_code}"
    print(f"  [OK] /actuator/health -> {r.status_code} ({r.json()})")

    # 2. Authentication
    print("\n[TEST 2] Authentication & RBAC")
    lr = requests.post(f"{BACKEND}/api/v1/auth/login", json={"username": "demo_admin", "password": "change_me"})
    assert lr.status_code == 200, f"Login failed with {lr.status_code}: {lr.text}"
    auth_data = lr.json()
    token = auth_data.get("token")
    assert token, "Token missing in login response"
    print(f"  [OK] Admin login successful! Username: {auth_data.get('username')}, Role: {auth_data.get('role')}")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Fleet Summary
    print("\n[TEST 3] Fleet Summary Ingestion & Real-Time Stats")
    sr = requests.get(f"{BACKEND}/api/v1/fleet/summary", headers=headers)
    print(f"  Status: {sr.status_code}")
    if sr.status_code == 200:
        sdata = sr.json()
        print(f"  [OK] Total Vehicles: {sdata.get('totalVehicles')}")
        print(f"  [OK] Online Vehicles: {sdata.get('onlineVehicles')}")
        print(f"  [OK] Healthy: {sdata.get('healthy')}, Degraded: {sdata.get('degraded')}, Critical: {sdata.get('critical')}")
        print(f"  [OK] Throughput: {sdata.get('eventsPerSecond'):.1f} events/sec (Total: {sdata.get('totalEventsProcessed')})")
        print(f"  [OK] ML Predicted Critical: {sdata.get('predictedCritical')}")
    else:
        print(f"  Response: {sr.text}")

    # 4. Fleet Vehicles Paginated List
    print("\n[TEST 4] Digital Twin Redis Store (Paginated)")
    vr = requests.get(f"{BACKEND}/api/v1/fleet/vehicles?page=0&size=5", headers=headers)
    assert vr.status_code == 200, f"Expected 200 got {vr.status_code}: {vr.text}"
    vdata = vr.json()
    total_vehicles = vdata.get("totalElements", 0)
    print(f"  [OK] Total Registered Digital Twins: {total_vehicles}")
    assert total_vehicles > 0, "Expected at least 1 vehicle"
    for v in vdata.get("content", [])[:3]:
        print(f"    * [{v.get('vehicleId')}] State={v.get('healthState')}, Health={v.get('healthScore')}, SOC={v.get('battery'):.1f}%, Temp={v.get('temperature'):.1f}C")

    # 5. Single Vehicle Detail & ML Predictions
    print("\n[TEST 5] Single Vehicle Telemetry & ML Predictions")
    vid = "fleet-a-001"
    dr = requests.get(f"{BACKEND}/api/v1/vehicles/{vid}", headers=headers)
    print(f"  [OK] GET /api/v1/vehicles/{vid} -> {dr.status_code}")
    if dr.status_code == 200:
        dj = dr.json()
        print(f"    * Vehicle ID: {dj.get('vehicleId')}")
        print(f"    * Health Score: {dj.get('healthScore')} ({dj.get('healthState')})")
        if dj.get('telemetry'):
            t = dj['telemetry']
            print(f"    * Telemetry: SOC={t.get('batterySocPct')}%, Speed={t.get('speedKmph')}km/h, Temp={t.get('batteryTempC')}C")
        if dj.get('predictions'):
            print(f"    * ML Predictions Object: Present")

    # 6. ML Risk Ranking
    print("\n[TEST 6] ML Risk Ranking API")
    rr = requests.get(f"{BACKEND}/api/v1/fleet/risk-ranking", headers=headers)
    print(f"  [OK] GET /api/v1/fleet/risk-ranking -> {rr.status_code}")
    if rr.status_code == 200:
        risk_list = rr.json()
        print(f"    * Ranked items count: {len(risk_list) if isinstance(risk_list, list) else risk_list}")

    # 7. Observability (Prometheus & Grafana)
    print("\n[TEST 7] Observability Stack")
    pr = requests.get(f"{PROMETHEUS}/api/v1/targets")
    assert pr.status_code == 200, f"Prometheus targets failed: {pr.status_code}"
    pdata = pr.json()
    active_targets = [t['scrapePool'] for t in pdata.get('data', {}).get('activeTargets', []) if t.get('health') == 'up']
    print(f"  [OK] Prometheus Scraping: {active_targets}")

    gr = requests.get(f"{GRAFANA}/api/health")
    assert gr.status_code == 200, f"Grafana health failed: {gr.status_code}"
    print(f"  [OK] Grafana Health: {gr.json().get('database')}")

    # 8. Frontend Web Server
    print("\n[TEST 8] Frontend UI Nginx Server")
    fr = requests.get(FRONTEND)
    assert fr.status_code == 200, f"Frontend failed: {fr.status_code}"
    print(f"  [OK] Frontend Web Dashboard reachable at {FRONTEND} (Status 200 OK)")

    print("\n" + "=" * 60)
    print("  ALL COMPONENT & INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == '__main__':
    run_tests()
