from fastapi import APIRouter
from app.api.v1.endpoints import health, cinemas, shows, seats, bookings

api_router = APIRouter()

# Health endpoints available at both root /health and under /api/v1
api_router.include_router(health.router)
api_router.include_router(cinemas.router)
api_router.include_router(shows.router)
api_router.include_router(seats.router)
api_router.include_router(bookings.router)
