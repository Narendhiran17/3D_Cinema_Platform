# 3D Cinema Platform --- Enterprise Architecture & Monorepo

[![CI Pipeline](https://github.com/3d-cinema/platform/actions/workflows/ci.yml/badge.svg)](.github/workflows/ci.yml)

A multi-tenant cinema management and ticket-booking platform with a photorealistic, interactive 3D virtual auditorium seat selection experience and robust transactional backend.

---

## 📦 Monorepo Structure

```text
.
├── apps/
│   ├── web/            # React 18 + Vite + Three.js + R3F customer booking app
│   ├── mobile/         # React Native / Expo iOS & Android shell
│   └── desktop/        # Tauri + React desktop shell
├── backend/
│   ├── app/            # FastAPI modular backend (v1 endpoints, middleware, logging)
│   ├── tests/          # Pytest integration & unit test suite
│   ├── requirements.txt# Python dependencies
│   └── Dockerfile      # Backend container definition
├── packages/
│   └── shared-types/   # Shared TypeScript domain models & API contracts
├── docker-compose.yml  # Local development stack (PostgreSQL, Redis, MinIO, Backend)
├── .github/workflows/  # Continuous Integration pipeline
└── .env.example        # Environment variable template
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on v26+)
- **Python**: 3.10+
- **Docker**: (Optional for local PostgreSQL and Redis orchestration)

### 2. Backend Setup
```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run automated tests
pytest tests

# Start API server (runs at http://localhost:8000)
uvicorn app.main:app --reload
```
API Documentation will be accessible at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/api/v1/openapi.json`

### 3. Web Application Setup
```bash
# Install frontend dependencies
npm install

# Start Vite development server (runs at http://localhost:5173)
npm run dev:web
```

---

## 🔒 Key System Invariants
1. **Zero Duplicate Bookings:** PostgreSQL enforces strict row-level locks and transactional seat holds. Redis & WebSockets handle UI coordination only.
2. **3D Visualization Boundary:** The 3D engine is strictly a visual renderer—it does not own pricing, seat availability, or confirmation authority.
3. **2D Accessible Fallback:** Every customer journey can be completed using the accessible 2D seat map without entering 3D.
