# 📡 NetPulse Audit Stack
> **Plataforma Full-Stack de Auditoría de Red y Ciberseguridad Defensiva.**

NetPulse es una solución profesional diseñada para la visibilidad total de infraestructuras de red locales. Utiliza una arquitectura de microservicios contenerizada para ofrecer escaneo táctico de puertos, descubrimiento de dispositivos en tiempo real y análisis de topología interactivo.

---

## 🚀 Funcionalidades Destacadas

### 🛡️ Rogue Device Detection
NetPulse incluye inteligencia comparativa. El sistema detecta automáticamente si un dispositivo es nuevo en la red comparándolo con escaneos históricos, resaltando posibles intrusos con alertas visuales dinámicas.

### 🕸️ Mapa de Topología Interactivo
Visualización de nodos basada en **ReactFlow**. Permite ver el Gateway y los dispositivos orbitando con conexiones animadas, permitiendo una comprensión inmediata de la jerarquía de la infraestructura.

### ⚡ Streaming de Datos con SSE
Descubrimiento de red ultra-rápido mediante **Server-Sent Events (SSE)**. Los dispositivos y sus puertos abiertos aparecen en el dashboard al instante conforme son detectados por el motor táctico.

---

## 📸 Vista Previa

### 1. Mapa de Topología Interactiva
Visualiza la infraestructura de red de forma gráfica. Arrastra nodos, haz zoom y analiza las conexiones en tiempo real.

<img src="docs/images/topologia.png" width="100%" alt="NetPulse Topology Map">

### 2. Detección de Intrusos (Rogue Devices)
Identifica instantáneamente cambios en la red. Los nuevos dispositivos se resaltan en rojo con alertas visuales y badges de seguridad.

<img src="docs/images/topologia2.png" width="100%" alt="NetPulse Security Alerts">

---

## 🏗️ Arquitectura Técnica

NetPulse se divide en cuatro servicios core totalmente aislados y orquestados mediante **Docker Compose**:

1.  **Scanner API (Python 3.11 / FastAPI):** Motor táctico basado en `Nmap` y `Scapy`.
2.  **Core Backend (Next.js 16+ / App Router):** Orquestador de APIs y persistencia relacional.
3.  **Real-Time Frontend (React / Vite):** Dashboard reactivo con **Tailwind CSS v4** y `ReactFlow`.
4.  **Database (PostgreSQL):** Almacenamiento persistente de dispositivos y trazas históricas.

---

## 🧪 Calidad de Software y CI/CD

El proyecto mantiene un estándar de calidad riguroso mediante una pipeline de **Integración Continua (CI)** local:

*   **Scanner:** 31 tests unitarios (Pytest) + Validación de estilo (Flake8).
*   **Backend:** 34 tests unitarios (Vitest) + TypeScript Check + ESLint.
*   **Frontend:** 34 tests unitarios (Vitest) + TypeScript Check + ESLint.

Para validar el proyecto completo:
```bash
make ci
```

---

## 🚦 Instalación Rápida

1. Clonar: `git clone https://github.com/JoseAndres20/NetPulse.git`
2. Configurar: `cp .env.example .env`
3. Lanzar: `make up`

---

## 🛡️ Licencia
Distribuido bajo la Licencia MIT.
