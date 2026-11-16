# ADR 0003: Auditorium Layout Versioning, Immutability, and 3D Seat Mapping

## Status
Approved (Sprint 3 Baseline)

## Context
Cinemas periodically adjust their auditoriums: reconfiguring seating rows, converting standard seats to recliners, adding wheelchair-accessible spots, or updating screen dimensions.
However, in-flight ticket sales and past bookings rely on immutable seat coordinate references. If a layout was mutated in place:
1. Active bookings would experience seat label and position mismatches.
2. 3D GLB models would point to orphaned or altered physical seat IDs.
3. Historical booking audits and financial reports would lose traceability.

## Decision
1. **Versioned Layout Records:**
   - Every auditorium layout has an integer version (`version >= 1`), unique constraint `(auditorium_id, version)`, and lifecycle status (`DRAFT`, `PUBLISHED`, `ARCHIVED`).
   - A published layout version is **strictly immutable**. Any physical seating or screen change requires creating and publishing version `N + 1`.
2. **Decoupled Show Referencing:**
   - Shows do not point generically to an auditorium; they explicitly reference a specific `layout_version_id`.
   - Publishing layout version `N + 1` does not affect existing scheduled or bookable shows.
3. **3D Mesh Object to Physical Seat Mapping:**
   - The 3D engine relies on stable, human-readable string object identifiers (e.g. `SEAT_A_05`).
   - The `seat_3d_mappings` table binds `(layout_version_id, object_identifier)` to `seat_id` with a database uniqueness constraint.
   - Public visualizer endpoints (`/auditoriums/{id}/layout`) deliver normalized layout geometry, screen specs, and 3D coordinate transforms (`position`, `eye_point`) to client engines.

## Consequences
- **Positive:** Complete data immutability, zero corruption of existing reservations when reconfiguring cinema rooms, deterministic 3D rendering.
- **Negative:** Requires storing layout snapshots across versions and copying unchanged seat geometry when branching a new version.
