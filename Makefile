# Simple Makefile for local dev and Docker workflows

.PHONY: help install-backend install-frontend dev-backend dev-frontend frontend-build docker-build docker-up docker-down docker-logs docker-restart dev electron-install electron-start electron-prepare-dist electron-release-linux electron-release-linux-all electron-release kill-port kill-ports stop-all

# Defaults for ports if not provided by environment
FRONTEND_PORT ?= 8088
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
	cd backend && npm install

install-frontend:
	cd frontend && npm install

dev-backend:
	cd backend && npm start

dev-frontend:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

docker-restart:
	docker compose restart

dev: docker-up

electron-install:
	cd electron && npm install

# Run with optional ELECTRON_APP_URL, e.g. ELECTRON_APP_URL=http://localhost:8080 make electron-start
electron-start:
	cd electron && ELECTRON_APP_URL=$${ELECTRON_APP_URL} npm start

# Build frontend and place assets into electron/dist for offline packaged app
electron-prepare-dist:
	cd frontend && (npm ci || npm install) && npm run build
	rm -rf electron/dist
	mkdir -p electron/dist
	cp -r frontend/dist/* electron/dist/

# Build a Linux release using electron-packager.
# Usage:
#   make electron-release-linux            # x64 by default
#   ARCH=arm64 make electron-release-linux # build arm64
electron-release-linux: electron-prepare-dist
	npx --yes electron-packager electron CollabMVP \
	  --platform=linux --arch=$${ARCH:-x64} \
	  --out=release --overwrite

# Build both linux x64 and arm64
electron-release-linux-all: electron-prepare-dist
	for arch in x64 arm64; do \
	  npx --yes electron-packager electron CollabMVP --platform=linux --arch=$$arch --out=release --overwrite; \
	done

# Alias
electron-release: electron-release-linux

# Kill a single port listener: make kill-port PORT=1234
kill-port:
	@if [ -z "$$PORT" ]; then echo "Usage: make kill-port PORT=1234"; exit 1; fi; \
	PIDS=$$(lsof -t -iTCP:$$PORT -sTCP:LISTEN 2>/dev/null || true); \
	if [ -n "$$PIDS" ]; then \
		echo "Killing PIDs $$PIDS on port $$PORT"; \
		kill -9 $$PIDS || true; \
	else \
		echo "No listeners on $$PORT"; \
	fi

# Kill common dev ports
kill-ports:
	@PORTS="$(FRONTEND_PORT) $(BACKEND_PORT) 5173 1234"; \
	for p in $$PORTS; do \
		if [ -n "$$p" ]; then \
			echo "Checking port $$p"; \
			PIDS=$$(lsof -t -iTCP:$$p -sTCP:LISTEN 2>/dev/null || true); \
			if [ -n "$$PIDS" ]; then \
				echo "Killing PIDs $$PIDS on port $$p"; \
				kill -9 $$PIDS || true; \
			else \
				echo "No listeners on $$p"; \
			fi; \
		fi; \
	done

# Stop docker services and free common dev ports
stop-all:
	- docker compose down
	$(MAKE) kill-ports
