# Axion Platform Testing Guide

This guide covers how to start the platform, what each subsystem does, and how to test the major user flows and failure cases.

## 1. What the platform includes

Axion is made of these runtime pieces:

- `Axion-Frontend`: React dashboard served by Nginx.
- `Axion-Backend/ingestion`: Spring Boot API, telemetry ingestion, digital twin state, OTA orchestration, Spring AI integration.
- `Axion-ML`: FastAPI service for predictive analytics and risk scoring.
- `Axion-Simulator`: Python simulator that emits vehicle telemetry over REST and MQTT.
- Infrastructure: Kafka, Redis, Mosquitto, PostgreSQL, TimescaleDB, Prometheus, Grafana.

## 2. Start the platform

### Prerequisites

- Docker Desktop running.
- Ports available: `80`, `8080`, `8000`, `5432`, `5433`, `9090`, `3001`.

### Start everything

```bash
docker compose up --build -d
```

### Stop everything

```bash
docker compose down
```

### Useful log commands

```bash
docker compose logs --tail 200 backend
docker compose logs --tail 200 ml
docker compose logs --tail 200 simulator
docker compose logs --tail 200 kafka
docker compose logs --tail 200 redis
```

## 3. Expected health status

When the stack is healthy:

- Frontend: `http://localhost/`
- Backend health: `http://localhost:8080/api/v1/health`
- Fleet summary: `http://localhost:8080/api/v1/fleet/summary`
- ML health: `http://localhost:8000/health`
- Prometheus: `http://localhost:9090/`
- Grafana: `http://localhost:3001/`

## 4. End-to-end test matrix

### 4.1 Startup and infra bootstrap

**How to test**

1. Start the stack with Docker Compose.
2. Check `docker compose ps`.
3. Confirm Kafka, Redis, Mosquitto, PostgreSQL, and TimescaleDB are healthy before the app services.

**What happens**

- Zookeeper starts first.
- Kafka waits for Zookeeper.
- Redis and Mosquitto come up next.
- Backend waits for Kafka, Redis, and Mosquitto.
- Frontend waits for backend health.
- Simulator waits for backend and Mosquitto.

**Pass criteria**

- All containers show `Up` or `healthy`.
- Backend health endpoint returns `200`.
- Frontend loads the dashboard.

**Failure signals**

- Backend container exits on startup.
- Frontend shows blank data or network errors.
- Kafka or Redis logs show connection or readiness failures.

### 4.2 Dashboard load

**How to test**

1. Open `http://localhost/`.
2. Verify the fleet dashboard renders cards, charts, vehicle list, and navigation.
3. Switch between pages such as Fleet, Vehicle Detail, OTA Manager, Analytics, Alerts, and System Health.

**What happens**

- The frontend requests backend APIs for fleet state.
- WebSocket updates refresh live data where enabled.
- The UI reflects health, OTA, and telemetry state.

**Pass criteria**

- No console errors.
- Navigation works.
- Data is visible in the dashboard widgets.

### 4.3 Fleet summary API

**How to test**

```bash
curl http://localhost:8080/api/v1/fleet/summary
```

**What happens**

- Backend aggregates twin state from Redis and returns fleet-wide KPIs.
- Health counts, vehicle counts, and prediction fields are surfaced in the response.

**Pass criteria**

- Response is `200` with JSON.
- Summary fields are populated.

### 4.4 Vehicle list and vehicle detail

**How to test**

1. Open the Fleet or Vehicle pages.
2. Select a vehicle and inspect its detail panel.
3. Confirm battery, temperature, connectivity, and health indicators update.

**What happens**

- The frontend fetches individual twin snapshots.
- Redis is the source of truth for the latest vehicle state.

**Pass criteria**

- A vehicle detail page opens.
- Health and telemetry values render without errors.

### 4.5 REST telemetry ingestion

**How to test**

Send a sample telemetry payload to the backend ingestion endpoint.

```bash
curl -X POST http://localhost:8080/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -d '{"vehicleId":"demo-001","batterySocPct":72.4,"batteryTempC":31.5,"speedKph":48,"timestamp":"2026-05-17T00:00:00Z"}'
```

**What happens**

- Backend validates and normalizes the payload.
- The event is published into the event pipeline.
- Redis twin state is updated.
- Fleet views and vehicle details should reflect the change.

**Pass criteria**

- HTTP request returns success.
- The vehicle appears in summaries or details.

### 4.6 MQTT telemetry ingestion

**How to test**

1. Start the simulator or publish a message to the MQTT topic.
2. Check backend and Mosquitto logs.

**What happens**

- MQTT messages arrive at Mosquitto.
- The backend consumes telemetry from MQTT topics and feeds the same digital twin pipeline as REST.

**Pass criteria**

- MQTT messages are accepted.
- Backend logs show telemetry processing.

### 4.7 Digital twin freshness and TTL

**How to test**

1. Ingest a vehicle update.
2. Wait longer than the configured Redis TTL if no new telemetry arrives.
3. Reload the vehicle detail page.

**What happens**

- The backend stores live twin state in Redis with TTL.
- Old telemetry is ignored if newer timestamps already exist.
- Stale records eventually expire.

**Pass criteria**

- Newer data replaces older data.
- Expired stale data does not remain visible forever.

### 4.8 ML health and predictions

**How to test**

```bash
curl http://localhost:8000/health
curl http://localhost:8080/api/v1/fleet/summary
```

**What happens**

- The backend calls the ML service for risk ranking and per-vehicle predictions.
- Results are cached in Redis for a short TTL.
- Fleet summary exposes prediction fields such as critical risk markers.

**Pass criteria**

- ML health returns `200`.
- Fleet summary includes prediction data when the ML service is reachable.

**Failure signals**

- ML health fails.
- Backend logs mention ML request failures.

### 4.9 ML cache behavior

**How to test**

1. Call the same ML-backed endpoint twice in a row.
2. Compare backend or ML logs.

**What happens**

- The first call fetches fresh analytics from the ML service.
- The next call should be served from Redis cache while the TTL is valid.

**Pass criteria**

- Repeated requests are faster or produce fewer upstream ML calls.

### 4.10 OTA campaign lifecycle

**How to test**

1. Open the OTA Manager.
2. Create a campaign.
3. Choose target vehicles and a canary subset.
4. Approve and run the campaign.

**What happens**

- Campaign starts in `DRAFT`.
- Approval moves it to `CANARY`.
- Canary vehicles are deployed first.
- If canary passes, rollout continues.
- If failure rate crosses the threshold, the campaign halts and rolls back successful vehicles.

**Pass criteria**

- Campaign status transitions are visible.
- Failed or unsafe vehicles are refused.
- Rollback occurs when the health threshold is violated.

### 4.11 OTA health gating

**How to test**

1. Pick a low-SOC or high-temperature vehicle.
2. Attempt an OTA campaign.

**What happens**

- Backend checks Redis twin state before deploying.
- Vehicles below SOC threshold or above temperature threshold are rejected.

**Pass criteria**

- Unsafe vehicles are not updated.
- Logs explain the refusal reason.

### 4.12 WebSocket real-time updates

**How to test**

1. Open the dashboard and keep it visible.
2. Trigger telemetry updates or an OTA event.

**What happens**

- Backend broadcasts twin or health changes.
- The frontend updates without manual refresh.

**Pass criteria**

- Live values change automatically.
- No repeated polling is needed for core updates.

### 4.13 GenAI / OpenAI behavior

**How to test**

1. Provide a valid OpenAI API key.
2. Restart the backend.
3. Open the fleet assistant or GenAI features if enabled.

**What happens**

- The backend loads the OpenAI key from environment or secret file.
- Spring AI becomes available for explanations and assistant flows.

**Pass criteria**

- Backend starts successfully with the key.
- Assistant or explanation features return responses.

**Failure signals**

- Backend fails to start because the key is missing or invalid.
- OpenAI-related errors appear in backend logs.

### 4.14 Secrets and environment validation

**How to test**

1. Inspect your `.env.local` or secret mounts.
2. Ensure placeholder passwords are replaced.
3. Verify `AXION_OPENAI_KEY_FILE` or `OPENAI_API_KEY` is set appropriately.

**What happens**

- Local dev can use an example env file.
- Production should use secret injection.

**Pass criteria**

- No committed secrets.
- The app starts with the expected credentials.

### 4.15 Observability

**How to test**

1. Open Prometheus at `http://localhost:9090/`.
2. Open Grafana at `http://localhost:3001/`.
3. Confirm dashboards populate.

**What happens**

- Backend metrics are exposed to Prometheus.
- Grafana reads the data source and renders dashboard panels.

**Pass criteria**

- Metrics endpoints are reachable.
- Grafana dashboard loads without datasource errors.

### 4.16 Load testing

**How to test**

```bash
python load_test.py
```

**What happens**

- The simulator or load script increases telemetry volume.
- Backend, Redis, Kafka, and the dashboard should keep responding.

**Pass criteria**

- No sustained errors.
- Health and fleet endpoints remain responsive under load.

## 5. Quick verification checklist

Use this short list for a demo or release check:

1. `docker compose up --build -d`
2. `docker compose ps`
3. `curl http://localhost:8080/api/v1/health`
4. `curl http://localhost:8000/health`
5. Open `http://localhost/`
6. Verify a vehicle detail page.
7. Verify OTA campaign creation.
8. Verify Prometheus and Grafana load.

## 6. Common problems

- Docker not running: start Docker Desktop first.
- Backend fails on startup: check OpenAI key and database URLs.
- Frontend loads but no data appears: confirm backend health and simulator logs.
- ML service fails: inspect `Axion-ML` logs and the TimescaleDB connection.
- Ports are in use: stop the conflicting process or remap ports in `docker-compose.yml`.

## 7. Notes on current behavior

- The backend uses Redis as live twin state, so new telemetry can replace older state.
- ML data may be cached briefly; repeat calls may not immediately hit the ML service.
- OTA is intentionally health-gated and can halt or roll back when the risk threshold is exceeded.
- If OpenAI is unavailable, GenAI features should be treated as optional and tested separately from the core platform.
