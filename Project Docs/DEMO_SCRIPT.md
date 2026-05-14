# Axion EV Fleet Management — 10-Minute Demo Walkthrough

This demo walkthrough is structured for senior engineering evaluators, highlighting the production-grade architecture, dual-database ingestion engine, anomaly RCA engine, observability suite, and GenAI intelligence capabilities.

---

## ⏱️ Minute 0–2: Architecture & Multi-Stage Deployment
**Goal**: Demonstrate complete containerized orchestration and infrastructure setup.
- Run `docker compose up -d` to verify all 12 containers are active and healthy.
- Highlight the dual-database architecture:
  - **TimescaleDB** (`axion_ts`): Optimized hyper-tables for real-time high-throughput time-series sensory telemetry.
  - **PgVector PostgreSQL** (`axion`): Primary relational and vector store for user management, OTA campaigns, and LLM RAG similarity embeddings.
- Show the clean separation of ingestion pipelines via **Kafka** (`telemetry.normal`, `ota.events`) and **MQTT** (`axion/telemetry/+`).

---

## ⏱️ Minute 2–4: Real-time Digital Twin & Streaming Analytics
**Goal**: Walk through the Mission Control dashboard and live vehicle digital twins.
- Open `http://localhost/` in the browser.
- Demonstrate the real-time telemetry stream updating vehicle health scores, battery temperatures, and network packet loss metrics instantly.
- Show the automatic state transitions (`OPTIMAL` -> `DEGRADED` -> `CRITICAL`) when simulated sensory spikes occur.

---

## ⏱️ Minute 4–6: Anomaly Detection & Root Cause Analysis (RCA)
**Goal**: Showcase the ML predictive analytics engine and RCA correlation.
- Navigate to the **Analytics & Alerts** view.
- Explain the integration with the **FastAPI ML Service** running Isolation Forests for real-time multivariate anomaly detection.
- Click into a degraded vehicle to display the **Interactive Timeline Visualization** correlating battery voltage drops with network packet loss.

---

## ⏱️ Minute 6–8: Observability, Prometheus, & Grafana Under Load
**Goal**: Demonstrate enterprise-grade infrastructure monitoring.
- Open Grafana at `http://localhost:3001/`.
- Display the **Axion EV Fleet Mission Control Observability** pre-built dashboard containing 8 comprehensive monitoring panels (Telemetry Ingestion Rate, Kafka Consumer Lag, API Response Quantiles, JVM Heap, Active Threads).
- In a terminal, run `python load_test.py` to simulate **100+ concurrent EV nodes** transmitting high-frequency MQTT telemetry. Show Grafana graphs scaling dynamically without latency spikes.

---

## ⏱️ Minute 8–10: GenAI Fleet Intelligence (Spring AI)
**Goal**: Showcase advanced autonomous conversational reasoning and diagnostics.
- Click the glowing purple **"GENAI INTELLIGENCE ^"** button in the bottom-right corner of the Mission Control dashboard.
- Demonstrate multi-turn conversational interactions streaming real-time markdown tokens over SSE.
- Show autonomous tool calling (`getVehicleStatus`, `getFleetSummary`) inspecting live Redis digital twin caches.
- Highlight the background automated explanation engine generating structured diagnostic summaries during vehicle health anomalies via PgVector similarity RAG.
