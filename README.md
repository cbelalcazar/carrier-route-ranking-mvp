# Genlogs Carrier Portal Prototype

[![Docker Ready](https://img.shields.io/badge/Docker-Zero--Config-blue?logo=docker)](https://github.com/carlosbelalcazar/genlogs-carrier-portal-analytics)
[![Architecture: C4](https://img.shields.io/badge/Architecture-C4--Level--2-emerald)](./ARCHITECTURE_DIAGRAMS.md)
[![Staff Level](https://img.shields.io/badge/Design-Staff--Level-gold)](#-architecture-overview)

This repository contains a high-fidelity prototype of the Genlogs truck tracking portal. It demonstrates a full-stack implementation using **FastAPI**, **React**, and **PostgreSQL**, following Staff-level architectural principles such as **Anti-Corruption Layer (ACL)** and **OLAP tier simulation**.

---

## 🌐 Live Production Demo

*   **Production Portal (Vercel):** [https://carrier-route-ranking-mvp.vercel.app/](https://carrier-route-ranking-mvp.vercel.app/)
*   **Infrastructure Note:** The high-performance API and PostgreSQL database are hosted on **Render**, secured via a shared secret authentication layer.

---

## 🚀 Quick Start (Docker Zero-Config)

The easiest way to run the full stack (Database, Backend, and Frontend) with automated seeding is using Docker Compose:

```bash
# Start all services (Postgres + Backend + Frontend)
docker compose up --build
```

**This will automatically:**
1. Spin up a **PostgreSQL 15** container.
2. Initialize the **Database Schema** and **Materialized Views**.
3. Run the **ACL ETL process** (`seed.py`) to ingest and normalize data from the raw CSV.
4. Start the **FastAPI Backend** on port 8000.
5. Start the **React/Vite Frontend** on port 5173 (with HMR enabled).

**Access Points:**
- **UI:** [http://localhost:5173](http://localhost:5173)
- **API Health Check:** [http://localhost:8000/api/v1/search?origin=New York&destination=Washington](http://localhost:8000/api/v1/search?origin=New%20York&destination=Washington)

---

## 📚 Documentation & Technical Deep-Dive

For a complete breakdown of the system, please refer to the following documents:

*   **[System Architecture & Diagrams](./ARCHITECTURE_DIAGRAMS.md):** C4 Model and Database ER Diagrams.
*   **[API Reference](./docs/API_REFERENCE.md):** Detailed endpoint specifications and logic tiers.
*   **[Frontend Architecture](./docs/FRONTEND_ARCHITECTURE.md):** State management, validation (Zod), and geographic logic.
*   **[Development Guide](./docs/DEVELOPMENT_GUIDE.md):** Instructions for extending the ETL pipeline and maintenance.

---

## 🏛 Architecture & Design

For a detailed visual mapping of the system, including **C4 Diagrams (Context & Containers)** and **ER Diagrams**, please see:
👉 **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)**

### Design Philosophy: Pragmatic Scale
We have mapped production-grade concepts to this MVP:
*   **Anti-Corruption Layer (ACL):** The ingestion pipeline normalizes external federal registry data into a clean internal domain model.
*   **OLAP Simulation:** Instead of simple joins, we use **PostgreSQL Materialized Views** with unique indexing to simulate the performance of an analytical database like ClickHouse.
*   **Edge AI Strategy:** The architecture is designed to support Edge nodes running YOLOv8 for bandwidth-optimized ingestion (ROI cropping).

---

## 🤖 AI-Accelerated Productivity

Following the "more AI the better" mandate, this project was built using an **Agentic Development Workflow**. 

**How AI was used to increase throughput:**
- **Surgical Refactoring:** Used AI agents to handle complex TypeScript migrations and library updates (React-Leaflet v5).
- **Automated Verification:** Every component was validated against production build standards and unit tests using autonomous agents.
- **Architectural Brainstorming:** C4 diagrams and System Design documents were co-authored with AI to ensure industry-standard best practices.
- **Dockerization:** Automated the complex `wait-for-it` logic and database initialization scripts.

---

## 🛠 Local Setup (Alternative)

### Prerequisites
*   PostgreSQL installed and running.
*   Python 3.11+ and Node.js 18+.

### 1. Automatic Orchestration
We provide a developer script that handles environment setup, data seeding, and server launching:
```bash
chmod +x dev.sh
./dev.sh
```

### 2. Verification
*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend API:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📊 Key Features Validated
*   [x] **Zero-Trust Input Sanitization:** Regex-based cleaning for all API inputs.
*   [x] **Staff-level SQL:** Pre-calculated rankings via Materialized Views.
*   [x] **Dynamic Map Framing:** Automatic `fitBounds` calculation for route visualization.
*   [x] **Type Safety:** Full Zod validation for API responses and TypeScript 5 integration.

---
**Author:** Carlos Belalcazar  
**Project Date:** April 22, 2026
