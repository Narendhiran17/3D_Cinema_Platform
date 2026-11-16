from typing import Optional
from fastapi import APIRouter, Header, Request
from pydantic import BaseModel, EmailStr
from app.schemas.common import StandardResponse, ResponseMeta

router = APIRouter(prefix="/bookings", tags=["Bookings & Checkout"])


class CustomerContact(BaseModel):
    email: EmailStr
    phone: Optional[str] = None


class CreateBookingRequest(BaseModel):
    hold_id: str
    customer_contact: CustomerContact


class BookingConfirmationData(BaseModel):
    booking_id: str
    booking_reference: str
    status: str
    amount_minor: int
    currency: str
    payment_required: bool


@router.post("", response_model=StandardResponse[BookingConfirmationData])
async def create_booking(
    payload: CreateBookingRequest,
    request: Request,
    idempotency_key: str = Header(..., alias="Idempotency-Key"),
):
    request_id = getattr(request.state, "request_id", None)

    return StandardResponse(
        data=BookingConfirmationData(
            booking_id="bk-5501-8899-aabb",
            booking_reference="CIN-2026-X992",
            status="PENDING",
            amount_minor=50000,
            currency="USD",
            payment_required=True,
        ),
        meta=ResponseMeta(request_id=request_id),
    )
