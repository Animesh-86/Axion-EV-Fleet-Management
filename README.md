# Axion

**Vendor-Neutral EV Fleet Telemetry, Digital Twin, and OTA Orchestration Platform**

## Overview

Axion is a backend-first, event-driven platform designed to ingest, normalize, and process electric vehicle (EV) telemetry at scale. It maintains a real-time digital twin for each vehicle, computes health indicators, and safely orchestrates over-the-air (OTA) update simulations across a fleet.

The system is built to tolerate unreliable vehicle connectivity, heterogeneous vendor data formats, and high-throughput telemetry streams, while providing operators with actionable fleet insights.

Axion is developed as an academic project with industry-aligned architecture, emphasizing correctness, scalability, and explainability.

## Core Objectives

*   **Ingest telemetry** from multiple vehicles using different protocols
*   **Normalize** vendor-specific data into a canonical internal schema
*   **Maintain a real-time digital twin** per vehicle
*   **Compute explainable vehicle health scores**
*   **Persist telemetry** for historical analysis
*   **Simulate safe, controlled OTA update rollouts**
*   **Provide fleet-level and vehicle-level analytics**
*   **Support future extension** into ML-based predictive intelligence

## System Architecture (High-Level)

Axion follows a modular, event-driven architecture:

1.  **Vehicles or simulators** emit telemetry via REST or MQTT
2.  **Ingestion services** validate and normalize data
3.  **Normalized telemetry** is published to Kafka
4.  **Downstream consumers** update digital twins, compute health, and persist history
5.  **APIs** expose fleet and vehicle data to the frontend dashboard

This design ensures loose coupling, fault isolation, and scalability.

## Key Features

### 1. Vehicle Telemetry & Connectivity
*   Supports REST (HTTP) and MQTT ingestion
*   Handles intermittent connectivity and retries
*   Maintains connection lifecycle state (online/offline, last seen)
*   Enforces idempotency and ordering per vehicle

### 2. Vendor-Neutral Data Normalization
*   Converts all incoming telemetry into a canonical schema
*   Adapter-based design for different vendors and protocols
*   Strict validation with graceful degradation for partial data

### 3. Real-Time Event Pipeline
*   Apache Kafka as the central event backbone
*   Separation of ingestion and processing
*   Topic-based isolation for telemetry and OTA events
*   Replay and fault-tolerant processing

### 4. Digital Twin Engine
*   One authoritative digital twin per vehicle
*   Stores latest telemetry, connectivity state, and health
*   Retains last-known state during disconnections
*   Prevents stale data overwrites using timestamp rules

### 5. Vehicle Health Scoring
*   Rule-based health score (0–100)
*   Factors include battery behavior, temperature anomalies, and connectivity stability
*   Generates human-readable explanations for score changes

### 6. OTA Update Simulation
*   Simulated OTA update workflows (no real firmware flashing)
*   Deterministic state machine: PENDING → IN_PROGRESS → SUCCESS / FAILURE
*   Canary-style rollout logic
*   Automatic rollback on simulated failures

### 7. Analytics & Insights
*   Fleet-level metrics (health distribution, online/offline)
*   Vehicle-level telemetry trends
*   Historical analysis using time-series storage

### 8. Simulator Framework
*   Python-based EV simulators
*   Multiple vehicle profiles
*   Scenario-based fault injection (battery drain, temperature spikes, network drops)
*   Enables safe and repeatable testing

## Technology Stack

### Backend
*   **Java 21**
*   **Spring Boot 4**
*   **Spring WebFlux** (telemetry ingestion)
*   **Spring Security** (authentication and authorization)
*   **Hibernate / JPA**

### Streaming & Messaging
*   **Apache Kafka**
*   **Kafka Streams** (aggregation and processing)
*   JSON or Protobuf messaging

### Digital Twin & Caching
*   **Redis** (real-time state storage)

### Storage
*   **TimescaleDB** (telemetry time-series data)
*   **PostgreSQL** (metadata, OTA campaigns, users, audit logs)

### Analytics & AI/ML
*   **Python**
*   **Pandas, NumPy**
*   **Scikit-learn**
*   **XGBoost**
*   **FastAPI** (ML service)

### Frontend
*   **React**
*   **TypeScript**
*   **Vite**
*   **Tailwind CSS**
*   **WebSockets** for real-time updates

### Observability
*   **Prometheus**
*   **Grafana**
*   Structured logging (JSON)
*   OpenTelemetry (partial)

## Project Structure (Logical)

```text
axion/
├── ingestion-service/
├── normalization-layer/
├── kafka-streams/
├── digital-twin-service/
├── health-scoring-service/
├── ota-orchestration-service/
├── analytics-ml/
├── simulator/
├── frontend/
└── docs/
```

## Minor vs Major Scope

### Minor Project
*   Telemetry ingestion and normalization
*   Kafka-based event pipeline
*   Digital twin implementation
*   Rule-based health scoring
*   OTA update simulation
*   Basic analytics dashboard
*   Simulator framework
*   API contract freeze

### Major Project
*   ML-based predictive health analytics
*   Advanced OTA orchestration (canary, rollback automation)
*   Digital twin lifecycle and policy engine
*   Root cause analysis
*   Security hardening and auditability
*   Advanced observability and forecasting

## Design Principles
*   **Event-driven, not request-driven**
*   **Vendor-neutral internal contracts**
*   **Explainability over black-box intelligence**
*   **Fault tolerance over perfect connectivity**
*   **Clear separation between Minor and Major scope**

## Disclaimer
Axion simulates OTA updates and vehicle behavior for academic and demonstration purposes only. It does not perform real firmware updates on physical vehicles.

## License
This project is developed for academic use. Licensing terms can be defined as required.