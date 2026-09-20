import { PoseKeypoint } from '../pose/poseSource';
import { angle, torsoLean, shoulderLevelDifference, Point2D } from './geometry';
import { FormCheck } from './feedbackArbiter';

function getKp(keypoints: PoseKeypoint[], name: string, fallbackIdx: number): Point2D | null {
  const found = keypoints.find((k) => k.name === name);
  if (found && found.score >= 0.25) return found;
  if (keypoints[fallbackIdx] && keypoints[fallbackIdx].score >= 0.25) return keypoints[fallbackIdx];
  return null;
}

export interface ExerciseEvaluation {
  currentRom: number | null;
  formChecks: FormCheck[];
}

/**
 * Evaluates Warrior II (hold mode)
 * Key criteria:
 * - Front knee bent near 90° (70° - 110°)
 * - Torso upright over hips (lean <= 15°)
 * - Shoulders level (tilt <= 12°)
 * - Arms horizontal (shoulder-elbow angle with torso 75° - 105°)
 */
export function evaluateWarrior2(
  keypoints: PoseKeypoint[],
  side: 'left' | 'right'
): ExerciseEvaluation {
  const checks: FormCheck[] = [];

  const hip = getKp(keypoints, `${side}_hip`, side === 'left' ? 23 : 24);
  const knee = getKp(keypoints, `${side}_knee`, side === 'left' ? 25 : 26);
  const ankle = getKp(keypoints, `${side}_ankle`, side === 'left' ? 27 : 28);

  const ls = getKp(keypoints, 'left_shoulder', 11);
  const rs = getKp(keypoints, 'right_shoulder', 12);
  const lh = getKp(keypoints, 'left_hip', 23);
  const rh = getKp(keypoints, 'right_hip', 24);

  let kneeAngle: number | null = null;
  if (hip && knee && ankle) {
    kneeAngle = angle(hip, knee, ankle);
    if (kneeAngle > 112) {
      checks.push({
        id: 'warrior_knee_shallow',
        passed: false,
        priority: 1,
        message: `Bend your ${side} knee deeper towards 90°`,
        joint: `${side}_knee`,
        category: 'knee',
      });
    } else if (kneeAngle < 65) {
      checks.push({
        id: 'warrior_knee_overbend',
        passed: false,
        priority: 1,
        message: `Ease your ${side} knee forward slightly`,
        joint: `${side}_knee`,
        category: 'knee',
      });
    } else {
      checks.push({
        id: 'warrior_knee',
        passed: true,
        priority: 1,
        message: '',
        joint: null,
        category: 'knee',
      });
    }
  }

  if (ls && rs && lh && rh) {
    const lean = torsoLean(ls, rs, lh, rh);
    if (lean > 15) {
      checks.push({
        id: 'warrior_torso_lean',
        passed: false,
        priority: 2,
        message: 'Keep spine upright and centered over hips',
        joint: 'spine',
        category: 'spine',
      });
    } else {
      checks.push({
        id: 'warrior_spine',
        passed: true,
        priority: 2,
        message: '',
        joint: null,
        category: 'spine',
      });
    }

    const shoulderTilt = shoulderLevelDifference(ls, rs);
    if (shoulderTilt > 12) {
      checks.push({
        id: 'warrior_shoulders_level',
        passed: false,
        priority: 3,
        message: 'Soften and level your shoulders',
        joint: `${side}_shoulder`,
        category: 'shoulder',
      });
    } else {
      checks.push({
        id: 'warrior_shoulders',
        passed: true,
        priority: 3,
        message: '',
        joint: null,
        category: 'shoulder',
      });
    }
  }

  // Arms horizontal check
  const shoulder = getKp(keypoints, `${side}_shoulder`, side === 'left' ? 11 : 12);
  const elbow = getKp(keypoints, `${side}_elbow`, side === 'left' ? 13 : 14);
  const backSide = side === 'left' ? 'right' : 'left';
  const otherHip = getKp(keypoints, `${backSide}_hip`, backSide === 'left' ? 23 : 24);
  const otherShoulder = getKp(keypoints, `${backSide}_shoulder`, backSide === 'left' ? 11 : 12);
  const otherElbow = getKp(keypoints, `${backSide}_elbow`, backSide === 'left' ? 13 : 14);

  if (hip && shoulder && elbow && otherHip && otherShoulder && otherElbow) {
    const frontArm = angle(hip, shoulder, elbow);
    const backArm = angle(otherHip, otherShoulder, otherElbow);
    if (frontArm < 68 || backArm < 68) {
      checks.push({
        id: 'warrior_arms_low',
        passed: false,
        priority: 4,
        message: 'Elevate both arms parallel to the floor',
        joint: `${side}_elbow`,
        category: 'arm',
      });
    } else {
      checks.push({
        id: 'warrior_arms',
        passed: true,
        priority: 4,
        message: '',
        joint: null,
        category: 'arm',
      });
    }
  }

  return {
    currentRom: kneeAngle,
    formChecks: checks,
  };
}

/**
 * Evaluates Wall Slide / Shoulder Raise (reps mode)
 * - ROM = hip-shoulder-elbow angle on the side the user selected
 * - Spine neutral (torso lean <= 16°)
 * - Shoulders level / relaxed away from ears
 */
export function evaluateWallSlide(
  keypoints: PoseKeypoint[],
  side: 'left' | 'right'
): ExerciseEvaluation {
  const checks: FormCheck[] = [];

  const hip = getKp(keypoints, `${side}_hip`, side === 'left' ? 23 : 24);
  const shoulder = getKp(keypoints, `${side}_shoulder`, side === 'left' ? 11 : 12);
  const elbow = getKp(keypoints, `${side}_elbow`, side === 'left' ? 13 : 14);

  let romAngle: number | null = null;
  if (hip && shoulder && elbow) {
    romAngle = angle(hip, shoulder, elbow);
  }

  const ls = getKp(keypoints, 'left_shoulder', 11);
  const rs = getKp(keypoints, 'right_shoulder', 12);
  const lh = getKp(keypoints, 'left_hip', 23);
  const rh = getKp(keypoints, 'right_hip', 24);

  if (ls && rs && lh && rh) {
    const lean = torsoLean(ls, rs, lh, rh);
    if (lean > 16) {
      checks.push({
        id: 'wallslide_spine_arch',
        passed: false,
        priority: 1,
        message: 'Engage core gently, keep spine neutral',
        joint: 'spine',
        category: 'spine',
      });
    } else {
      checks.push({
        id: 'wallslide_spine',
        passed: true,
        priority: 1,
        message: '',
        joint: null,
        category: 'spine',
      });
    }

    const shoulderTilt = shoulderLevelDifference(ls, rs);
    if (shoulderTilt > 15) {
      checks.push({
        id: 'wallslide_shoulder_shrug',
        passed: false,
        priority: 2,
        message: `Keep ${side} shoulder relaxed away from your ear`,
        joint: `${side}_shoulder`,
        category: 'shoulder',
      });
    } else {
      checks.push({
        id: 'wallslide_shoulders',
        passed: true,
        priority: 2,
        message: '',
        joint: null,
        category: 'shoulder',
      });
    }
  }

  return {
    currentRom: romAngle,
    formChecks: checks,
  };
}
