# Axion EV Fleet Management — Major Project Plan (7th Semester)

> **Production-Grade Upgrade Roadmap**
> Building on the frozen Minor Project foundation to create an intelligent, stateful, enterprise-ready fleet management platform.

---

## Table of Contents

1. [Current State (Minor — Completed)](#current-state-minor--completed)
2. [Major Architecture Target](#major-architecture-target)
3. [Phase 1 — Database & Persistence (Weeks 1–3)](#phase-1--database--persistence-weeks-13)
4. [Phase 2 — Authentication & Security (Weeks 3–4)](#phase-2--authentication--security-weeks-34)
5. [Phase 3 — Real-Time WebSockets (Weeks 4–5)](#phase-3--real-time-websockets-weeks-45)
6. [Phase 4 — ML Predictive Analytics (Weeks 5–8)](#phase-4--ml-predictive-analytics-weeks-58)
7. [Phase 5 — Advanced OTA Orchestration (Weeks 6–8)](#phase-5--advanced-ota-orchestration-weeks-68)
8. [Phase 6 — Root Cause Analysis Timeline (Weeks 7–8)](#phase-6--root-cause-analysis-timeline-weeks-78)
9. [Phase 7 — Observability & Monitoring (Weeks 8–9)](#phase-7--observability--monitoring-weeks-89)
10. [Phase 8 — Polish & Presentation (Weeks 9–10)](#phase-8--polish--presentation-weeks-910)
11. [Technology Stack Comparison](#technology-stack-comparison)
12. [Work Division](#work-division)
13. [What Makes This Production-Grade](#what-makes-this-production-grade)

---

## Current State (Minor — Completed)

| Layer | Stack | State |
|-------|-------|-------|
| **Backend** | Spring Boot 3.2, Kafka, Redis, MQTT | Fully functional, volatile (Redis TTL 120s) |
| **Frontend** | React 18, Recharts, Tailwind, Shadcn UI | 7 pages working with live polling |
| **Simulator** | Python asyncio, 20 vehicles, 5 scenarios | Emitting REST + MQTT telemetry |
| **Infrastructure** | Docker Compose (Kafka, Redis, Mosquitto, Zookeeper) | Running |

### Current Data Pipeline

```
Python Simulator ──REST/MQTT──► Spring Boot Ingestion
                                       │
                                       ▼
                             Kafka (telemetry.normal)
                                       │
                                       ▼
                              TelemetryConsumer
                                       │
                                       ▼
                               Redis (Live State, 120s TTL)
                                       │
                                       ▼
                              React Frontend (Polling 3-5s)
```

### Critical Limitations to Solve in Major

- **No persistent database** — everything vanishes when Redis TTL expires
- **No authentication** — all endpoints are open
- **No historical data** — only last-known-state snapshots
- **No ML/AI** — purely reactive, no predictions
- **Polling-only frontend** — not truly real-time
- **No observability** — no metrics, no structured logging

---

## Major Architecture Target

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AXION MAJOR ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  [Python Simulator] ──REST/MQTT──► [Spring Boot API Gateway]       │
│                                          │                          │
│                                  ┌───────┴───────┐                  │
│                                  ▼               ▼                  │
│                       [Kafka: telemetry.normal] [Kafka: ota.events] │
│                                  │               │                  │
│                        ┌─────────┼───────────────┘                  │
│                        ▼         ▼                                  │
│                [TwinConsumer] [OTA Consumer]                        │
│                        │         │                                  │
│                  ┌─────┼─────┐   │                                  │
│                  ▼     ▼     ▼   ▼                                  │
│             [Redis] [TimescaleDB] [PostgreSQL]                      │
│             (live)  (time-series)  (campaigns,                      │
│                                    users, audit)                    │
│                        │                                            │
│                        ▼                                            │
│              [FastAPI ML Service] ──predictions──► [Spring Boot]    │
│                                                         │           │
│                                                    [WebSocket]      │
│                                                         │           │
│                                                         ▼           │
│                                               [React Dashboard]     │
│                                               (JWT Auth + RBAC)     │
│                                                                     │
│  [Prometheus] ◄──metrics── [Spring Actuator]                       │
│       │                                                             │
│       ▼                                                             │
│  [Grafana Dashboards]                                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Phase 1 — Database & Persistence (Weeks 1–3)

**Goal**: Axion remembers everything. Historical telemetry + relational business data.

### 1A. TimescaleDB for Telemetry History

**Why**: Currently Redis forgets data after 120 seconds. TimescaleDB stores millions of telemetry rows with automatic time-partitioning and fast time-range queries.

**What to build**:

- Add TimescaleDB container to `docker-compose.yml`
- Create `telemetry_history` hypertable:

```sql
CREATE TABLE telemetry_history (
    time            TIMESTAMPTZ NOT NULL,
    vehicle_id      VARCHAR(50) NOT NULL,
    battery_soc     FLOAT,
    battery_temp    FLOAT,
    motor_temp      FLOAT,
    speed           FLOAT,
    health_score    INTEGER,
    health_state    VARCHAR(20)
);

-- Converts table into an optimized time-series hypertable
SELECT create_hypertable('telemetry_history', 'time');

-- Index for fast vehicle-specific queries
CREATE INDEX idx_vehicle_time ON telemetry_history (vehicle_id, time DESC);
```

- New `TelemetryHistoryConsumer` — a second Kafka consumer that reads `telemetry.normal` and batch-inserts into TimescaleDB (use Spring JdbcTemplate with batch size 100)
- New REST endpoints:
  - `GET /api/v1/history/{vehicleId}?from=&to=` — time-range query
  - `GET /api/v1/history/{vehicleId}/aggregates?interval=1h` — hourly averages
- **Retention policy**: Auto-drop data older than 30 days via `add_retention_policy`

### 1B. PostgreSQL for Business Data

**Why**: OTA campaigns, user accounts, audit logs, and vehicle policies need relational integrity.

**What to build**:

- Add PostgreSQL container to `docker-compose.yml`
- Spring Data JPA + Flyway migrations for schema version control
- Database tables:

```sql
-- Users & Authentication
CREATE TABLE users (
    user_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username   VARCHAR(50) UNIQUE NOT NULL,
    password   VARCHAR(255) NOT NULL,  -- BCrypt hash
    role       VARCHAR(20) NOT NULL,   -- ADMIN, OPERATOR
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OTA Campaign Tracking (persistent, not in-memory)
CREATE TABLE ota_campaigns (
    campaign_id    UUID PRIMARY KEY,
    target_version VARCHAR(20) NOT NULL,
    status         VARCHAR(20) NOT NULL, -- DRAFT, CANARY, ROLLOUT, COMPLETED, HALTED
    created_by     UUID REFERENCES users(user_id),
    created_at     TIMESTAMPTZ DEFAULT NOW(),
    completed_at   TIMESTAMPTZ
);

-- Individual OTA Jobs per Vehicle
CREATE TABLE ota_jobs (
    job_id       UUID PRIMARY KEY,
    campaign_id  UUID REFERENCES ota_campaigns(campaign_id),
    vehicle_id   VARCHAR(50) NOT NULL,
    state        VARCHAR(20) NOT NULL, -- PENDING, IN_PROGRESS, SUCCESS, FAILED, ROLLED_BACK
    started_at   TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- Vehicle Policies (configurable thresholds per vehicle)
CREATE TABLE vehicle_policies (
    vehicle_id          VARCHAR(50) PRIMARY KEY,
    max_temp_threshold  FLOAT DEFAULT 55.0,
    min_ota_battery     FLOAT DEFAULT 30.0,
    auto_exclude_ota    BOOLEAN DEFAULT FALSE
);

-- Audit Trail
CREATE TABLE audit_logs (
    log_id       BIGSERIAL PRIMARY KEY,
    actor        VARCHAR(100),
    action       VARCHAR(50),  -- TRIGGERED_OTA, HALTED_CAMPAIGN, LOGIN, etc.
    target       VARCHAR(100),
    details      JSONB,
    timestamp    TIMESTAMPTZ DEFAULT NOW()
);
```

### 1C. Docker Compose Additions

```yaml
postgres:
  image: postgres:16-alpine
  ports: ["5432:5432"]
  environment:
    POSTGRES_DB: axion
    POSTGRES_USER: axion
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
  volumes:
    - pgdata:/var/lib/postgresql/data

timescaledb:
  image: timescale/timescaledb:latest-pg16
  ports: ["5433:5432"]
  environment:
    POSTGRES_DB: axion_ts
    POSTGRES_USER: axion
    POSTGRES_PASSWORD: ${TS_PASSWORD}
  volumes:
    - tsdata:/var/lib/postgresql/data
```

### Phase 1 Deliverables

- [ ] TimescaleDB hypertable storing all telemetry
- [ ] PostgreSQL schemas for users, campaigns, policies, audit
- [ ] Flyway migration scripts
- [ ] Historical telemetry API endpoints
- [ ] Frontend: Historical charts showing 24h / 7d / 30d trends
- [ ] OTA campaigns persisted across restarts
- [ ] Audit log page in frontend

---

## Phase 2 — Authentication & Security (Weeks 3–4)

**Goal**: Role-based access control. Admin vs Operator.

### 2A. Spring Security + JWT (Backend)

**What to build**:

- Add `spring-boot-starter-security` + `jjwt` dependencies to `pom.xml`
- `JwtTokenProvider` — generates/validates JWT tokens (HS256, 24h expiry)
- `JwtAuthenticationFilter` — extracts token from `Authorization: Bearer <token>` header
- `SecurityConfig` — endpoint-level access rules:

```
/api/v1/auth/**          → permitAll (login, register)
/api/v1/fleet/**         → OPERATOR, ADMIN (read-only fleet data)
/api/v1/ota/**           → ADMIN only (trigger OTA updates)
/api/v1/admin/**         → ADMIN only (user management)
/api/v1/history/**       → OPERATOR, ADMIN (historical data)
```

- New REST endpoints:
  - `POST /api/v1/auth/login` — returns JWT token
  - `POST /api/v1/auth/register` — creates user (admin-only)
  - `GET /api/v1/auth/me` — returns current user info

### 2B. Frontend Authentication

**What to build**:

- Login page with username/password form (Shadcn UI components)
- JWT stored in memory (not localStorage — XSS protection)
- `AuthContext` React context for global auth state
- Protected routes — redirect to login if unauthenticated
- Conditional UI rendering:
  - ADMIN: Full access, OTA trigger buttons visible
  - OPERATOR: Read-only, OTA buttons hidden
- Logout button in sidebar header

### Phase 2 Deliverables

- [ ] Spring Security filter chain with JWT
- [ ] Login / Register API endpoints
- [ ] BCrypt password hashing
- [ ] Frontend login page
- [ ] Role-based UI (Admin vs Operator)
- [ ] Audit log records "who did what"

---

## Phase 3 — Real-Time WebSockets (Weeks 4–5)

**Goal**: Replace polling with server-push. Instant dashboard updates.

### 3A. Backend WebSocket Server

**What to build**:

- Add `spring-boot-starter-websocket` dependency
- `WebSocketConfig` — STOMP over SockJS configuration
- `TelemetryWebSocketPublisher` — when `TelemetryConsumer` updates a digital twin, also broadcast to WebSocket topics:
  - `/topic/fleet/updates` — fleet-wide updates
  - `/topic/vehicle/{vehicleId}` — vehicle-specific updates
- Message types:

```json
{ "type": "TWIN_UPDATE",   "vehicleId": "v003", "data": { "...snapshot" } }
{ "type": "HEALTH_CHANGE", "vehicleId": "v012", "from": "HEALTHY", "to": "DEGRADED" }
{ "type": "OTA_STATUS",    "vehicleId": "v005", "state": "SUCCESS" }
{ "type": "ALERT",         "severity": "CRITICAL", "message": "v019 battery temp 68°C" }
```

### 3B. Frontend WebSocket Client

**What to build**:

- Replace all `setInterval` polling loops with STOMP.js WebSocket subscriptions
- `useWebSocket` custom React hook — auto-reconnect, connection status indicator
- Dashboard updates in real-time without page refresh
- Toast notifications on health state changes (e.g., "v012 went CRITICAL!")
- Connection status indicator in header (WebSocket Connected / Reconnecting)

### Phase 3 Deliverables

- [ ] STOMP WebSocket server configuration
- [ ] TelemetryWebSocketPublisher broadcasting twin updates
- [ ] Frontend STOMP.js client with auto-reconnect
- [ ] Zero-polling dashboard
- [ ] Instant OTA status updates
- [ ] Live alert feed via WebSocket

---

## Phase 4 — ML Predictive Analytics (Weeks 5–8)

**Goal**: The "star feature" — AI-powered battery degradation prediction and anomaly detection.

### 4A. FastAPI ML Microservice

**Stack**: Python 3.11, FastAPI, scikit-learn, XGBoost, pandas, uvicorn

**What to build**:

- New `Axion-ML/` directory alongside existing services
- Connects to TimescaleDB to read historical telemetry
- Two ML models:

| Model | Input | Output |
|-------|-------|--------|
| **Battery Depletion Predictor** | Historical SOC drain rate, speed, temperature | Predicted hours until SOC reaches 15% + confidence score |
| **Temperature Anomaly Detector** | Historical temperature trajectory, ambient temp | Anomaly risk (LOW/MEDIUM/HIGH) + predicted peak temperature |

- REST API endpoints:

```
GET  /ml/v1/predict/{vehicleId}/battery
     → { "predictedDepletionHours": 4.2, "confidence": 0.85 }

GET  /ml/v1/predict/{vehicleId}/temperature
     → { "anomalyRisk": "HIGH", "predictedPeakC": 62.3 }

GET  /ml/v1/fleet/risk-ranking
     → [{ "vehicleId": "v019", "riskScore": 0.87 }, ...]

POST /ml/v1/retrain
     → Trigger model retraining on latest data
```

- Docker container with dependencies: fastapi, uvicorn, scikit-learn, xgboost, pandas, psycopg2, sqlalchemy

### 4B. Spring Boot Integration

- `MlServiceClient` — HTTP client calling FastAPI prediction endpoints
- Cache predictions in Redis (TTL 60s) to avoid hammering ML service
- Include predictions in vehicle detail API response:

```json
{
  "vehicleId": "v003",
  "telemetry": { "..." },
  "predictions": {
    "batteryDepletion": { "hours": 4.2, "confidence": 0.85 },
    "tempAnomaly": { "risk": "LOW", "predictedPeakC": 42.1 }
  }
}
```

### 4C. Frontend ML Widgets

- **Vehicle Detail Page**: "Predicted Battery Life: 4.2 hours (85% confidence)" card with gauge visualization
- **Analytics Page**: Fleet-wide risk heatmap — vehicles ranked by predicted failure risk
- **Alerts Integration**: Auto-generate alerts when ML predicts imminent failure

### Phase 4 Deliverables

- [ ] FastAPI microservice with two trained ML models
- [ ] Battery depletion prediction endpoint
- [ ] Temperature anomaly detection endpoint
- [ ] Fleet risk ranking endpoint
- [ ] Model retraining endpoint
- [ ] Spring Boot ML client with Redis caching
- [ ] Frontend prediction widgets on Vehicle Detail page
- [ ] Risk heatmap on Analytics page
- [ ] ML-driven auto-alerts

---

## Phase 5 — Advanced OTA Orchestration (Weeks 6–8)

**Goal**: Production-grade OTA with canary deployments, health-gating, and automatic rollback.

### 5A. Campaign Lifecycle State Machine

```
DRAFT ──► CANARY ──► ROLLOUT ──► COMPLETED
                  │            │
                  └──► HALTED ◄┘
```

**What to build**:

- `OtaCampaignService` with full lifecycle management (persisted in PostgreSQL)
- **Canary deployment**: Select 2-3 vehicles, deploy, wait 5 minutes, check health scores. If all pass → proceed to full rollout
- **Health-gated rollout**: Backend automatically refuses OTA if:
  - Vehicle SOC < 30%
  - Vehicle temperature > 45°C
  - Vehicle health state = CRITICAL
- **Auto-rollback**: If failure rate exceeds 30% during rollout, automatically HALT campaign and rollback successful vehicles
- **Approval workflow**: ADMIN creates campaign → reviews target list → approves → system executes autonomously

### 5B. Campaign Manager UI

- Campaign creation wizard:
  1. Select target firmware version
  2. Choose target vehicles (filter by model, health state)
  3. Select canary group (2-3 vehicles)
  4. Review & approve
- Live rollout progress bar with per-vehicle status indicators
- Campaign history table with status filtering
- Rollback button with confirmation dialog
- Real-time status via WebSocket

### Phase 5 Deliverables

- [ ] Campaign lifecycle state machine (PostgreSQL-backed)
- [ ] Canary deployment logic
- [ ] Health-gated rollout enforcement
- [ ] Automatic rollback on high failure rate
- [ ] Campaign creation wizard UI
- [ ] Live rollout progress visualization
- [ ] Campaign history & audit trail

---

## Phase 6 — Root Cause Analysis Timeline (Weeks 7–8)

**Goal**: Correlate events across time to prove cause-and-effect relationships.

### What to Build

- Query engine that merges events from:
  - TimescaleDB (telemetry data points)
  - PostgreSQL (OTA events, audit logs)
- New API endpoint: `GET /api/v1/rca/{vehicleId}?from=&to=` → returns unified event timeline
- Frontend RCA Timeline component with interactive visualization:

```
10:00:00  [OTA]     Campaign "v2.1" started on v019
10:02:15  [TEMP]    Battery temp rose from 35°C → 52°C
10:03:00  [HEALTH]  Health dropped: HEALTHY → DEGRADED (score: 70 → 45)
10:03:30  [OTA]     OTA FAILED — auto-rollback triggered
10:05:00  [TEMP]    Battery temp stabilized at 38°C
10:06:00  [HEALTH]  Health recovered: CRITICAL → DEGRADED (score: 45 → 62)
```

- Interactive timeline with zoom/scroll capability
- Color-coded event categories (OTA, Telemetry, Health, Alert)
- Click-to-expand detail for each event

### Phase 6 Deliverables

- [ ] Cross-source event query engine
- [ ] RCA API endpoint
- [ ] Interactive timeline visualization component
- [ ] Event correlation logic
- [ ] Vehicle-specific RCA page accessible from Vehicle Detail

---

## Phase 7 — Observability & Monitoring (Weeks 8–9)

**Goal**: Professional-grade infrastructure monitoring with Prometheus + Grafana.

### 7A. Prometheus + Grafana

**What to build**:

- Add `spring-boot-starter-actuator` + `micrometer-registry-prometheus` dependencies
- Expose `/actuator/prometheus` endpoint with custom metrics:

| Metric | Type | Description |
|--------|------|-------------|
| `axion_telemetry_ingested_total` | Counter | Total telemetry messages processed |
| `axion_kafka_consumer_lag` | Gauge | Kafka consumer group lag |
| `axion_health_score_distribution` | Histogram | Distribution of fleet health scores |
| `axion_ota_campaigns_active` | Gauge | Currently active OTA campaigns |
| `axion_api_latency_seconds` | Summary | API response time (p50, p95, p99) |
| JVM metrics (heap, GC, threads) | Auto | Exposed automatically by Actuator |

- Add Prometheus + Grafana to `docker-compose.yml`:

```yaml
prometheus:
  image: prom/prometheus:latest
  ports: ["9090:9090"]
  volumes:
    - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

grafana:
  image: grafana/grafana:latest
  ports: ["3001:3000"]
  environment:
    GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
  volumes:
    - ./grafana/dashboards:/var/lib/grafana/dashboards
```

- Pre-built Grafana dashboard JSON with panels:
  1. Telemetry ingestion rate (messages/sec)
  2. Kafka consumer lag
  3. API response latency (p50, p95, p99)
  4. JVM heap usage & garbage collection
  5. Fleet health distribution over time
  6. OTA success/failure rate
  7. Active vehicles count
  8. Redis memory usage

### 7B. Structured Logging

- Add `logback-spring.xml` with JSON-formatted log output
- Correlation IDs (vehicleId, campaignId) in every log line via MDC (Mapped Diagnostic Context)
- Consistent log format across all services

### Phase 7 Deliverables

- [ ] Spring Actuator + Prometheus metrics endpoint
- [ ] Custom Axion business metrics
- [ ] Prometheus scrape configuration
- [ ] Grafana dashboard with 8+ panels
- [ ] Structured JSON logging with correlation IDs
- [ ] Grafana accessible at `http://localhost:3001`

---

## Phase 8 — Polish & Presentation (Weeks 9–10)

**Goal**: Demo-ready, evaluator-proof system.

### What to Do

- **API Documentation**: SpringDoc OpenAPI with request/response examples for every endpoint
- **README**: Updated architecture diagram, setup instructions, API reference, screenshots
- **One-command deploy**: `docker-compose up -d` starts ALL 9-10 services:
  - Kafka, Zookeeper, Redis, Mosquitto (existing)
  - PostgreSQL, TimescaleDB (new)
  - Spring Boot Backend (new containerized)
  - FastAPI ML Service (new)
  - Prometheus, Grafana (new)
- **Load testing**: Simulate 100+ vehicles, show Grafana handling it gracefully
- **Demo script**: A structured 10-minute walkthrough showing every feature

### Phase 8 Deliverables

- [ ] Complete OpenAPI/Swagger documentation
- [ ] Updated README with architecture diagram
- [ ] Single `docker-compose up -d` starts everything
- [ ] Load test results (100+ vehicles)
- [ ] 10-minute demo script
- [ ] Screenshots of all major features

---

## Technology Stack Comparison

| Component | Minor (Current) | Major (Target) |
|-----------|-----------------|----------------|
| **State Management** | Redis only (120s TTL) | Redis + PostgreSQL + TimescaleDB |
| **Authentication** | None | Spring Security + JWT + RBAC |
| **Frontend Updates** | Polling (3-5s interval) | WebSocket (STOMP) real-time push |
| **Analytics** | Live snapshot only | 30-day historical trends + ML predictions |
| **ML / AI** | None | FastAPI + scikit-learn + XGBoost |
| **OTA Management** | Single trigger, in-memory | Campaign lifecycle, canary, health-gating, rollback |
| **Monitoring** | None | Prometheus + Grafana + Actuator |
| **Logging** | Basic SLF4J | Structured JSON + MDC correlation IDs |
| **Event Timeline** | None | RCA timeline with cross-source correlation |
| **API Docs** | Minimal | Full OpenAPI/Swagger with examples |
| **Docker Services** | 4 containers | 9-10 containers (full platform) |

---

## Work Division

### Animesh (System & Platform Lead)

| Task | Phase | Description |
|------|-------|-------------|
| Database schemas | Phase 1 | TimescaleDB hypertable, PostgreSQL tables, Flyway migrations |
| JPA Repositories | Phase 1 | Spring Data JPA for campaigns, users, policies, audit |
| Spring Security + JWT | Phase 2 | Auth filter chain, token provider, role enforcement |
| WebSocket Backend | Phase 3 | STOMP config, TelemetryWebSocketPublisher |
| OTA Campaign Lifecycle | Phase 5 | State machine, health-gating, canary logic, PostgreSQL persistence |
| Prometheus + Grafana | Phase 7 | Actuator, Micrometer metrics, Grafana dashboard JSON |
| RCA Query Engine | Phase 6 | Cross-source event merging (TimescaleDB + PostgreSQL) |
| Docker Compose | Phase 8 | Full platform orchestration |

### Kajol (Simulation & Analytics Lead)

| Task | Phase | Description |
|------|-------|-------------|
| FastAPI ML Service | Phase 4 | Model training, prediction endpoints, TimescaleDB queries |
| Frontend Auth | Phase 2 | Login page, AuthContext, protected routes, role-based UI |
| Frontend WebSocket | Phase 3 | STOMP.js client, useWebSocket hook, auto-reconnect |
| RCA Timeline UI | Phase 6 | Interactive timeline component, event visualization |
| Campaign Manager UI | Phase 5 | Campaign wizard, rollout progress bar, history table |
| Analytics Upgrade | Phase 4 | Historical charts (24h/7d/30d), ML prediction widgets |
| Load Testing | Phase 8 | 100+ vehicle simulation, performance validation |

---

## What Makes This Production-Grade

| Feature | Why Evaluators Care |
|---------|---------------------|
| **Persistent Data** | Survives restarts, queryable 30-day history — proves database competence |
| **Authentication + RBAC** | Not just open endpoints — proves security awareness |
| **ML Predictions** | "Intelligent" system with confidence scores — proves data science integration |
| **WebSockets** | True real-time push, not fake polling — proves modern architecture knowledge |
| **Canary OTA Deployments** | Enterprise deployment strategy — proves understanding of production systems |
| **RCA Timeline** | Proves the value of event-driven architecture with cause-and-effect analysis |
| **Grafana Dashboards** | Infrastructure visibility — proves DevOps/SRE awareness |
| **One-Command Deploy** | `docker-compose up -d` runs everything — proves containerization mastery |

---

## Minor Freeze Contract

The Minor submission acts as a hard contract barrier. The following are **frozen** and must not change:

- Canonical telemetry schema (CanonicalTelemetryEnvelope)
- Existing REST API contracts (`/api/v1/fleet/*`, `/api/v1/telemetry`, `/api/v1/ota/trigger`)
- Kafka topic names (`telemetry.normal`, `ota.events`)
- Core health scoring logic (HealthScoreEngine thresholds)

**Only additive changes are allowed** — new endpoints, new services, new database tables, new frontend pages. No breaking changes to existing interfaces.

---

*Document generated: March 2026*
*Project: Axion EV Fleet Management*
*Team: Animesh (System Lead) + Kajol (Analytics Lead)*
