# ADR 0002: Multi-Tenant Data Isolation and Role-Based Access Control (RBAC)

## Status
Approved (Sprint 2 Baseline)

## Context
The 3D Cinema Platform is a multi-tenant system hosting multiple independent cinema operator chains. It is essential that:
1. No cinema operator can ever read, modify, or lock seats/cinemas belonging to another operator.
2. Central platform administrators can oversee platform operations, onboard tenants, and monitor global health.
3. Customers can seamlessly book tickets across different cinemas without leaking tenant administrative scopes.

## Decision
1. **Tenant ID on Tenant-Owned Records:** Every tenant-scoped entity (cinemas, auditoriums, layout versions, shows, show_seats, bookings) carries an indexed `tenant_id UUID NOT NULL` column.
2. **Context Resolution:** The backend extracts the authenticated user identity from the signed JWT. For tenant operations, the tenant context is validated against the user's active tenant memberships. Untrusted client parameters are never accepted without membership verification.
3. **Defense in Depth:**
   - Layer 1: FastAPI Dependency Injection (`get_current_tenant_id`) verifies membership and aborts with `403 TENANT_FORBIDDEN` before reaching database queries.
   - Layer 2: PostgreSQL composite foreign keys `(tenant_id, id)` and Row-Level Security (RLS) policies enforce physical data isolation at the SQL transaction boundary.
4. **Role Hierarchy:**
   - `PLATFORM_ADMIN`: Global scope. Can onboard tenants and access cross-tenant oversight.
   - `OPERATOR_ADMIN`: Tenant scope. Full control over cinemas, auditoriums, layouts, movies, and shows for the assigned tenant.
   - `OPERATOR_STAFF`: Tenant scope. Read access and box-office operations.
   - `CUSTOMER`: Public discovery and authenticated self-booking history.

## Consequences
- **Positive:** Guarantees zero cross-tenant leakage. Passwords hashed using bcrypt. Stateless, verified JWT tokens.
- **Negative:** Requires composite keys and tenant parameter validation on all operator endpoints.
