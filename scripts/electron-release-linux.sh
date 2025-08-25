#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
bash "$DIR/scripts/electron-prepare-dist.sh"
cd "$DIR"
ARCH="${ARCH:-x64}"
npx --yes electron-packager electron CollabMVP --platform=linux --arch="$ARCH" --out=release --overwrite
