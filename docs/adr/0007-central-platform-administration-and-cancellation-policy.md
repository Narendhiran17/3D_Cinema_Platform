# ADR 0007: Central Platform Administration, Multi-Tenant Governance, and Booking Cancellation Policy

## Status
Approved (Sprint 10 & 11 Baseline)

## Context
As an enterprise SaaS cinema booking platform, the system hosts multiple independent theater operators (tenants), each running their own branches, auditoriums, 3D layouts, and movie schedules.
To operate effectively at scale:
1. Platform administrators (Super Admins) require centralized visibility and control over all tenants, cross-tenant financial aggregation (gross booking volume in minor currency units), subscription tier provisioning, and system-wide auditability.
2. Customers need self-service access to view their booking history and cancel tickets, releasing the held/confirmed seats back into the live inventory and triggering real-time UI synchronization across all connected clients.
3. Strict access boundaries must prevent tenant operators or customers from accessing central administrative endpoints (`/platform/*`).

## Decision
1. **Central Platform Administration Scope & RBAC:**
   - Dedicated administration endpoints under `/api/v1/platform/*` are guarded by the `require_platform_admin` dependency.
   - Non-platform administrators (including regular tenant managers and customers) attempting access receive `403 FORBIDDEN_PLATFORM_ADMIN_REQUIRED`.
   - Platform admins can onboard new tenants (`POST /platform/tenants`), enforce unique slug routing, modify tenant operational statuses (`PATCH /platform/tenants/{id}/status`), query system-wide KPIs (`GET /platform/analytics`), and inspect platform audit logs (`GET /platform/audit-logs`).
2. **Customer Booking History & Ownership Verification:**
   - Authenticated customers query their reservation history via `GET /api/v1/bookings/me`.
   - Guest bookings are linked by verified customer email contact records.
3. **Atomic Booking Cancellation & Inventory Release Policy:**
   - Cancellations are triggered via `POST /api/v1/bookings/{id}/cancel`.
   - Access control mandates that only the booking owner or a platform administrator may execute a cancellation; unauthorized attempts are rejected with `403 FORBIDDEN`.
   - Once cancelled, the booking status transitions to `CANCELLED`.
   - Associated show-seats are atomically reverted to `AVAILABLE`.
   - A `seat.released` event is broadcast across the show's WebSocket channel (`/api/v1/ws/shows/{id}/seats`), ensuring connected users immediately observe the newly available seats without polling.
   - Repeated cancellation attempts on an already cancelled reservation fail idempotently with `400 ALREADY_CANCELLED`.

## Consequences
- **Positive:**
  - Strict multi-tenant operational security; platform administrators maintain full governance without breaking tenant isolation boundaries.
  - Complete customer self-service cancellation flow with instant seat re-inventorying and real-time WebSocket fan-out.
  - Comprehensive audit trail of all governance and provisioning activities.
- **Negative:**
  - Requires maintaining refund policy configuration per tenant in future billing enhancements.
