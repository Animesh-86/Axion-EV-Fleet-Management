#!/bin/bash
# Axion EV Fleet Management - Deployment Script

echo "=================================================="
echo " Starting Axion EV Fleet Management Deployment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "[ERROR] Docker is not installed or not in PATH."
    exit 1
fi

# Tear down any existing containers and networks cleanly
echo "[1/3] Tearing down existing Axion containers..."
docker compose down

# Start the stack
echo "[2/3] Building and starting Axion services..."
docker compose up --build -d

echo "[3/3] Deployment initiated successfully."
echo ""
echo "=================================================="
echo " The stack is spinning up. The services may take"
echo " 1-2 minutes to fully initialize and pass healthchecks."
echo ""
echo " Dashboard will be available at: http://localhost"
echo " To view logs: docker compose logs -f"
echo " To run the heavy load test (100 vehicles):"
echo "   docker compose --profile testing up load-tester"
echo "=================================================="
