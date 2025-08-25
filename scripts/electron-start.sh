#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$DIR/electron"
ELECTRON_APP_URL="${ELECTRON_APP_URL:-}" ELECTRON_ENABLE_LOGGING=1 npm start
