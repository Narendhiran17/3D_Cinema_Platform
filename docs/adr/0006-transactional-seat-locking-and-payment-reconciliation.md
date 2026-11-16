# ADR 0006: Transactional Seat Locking, Idempotency, and Webhook Reconciliation

## Status
Approved (Sprint 8 & 9 Baseline)

## Context
High-demand cinema screenings (e.g., premiere nights, IMAX 3D blockbusters) experience simultaneous concurrent traffic where multiple customers attempt to select and book the exact same physical seats.
Furthermore:
1. Online payment providers send asynchronous webhook status events that can be duplicated, delayed, or delivered out-of-order.
2. Under no circumstance may the system produce duplicate confirmed bookings for the same seat in the same screening.

## Decision
1. **Two-Phase Reservation Pattern:**
   - **Phase 1 (Provisional Hold):** `POST /seat-locks` validates that all requested seats are currently `AVAILABLE`. If all are valid, it atomically transitions their status to `HELD` with an expiration timestamp (`expires_at`, default 10 minutes) and issues a `hold_id`. If any seat is already held or confirmed, the entire request fails atomically with `409 SEAT_UNAVAILABLE`.
   - **Phase 2 (Transactional Confirmation):** `POST /bookings` converts an active hold into a `PENDING` booking with immutable price snapshots. Upon receiving a verified, signed provider webhook (`payment_intent.succeeded`), the booking transitions to `CONFIRMED` and the seats transition to `CONFIRMED`.
2. **Webhook Replay Protection & Signature Enforcement:**
   - Webhook requests must provide a valid cryptographic signature; unsigned or tampered requests are rejected with `401 INVALID_SIGNATURE`.
   - Incoming events are recorded by `(provider, provider_event_id)` with a unique constraint. Duplicate deliveries return an idempotent acknowledgment (`ALREADY_PROCESSED`) without duplicating order processing.
3. **Real-time Event Broadcasting:**
   - All state transitions (`seat.held`, `seat.released`, `seat.confirmed`) are broadcast in real-time across WebSockets (`/api/v1/ws/shows/{id}/seats`), giving all active customers immediate visual updates.
4. **Late Payment Recovery Policy:**
   - If a payment succeeds after a hold has expired and the seats were claimed by another customer, the system automatically redirects the transaction into an automated refund/customer support queue rather than silently creating an overbooking.

## Consequences
- **Positive:** Zero double-bookings under heavy concurrent load; auditable financial history; real-time customer UX via WebSockets.
- **Negative:** Requires background worker and lazy-release cleanup for abandoned holds.
