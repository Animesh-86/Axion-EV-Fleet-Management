# Axion EV Fleet Management — Major Project: Detailed Work Plan

## Overview
This document details the phase-wise breakdown, responsibilities, and implementation flow for the Major Project, clearly separating tasks for Animesh (Frontend & Backend) and Kajol (ML, Analytics, Simulator).

---

## 1. Phase-Wise Task Breakdown

### Phase 1 — Database & Persistence

**Animesh (Frontend & Backend):**
- Add TimescaleDB and PostgreSQL to docker-compose.
- Implement Flyway migration scripts for PostgreSQL schemas (users, campaigns, policies, audit).
- Create Spring Data JPA repositories for business data.
- Implement TelemetryHistoryConsumer (Kafka → TimescaleDB batch insert).
- Expose REST endpoints for historical telemetry and aggregates.
- Ensure OTA campaigns and audit logs are persisted.
- Frontend: Build historical charts (24h/7d/30d), audit log page.

**Kajol:**
- No direct tasks in this phase.

---

### Phase 2 — Authentication & Security

**Animesh:**
- Integrate Spring Security + JWT in backend.
- Implement JwtTokenProvider, JwtAuthenticationFilter, SecurityConfig.
- Create login/register endpoints, BCrypt password hashing.
- Enforce RBAC on endpoints.
- Frontend: Build login page, AuthContext, protected routes, role-based UI, logout button.
- Ensure audit logs record user actions.

**Kajol:**
- Assist with frontend auth if needed.

---

### Phase 3 — Real-Time WebSockets

**Animesh:**
- Add spring-boot-starter-websocket, configure STOMP over SockJS.
- Implement TelemetryWebSocketPublisher (broadcast twin/OTA/alert updates).
- Expose WebSocket endpoints for fleet/vehicle updates.
- Frontend: Replace polling with STOMP.js WebSocket subscriptions, useWebSocket hook, real-time dashboard, toast notifications, connection status indicator.

**Kajol:**
- No direct tasks.

---

### Phase 4 — ML Predictive Analytics

**Animesh:**
- Backend: Integrate ML service client, cache predictions in Redis, expose predictions in vehicle detail API.
- Frontend: Build prediction widgets (vehicle detail), fleet risk heatmap, ML-driven alerts.

**Kajol:**
- Create Axion-ML FastAPI microservice (battery depletion, temp anomaly models).
- Connect ML service to TimescaleDB.
- Implement REST endpoints for predictions, retraining, risk ranking.
- Build Docker container for ML service.
- Support frontend with API contracts and data formats.

---

### Phase 5 — Advanced OTA Orchestration

**Animesh:**
- Backend: Implement OtaCampaignService (state machine, canary, health-gating, rollback, approval workflow).
- Expose campaign management endpoints.
- Frontend: Build campaign creation wizard, rollout progress bar, campaign history, rollback button, real-time status.

**Kajol:**
- No direct tasks.

---

### Phase 6 — Root Cause Analysis Timeline

**Animesh:**
- Backend: Build query engine merging TimescaleDB and PostgreSQL events.
- Expose RCA API endpoint.
- Frontend: Build interactive RCA timeline component, event correlation logic, vehicle-specific RCA page.

**Kajol:**
- Assist with frontend RCA timeline visualization if needed.

---

### Phase 7 — Observability & Monitoring

**Animesh:**
- Backend: Add Spring Actuator, Micrometer Prometheus registry, expose custom metrics.
- Add Prometheus & Grafana to docker-compose.
- Create Grafana dashboard JSON.
- Implement structured JSON logging with correlation IDs.

**Kajol:**
- No direct tasks.

---

### Phase 8 — Polish & Presentation

**Animesh:**
- Backend: Add OpenAPI/Swagger docs, update README, ensure one-command deploy.
- Frontend: Add screenshots, polish UI, demo script, load test results.

**Kajol:**
- Run large-scale simulation (100+ vehicles), validate system under load, provide analytics for demo.

---

## 2. Work Division Table

| Phase | Animesh (Frontend & Backend) | Kajol (ML, Analytics, Simulator) |
|-------|------------------------------|----------------------------------|
| 1     | DB setup, JPA, Flyway, REST, frontend charts, audit log | — |
| 2     | Spring Security, JWT, RBAC, frontend auth, role UI | Assist frontend auth |
| 3     | WebSocket backend, frontend real-time, notifications | — |
| 4     | ML client, Redis cache, frontend ML widgets | FastAPI ML service, models, endpoints, Docker |
| 5     | OTA state machine, campaign APIs, frontend campaign UI | — |
| 6     | RCA query engine, API, frontend timeline | Assist RCA UI |
| 7     | Actuator, Prometheus, Grafana, logging | — |
| 8     | OpenAPI docs, README, deploy, frontend polish | Load testing, analytics validation |

---

## 3. Implementation Flow

1. Set up DB containers and migrations (Animesh)
2. Implement backend persistence, REST APIs, and frontend charts (Animesh)
3. Add authentication and RBAC (Animesh), build frontend auth (Animesh/Kajol)
4. Integrate WebSockets for real-time updates (Animesh), update frontend (Animesh)
5. Develop ML microservice (Kajol), integrate with backend and frontend (Both)
6. Implement advanced OTA logic and UI (Animesh)
7. Build RCA engine and timeline UI (Animesh, with Kajol’s help for visualization)
8. Add observability, monitoring, and structured logging (Animesh)
9. Polish, document, and load test (Both)

---

## 4. Feature Checklist by Owner

### Animesh
- DB schemas, migrations, JPA, REST APIs
- Auth, RBAC, frontend login/protected routes
- WebSocket backend, frontend real-time updates
- ML client, prediction widgets, risk heatmap
- OTA campaign backend, frontend wizard/history
- RCA query engine, timeline UI
- Prometheus, Grafana, logging, docs, polish

### Kajol
- FastAPI ML microservice, models, endpoints
- Dockerize ML service
- Support frontend ML integration
- Load testing with simulator
- Analytics validation, RCA timeline UI support

---

## 5. Timeline & Coordination

- Each phase should be tracked in a Kanban board (e.g., GitHub Projects or Notion).
- Weekly sync meetings to review progress and blockers.
- Use clear API contracts and interface docs for handoff between backend/frontend/ML.
- Prioritize integration testing after each major backend/ML milestone.

---

## 6. Notes

- Minor project scope (telemetry schema, existing REST API contracts) is frozen and must not change.
- All new features must be production-grade, with persistence, security, and observability.
- Aim for a one-command deploy and a demo-ready system by the end of the timeline.

---

This plan should guide the full implementation and collaboration for the Major Project.