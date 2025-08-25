#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
if command -v docker >/dev/null 2>&1; then
  docker compose down || true
fi
bash "$DIR/scripts/kill-ports.sh"
