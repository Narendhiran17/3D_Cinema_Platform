# ADR 0008: Production Hardening, Security Middleware, and Release Gate Validation

## Status
Approved (Sprint 12 Baseline & Production Release Gate)

## Context
Following the implementation of all business domains (Authentication, Tenancy, Layout Versioning, Show Scheduling, 3D Calibrated Sightlines, Transactional Seat Holds, Payment Reconciliation, and Administration), the system required production-readiness hardening to satisfy Section 11 (Security baseline), Section 12 (Non-functional targets), and Section 13 (Testing and release gates) of the approved architecture specification.

Specifically:
1. HTTP responses must satisfy OWASP security standards to guard against clickjacking, MIME-sniffing, and cross-site vulnerabilities.
2. High-traffic and financial endpoints must be protected against brute-force and request flooding.
3. Production artifacts must be packaged in reproducible, multi-stage containers with static asset caching and SPA routing.
4. An automated release gate test suite must continuously verify core architectural invariants before any release.

## Decision
1. **OWASP Security Headers & Tracing Middleware:**
   - Introduced `SecurityHeadersMiddleware` enforcing:
     - `X-Content-Type-Options: nosniff`
     - `X-Frame-Options: DENY`
     - `X-XSS-Protection: 1; mode=block`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
   - Every request is tagged with an immutable `X-Request-ID` and latency header `X-Process-Time-Ms`.
2. **Sliding-Window Rate Limiting:**
   - Introduced `RateLimiterMiddleware` restricting requests on sensitive endpoints (`/api/v1/auth/login`, `/api/v1/seat-locks`, `/api/v1/payments/initiate`) to 120 req/min per IP.
   - Excess requests are rejected with `429 RATE_LIMIT_EXCEEDED`.
3. **Multi-Stage Production Containerization:**
   - Multi-stage Docker build for the React web client compiling TypeScript to static assets and serving via Nginx with aggressive HTTP caching (`Cache-Control: immutable`) and gzip compression.
   - `docker-compose.prod.yml` coordinating Postgres 18, Redis 7, the FastAPI backend, and Nginx.
4. **Automated Production Release Gate Suite:**
   - Created `test_production_release_gate.py` verifying:
     - Security and observability headers on all endpoints.
     - Readiness probes for orchestration health.
     - Strict integer minor currency units on all prices.
     - Zero double-booking under concurrent load.
     - Cross-tenant isolation boundaries.
5. **Operational Runbook:**
   - Authored `docs/operations/production_deployment_runbook.md` specifying backup, recovery (RPO $\le 1$h, RTO $\le 4$h), zero-downtime rolling updates, and incident response procedures.

## Consequences
- **Positive:** System passes all definition of done criteria, security compliance audits, and release gates.
- **Negative:** Rate limits must be tuned dynamically or moved to Redis cluster under ultra-high global scale.
