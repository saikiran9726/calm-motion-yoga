export interface Point2D {
  x: number;
  y: number;
  z?: number;
}

/**
 * Calculates the angle at joint vertex `b` between vectors (a - b) and (c - b).
 * Returns angle in degrees [0, 180].
 * If use3D is true and points have z coordinates, calculates true 3D spatial angle.
 */
export function angle(a: Point2D, b: Point2D, c: Point2D, use3D = false): number {
  if (!a || !b || !c) return 0;

  const bax = a.x - b.x;
  const bay = a.y - b.y;
  const baz = use3D ? (a.z ?? 0) - (b.z ?? 0) : 0;

  const bcx = c.x - b.x;
  const bcy = c.y - b.y;
  const bcz = use3D ? (c.z ?? 0) - (b.z ?? 0) : 0;

  const dot = bax * bcx + bay * bcy + baz * bcz;
  const magBA = Math.sqrt(bax * bax + bay * bay + baz * baz);
  const magBC = Math.sqrt(bcx * bcx + bcy * bcy + bcz * bcz);

  if (magBA === 0 || magBC === 0) return 0;

  let cosine = dot / (magBA * magBC);
  // Clamp against numerical precision overflow
  cosine = Math.max(-1.0, Math.min(1.0, cosine));

  const radians = Math.acos(cosine);
  return Math.round((radians * 180) / Math.PI);
}

/**
 * Calculates torso lean angle in degrees from true vertical [0, 90].
 * 0 degrees represents a perfectly upright spine.
 */
export function torsoLean(
  leftShoulder: Point2D,
  rightShoulder: Point2D,
  leftHip: Point2D,
  rightHip: Point2D
): number {
  if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 0;

  const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
  const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
  const midHipX = (leftHip.x + rightHip.x) / 2;
  const midHipY = (leftHip.y + rightHip.y) / 2;

  const dx = midShoulderX - midHipX;
  const dy = midHipY - midShoulderY; // In inverted y-space, upward vector has positive delta

  const rad = Math.atan2(Math.abs(dx), Math.max(0.0001, Math.abs(dy)));
  return Math.round((rad * 180) / Math.PI);
}

/**
 * Calculates shoulder level difference (tilt from horizontal) in degrees [0, 90].
 * 0 degrees indicates level horizontal shoulders.
 */
export function shoulderLevelDifference(
  leftShoulder: Point2D,
  rightShoulder: Point2D
): number {
  if (!leftShoulder || !rightShoulder) return 0;

  const dx = Math.abs(rightShoulder.x - leftShoulder.x);
  const dy = Math.abs(rightShoulder.y - leftShoulder.y);

  const rad = Math.atan2(dy, Math.max(0.0001, dx));
  return Math.round((rad * 180) / Math.PI);
}
