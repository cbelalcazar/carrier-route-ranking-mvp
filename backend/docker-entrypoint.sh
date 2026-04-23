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
