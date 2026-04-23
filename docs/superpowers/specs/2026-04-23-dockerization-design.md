# Design Spec: Dockerization for Genlogs Carrier Portal

## 1. Goal
Provide a "Zero-Config" deployment environment for the Genlogs Carrier Portal using Docker and Docker Compose. This ensures that the interviewer can run the full system (Postgres, FastAPI Backend, and React Frontend) with a single command.

## 2. Architecture

### 2.1 Database (`db`)
- **Image**: `postgres:15-alpine`
- **Port**: `5432`
- **Volume**: `postgres_data` (for persistence)
- **Environment**:
  - `POSTGRES_DB=genlogs`
  - `POSTGRES_USER=genlogs_user`
  - `POSTGRES_PASSWORD=genlogs_pass`

### 2.2 Backend (`backend`)
- **Base Image**: `python:3.11-slim`
- **Port**: `8000`
- **Responsibilities**:
  - Wait for Postgres to be ready.
  - Run `schema.sql`.
  - Run `seed.py`.
  - Start FastAPI server.
- **Environment**:
  - `DATABASE_URL=postgresql://genlogs_user:genlogs_pass@db:5432/genlogs`

### 2.3 Frontend (`frontend`)
- **Base Image**: `node:20-alpine`
- **Port**: `5173`
- **Mode**: Development (with Hot Module Replacement).
- **Volume**: Mount `./frontend` to `/app` (excluding `node_modules`).
- **Environment**:
  - `VITE_API_URL=http://localhost:8000`

## 3. Implementation Details

### 3.1 Entrypoint Script (Backend)
A script `docker-entrypoint.sh` will be created in the backend folder:
1.  Check for DB availability using `pg_isready`.
2.  Execute `psql -f app/db/schema.sql`.
3.  Execute `python app/db/seed.py`.
4.  Execute `uvicorn app.main:app --host 0.0.0.0 --port 8000`.

### 3.2 Frontend HMR Fix
Since the frontend runs in a container, Vite needs to be configured to listen on `0.0.0.0` and handle the HMR websocket port correctly for host access.

## 4. Success Criteria
- Running `docker compose up --build` initializes the DB, seeds the data, and starts both apps.
- Accessing `http://localhost:5173` shows the UI.
- Searching for routes (e.g., "New York" to "Washington") returns data from the containerized DB.
