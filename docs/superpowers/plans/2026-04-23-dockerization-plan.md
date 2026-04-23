# Dockerization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dockerize the Genlogs Carrier Portal with automated database initialization and seeding.

**Architecture:** A three-service Docker Compose setup: `db` (PostgreSQL), `backend` (FastAPI with automated migrations/seeding), and `frontend` (React/Vite in development mode).

**Tech Stack:** Docker, Docker Compose, PostgreSQL 15, Python 3.11, Node 20.

---

### Task 1: Backend Dockerization

**Files:**
- Create: `backend/Dockerfile`
- Create: `backend/docker-entrypoint.sh`

- [ ] **Step 1: Create the Backend Dockerfile**

```dockerfile
FROM python:3.11-slim

# Install postgresql-client for pg_isready and psql
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
```

- [ ] **Step 2: Create the Backend Entrypoint Script**

```bash
#!/bin/bash
set -e

# Wait for database
until pg_isready -h db -U genlogs_user; do
  echo "Waiting for database..."
  sleep 2
done

echo "Database is ready!"

# Run schema initialization
echo "Running schema.sql..."
PGPASSWORD=genlogs_pass psql -h db -U genlogs_user -d genlogs -f app/db/schema.sql

# Run ETL/Seed
echo "Running seed.py..."
DATABASE_URL=postgresql://genlogs_user:genlogs_pass@db:5432/genlogs python app/db/seed.py

# Start application
echo "Starting FastAPI..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
```

- [ ] **Step 3: Commit**

```bash
git add backend/Dockerfile backend/docker-entrypoint.sh
git commit -m "feat: add backend docker files"
```

---

### Task 2: Frontend Dockerization

**Files:**
- Create: `frontend/Dockerfile`
- Modify: `frontend/vite.config.ts`

- [ ] **Step 1: Create the Frontend Dockerfile**

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
```

- [ ] **Step 2: Update Vite configuration for Docker HMR**

Modify `frontend/vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    watch: {
      usePolling: true,
    },
  },
})
```

- [ ] **Step 3: Commit**

```bash
git add frontend/Dockerfile frontend/vite.config.ts
git commit -m "feat: add frontend docker files and fix HMR"
```

---

### Task 3: Docker Compose Configuration

**Files:**
- Create: `docker-compose.yml`
- Create: `.dockerignore` (Global)

- [ ] **Step 1: Create .dockerignore**

```text
**/node_modules
**/__pycache__
**/.venv
**/dist
.git
.env
```

- [ ] **Step 2: Create docker-compose.yml**

```yaml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    container_name: genlogs_db
    environment:
      POSTGRES_DB: genlogs
      POSTGRES_USER: genlogs_user
      POSTGRES_PASSWORD: genlogs_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    container_name: genlogs_backend
    environment:
      DATABASE_URL: postgresql://genlogs_user:genlogs_pass@db:5432/genlogs
    ports:
      - "8000:8000"
    depends_on:
      - db

  frontend:
    build: ./frontend
    container_name: genlogs_frontend
    environment:
      VITE_API_URL: http://localhost:8000
    ports:
      - "5173:5173"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    depends_on:
      - backend

volumes:
  postgres_data:
```

- [ ] **Step 3: Commit**

```bash
git add docker-compose.yml .dockerignore
git commit -m "feat: add docker-compose configuration"
```

---

### Task 4: Verification

- [ ] **Step 1: Run the full stack**

Run: `docker compose up --build -d`

- [ ] **Step 2: Verify logs for seeding**

Run: `docker compose logs -f backend`
Expected: "Database is ready!", "Running schema.sql...", "ETL Success: Loaded 610 detections.", "Starting FastAPI..."

- [ ] **Step 3: Test API**

Run: `curl "http://localhost:8000/api/v1/search?origin=New%20York&destination=Washington"`
Expected: JSON response with carriers.

- [ ] **Step 4: Test Frontend**

Action: Open `http://localhost:5173` in the browser.
Expected: UI loads and search works.
