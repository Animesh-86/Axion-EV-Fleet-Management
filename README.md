<p align="center">
  <img src="Design/Dashboard.png" alt="Axion Dashboard" width="100%"/>
</p>

<h1 align="center">Axion — EV Fleet Management Platform</h1>

<p align="center">
  <b>Vendor-Neutral EV Fleet Telemetry · Digital Twin · OTA Orchestration</b><br/>
  <sub>Event-driven platform managing 250 electric vehicles in real-time</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Java-21-ED8B00?style=flat&logo=openjdk&logoColor=white"/>
  <img src="https://img.shields.io/badge/Spring_Boot-3.2-6DB33F?style=flat&logo=springboot&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black"/>
  <img src="https://img.shields.io/badge/Kafka-7.5-231F20?style=flat&logo=apachekafka&logoColor=white"/>
  <img src="https://img.shields.io/badge/Redis-7.0-DC382D?style=flat&logo=redis&logoColor=white"/>
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white"/>
</p>

---

## Quick Start

```bash
git clone https://github.com/Animesh-86/Axion-EV-Fleet-Management.git
cd Axion-EV-Fleet-Management

# Copy environment templates
cp .env.local.example .env.local
cp .env.production.example .env.production

# Run the 1-click deployment script
# On Windows:
deploy.bat

# On Linux / Mac:
./deploy.sh
```

Open http://localhost — 250 simulated EVs streaming live telemetry.

---

## Overview

Axion is an **enterprise-grade, event-driven EV fleet management platform** built for high-throughput telemetry ingestion, real-time digital twin tracking, explainable AI health scoring, and resilient over-the-air (OTA) orchestrations. 

Engineered with a **production-first mindset**, the platform leverages Spring Boot, Spring WebFlux (for non-blocking concurrent I/O), Apache Kafka (for decoupled linear stream processing), Mosquitto MQTT, and Redis (for distributed coordination, low-latency twin storage, and global lock management).

---

## Production-Grade Architecture

To scale seamlessly to thousands of concurrent electric vehicles under unreliable network conditions, Axion utilizes a decoupled, linear event-driven pipeline that guarantees zero data loss, low database contention, and robust edge validation.

```
┌────────────────────────────────────────────────────────────────────────┐
│                     AXION ENTERPRISE ARCHITECTURE                      │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [250 simulated EVs]                [Enterprise Dashboard (React)]     │
│   HTTP/MQTT Client                      WebSocket / REST API           │
│         │                                        ▲                     │
│         ▼ (Edge Security)                        │ (Throttled 1/sec)   │
│  [Mosquitto MQTT Broker]                         │                     │
│    └─► Validation (VehicleRegistry)              │                     │
│  [Spring Boot Ingestion REST]                    │                     │
│         │                                        │                     │
│         ▼ Ingest (Throughput metrics)            │                     │
│   (Topic: telemetry.raw)                         │                     │
│  [Apache Kafka Ingress]                          │                     │
│         │                                        │                     │
│         ▼ Consume                                │                     │
│  [TelemetryPipelineEnricher]                     │                     │
│         │                                        │                     │
│         ├─► Schema Validation & Registry checks  │                     │
│         ├─► [ML Predictive Service] (WebClient)  │                     │
│         └─► Rules Engine (Health Scoring)        │                     │
│         │                                        │                     │
│         ▼ Publish Enriched Telemetry             │                     │
│   (Topic: telemetry.enriched) ───► Persistence   │                     │
│  [Apache Kafka Egress]            (TimescaleDB)  │                     │
│         │                                        │                     │
│         ▼ Consume                                │                     │
│  [TelemetryEnrichedConsumer] ────────────────────┘                     │
│         │                                                              │
│         ▼ Direct Write (Optimized Twin State)                          │
│     [Redis 7.0 Cache] (120s TTL)                                       │
│         │                                                              │
│         ▼ LLM Explanations (Distributed Redis Lock)                    │
│     [Spring AI / OpenAI] ──► PgVector RAG KB                           │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Production Telemetry Pipeline
1. **Edge Authorization**: Incoming telemetry over MQTT is authorized at the edge. The `MqttMessageHandler` performs high-speed validation against the `VehicleRegistryService` to instantly drop unauthenticated payloads.
2. **Ingress Buffer (`telemetry.raw`)**: Telemetry payloads are normalized using the Adapter Pattern and immediately dispatched to Kafka's `telemetry.raw` partition to decouple the ingestion boundary from down-stream CPU-intensive operations.
3. **Linear Enrichment & Scoring Pipeline**:
   - The `TelemetryPipelineEnricher` processes events from `telemetry.raw` sequentially.
   - It executes non-blocking concurrent API calls to the ML predictive services using a Spring WebFlux `WebClient` under a fully reactive `Mono.zip(...)` pattern.
   - It performs deterministic health scoring and attaches metadata directly to a new `telemetry.enriched` Kafka topic.
4. **Authoritative Digital Twin State**:
   - The `TelemetryEnrichedConsumer` reads from `telemetry.enriched` and commits updates directly to Redis.
   - We removed highly-contentious Redis `WATCH/MULTI/EXEC` optimistic locks, replacing them with highly-performant direct read/writes governed by strict client-side timestamp tracking (stale telemetry packets are dropped deterministically).
5. **WebSocket Throttling & Debouncing**:
   - Broadcast storms are prevented by a local `ConcurrentHashMap`-based debouncer, limiting WebSocket `TWIN_UPDATE` UI notifications to a maximum of **1 update per second per vehicle**, shielding client browsers from rendering fatigue.

---

## Key Features & Hardened Infrastructure

### 🛡️ Edge Security & Dual-Protocol Ingestion
- **Protocols**: Low-overhead MQTT (Eclipse Mosquitto) and high-throughput REST (HTTP POST).
- **Edge Security**: Strict whitelist checks against a synchronized `VehicleRegistry` at ingestion time to prevent malicious packet injection.
- **Dependency Injection**: Fully clean Spring IoC architecture with constructor injection and annotated `@Component` mappings, entirely removing unmanageable `new` adapter/validator instances.

### ⚡ Non-Blocking Reactive Orchestration
- **WebClient Integration**: Stalling REST calls (previously blocked on `RestTemplate`) have been completely replaced with a fully concurrent, non-blocking `WebClient` integration to fetch real-time battery degradation predictions.
- **Throttling**: Dual-layered debouncing prevents downstream database and UI congestion while retaining data fidelity inside Kafka.

### 🧬 Digital Twin Engine & Distributed Locks
- **Redis Cache**: Authoritative digital twin states indexed by `vehicleId` with a 120-second automatic TTL expiry.
- **Distributed Lock Management**: The GenAI Anomaly Explainer utilizes a distributed Redis Lock manager (`setIfAbsent` with 15-minute global TTL) instead of local in-memory caches. This prevents concurrent LLM invocation storms and redundant token consumption when scaling backend replicas across multiple Kubernetes pods.

### 📊 Micrometer Observability (Prometheus & Grafana Ready)
- **Engineered Metrics**: Ripped out volatile custom array-based sliding windows, implementing native Spring **Micrometer Instrumentation** via `MeterRegistry`.
- **Metrics Tracked**: High-speed concurrency-safe telemetry throughput counters, processing latency timers, and payload validation failure meters.

### 🧪 Hardened OTA Simulation & State Machine
- **State Flow**: Gated state transitions: `PENDING → IN_PROGRESS → SUCCESS / FAILURE`.
- **Asynchronous Execution**: Simulated downloads and installations are executed via Spring `@Async` threads using non-blocking asynchronous delays (`Thread.sleep(3000)` within an executor pool). This preserves the critical `IN_PROGRESS` duration required for realistic frontend polling, rather than executing instantaneously.
- **Safety**: Updates automatically reject if the twin state indicates low state-of-charge (<20% SOC) or thermal warnings (>45°C).

### 🤖 Explainable GenAI Intelligence
- **RAG Capability**: Dynamic anomaly identification powered by Spring AI linked to a `PgVector` vector database.
- **Conversational Ops**: Continuous streaming Server-Sent Events (SSE) chat broker allowing operators to interactively diagnose anomalies in plain natural language.

### 🖥️ Premium Glassmorphic Dashboard
- **Visuals**: Dark-themed modern React 18 UI built with Tailwind CSS, Framer Motion, and Shadcn UI.
- **Dynamic Views**: 6 animated KPI cards, interactive Recharts graphs, real-time alert logs, custom OTA campaign controller, and a fully interactive GenAI SSE chat assistant.

### 🚗 Async Python Simulator
- **Simulation**: High-concurrency `asyncio` engine representing a fleet of 250 vehicles.
- **Scenarios**: 5 hot-swappable telemetry profiles (Normal Drive, Rapid SOC Drain, High-Temp Spike, GPS/Network Dropout, OTA trigger) loaded dynamically from YAML files.

---

## Screenshots

<details>
<summary><b>Fleet Dashboard</b> — Real-time monitoring with KPI cards & health distribution</summary>
<img src="Design/Dashboard.png" width="100%"/>
</details>

<details>
<summary><b>Vehicle List</b> — All vehicles with battery, temperature & health scores</summary>
<img src="Design/Vehicles.png" width="100%"/>
</details>

<details>
<summary><b>Digital Twin</b> — Battery, thermal, motion & operational states</summary>
<img src="Design/Digital Twin.png" width="100%"/>
</details>

<details>
<summary><b>OTA Campaign Manager</b> — Canary phases, rollout progress & rollback</summary>
<img src="Design/OTA.png" width="100%"/>
</details>

<details>
<summary><b>Analytics & Health Scoring</b> — Degradation trends & anomaly detection</summary>
<img src="Design/Analytics.png" width="100%"/>
</details>

<details>
<summary><b>Alerts</b> — Real-time alert feed with severity indicators</summary>
<img src="Design/Alerts.png" width="100%"/>
</details>

<details>
<summary><b>System Health</b> — Infrastructure monitoring & service status</summary>
<img src="Design/System Health.png" width="100%"/>
</details>

<details>
<summary><b>Settings</b> — Connection config, polling intervals & health scoring rules</summary>
<img src="Design/Settings.png" width="100%"/>
</details>

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.2, Spring WebFlux |
| **Messaging** | Apache Kafka (Confluent 7.5), Zookeeper |
| **MQTT** | Eclipse Mosquitto 2.0 |
| **GenAI / Vector** | Spring AI, PgVector (pgvector/pgvector:pg16), OpenAI |
| **State Store** | Redis 7.0 Alpine |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **Charts** | Recharts, Framer Motion |
| **Simulator** | Python 3.12, asyncio, YAML config |
| **Deployment** | Docker, Docker Compose (7 containers) |

---

## Project Structure

```
Axion-EV-Fleet-Management/
├── Axion-Backend/
│   └── ingestion/
│       └── src/main/java/com/axion/
│           ├── ingestion/          # Telemetry pipeline
│           │   ├── adapter/        # Vendor data normalization
│           │   ├── api/            # Fleet & Vehicle REST controllers
│           │   ├── config/         # Kafka, Redis, MQTT, CORS config
│           │   ├── consumer/       # Kafka telemetry consumer
│           │   ├── health/         # Health score engine & rules
│           │   ├── model/          # Domain models (twin, envelope, snapshot)
│           │   ├── mqtt/           # MQTT message handler
│           │   ├── producer/       # Kafka producer
│           │   ├── service/        # Digital twin, OTA, ingestion services
│           │   └── validation/     # Payload validator
│           └── ota/                # OTA orchestration module
├── Axion-Frontend/
│   └── src/
│       ├── components/             # Dashboard, Vehicle, OTA, Analytics pages
│       ├── services/               # API client, auth context
│       └── App.tsx                 # Main app with routing
├── Axion-Simulator/
│   ├── core/                       # Vehicle, state, telemetry builder
│   ├── scenarios/                  # Fault injection (5 scenarios)
│   ├── emitters/                   # REST & MQTT emitters
│   ├── ota/                        # OTA simulation
│   ├── profiles/                   # Vehicle profiles (sedan, truck, sport)
│   └── config/fleet.yaml           # Fleet configuration (250 vehicles)
├── Design/                         # Dashboard screenshots
├── Project Docs/                   # Reports, evaluation sheets, presentation
├── docker-compose.yml              # Full-stack deployment (7 containers)
└── README.md
```

---

## Deployment

For a complete feature-by-feature verification checklist, see [Project Docs/TESTING_GUIDE.md](Project%20Docs/TESTING_GUIDE.md).

### 1-Click Deployment (Recommended)

To completely spin up the stack, tear down any old conflicting containers, and ensure a clean environment, simply use the deployment scripts:

**Windows:**
```cmd
deploy.bat
```

**Linux / macOS:**
```bash
./deploy.sh
```

### Load Testing Simulation
To test the backend ingestion pipeline with high-throughput telemetry (100 concurrent vehicles), we provide a containerized load-tester. You don't need Python installed on your host machine to run this.

```bash
docker compose --profile testing up load-tester -d
```

### Troubleshooting
**Port Conflicts (e.g. 8080 or 5432 is already in use):**
If you see an error like `bind: Only one usage of each socket address is normally permitted`, it means you have a local process (like a local Postgres or a rogue Java process) holding that port. Ensure you shut down local databases or Spring Boot apps before running the deploy script.

| Container | Image | Port |
|-----------|-------|------|
| `axion-frontend` | React + Nginx | `:80` |
| `axion-backend` | Spring Boot 3.2 | `:8080` |
| `axion-simulator` | Python 3.12 | — |
| `axion-kafka` | Confluent 7.5 | `:9092` |
| `axion-redis` | Redis 7.0 | `:6379` |
| `axion-mosquitto` | Eclipse 2.0 | `:1883` |
| `axion-zookeeper` | Confluent 7.5 | `:2181` |

**Startup order** (automatic via healthchecks): Zookeeper → Kafka → Redis → Mosquitto → Backend → Frontend + Simulator

### Development Mode

```bash
# 1. Infrastructure
cd Axion-Backend && docker compose up -d

# 2. Backend (hot-reload on :8080)
cd Axion-Backend/ingestion && ./mvnw spring-boot:run

# 3. Frontend (hot-reload on :5173)
cd Axion-Frontend && npm run dev

# 4. Simulator
cd Axion-Simulator && python main.py
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/telemetry` | Ingest telemetry payload |
| `GET` | `/api/v1/fleet/summary` | Fleet-wide KPIs (total, online, health distribution) |
| `GET` | `/api/v1/fleet/vehicles` | All vehicles with latest telemetry |
| `GET` | `/api/v1/fleet/vehicle/{id}` | Single vehicle digital twin |
| `POST` | `/api/v1/ota/trigger` | Trigger OTA update for a vehicle |

---

## Roadmap (Major Project — 7th Semester)

| Phase | Feature | Timeline |
|-------|---------|----------|
| 1 | TimescaleDB + PostgreSQL persistence | Weeks 1–3 |
| 2 | JWT Authentication + RBAC | Weeks 3–4 |
| 3 | WebSocket real-time (replace polling) | Weeks 4–5 |
| 4 | ML Predictive Analytics (FastAPI + XGBoost) | Weeks 5–8 |
| 5 | Advanced OTA (canary, health-gating, rollback) | Weeks 6–8 |
| 6 | Root Cause Analysis timeline | Weeks 7–8 |
| 7 | Prometheus + Grafana observability | Weeks 8–9 |
| 8 | Polish, docs, load testing (100+ vehicles) | Weeks 9–10 |
| 9 | GenAI Fleet Intelligence (Spring AI + PgVector) | Weeks 5–9 |

See [MAJOR_PROJECT_PLAN.md](Project%20Docs/MAJOR_PROJECT_PLAN.md) for full details.

---

## Team

| Member | Role |
|--------|------|
| **Animesh** | System & Platform Lead — Backend, infrastructure, deployment |
| **Kajol** | Simulation & Analytics Lead — Simulator, frontend, analytics |

---

## Disclaimer

Axion simulates OTA updates and vehicle behavior for academic and demonstration purposes only. It does not perform real firmware updates on physical vehicles.

## License

This project is developed for academic use. Licensing terms can be defined as required.