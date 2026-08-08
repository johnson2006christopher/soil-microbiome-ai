#!/bin/bash
set -e

PROJECT_DIR=~/work-innovations/soil-microbiome-ai

# Clean up any previously started instances from this project
echo "=== Stopping any existing project processes ==="
pkill -f "uvicorn main:app --host 0.0.0.0 --port 8000" 2>/dev/null || true
pkill -f "node index.js" 2>/dev/null || true
pkill -f "npx vite --host 0.0.0.0 --port 3000" 2>/dev/null || true
pkill -f "cloudflared tunnel --url http://localhost:3000" 2>/dev/null || true
sleep 2

cd "$PROJECT_DIR/ml-engine"
source .venv/bin/activate
export ML_ENGINE_API_KEY=ml-internal-key-change-in-production
export APP_ENV=production
nohup uvicorn main:app --host 0.0.0.0 --port 8000 > /tmp/ml-engine.log 2>&1 &
ML_PID=$!
echo "ML Engine PID: $ML_PID"

cd "$PROJECT_DIR/server"
# Accept any origin (Cloudflare Tunnel hostnames change on every run)
export CORS_ALLOW_ALL=true
nohup node index.js > /tmp/server.log 2>&1 &
echo "Server PID: $!"

cd "$PROJECT_DIR/client"
# Use relative API URLs so Vite's dev proxy handles /api -> localhost:5000.
# This avoids CORS when sharing via Cloudflare Tunnel.
export VITE_API_URL=
nohup npx vite --host 0.0.0.0 --port 3000 > /tmp/client.log 2>&1 &
echo "Client PID: $!"

# Wait briefly for services to start
sleep 5

# Verify
echo "=== Verifying ==="
curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null
curl -s http://localhost:5000/health
curl -s -o /dev/null -w "Client: HTTP %{http_code}\n" http://localhost:3000

# Cloudflare Tunnel (quick tunnel — no account required)
if command -v cloudflared &> /dev/null; then
    echo ""
    echo "=== Starting Cloudflare Tunnel ==="
    nohup cloudflared tunnel --url http://localhost:3000 > /tmp/cloudflared.log 2>&1 &
    CF_PID=$!
    echo "Cloudflared PID: $CF_PID"

    # Wait for the tunnel URL to appear in the log
    for i in {1..30}; do
        CF_URL=$(grep -oE 'https://[a-zA-Z0-9-]+\.trycloudflare\.com' /tmp/cloudflared.log | head -1)
        if [ -n "$CF_URL" ]; then
            echo ""
            echo "============================================"
            echo " SHAREABLE URL: $CF_URL"
            echo "============================================"
            break
        fi
        sleep 1
    done

    if [ -z "$CF_URL" ]; then
        echo "Cloudflare tunnel did not produce a URL yet."
        echo "Check the log: tail -f /tmp/cloudflared.log"
    fi
else
    echo ""
    echo "cloudflared is not installed. To get a shareable link, install it first:"
    echo "  Debian/Ubuntu: sudo apt install cloudflared"
    echo "  macOS:         brew install cloudflared"
    echo "  Other:         https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/"
    echo "Then run ./start.sh again."
fi

echo ""
echo "All services started."
