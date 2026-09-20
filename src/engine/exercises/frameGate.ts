import { LivePoseFrame } from '../pose/poseSource';

/**
 * Determines whether a pose frame has sufficient tracking quality and keypoints
 * to be passed to biomechanical rule evaluation and rep/hold counters.
 *
 * Requirements to return true:
 * 1. frame.state === 'tracking'
 * 2. frame.keypoints.length >= 33
 * 3. Shoulders (11, 12) and hips (23, 24) each have score >= 0.5
 */
export function shouldEvaluateFrame(frame: LivePoseFrame | null | undefined): boolean {
  if (!frame) return false;
  if (frame.state !== 'tracking') return false;
  if (!frame.keypoints || frame.keypoints.length < 33) return false;

  const leftShoulder = frame.keypoints[11];
  const rightShoulder = frame.keypoints[12];
  const leftHip = frame.keypoints[23];
  const rightHip = frame.keypoints[24];

  if (!leftShoulder || (typeof leftShoulder.score === 'number' && leftShoulder.score < 0.5)) return false;
  if (!rightShoulder || (typeof rightShoulder.score === 'number' && rightShoulder.score < 0.5)) return false;
  if (!leftHip || (typeof leftHip.score === 'number' && leftHip.score < 0.5)) return false;
  if (!rightHip || (typeof rightHip.score === 'number' && rightHip.score < 0.5)) return false;

  return true;
}
