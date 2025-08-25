# Simple Makefile for local dev and Docker workflows

.PHONY: help install-backend install-frontend dev-backend dev-frontend docker-build docker-up docker-down docker-logs docker-restart

help:
	@echo "Targets:"
	@echo "  install-backend   - npm install in backend"
	@echo "  install-frontend  - npm install in frontend"
	@echo "  dev-backend       - run backend server (ws on :1234)"
	@echo "  dev-frontend      - run frontend Vite dev server"
	@echo "  docker-build      - build Docker images"
	@echo "  docker-up         - start services in background"
	@echo "  docker-down       - stop services"
	@echo "  docker-logs       - follow logs"
	@echo "  docker-restart    - restart services"

install-backend:
	cd backend && npm install

install-frontend:
	cd frontend && npm install

dev-backend:
	cd backend && npm start

dev-frontend:
	cd frontend && npm run dev

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
