# Simple Makefile for local dev and Docker workflows

.PHONY: help install-backend install-frontend dev-backend dev-frontend frontend-build docker-build docker-up docker-down docker-logs docker-restart dev electron-install electron-start

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
	@echo "  dev               - docker compose up (frontend:8080, backend:1234)"
	@echo "  electron-install  - install Electron deps"
	@echo "  electron-start    - start Electron app (ELECTRON_APP_URL to point to URL)"

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
