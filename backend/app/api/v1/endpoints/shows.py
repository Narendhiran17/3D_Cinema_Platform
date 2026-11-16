from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.schemas.common import StandardResponse, ResponseMeta

router = APIRouter(prefix="/shows", tags=["Shows & Schedules"])


class ShowSummary(BaseModel):
    id: str
    tenant_id: str
    cinema_id: str
    auditorium_id: str
    movie_id: str
    movie_title: str
    starts_at: str
    ends_at: str
    timezone: str
    format: str
    status: str


@router.get("", response_model=StandardResponse[List[ShowSummary]])
async def list_shows(
    request: Request,
    cinema_id: Optional[str] = None,
    movie_id: Optional[str] = None,
):
    request_id = getattr(request.state, "request_id", None)
    sample_shows = [
        ShowSummary(
            id="show-8801-99ab-cdef",
            tenant_id="ten-apex-cinemas-01",
            cinema_id="cin-1001-a1b2-c3d4",
            auditorium_id="aud-01-prime",
            movie_id="mov-avatar-3d-001",
            movie_title="Cosmic Odyssey: 3D Experience",
            starts_at="2026-11-20T19:30:00Z",
            ends_at="2026-11-20T22:15:00Z",
            timezone="America/New_York",
            format="IMAX_3D",
            status="PUBLISHED",
        )
    ]
    return StandardResponse(
        data=sample_shows,
        meta=ResponseMeta(request_id=request_id, total=len(sample_shows)),
    )
