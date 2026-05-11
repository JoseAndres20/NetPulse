.PHONY: up down restart logs ps shell-scanner shell-backend shell-frontend shell-db build urls tables

# Cargar variables del .env
include .env
export

# Ver los accesos directos de los servicios
urls:
	@echo " "
	@echo "🚀 NetPulse Audit Stack - Accesos Rápidos"
	@echo "----------------------------------------"
	@echo "🌐 Frontend:    http://localhost:80"
	@echo "⚙️  Backend:     http://localhost:3000"
	@echo "🐍 Scanner API: http://localhost:$(SCANNER_PORT)"
	@echo "📑 API Docs:    http://localhost:$(SCANNER_PORT)/docs"
	@echo "----------------------------------------"
	@echo " "

# Ver las tablas de la base de datos
tables:
	docker exec -it netpulse-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB) -c "\dt"

# Levantar todos los servicios
up:
	docker compose up -d

# Detener todos los servicios
down:
	docker compose down

# Reiniciar y reconstruir todo
restart:
	docker compose down
	docker compose up -d --build db
	@echo "⏳ Esperando a que la base de datos esté lista..."
	@until docker exec netpulse-db pg_isready -U $(POSTGRES_USER) -d $(POSTGRES_DB) > /dev/null 2>&1; do sleep 1; done
	@echo "✅ Base de datos lista. Levantando el resto..."
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
	docker exec -it netpulse-db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

db-shell:
	docker compose exec db psql -U $(POSTGRES_USER) -d $(POSTGRES_DB)

# Ejecuta los tests de backend y frontend
test:
	@echo "--- 🧪 Corriendo Tests de Backend ---"
	cd backend && npm test
	@echo "--- 🧪 Corriendo Tests de Frontend ---"
	cd frontend && npm test
	@echo "--- 🧪 Corriendo Tests de Scanner ---"
	cd scanner && pytest

# Ejecuta el CI localmente
.PHONY: ci
ci:
	@chmod +x scripts/local-ci.sh
	@./scripts/local-ci.sh
