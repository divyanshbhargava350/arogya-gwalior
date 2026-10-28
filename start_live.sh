#!/usr/bin/env bash
# =============================================================================
# Arogya Gwalior (Sanjeevani) - 1-Click Instant Live Server + Public Tunnel
# =============================================================================

echo "========================================================"
echo "🌿 Starting Arogya Gwalior Local Server & Live Public Tunnel"
echo "========================================================"

# Determine Python
if [ -f "venv/bin/python3" ]; then
    PY="venv/bin/python3"
else
    PY="python3"
fi

# Start Backend Server
echo "1. Starting Backend & UI Server on port 8000..."
$PY -m uvicorn backend.main:app --host 0.0.0.0 --port 8000 &
SERVER_PID=$!

sleep 2

# Start Public HTTPS Tunnel
echo "2. Creating Instant Live HTTPS Public Tunnel..."
echo "--------------------------------------------------------"
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8000 nokey@localhost.run

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
