# Alias: stop containers (same as docker-down)
stop: docker-down
# Alias: start containers (same as docker-up)
start: docker-up
# Simple Makefile for local dev and Docker workflows

.PHONY: help install-backend install-frontend dev-backend dev-frontend frontend-build docker-build docker-up docker-down docker-logs docker-restart dev electron-install electron-start electron-prepare-dist electron-release-linux electron-release-linux-all electron-release kill-port kill-ports stop-all stop

# Defaults for ports if not provided by environment
FRONTEND_PORT ?= 8089
BACKEND_PORT ?= 9134
BACKEND_INTERNAL_PORT ?= 1234

help:
	@echo "Targets:"
	@echo "  install-backend   - npm install in backend"
	@echo "  install-frontend  - npm install in frontend"
	@echo "  dev-backend       - run backend server (ws on :1234)"
	@echo "  dev-frontend      - run frontend Vite dev server"
	@echo "  frontend-build    - build frontend (Vite) into dist/"
	@echo "  docker-build      - build Docker images"
	@echo "  docker-up         - start services in background"
	@echo "  docker-down       - stop services"
	@echo "  stop              - alias for docker-down"
	@echo "  docker-logs       - follow logs"
	@echo "  docker-restart    - restart services"
	@echo "  dev               - docker compose up (ports from .env: FRONTEND_PORT, BACKEND_PORT)"
	@echo "  electron-install  - install Electron deps"
	@echo "  electron-start    - start Electron app (ELECTRON_APP_URL to point to URL)"
	@echo "  electron-prepare-dist - build frontend and copy into electron/dist"
	@echo "  electron-release-linux - package Electron app for Linux (ARCH env: x64|arm64, default x64)"
	@echo "  electron-release-linux-all - package for linux x64 and arm64"
	@echo "  kill-port PORT=<p> - kill any process listening on TCP port <p>"
	@echo "  kill-ports        - kill common dev ports ($(FRONTEND_PORT), $(BACKEND_PORT), 5173, 1234)"
	@echo "  stop-all          - docker compose down + kill-ports"

install-backend:
	bash scripts/install-backend.sh

install-frontend:
	bash scripts/install-frontend.sh

dev-backend:
	bash scripts/dev-backend.sh

dev-frontend:
	bash scripts/dev-frontend.sh

frontend-build:
	bash scripts/frontend-build.sh

docker-build:
	bash scripts/docker-build.sh

docker-up:
	bash scripts/docker-up.sh

docker-down:
	bash scripts/docker-down.sh

docker-logs:
	bash scripts/docker-logs.sh

docker-restart:
	bash scripts/docker-restart.sh

dev: docker-up

electron-install:
	bash scripts/electron-install.sh

# Run with optional ELECTRON_APP_URL, e.g. ELECTRON_APP_URL=http://localhost:8080 make electron-start
electron-start:
	ELECTRON_APP_URL=$${ELECTRON_APP_URL} bash scripts/electron-start.sh

# Build frontend and place assets into electron/dist for offline packaged app
electron-prepare-dist:
	bash scripts/electron-prepare-dist.sh

# Build a Linux release using electron-packager.
# Usage:
#   make electron-release-linux            # x64 by default
#   ARCH=arm64 make electron-release-linux # build arm64
electron-release-linux: electron-prepare-dist
	ARCH=$${ARCH} bash scripts/electron-release-linux.sh

# Build both linux x64 and arm64
electron-release-linux-all: electron-prepare-dist
	bash scripts/electron-release-linux-all.sh

# Alias
electron-release: electron-release-linux

# Kill a single port listener: make kill-port PORT=1234
kill-port:
	@if [ -z "$${PORT}" ]; then echo "Usage: make kill-port PORT=<p>"; exit 1; fi
	PORT=$${PORT} bash scripts/kill-port.sh

# Kill common dev ports
kill-ports:
	FRONTEND_PORT=$${FRONTEND_PORT} BACKEND_PORT=$${BACKEND_PORT} bash scripts/kill-ports.sh

# Stop docker services and free common dev ports
stop-all:
	FRONTEND_PORT=$${FRONTEND_PORT} BACKEND_PORT=$${BACKEND_PORT} bash scripts/stop-all.sh
