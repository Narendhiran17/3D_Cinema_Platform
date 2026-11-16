import pytest


@pytest.mark.asyncio
async def test_get_show_seat_map(client):
    response = await client.get("/api/v1/shows/show-1234/seat-map")
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["data"]["show_id"] == "show-1234"
    assert len(res_json["data"]["seats"]) > 0
    first_seat = res_json["data"]["seats"][0]
    assert first_seat["label"] == "A1"
    assert first_seat["status"] == "AVAILABLE"


@pytest.mark.asyncio
async def test_create_seat_lock(client):
    payload = {
        "show_id": "show-1234",
        "show_seat_ids": ["ss-show-1234-a1", "ss-show-1234-a2"],
        "booking_session_id": "sess-user-999"
    }
    headers = {"Idempotency-Key": "test-idempotency-key-001"}
    response = await client.post("/api/v1/seat-locks", json=payload, headers=headers)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["data"]["status"] == "HELD"
    assert len(res_json["data"]["show_seat_ids"]) == 2
    assert "expires_at" in res_json["data"]
