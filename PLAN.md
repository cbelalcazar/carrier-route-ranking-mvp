# MVP Implementation Plan: Genlogs Carrier Portal

## 1. Goal

Deliver a functional, high-fidelity prototype that validates carrier volume between routes using a "Local-First" data strategy, mapped directly to the proposed v4.0 architecture.

## 2. Technical Stack

- **Database:** PostgreSQL (Managed on Neon/Supabase).
- **Backend:** FastAPI (Python 3.11) + Prisma/SQLAlchemy.
- **Frontend:** React (Vite/TypeScript) + Leaflet (OpenStreetMap).
- **Deployment:** Vercel (FE) + Render (BE).

## 3. Execution Phases (Total: 5.5 Hours)

### Phase 1: Data Engine & SQL Mastery (1.5 Hours) - [CRITICAL]

- **Step 1.1: Schema Definition.** Create the core OLTP/Event tables: `Cameras`, `Carriers`, `Trucks`, and `Truck_Detections_Log` (Simulating the ClickHouse Fact Table).
- **Step 1.2: Materialized View.** Write the SQL `CREATE MATERIALIZED VIEW mv_route_carrier_stats` to pre-calculate carrier rankings per route (Simulating the Flink Stream aggregations).
- **Step 1.3: The "ACL" Seed.** Create `seed.py` to ingest a mock CSV, clean data, and populate the DB, simulating the Anti-Corruption Layer batch process.

### Phase 2: High-Performance Backend (1.5 Hours)

- **Step 2.1: API Scaffolding.** Setup FastAPI with structured logging and CORS for Vercel.
- **Step 2.2: The Search Endpoint.** `GET /api/v1/carriers/search?origin=X&dest=Y`. Implementation must query the **Materialized View** for sub-millisecond response.
- **Step 2.3: Docs.** Finalize Swagger/OpenAPI annotations.

### Phase 3: Interactive Dashboard (2.0 Hours)

- **Step 3.1: React Setup.** Vite + TailwindCSS + React Query (for data fetching).
- **Step 3.2: Map Integration.** Use `react-leaflet` to draw a simple route line between two coordinates.
- **Step 3.3: UI Polish.** Ranking list of carriers with "Trucks/Day" metrics as specified in the exercise.

### Phase 4: CI/CD & README (0.5 Hours)

- **Step 4.1: Deploy.** Push to GitHub, link to Vercel/Render.
- **Step 4.2: README.** Final polish of the **v4.0 Architecture** vs. **MVP Scope** explanation.

## 4. Verification Checklist

- [ ] Backend returns exact carrier data (e.g., UPS/FedEx) as requested in the assignment parameters.
- [ ] SQL Materialized View can be queried rapidly without complex joins on the fly.
- [ ] Frontend map updates markers dynamically on search.
- [ ] Public URLs are live and HTTPS enabled.
