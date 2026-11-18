export interface ViewingMetrics {
  distanceMeters: number;
  horizontalAngleDegrees: number;
  verticalAngleDegrees: number;
  qualityRating: 'Optimal Prime' | 'Comfortable' | 'Wide Angle' | 'Front Row Immersive';
  qualityColor: string;
}

/**
 * Calculates sightline and viewing metrics from a seat's eye-point to the screen center.
 * Implements SMPTE and THX cinematic viewing guidelines.
 */
export function calculateViewingMetrics(
  eyePoint: [number, number, number],
  screenCenter: [number, number, number] = [0.0, 3.95, 2.3]
): ViewingMetrics {
  const dx = eyePoint[0] - screenCenter[0];
  const dy = eyePoint[1] - screenCenter[1];
  const dz = eyePoint[2] - screenCenter[2];

  // Euclidean distance in 3D meters
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Horizontal angle relative to screen center normal
  const horizontalAngleRad = Math.atan2(Math.abs(dx), Math.abs(dz));
  const horizontalAngleDeg = (horizontalAngleRad * 180) / Math.PI;

  // Vertical viewing angle looking up/down to screen center
  const verticalAngleRad = Math.atan2(Math.abs(dy), Math.abs(dz));
  const verticalAngleDeg = (verticalAngleRad * 180) / Math.PI;

  let qualityRating: ViewingMetrics['qualityRating'] = 'Comfortable';
  let qualityColor = '#10b981';

  if (horizontalAngleDeg < 15 && verticalAngleDeg < 15) {
    qualityRating = 'Optimal Prime';
    qualityColor = '#f59e0b'; // Gold
  } else if (horizontalAngleDeg >= 28) {
    qualityRating = 'Wide Angle';
    qualityColor = '#38bdf8'; // Sky blue
  } else if (distance < 9.0) {
    qualityRating = 'Front Row Immersive';
    qualityColor = '#a855f7'; // Purple
  }

  return {
    distanceMeters: parseFloat(distance.toFixed(1)),
    horizontalAngleDegrees: parseFloat(horizontalAngleDeg.toFixed(1)),
    verticalAngleDegrees: parseFloat(verticalAngleDeg.toFixed(1)),
    qualityRating,
    qualityColor,
  };
}
