# ADR 0004: Show Scheduling Conflict Detection and Seat Inventory Generation

## Status
Approved (Sprint 4 Baseline)

## Context
When scheduling movie shows in cinema auditoriums:
1. Multiple shows must never overlap in the same physical auditorium.
2. Seat inventory for a show must be separated from physical seat definitions to allow independent availability states per screening.
3. Currency handling must eliminate floating-point representation errors.

## Decision
1. **Auditorium Schedule Conflict Detection:**
   - Every show record specifies `starts_at` and `ends_at` in UTC with timezone preservation.
   - The scheduling engine checks `(starts_at < existing_ends_at AND ends_at > existing_starts_at)` for active shows in the same auditorium. Conflicting schedules are rejected with `409 SHOW_SCHEDULE_CONFLICT`.
2. **Authoritative Show Seat Generation:**
   - When a show is published, the backend resolves the auditorium's immutable layout version.
   - For every physical seat in that layout, a dedicated `show_seats` row is generated with status `AVAILABLE` and version `1`.
   - Seat categories (`STANDARD`, `PREMIUM`, `RECLINER`) receive prices calculated in integer minor currency units (cents).
3. **Monetary Precision:**
   - All ticket prices and subtotals use integer minor units (e.g., `2500` minor units = \$25.00 USD), never floating-point numbers.

## Consequences
- **Positive:** Deterministic show scheduling, prevention of auditorium double-booking, robust financial arithmetic, decoupled seat inventory lifecycle.
- **Negative:** Requires creating `N` rows in `show_seats` per scheduled show (mitigated by bulk generation).
