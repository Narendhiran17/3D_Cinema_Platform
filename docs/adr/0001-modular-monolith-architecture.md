# ADR 0001: Modular Monolith Architecture Baseline

## Status
Approved (Frozen Baseline v1.0)

## Context
The 3D Cinema Platform is a greenfield multi-tenant cinema management and ticket booking system. A critical decision must be made regarding whether to deploy as a microservice fleet or start with a modular monolith.
Microservices introduce early distributed tracing overhead, network latency on seat holds, cross-service transaction complexity (two-phase commits / sagas), and significant deployment friction.

## Decision
We adopt a **Modular Monolith** pattern using Python, FastAPI, and SQLAlchemy, with explicit internal domain boundaries:
- `Identity & Tenant Management`
- `Cinema & Auditorium Management`
- `Movie & Show Scheduling`
- `Seat Inventory`
- `Booking & Checkout`
- `Payment & Reconciliation`
- `Notification & Outbox`

Background workers (Celery/worker processes) and WebSocket gateways share the domain codebase and schema boundaries but deploy as distinct runtime processes.

## Consequences
- **Positive:** Single deployment artifact for APIs, zero network latency between domain boundaries, shared PostgreSQL transactional guarantees, simplified local development and CI pipelines.
- **Negative:** Requires strict code discipline to prevent domain boundary bleeding. Modules must interact via defined interfaces and never execute raw cross-domain table joins directly.
