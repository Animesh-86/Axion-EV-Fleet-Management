@echo off
setlocal
echo ==================================================
echo  Axion EV Fleet - Local Hybrid Dev Setup
echo ==================================================
echo.

:: Check Docker
where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    exit /b 1
)

:: Step 1: Start infrastructure
echo [1/4] Starting infrastructure services (Kafka, Redis, Postgres, TimescaleDB, Mosquitto)...
call docker compose -f docker-compose.dev.yml up -d
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to start infrastructure. Check Docker logs.
    exit /b 1
)

echo.
echo [2/4] Waiting for infrastructure to be healthy...
echo       This may take 30-60 seconds for Kafka...
timeout /t 10 /nobreak >nul

echo.
echo ==================================================
echo  Infrastructure is starting up!
echo ==================================================
echo.
echo  Now open separate terminals to run each service:
echo.
echo  BACKEND (Terminal 1):
echo    cd Axion-Backend\ingestion
echo    mvn spring-boot:run
echo.
echo  FRONTEND (Terminal 2):
echo    cd Axion-Frontend
echo    npm install   (first time only)
echo    npm run dev
echo.
echo  ML SERVICE (Terminal 3 - optional):
echo    cd Axion-ML
echo    pip install -r requirements.txt   (first time only)
echo    uvicorn main:app --host 0.0.0.0 --port 8000 --reload
echo.
echo  SIMULATOR (Terminal 4 - optional):
echo    cd Axion-Simulator
echo    pip install -r requirements.txt   (first time only)
echo    python main.py
echo.
echo  PORTS:
echo    Frontend:    http://localhost:3000
echo    Backend:     http://localhost:8080
echo    ML Service:  http://localhost:8000
echo    Kafka:       localhost:9092
echo    Redis:       localhost:6379
echo    PostgreSQL:  localhost:5432
echo    TimescaleDB: localhost:5433
echo    MQTT:        localhost:1883
echo.
echo  To stop infrastructure:
echo    docker compose -f docker-compose.dev.yml down
echo ==================================================
