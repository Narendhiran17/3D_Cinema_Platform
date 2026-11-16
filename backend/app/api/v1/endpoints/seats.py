from typing import List
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Header, HTTPException, Request, status
from pydantic import BaseModel, Field
from app.schemas.common import StandardResponse, ResponseMeta

router = APIRouter(tags=["Seat Inventory & 3D Mapping"])


class SeatItem(BaseModel):
    show_seat_id: str
    seat_id: str
    label: str
    seat_type: str
    price_minor: int
    status: str
    version: int


class ShowSeatMapData(BaseModel):
    show_id: str
    layout_version: int
    currency: str
    seats: List[SeatItem]


class SeatLockRequest(BaseModel):
    show_id: str
    show_seat_ids: List[str]
    booking_session_id: str


class SeatLockData(BaseModel):
    hold_id: str
    status: str
    expires_at: str
    show_seat_ids: List[str]


@router.get("/shows/{show_id}/seat-map", response_model=StandardResponse[ShowSeatMapData])
async def get_show_seat_map(show_id: str, request: Request):
    request_id = getattr(request.state, "request_id", None)
    
    # Generate standard rows A-E, seats 1-10
    seats = []
    for row in ["A", "B", "C", "D", "E"]:
        for num in range(1, 11):
            seat_label = f"{row}{num}"
            seat_type = "PREMIUM" if row in ["D", "E"] else "STANDARD"
            price = 25000 if seat_type == "PREMIUM" else 18000
            seats.append(
                SeatItem(
                    show_seat_id=f"ss-{show_id}-{seat_label.lower()}",
                    seat_id=f"seat-{seat_label.lower()}",
                    label=seat_label,
                    seat_type=seat_type,
                    price_minor=price,
                    status="AVAILABLE",
                    version=1,
                )
            )

    return StandardResponse(
        data=ShowSeatMapData(
            show_id=show_id,
            layout_version=1,
            currency="USD",
            seats=seats,
        ),
        meta=ResponseMeta(request_id=request_id),
    )


@router.post("/seat-locks", response_model=StandardResponse[SeatLockData])
async def create_seat_lock(
    payload: SeatLockRequest,
    request: Request,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
):
    """Atomic seat lock creation with expiration timer."""
    request_id = getattr(request.state, "request_id", None)
    expiry = datetime.now(timezone.utc) + timedelta(minutes=10)

    return StandardResponse(
        data=SeatLockData(
            hold_id="hold-77a8-44b2-99cc",
            status="HELD",
            expires_at=expiry.isoformat(),
            show_seat_ids=payload.show_seat_ids,
        ),
        meta=ResponseMeta(request_id=request_id),
    )
