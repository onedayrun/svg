#!/usr/bin/env bash
set -euo pipefail
PORT_IN="${1:-${PORT:-}}"
if [[ -z "$PORT_IN" ]]; then
  echo "Usage: $0 <port> or PORT=<port> $0" >&2
  exit 1
fi
PIDS=$(lsof -t -iTCP:"$PORT_IN" -sTCP:LISTEN 2>/dev/null || true)
if [[ -n "$PIDS" ]]; then
  echo "Killing PIDs $PIDS on port $PORT_IN"
  kill -9 $PIDS || true
else
  echo "No listeners on $PORT_IN"
fi
