.PHONY: up down restart logs ps shell-scanner shell-backend shell-frontend shell-db build urls

# Ver los accesos directos de los servicios
urls:
	@echo " "
	@echo "🚀 NetPulse Audit Stack - Accesos Rápidos"
	@echo "----------------------------------------"
	@echo "🌐 Frontend:   http://localhost:5173"
	@echo "⚙️  Backend:    http://localhost:3001"
	@echo "🐍 Scanner API: http://localhost:8000"
	@echo "📑 API Docs:    http://localhost:8000/docs"
	@echo "----------------------------------------"
	@echo " "

# Levantar todos los servicios
up:
	docker compose up -d

# Detener todos los servicios
down:
	docker compose down

# Reiniciar y reconstruir todo
restart:
	docker compose down
	docker compose up -d --build

# Ver logs en tiempo real
logs:
	docker compose logs -f

# Ver el estado de los contenedores
ps:
	docker compose ps

# Reconstruir imágenes
build:
	docker compose build

# --- Comandos para entrar en los contenedores ---

shell-scanner:
	docker exec -it netpulse-scanner /bin/bash

shell-backend:
	docker exec -it netpulse-backend sh

shell-frontend:
	docker exec -it netpulse-frontend sh

shell-db:
	docker exec -it netpulse-db psql -U user -d netpulse
