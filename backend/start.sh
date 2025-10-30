#!/bin/bash
set -euo pipefail

python3 -m uvicorn model.functions:app --host 0.0.0.0 --port 8000 &
UVICORN_PID=$!

node server.js &
NODE_PID=$!

terminate() {
  kill -TERM "$UVICORN_PID" "$NODE_PID" 2>/dev/null || true
}

trap terminate SIGINT SIGTERM

wait -n "$UVICORN_PID" "$NODE_PID"
EXIT_CODE=$?

terminate
wait "$UVICORN_PID" "$NODE_PID" 2>/dev/null || true

exit "$EXIT_CODE"
