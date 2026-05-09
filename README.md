# 📡 NetPulse Audit Stack

**NetPulse Audit Stack** es una plataforma profesional de monitoreo y descubrimiento de redes locales en tiempo real. Diseñada bajo una arquitectura de microservicios contenida en Docker, permite identificar dispositivos, auditar puertos y visualizar el estado de la red de forma eficiente y segura.

---

## 🏗️ Arquitectura del Sistema

El proyecto se divide en 4 contenedores especializados que colaboran entre sí:

```mermaid
graph TD
    User((Usuario)) --> |Accede| Frontend[Frontend - React/Vite]
    Frontend --> |Consulta API| Backend[Backend - Next.js]
    Backend --> |Orquestación| Scanner[Scanner - Python/Scapy]
    Backend --> |Persistencia| DB[(PostgreSQL)]
    Scanner --> |Sniffing/ARP| LAN((Red Local))
```

### Componentes:
1.  **Scanner (Python/FastAPI):** El motor táctico. Utiliza `Scapy` y `Nmap` con privilegios de red (`host mode`) para el descubrimiento profundo de dispositivos.
2.  **Backend (Next.js 14):** El orquestador. Gestiona la lógica de negocio, las APIs y la comunicación con la base de datos mediante Prisma ORM.
3.  **Frontend (React/Vite):** El dashboard visual. Una interfaz moderna y reactiva para visualizar mapas de red y tablas de dispositivos.
4.  **Database (PostgreSQL):** Almacenamiento persistente de dispositivos, historial de escaneos y estados.

---

## 🛠️ Stack Tecnológico

| Componente | Tecnología |
| :--- | :--- |
| **Scanner** | Docker, Python 3.11, FastAPI, Scapy, Nmap |
| **Backend** | Docker, Next.js (App Router), TypeScript, Prisma ORM |
| **Frontend** | Docker, React, Vite, Tailwind CSS |
| **Infraestructura** | Docker Compose, Makefile, Host Networking |
| **Base de Datos** | Docker, PostgreSQL 15 (Alpine) |

---

## 🚀 Inicio Rápido

Este proyecto está optimizado para ejecutarse con un solo comando gracias al `Makefile` incluido.

### Requisitos:
*   Docker y Docker Compose instalados.
*   Linux (recomendado para el modo `host` del scanner).

### Instalación:

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/netpulse-audit.git
    cd netpulse-audit
    ```

2.  **Levanta el stack completo:**
    ```bash
    make restart
    ```

3.  **Verifica los servicios:**
    ```bash
    make urls
    ```

---

## 📖 Comandos Disponibles (Makefile)

*   `make up`: Inicia los contenedores en segundo plano.
*   `make down`: Detiene y elimina los contenedores.
*   `make restart`: Reconstruye las imágenes y reinicia el sistema.
*   `make logs`: Visualiza los logs de todos los servicios en tiempo real.
*   `make shell-scanner`: Acceso interactivo al contenedor de Python.
*   `make urls`: Muestra las direcciones de acceso de cada servicio.

## 🛡️ Infraestructura y Aislamiento

La arquitectura de NetPulse Audit Stack se basa en el principio de **aislamiento por responsabilidad**:

*   **Host Networking**: El servicio `scanner` utiliza acceso directo a la pila de red del host para capturar tráfico ARP y realizar descubrimientos sin las capas de abstracción de Docker.
*   **Aislamiento de Aplicación**: El Backend y Frontend operan en una red virtual privada (`bridge mode`), exponiendo únicamente los puertos necesarios y protegiendo la base de datos de accesos externos directos.
*   **Capacidades Reducidas**: Se implementan las capacidades de Linux `NET_ADMIN` y `NET_RAW` para permitir al scanner operar a bajo nivel sin necesidad de privilegios de root completos, siguiendo el principio de mínimo privilegio.

---
