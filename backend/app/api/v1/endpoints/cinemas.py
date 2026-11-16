from typing import List
from fastapi import APIRouter, Request
from pydantic import BaseModel
from app.schemas.common import StandardResponse, ResponseMeta

router = APIRouter(prefix="/cinemas", tags=["Cinemas Discovery"])


class CinemaSummary(BaseModel):
    id: str
    tenant_id: str
    name: str
    city: str
    country_code: str
    timezone: str
    status: str


@router.get("", response_model=StandardResponse[List[CinemaSummary]])
async def list_cinemas(request: Request, city: str = None):
    request_id = getattr(request.state, "request_id", None)
    # Baseline discovery stub
    sample_cinemas = [
        CinemaSummary(
            id="cin-1001-a1b2-c3d4",
            tenant_id="ten-apex-cinemas-01",
            name="Apex Grand Cinema - IMAX & 3D",
            city="Metropolis",
            country_code="US",
            timezone="America/New_York",
            status="ACTIVE",
        )
    ]
    return StandardResponse(
        data=sample_cinemas,
        meta=ResponseMeta(request_id=request_id, total=len(sample_cinemas)),
    )
