# Development Guide

This guide provides instructions on how to maintain and extend the Genlogs Carrier Portal.

## 1. Environment Setup

### Docker (Recommended)
The most efficient way to develop is using the provided Docker Compose stack.
```bash
docker compose up --build
```
The frontend is configured with **polling-based Hot Module Replacement (HMR)** to work seamlessly within the container.

### Local Development
If you prefer running outside Docker:
1.  **Backend:** Create a venv, install `requirements.txt`, and run `uvicorn app.main:app --reload`.
2.  **Frontend:** Run `npm install` and `npm run dev`.

---

## 2. Modifying the Data (ETL)
The application data originates from `backend/app/db/carriers_raw.csv`. 
To update the data:
1.  Modify the CSV file.
2.  Run the ETL process: `python backend/app/db/seed.py`.
3.  The Materialized View in Postgres will be automatically refreshed.

## 3. Extending the API
1.  Define a new schema in `backend/app/main.py` using Pydantic.
2.  Create the endpoint with FastAPI.
3.  Update the `SearchResponseSchema` in `frontend/src/types/index.ts` to match the new API structure.

## 4. Testing
We use `pytest` for the backend.
```bash
cd backend
./venv/bin/pytest
```
Verification of the frontend is done via the production build command:
```bash
cd frontend
npm run build
```

---

## 5. Deployment Checklist
Before pushing to production:
- [ ] Verify `VITE_API_URL` is set to the production backend URL.
- [ ] Ensure `DATABASE_URL` is configured in the cloud environment variables.
- [ ] Run `npm run build` to check for TypeScript regressions.
