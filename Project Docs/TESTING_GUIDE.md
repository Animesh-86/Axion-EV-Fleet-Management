# Axion EV Fleet Platform — Complete Feature Testing Guide

> **Platform**: Distributed IoT Telemetry & Digital Twin Engine
> **Stack**: Spring Boot 3.2 · React 18 · Kafka · Redis · TimescaleDB · PostgreSQL · FastAPI · XGBoost

---

## Quick Start

```bash
# 1. Start the entire platform (12 containers)
docker compose up --build -d

# 2. Wait for all services to be healthy (~60-90 seconds)
docker compose ps

# 3. Open the dashboard
# Frontend: http://localhost:80
# Backend API: http://localhost:8080
# ML Service: http://localhost:8000/docs
# Grafana: http://localhost:3001 (admin/admin)
# Prometheus: http://localhost:9090
```

> **IMPORTANT**: Wait until `docker compose ps` shows all services as **healthy** before testing. The backend needs Kafka, Redis, and PostgreSQL to be ready first.

---

## Feature 1: Authentication & Authorization

### What It Does
JWT-based authentication with role-based access control. Admin users can create vehicles and manage OTA campaigns.

### Test Steps

**1a. Register a new user**
```bash
curl -X POST http://localhost:8080/api/v1/auth/register -H "Content-Type: application/json" -d "{\"username\": \"testadmin\", \"password\": \"SecurePass123!\", \"role\": \"ADMIN\"}"
```
Expected: `200 OK` with `{"token": "eyJ..."}`

**1b. Login**
```bash
curl -X POST http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d "{\"username\": \"testadmin\", \"password\": \"SecurePass123!\"}"
```
Expected: `200 OK` with JWT token

**1c. Access protected endpoint without token**
```bash
curl http://localhost:8080/api/v1/ota/campaigns
```
Expected: `401 Unauthorized` or `403 Forbidden`

**1d. Access with valid token**
```bash
curl http://localhost:8080/api/v1/ota/campaigns -H "Authorization: Bearer <TOKEN>"
```
Expected: `200 OK` with campaigns list

**1e. UI Test**
1. Open `http://localhost:80`
2. You should see the login page
3. Register or login with credentials
4. Dashboard should load with fleet data

---

## Feature 2: Vehicle Registry & Provisioning

### What It Does
Manages the lifecycle of fleet vehicles. Only provisioned vehicles can emit telemetry. Prevents ghost digital twins.

### Test Steps

**2a. List registered vehicles**
```bash
curl http://localhost:8080/api/v1/registry/vehicles
```
Expected: List of 250+ pre-registered vehicles (from bootstrap)

**2b. Check registry stats**
```bash
curl http://localhost:8080/api/v1/registry/stats
```
Expected: `{"registeredActive": 250, "totalRegistered": 250}`

**2c. Provision a new vehicle via API**
```bash
curl -X POST http://localhost:8080/api/v1/registry/provision -H "Content-Type: application/json" -d "{\"vehicleId\": \"test-new-001\", \"profile\": \"sedan_sport\"}"
```
Expected: `200 OK` with vehicle entity details

**2d. Verify the new vehicle is registered**
```bash
curl http://localhost:8080/api/v1/registry/vehicles/test-new-001
```
Expected: `200 OK` with vehicle details including `lifecycleState: "ACTIVE"`

**2e. Decommission a vehicle**
```bash
curl -X POST http://localhost:8080/api/v1/registry/vehicles/test-new-001/decommission
```
Expected: `200 OK` with `lifecycleState: "DECOMMISSIONED"`

**2f. Verify telemetry rejection for unregistered vehicle**
```bash
curl -X POST http://localhost:8080/api/v1/telemetry -H "Content-Type: application/json" -d "{\"vehicle_id\": \"ghost-999\", \"vendor\": \"HACKER\", \"timestamp\": \"2026-05-18T00:00:00Z\", \"telemetry\": {\"battery_soc_pct\": 85, \"speed_kmph\": 60, \"battery_temp_c\": 30, \"motor_temp_c\": 35, \"ambient_temp_c\": 25, \"odometer_km\": 1000}}"
```
Expected: `200 OK` but check backend logs: `Telemetry rejected: vehicle ghost-999 is not registered`

---

## Feature 3: Create New Vehicle (Frontend UI)

### What It Does
Admin users can create new vehicles from the dashboard. The vehicle gets registered in PostgreSQL, gets a Redis digital twin, and the simulator starts generating telemetry.

### Test Steps

1. Login to the dashboard at `http://localhost:80`
2. Navigate to the "Add Vehicle" page
3. Fill in:
   - Vehicle ID: `my-custom-ev-001`
   - Profile: `Sedan Sport`
   - Scenario: `Normal Drive`
   - Register with simulator: checked
4. Click "Create Vehicle"
5. Should redirect to the vehicle detail page
6. Verify:
   ```bash
   curl http://localhost:8080/api/v1/registry/vehicles/my-custom-ev-001
   ```
7. Wait 10-15 seconds — telemetry should start flowing for the new vehicle

---

## Feature 4: Telemetry Ingestion Pipeline

### Architecture
```
Simulator -> REST POST -> Kafka -> Consumer 1 -> Redis (Digital Twin)
                                -> Consumer 2 -> TimescaleDB (History)
```

### Test Steps

**4a. Send manual telemetry**
```bash
curl -X POST http://localhost:8080/api/v1/telemetry -H "Content-Type: application/json" -d "{\"vehicle_id\": \"v001\", \"vendor\": \"MANUAL_TEST\", \"timestamp\": \"2026-05-18T00:00:00Z\", \"telemetry\": {\"battery_soc_pct\": 42.5, \"speed_kmph\": 75.0, \"battery_temp_c\": 38.0, \"motor_temp_c\": 43.0, \"ambient_temp_c\": 28.0, \"odometer_km\": 25000.0}}"
```
Expected: `200 OK`

**4b. Verify dual-write**
```bash
# Check Redis twin
curl http://localhost:8080/api/v1/fleet/summary

# Check TimescaleDB
docker exec -it axion-tsdb psql -U axion -d axion_tsdb -c "SELECT COUNT(*) FROM telemetry_history;"
```

**4c. Verify scheduled batch flush**
```bash
# Count now
docker exec -it axion-tsdb psql -U axion -d axion_tsdb -c "SELECT COUNT(*) FROM telemetry_history;"
# Wait 10 seconds
docker exec -it axion-tsdb psql -U axion -d axion_tsdb -c "SELECT COUNT(*) FROM telemetry_history;"
```
Count should increase (proving 5-second scheduled flush works)

---

## Feature 5: Digital Twin & Health Scoring

### Health Score Rules
| Condition | Penalty |
|-----------|---------|
| Battery SOC < 30% | -15 |
| Battery SOC < 15% | -35 |
| Battery Temp > 40C | -15 |
| Battery Temp > 55C | -35 |
| Vehicle Offline | -35 |
| Score >= 80 = HEALTHY | Score 50-79 = DEGRADED | Score < 50 = CRITICAL |

### Test Steps

**5a. View fleet summary**
```bash
curl http://localhost:8080/api/v1/fleet/summary
```

**5b. View all vehicle twins**
```bash
curl http://localhost:8080/api/v1/fleet/vehicles
```

**5c. WebSocket verification**: Open browser console, check Network > WS for `/topic/fleet/updates` messages

---

## Feature 6: OTA Campaign Management

### State Machine
```
DRAFT -> CANARY -> ROLLOUT -> COMPLETED
              |            |
              +---> HALTED <+
```

### Test Steps

**6a. Create campaign**
```bash
curl -X POST http://localhost:8080/api/v1/ota/campaigns -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"targetVersion\": \"v2.5.0\", \"vehicleIds\": [\"v001\", \"v002\", \"v003\"], \"canaryVehicleIds\": [\"v001\"]}"
```

**6b. Approve (DRAFT -> CANARY)**
```bash
curl -X POST http://localhost:8080/api/v1/ota/campaigns/<ID>/approve -H "Authorization: Bearer <TOKEN>"
```

**6c. Check progress**
```bash
curl http://localhost:8080/api/v1/ota/campaigns/<ID> -H "Authorization: Bearer <TOKEN>"
```

**6d. Manual halt**
```bash
curl -X POST http://localhost:8080/api/v1/ota/campaigns/<ID>/halt -H "Authorization: Bearer <TOKEN>"
```

---

## Feature 7: ML Predictive Analytics

### Test Steps

**7a. ML API docs**: Open `http://localhost:8000/docs`

**7b. Battery prediction**
```bash
curl http://localhost:8000/ml/v1/predict/v001/battery
```

**7c. Temperature anomaly**
```bash
curl http://localhost:8000/ml/v1/predict/v019/temperature
```

**7d. Fleet risk ranking**
```bash
curl http://localhost:8000/ml/v1/fleet/risk-ranking
```

**7e. ML fallback test**: Stop ML service and check backend returns `"available": false, "confidence": 0.0`

---

## Feature 8: GenAI Fleet Intelligence

Requires `OPENAI_API_KEY` environment variable. Without it, system provides fallback responses.

### Test Steps

**8a. Anomaly explanations**
```bash
curl http://localhost:8080/api/v1/ai/explanations/v019 -H "Authorization: Bearer <TOKEN>"
```

**8b. Interactive chat**
```bash
curl -X POST http://localhost:8080/api/v1/ai/chat/stream -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"prompt\": \"What vehicles are critical?\", \"sessionId\": \"test-1\"}" --no-buffer
```

---

## Feature 9-14: Additional Features

**RCA Timeline**: `GET /api/v1/rca/{vehicleId}/timeline?from=...&to=...`
**Telemetry History**: `GET /api/v1/telemetry/history/{vehicleId}?from=...&to=...`
**Prometheus Metrics**: `http://localhost:9090/targets`
**Grafana Dashboards**: `http://localhost:3001` (admin/admin)
**Kafka Topics**: `docker exec -it axion-kafka kafka-topics --list --bootstrap-server localhost:9092`
**Unit Tests**: `mvn test` in `Axion-Backend/ingestion` (40 tests, all passing)

---

## API Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/api/v1/auth/register` | POST | No | Register |
| `/api/v1/auth/login` | POST | No | Login |
| `/api/v1/telemetry` | POST | No | Ingest |
| `/api/v1/fleet/summary` | GET | Optional | Fleet stats |
| `/api/v1/fleet/vehicles` | GET | Optional | All twins |
| `/api/v1/registry/provision` | POST | No | Register vehicle |
| `/api/v1/registry/vehicles` | GET | No | List registered |
| `/api/v1/registry/stats` | GET | No | Registry stats |
| `/api/v1/admin/vehicles` | POST | Yes | Create vehicle (UI) |
| `/api/v1/ota/campaigns` | GET/POST | Yes | OTA CRUD |
| `/api/v1/ai/explanations/{id}` | GET | Yes | Anomaly explanations |
| `/api/v1/ai/chat/stream` | POST | Yes | AI chat |
| `/api/v1/rca/{id}/timeline` | GET | Yes | RCA timeline |
| `/ml/v1/predict/{id}/battery` | GET | No | Battery prediction |
| `/ml/v1/fleet/risk-ranking` | GET | No | Risk ranking |
