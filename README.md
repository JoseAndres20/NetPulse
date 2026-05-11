# 📡 NetPulse Audit Stack
> **Plataforma Full-Stack de Auditoría de Red y Ciberseguridad Defensiva.**

NetPulse es una solución profesional diseñada para la visibilidad total de infraestructuras de red locales. Utiliza una arquitectura de microservicios contenerizada para ofrecer escaneo táctico de puertos, descubrimiento de dispositivos en tiempo real y análisis de topología interactivo con detección de intrusos.

---

## 🏗️ Arquitectura del Sistema
El proyecto está construido sobre una infraestructura robusta de microservicios, diseñada para escalabilidad y aislamiento.

<p align="center">
  <img src="docs/images/architecture.png" width="850" alt="Technical Architecture">
</p>

---

## 📸 Galería de Funcionalidades

### 🕸️ 1. Topología de Red Dinámica
Visualización interactiva basada en **ReactFlow**. Permite identificar jerarquías y conexiones entre el Gateway y los dispositivos detectados de forma gráfica.

<p align="center">
  <img src="docs/images/topologia.png" width="100%" alt="NetPulse Topology Map">
</p>

### 🛡️ 2. Detección de Rogue Devices
Inteligencia de red que compara escaneos históricos para detectar automáticamente nuevos dispositivos, alertando visualmente sobre posibles intrusos.

<p align="center">
  <img src="docs/images/topologia2.png" width="100%" alt="Security Alerts">
</p>

### 📊 3. Gestión de Dispositivos y Servicios
Análisis detallado de puertos abiertos, servicios y fingerprinting de dispositivos (S.O., Fabricante, etc.).

<p align="center">
  <img src="docs/images/devices.png" width="100%" alt="Device Management">
</p>

### 📜 4. Historial de Auditoría
Control total sobre los escaneos realizados, permitiendo volver atrás en el tiempo para comparar el estado de la red.

<p align="center">
  <img src="docs/images/scans.png" width="100%" alt="Scan History">
</p>

### 🌓 5. Interfaz Premium (Dark/Light Mode)
Diseño moderno y adaptable que garantiza la mejor experiencia de usuario en cualquier entorno de trabajo.

<p align="center">
  <img src="docs/images/theme.png" width="100%" alt="Theme Support">
</p>

### ✨ 6. Características Core
Resumen de las capacidades tácticas del motor de escaneo.

<p align="center">
  <img src="docs/images/caracter.png" width="100%" alt="Core Features">
</p>

---

## 🧪 Calidad de Software y CI/CD

El proyecto cuenta con una pipeline de **Integración Continua (CI)** local que valida cada commit:

*   **Scanner:** 31 tests unitarios (Pytest) + Validación de estilo (Flake8).
*   **Backend:** 34 tests unitarios (Vitest) + TypeScript Check + ESLint.
*   **Frontend:** 34 tests unitarios (Vitest) + TypeScript Check + ESLint.

Para validar el stack completo:
```bash
make ci
```

---

## 🚦 Guía de Inicio Rápido

1. **Clonar:** `git clone https://github.com/JoseAndres20/NetPulse.git`
2. **Configurar:** `cp .env.example .env`
3. **Levantar:** `make up`

---

## 🛡️ Licencia
Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.
