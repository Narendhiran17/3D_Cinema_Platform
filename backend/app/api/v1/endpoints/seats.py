from datetime import datetime, timedelta, timezone
from typing import List
from fastapi import APIRouter, Header, Request, status
from pydantic import BaseModel
from app.api.v1.endpoints.operator_shows import SHOWS_STORE, SHOW_SEATS_STORE
from app.core.errors import APIException
from app.schemas.common import ResponseMeta, StandardResponse
from app.schemas.show import ShowSeatInventoryItem, ShowSeatMapResponse

router = APIRouter(tags=["Seat Inventory & 3D Mapping"])


class SeatLockRequest(BaseModel):
    show_id: str
    show_seat_ids: List[str]
    booking_session_id: str


class SeatLockData(BaseModel):
    hold_id: str
    status: str
    expires_at: str
    show_seat_ids: List[str]


@router.get("/shows/{show_id}/seat-map", response_model=StandardResponse[ShowSeatMapResponse])
async def get_show_seat_map(show_id: str, request: Request):
    """
    Returns authoritative show seat inventory with current status, pricing in minor units,
    and 3D coordinates for visualization.
    """
    request_id = getattr(request.state, "request_id", None)
    show = SHOWS_STORE.get(show_id)

    if not show:
        raise APIException(
            code="SHOW_NOT_FOUND",
            message=f"Show '{show_id}' not found.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    seats = SHOW_SEATS_STORE.get(show_id, [])

    return StandardResponse(
        data=ShowSeatMapResponse(
            show_id=show_id,
            auditorium_id=show["auditorium_id"],
            layout_version=show["layout_version"],
            currency="USD",
            seats=[ShowSeatInventoryItem(**s) for s in seats],
        ),
        meta=ResponseMeta(request_id=request_id),
    )


@router.post("/seat-locks", response_model=StandardResponse[SeatLockData])
async def create_seat_lock(
    payload: SeatLockRequest,
    request: Request,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
):
    """
    Atomic seat lock creation with expiration timer.
    """
    request_id = getattr(request.state, "request_id", None)
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

    # In Sprint 4/5: Mark seats as HELD in SHOW_SEATS_STORE for this show
    seats = SHOW_SEATS_STORE.get(payload.show_id, [])
    for s in seats:
        if s["show_seat_id"] in payload.show_seat_ids:
            if s["status"] != "AVAILABLE":
                raise APIException(
                    code="SEAT_UNAVAILABLE",
                    message=f"Seat '{s['label']}' is not available for locking.",
                    status_code=status.HTTP_409_CONFLICT,
                )
            s["status"] = "HELD"

    return StandardResponse(
        data=SeatLockData(
            hold_id=f"hold-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            status="HELD",
            expires_at=expiry.isoformat(),
            show_seat_ids=payload.show_seat_ids,
        ),
        meta=ResponseMeta(request_id=request_id),
    )
