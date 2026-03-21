<p align="center">
  <img src="Design/Dashboard.png" alt="Axion Dashboard" width="100%"/>
</p>

<h1 align="center">⚡ Axion — EV Fleet Management Platform</h1>

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

## 🚀 Quick Start

```bash
git clone https://github.com/Animesh-86/Axion-EV-Fleet-Management.git
cd Axion-EV-Fleet-Management
docker compose up --build -d
```

Open **http://localhost** — 250 simulated EVs streaming live telemetry.

---

## 📖 Overview

Axion is a **backend-first, event-driven platform** that ingests, normalizes, and processes electric vehicle telemetry at scale. It maintains a **real-time digital twin** for each vehicle, computes **explainable health scores**, and orchestrates **OTA update simulations** across a fleet of 250 vehicles.

The system tolerates unreliable connectivity, heterogeneous vendor data formats, and high-throughput telemetry streams — providing operators with actionable fleet insights through a premium dark-themed dashboard.

> 🎓 Academic project with industry-aligned architecture — emphasizing correctness, scalability, and explainability.

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     AXION ARCHITECTURE                           │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Python Simulator]              [React Dashboard]               │
│   250 Vehicles                    Polling 3-5s                   │
│   5 Scenarios                          ▲                         │
│       │                                │                         │
│       ▼                          Fleet REST API                  │
│  REST + MQTT ──────► [Spring Boot Ingestion]                     │
│                            │                                     │
│                    Validate + Normalize                           │
│                            │                                     │
│                            ▼                                     │
│                   [Apache Kafka]                                  │
│                   telemetry.normal                                │
│                   ota.events                                     │
│                            │                                     │
│                            ▼                                     │
│                   [TelemetryConsumer]                             │
│                            │                                     │
│                    ┌───────┴───────┐                              │
│                    ▼               ▼                              │
│            [Digital Twin]   [Health Score                         │
│             Service]         Engine]                              │
│                    │                                              │
│                    ▼                                              │
│              [Redis 7.0]                                         │
│              Live State                                          │
│              120s TTL                                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**Data Flow:** Simulator → REST/MQTT → Spring Boot → Kafka → Consumer → Digital Twin + Health Score → Redis → React Dashboard

---

## ✨ Key Features

### 🔌 Dual-Protocol Telemetry Ingestion
- REST (HTTP POST) and MQTT ingestion
- Adapter pattern normalizes vendor data into canonical `CanonicalTelemetryEnvelope`
- Strict validation with graceful error handling
- Throughput tracking (events/second)

### 📡 Real-Time Event Pipeline
- Apache Kafka as central event backbone
- Topic isolation: `telemetry.normal`, `ota.events`
- Fault-tolerant, replayable event processing

### 🪞 Digital Twin Engine
- One authoritative twin per vehicle in Redis
- Stores: telemetry snapshot, health score, connectivity state
- Stale-data protection via timestamp ordering
- Automatic 120s TTL expiry

### 💚 Explainable Health Scoring (0–100)
- Rule-based scoring with configurable thresholds
- **HEALTHY** (≥80) · **DEGRADED** (50–79) · **CRITICAL** (<50)
- Factors: Battery SOC, battery temperature, connectivity
- Human-readable explanations for every deduction

### 🔄 OTA Update Simulation
- Health-gated: refuses if battery low or temp high
- State machine: `PENDING → IN_PROGRESS → SUCCESS / FAILURE`
- Canary-style rollout with automatic rollback
- Campaign tracking via Kafka events

### 📊 Premium Dashboard
- Dark-themed React 18 dashboard with glassmorphism effects
- 6 animated KPI cards, health distribution charts
- 7+ pages: Dashboard, Fleet, Vehicle Detail, OTA Manager, Analytics, Alerts, System Health

### 🐍 250-Vehicle Simulator
- Python asyncio driving 250 concurrent EVs
- Vehicle profiles: sedan, truck, sport
- 5 fault-injection scenarios: normal drive, battery drain, temp spike, network dropout, OTA trigger
- YAML-based fleet configuration

---

## 🖼️ Screenshots

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

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Java 21, Spring Boot 3.2, Spring WebFlux |
| **Messaging** | Apache Kafka (Confluent 7.5), Zookeeper |
| **MQTT** | Eclipse Mosquitto 2.0 |
| **State Store** | Redis 7.0 Alpine |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Shadcn UI |
| **Charts** | Recharts, Framer Motion |
| **Simulator** | Python 3.12, asyncio, YAML config |
| **Deployment** | Docker, Docker Compose (7 containers) |

---

## 📁 Project Structure

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

## 🐳 Deployment

### Docker Compose (One Command)

```bash
docker compose up --build -d
```

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

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/telemetry` | Ingest telemetry payload |
| `GET` | `/api/v1/fleet/summary` | Fleet-wide KPIs (total, online, health distribution) |
| `GET` | `/api/v1/fleet/vehicles` | All vehicles with latest telemetry |
| `GET` | `/api/v1/fleet/vehicle/{id}` | Single vehicle digital twin |
| `POST` | `/api/v1/ota/trigger` | Trigger OTA update for a vehicle |

---

## 🗺️ Roadmap (Major Project — 7th Semester)

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

See [MAJOR_PROJECT_PLAN.md](Project%20Docs/MAJOR_PROJECT_PLAN.md) for full details.

---

## 👥 Team

| Member | Role |
|--------|------|
| **Animesh** | System & Platform Lead — Backend, infrastructure, deployment |
| **Kajol** | Simulation & Analytics Lead — Simulator, frontend, analytics |

---

## ⚠️ Disclaimer

Axion simulates OTA updates and vehicle behavior for academic and demonstration purposes only. It does not perform real firmware updates on physical vehicles.

## 📄 License

This project is developed for academic use. Licensing terms can be defined as required.