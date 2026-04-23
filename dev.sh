#!/bin/bash

# Genlogs Dev Orchestrator v2.0
echo "🚀 Starting Genlogs Prototype Environment..."

# 1. Backend Setup
echo "📦 Setting up Backend..."
cd backend

# Create venv if not exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Use the full path to avoid activation issues
PYTHON_BIN="./venv/bin/python3"
PIP_BIN="./venv/bin/pip"

# UPGRADE PIP FIRST (Fixes the setuptools error)
echo "Upgrading pip..."
$PYTHON_BIN -m pip install --upgrade pip

echo "Installing requirements..."
$PIP_BIN install -r requirements.txt

echo "🗄️ Refreshing Database Schema & Seed..."
# Using the python binary from venv to run the seed
psql -d genlogs -f app/db/schema.sql
$PYTHON_BIN app/db/seed.py

# 2. Start Backend
echo "⚡ Starting FastAPI on http://localhost:8000..."
$PYTHON_BIN -m uvicorn app.main:app --reload &
BACKEND_PID=$!

# 3. Frontend Setup
echo "🎨 Setting up Frontend..."
cd ../frontend
# npm install -s  # Skipping to save time if already installed, uncomment if needed

# 4. Start Frontend
echo "🌐 Starting React on http://localhost:5173..."
npm run dev &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID; echo '🛑 Servers stopped.'; exit" INT TERM EXIT
wait
