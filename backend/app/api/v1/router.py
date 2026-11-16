from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth,
    health,
    cinemas,
    shows,
    seats,
    bookings,
    operator_cinemas,
    operator_shows,
    auditoriums,
)

api_router = APIRouter()

# Core routes
api_router.include_router(auth.router)
api_router.include_router(health.router)
api_router.include_router(cinemas.router)
api_router.include_router(shows.router)
api_router.include_router(seats.router)
api_router.include_router(bookings.router)

# Operator & 3D Layout routes (Sprint 3 & 4)
api_router.include_router(operator_cinemas.router)
api_router.include_router(operator_shows.router)
api_router.include_router(auditoriums.router)
