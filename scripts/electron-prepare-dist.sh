#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$DIR/frontend" && (npm ci || npm install) && npm run build
rm -rf "$DIR/electron/dist"
mkdir -p "$DIR/electron/dist"
cp -r "$DIR/frontend/dist/"* "$DIR/electron/dist/"
