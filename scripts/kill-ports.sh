#!/usr/bin/env bash
set -euo pipefail
FRONTEND_PORT="${FRONTEND_PORT:-8089}"
BACKEND_PORT="${BACKEND_PORT:-9134}"
PORTS=("$FRONTEND_PORT" "$BACKEND_PORT" 5173 1234)
for p in "${PORTS[@]}"; do
  if [[ -n "$p" ]]; then
    echo "Checking port $p"
    PIDS=$(lsof -t -iTCP:"$p" -sTCP:LISTEN 2>/dev/null || true)
    if [[ -n "$PIDS" ]]; then
      echo "Killing PIDs $PIDS on port $p"
      kill -9 $PIDS || true
    else
      echo "No listeners on $p"
    fi
  fi
done
