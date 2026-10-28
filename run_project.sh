#!/usr/bin/env bash
# =============================================================================
# Arogya Gwalior (Sanjeevani) - 1-Click Launch Script
# =============================================================================

echo "========================================================"
echo "🌿 Starting Arogya Gwalior (Sanjeevani) Healthcare Platform"
echo "========================================================"

# Determine Python binary
if [ -f "venv/bin/python3" ]; then
    PY="venv/bin/python3"
elif command -v python3 &> /dev/null; then
    PY="python3"
else
    PY="python"
fi

echo "Using Python: $PY"
echo "Installing/checking requirements..."
$PY -m pip install -q -r requirements.txt 2>/dev/null || true

echo "Starting Server on http://localhost:8000 ..."
$PY -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
