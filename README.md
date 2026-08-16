# Relay

Relay is an AI-powered event operations agent that manages one live event and continuously adapts its plan when real-world disruptions happen, surfacing reasoning, negotiation, and decision-making for human approval.

## Architecture

React Frontend
      ↓
Express API
      ↓
FastAPI Agent Service
      ↓
MongoDB

## Local Development

### 1. Start Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

### 2. Start Express API
```bash
cd backend/api
npm install
npm run dev
```

### 3. Start FastAPI Agent Service
```bash
cd backend/agent
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
