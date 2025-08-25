#!/usr/bin/env bash
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
bash "$DIR/scripts/electron-prepare-dist.sh"
cd "$DIR"
for arch in x64 arm64; do
  npx --yes electron-packager electron CollabMVP --platform=linux --arch="$arch" --out=release --overwrite
done
