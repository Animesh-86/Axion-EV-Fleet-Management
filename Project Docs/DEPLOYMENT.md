# Axion EV Fleet Management — Deployment Guide

## Quick Start (One Command)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# Clone the repo
git clone https://github.com/Animesh-86/Axion-EV-Fleet-Management.git
cd Axion-EV-Fleet-Management

# Build & launch everything
docker compose up --build -d
```

Open **http://localhost** — the full dashboard with 20 live simulated vehicles.

### Stop

```bash
docker compose down
```

---

## What Gets Deployed

| Service | Container | Port | Technology |
|---------|-----------|------|------------|
| **Frontend** | `axion-frontend` | `:80` | React + Nginx |
| **Backend** | `axion-backend` | `:8080` | Spring Boot 3.2 |
| **Simulator** | `axion-simulator` | — | Python 3.12 |
| **Kafka** | `axion-kafka` | `:9092` | Confluent 7.5 |
| **Redis** | `axion-redis` | `:6379` | Redis 7.0 |
| **Mosquitto** | `axion-mosquitto` | `:1883` | Eclipse 2.0 |
| **Zookeeper** | `axion-zookeeper` | `:2181` | Confluent 7.5 |

**Startup order** (automatic via healthchecks):
Zookeeper → Kafka → Redis → Mosquitto → Backend → Frontend + Simulator

---

## Deployment Options

### Option 1: Local Docker (Above)
Best for demos and local testing. Runs on any machine with Docker.

### Option 2: Cloud VM (AWS EC2 / Azure VM / DigitalOcean)

1. Create a VM (Ubuntu 22.04, minimum **4 GB RAM**, 2 vCPU)
2. Install Docker + Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   sudo usermod -aG docker $USER
   ```
3. Clone and deploy:
   ```bash
   git clone https://github.com/Animesh-86/Axion-EV-Fleet-Management.git
   cd Axion-EV-Fleet-Management
   docker compose up --build -d
   ```
4. Open port **80** in your cloud firewall/security group
5. Access at `http://<your-vm-public-ip>`

### Option 3: Railway / Render (PaaS)

These platforms support Docker Compose or multi-service deploys:

- **[Railway](https://railway.app)**: Import GitHub repo → Railway auto-detects `docker-compose.yml` → Deploy
- **[Render](https://render.com)**: Create a "Blueprint" from the repo with render.yaml (requires splitting services)

### Option 4: GitHub Codespaces (Instant Demo)

1. Open repo on GitHub → Click **Code** → **Codespaces** → **New codespace**
2. In the terminal: `docker compose up --build -d`
3. Codespaces auto-forwards port 80 — share the URL

---

## Environment Variables

Override these in `docker-compose.yml` or pass via `-e`:

| Variable | Default | Purpose |
|----------|---------|---------|
| `AXION_KAFKA_BOOTSTRAP_SERVERS` | `kafka:9092` | Kafka broker address |
| `AXION_MQTT_BROKER_URL` | `tcp://mosquitto:1883` | MQTT broker |
| `SPRING_DATA_REDIS_HOST` | `redis` | Redis host |
| `AXION_CORS_ALLOWED_ORIGINS` | `http://localhost` | CORS allowed origins |
| `AXION_BACKEND_URL` | `http://backend:8080/api/v1/telemetry` | Simulator → Backend URL |
| `VITE_API_BASE_URL` | `""` (proxied via nginx) | Frontend API base |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Kafka won't start | Wait 30s and retry — Zookeeper healthcheck gates it |
| Backend fails to connect | Check `docker compose logs backend` — Kafka may still be initializing |
| Frontend shows no data | Verify backend health: `curl http://localhost:8080/api/v1/fleet/summary` |
| Port 80 in use | Change frontend port in `docker-compose.yml`: `"3000:80"` instead of `"80:80"` |
| Rebuild after code changes | `docker compose up --build -d` |

---

## Development Mode (Without Docker)

For local development with hot-reload, run services individually:

```bash
# 1. Infrastructure only
cd Axion-Backend && docker compose up -d

# 2. Backend
cd Axion-Backend/ingestion && ./mvnw spring-boot:run

# 3. Frontend (hot-reload on :5173)
cd Axion-Frontend && npm run dev

# 4. Simulator
cd Axion-Simulator && python main.py
```
