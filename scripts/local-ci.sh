#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🚀 Iniciando Validación de CI Local para NetPulse...${NC}\n"

# Función de ayuda para chequear errores
check_status() {
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ PASÓ: $1${NC}\n"
  else
    echo -e "${RED}❌ FALLÓ: $1${NC}"
    echo -e "Por favor, corrige los errores antes de hacer push."
    exit 1
  fi
}

# 1. Backend CI
echo -e "--- 🛠️  Validando BACKEND ---"
cd backend
echo "Ejecutando TypeScript Check..."
npx tsc --noEmit
check_status "Backend TypeScript"

echo "Ejecutando ESLint..."
npx eslint src --ext .ts,.tsx --max-warnings 0
check_status "Backend ESLint"

echo "Ejecutando Tests Unitarios..."
npm test
check_status "Backend Unit Tests"
cd ..

# 2. Frontend CI
echo -e "--- 🎨 Validando FRONTEND ---"
cd frontend
echo "Ejecutando TypeScript Check..."
npx tsc -b
check_status "Frontend TypeScript"

echo "Ejecutando ESLint..."
npx eslint src --ext .ts,.tsx --max-warnings 0
check_status "Frontend ESLint"

echo "Ejecutando Tests Unitarios..."
npm test
check_status "Frontend Unit Tests"
cd ..

# 3. Scanner CI
echo -e "--- 🐍 Validando SCANNER ---"
cd scanner
echo "Ejecutando Flake8 (PEP8)..."
flake8 . --max-line-length=120 --exclude=__pycache__ --extend-ignore=E501,W503,B008
check_status "Scanner Flake8"
cd ..

# 4. Docker Config CI
echo -e "--- 🐳 Validando DOCKER ---"
docker compose config --quiet
check_status "Docker Compose Config"

echo -e "${GREEN}🎉 ¡TODOS LOS CHECKS DEL CI PASARON CORRECTAMENTE! 🎉${NC}"
echo "El código está listo para subir a GitHub."
