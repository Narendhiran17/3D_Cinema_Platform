# ADR 0005: 3D Camera Controller and Sightline View Simulation

## Status
Approved (Sprint 5 & 6 Baseline)

## Context
A key differentiator of the platform is allowing customers to inspect their seat's exact first-person perspective toward the screen prior to booking.
This requires:
1. Smooth, non-disorienting camera transitions between overview orbit mode and the seat's calibrated eye-point.
2. Scientific, repeatable viewing metrics (screen distance in meters, horizontal and vertical viewing angles).
3. Complete decoupling of client-side 3D rendering from backend booking authority.

## Decision
1. **Camera Rig & Interpolation:**
   - The Three.js camera rig utilizes vector interpolation (`lerp` with damping factor `0.06`) within the render loop (`useFrame`).
   - In overview mode, the camera floats at `[0, 9.0, 12.0]` with an interactive orbit control looking at `[0, 2.0, -2.0]`.
   - In first-person seat preview, the camera glides to `seat.eye_point` and focuses on the screen center `[0, 4.5, -14.0]`. Orbit controls are disabled during first-person mode to prevent disorientation.
2. **ViewSimulator Metrics Calculation:**
   - Evaluates Euclidean distance to screen center in 3D meters.
   - Calculates horizontal viewing angle: `atan2(|dx|, |dz|)` converted to degrees.
   - Evaluates vertical viewing angle: `atan2(|dy|, |dz|)` converted to degrees.
   - Computes a quality rating ('Optimal Prime', 'Comfortable', 'Wide Angle', 'Front Row Immersive') adhering to SMPTE and THX cinema guidelines.
3. **Visualization Boundary Enforcement:**
   - All seat coordinates, prices, and availability are received from `GET /shows/{id}/seat-map`. The 3D engine remains purely a client-side visualization tool.

## Consequences
- **Positive:** Immersive, photorealistic perspective previews; instant customer confidence in sightlines; accessible return controls.
- **Negative:** Requires calibrated `eye_point` metadata per seat in the auditorium layout.
