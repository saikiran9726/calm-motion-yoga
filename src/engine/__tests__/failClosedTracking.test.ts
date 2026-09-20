import { describe, it, expect } from 'vitest';
import {
  shouldEvaluateFrame,
  evaluateWarrior2,
  evaluateWallSlide,
  isEvaluationComplete,
  HoldAccumulator,
  RepCounter,
} from '../exercises';
import { LivePoseFrame, PoseKeypoint } from '../pose/poseSource';

function createSyntheticKeypoints(custom: Record<number, Partial<PoseKeypoint>> = {}): PoseKeypoint[] {
  const kps: PoseKeypoint[] = [];
  const names: Record<number, string> = {
    11: 'left_shoulder',
    12: 'right_shoulder',
    13: 'left_elbow',
    14: 'right_elbow',
    23: 'left_hip',
    24: 'right_hip',
    25: 'left_knee',
    26: 'right_knee',
    27: 'left_ankle',
    28: 'right_ankle',
  };

  for (let i = 0; i < 33; i++) {
    kps.push({
      name: names[i] || `kp_${i}`,
      x: 0.5,
      y: 0.5,
      z: 0,
      score: 0.9,
      ...custom[i],
    });
  }
  return kps;
}

function createFrame(partial: Partial<LivePoseFrame>): LivePoseFrame {
  return {
    timestamp: Date.now(),
    frameIndex: 1,
    rep: 0,
    totalReps: 10,
    state: 'tracking',
    keypoints: [],
    feedback: {
      type: 'info',
      message: '',
      joint: null,
      checks: { spine: true, knee: true },
    },
    ...partial,
  };
}

describe('Fail-Closed Tracking & Frame Gating', () => {
  describe('shouldEvaluateFrame gate', () => {
    it('rejects frames when state is user_out_of_frame, low_light, or step_back', () => {
      const validKps = createSyntheticKeypoints();

      expect(shouldEvaluateFrame(createFrame({ state: 'user_out_of_frame', keypoints: validKps }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'low_light', keypoints: validKps }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'step_back', keypoints: validKps }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'paused', keypoints: validKps }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'model_loading', keypoints: validKps }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'error', keypoints: validKps }))).toBe(false);
    });

    it('rejects frames with fewer than 33 keypoints or empty keypoints', () => {
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: [] }))).toBe(false);
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: createSyntheticKeypoints().slice(0, 25) }))).toBe(false);
    });

    it('rejects frames if any shoulder or hip is below 0.5 confidence score', () => {
      // 11 = left_shoulder, 12 = right_shoulder, 23 = left_hip, 24 = right_hip
      const lowLeftShoulder = createSyntheticKeypoints({ 11: { score: 0.42 } });
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: lowLeftShoulder }))).toBe(false);

      const lowRightShoulder = createSyntheticKeypoints({ 12: { score: 0.3 } });
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: lowRightShoulder }))).toBe(false);

      const lowLeftHip = createSyntheticKeypoints({ 23: { score: 0.49 } });
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: lowLeftHip }))).toBe(false);

      const lowRightHip = createSyntheticKeypoints({ 24: { score: 0.1 } });
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: lowRightHip }))).toBe(false);
    });

    it('accepts frames when state is tracking and shoulders + hips have score >= 0.5', () => {
      const validKps = createSyntheticKeypoints({
        11: { score: 0.5 },
        12: { score: 0.8 },
        23: { score: 0.95 },
        24: { score: 0.7 },
      });
      expect(shouldEvaluateFrame(createFrame({ state: 'tracking', keypoints: validKps }))).toBe(true);
    });
  });

  describe('Empty keypoints fail-closed proof', () => {
    it('empty keypoints -> isEvaluationComplete false and holdSeconds stays 0 for 30s', () => {
      const evalResult = evaluateWarrior2([], 'right');
      expect(isEvaluationComplete(evalResult)).toBe(false);
      expect(evalResult.formChecks.some((c) => c.category === 'visibility')).toBe(true);

      const hold = new HoldAccumulator();
      let now = 1000;

      // Simulate 30 seconds of frames at 100ms intervals (300 frames) with camera blocked / empty keypoints
      for (let i = 0; i < 300; i++) {
        const frame = createFrame({
          timestamp: now,
          state: 'user_out_of_frame',
          keypoints: [],
        });

        const shouldEval = shouldEvaluateFrame(frame);
        expect(shouldEval).toBe(false);

        // In LiveSessionScreen: when shouldEval is false, holdAccumulator.update(false, now) is called
        hold.update(false, now);
        now += 100;
      }

      expect(hold.getHoldSeconds()).toBe(0);
    });
  });

  describe('Missing joint visibility checks', () => {
    it('missing knee/ankle keypoints -> failed visibility check and hold does not accumulate', () => {
      // Shoulders and hips are visible, but right knee and ankle are out of frame (< 0.5)
      const missingLegKps = createSyntheticKeypoints({
        11: { x: 0.4, y: 0.25, score: 0.9 },
        12: { x: 0.6, y: 0.25, score: 0.9 },
        23: { x: 0.4, y: 0.5, score: 0.9 },
        24: { x: 0.6, y: 0.5, score: 0.9 },
        26: { score: 0.2 }, // right knee missing
        28: { score: 0.1 }, // right ankle missing
      });

      const frame = createFrame({ state: 'tracking', keypoints: missingLegKps });
      expect(shouldEvaluateFrame(frame)).toBe(true);

      const evalResult = evaluateWarrior2(missingLegKps, 'right');
      const visibilityCheck = evalResult.formChecks.find((c) => c.category === 'visibility');
      expect(visibilityCheck).toBeDefined();
      expect(visibilityCheck?.passed).toBe(false);
      expect(visibilityCheck?.message).toBe('Move so your whole body is visible');

      expect(isEvaluationComplete(evalResult)).toBe(false);

      const allChecksPass = isEvaluationComplete(evalResult) && evalResult.formChecks.every((c) => c.passed);
      expect(allChecksPass).toBe(false);

      const hold = new HoldAccumulator();
      let now = 1000;
      for (let i = 0; i < 50; i++) {
        hold.update(allChecksPass, now);
        now += 100;
      }
      expect(hold.getHoldSeconds()).toBe(0);
    });

    it('Wall Slide missing arm keypoints -> failed visibility check and null ROM', () => {
      const missingArmKps = createSyntheticKeypoints({
        12: { score: 0.9 }, // right shoulder
        14: { score: 0.2 }, // right elbow missing
        24: { score: 0.9 }, // right hip
      });

      const evalResult = evaluateWallSlide(missingArmKps, 'right');
      expect(evalResult.currentRom).toBeNull();
      expect(evalResult.formChecks.some((c) => c.category === 'visibility')).toBe(true);
      expect(isEvaluationComplete(evalResult)).toBe(false);
    });
  });

  describe('Valid Warrior II keypoints accumulate hold time (regression)', () => {
    it('accumulates hold time when whole body is properly aligned in Warrior II', () => {
      // Build a synthetic perfect Warrior II for right side:
      // Front knee at 90°: hip (0.6, 0.5) -> knee (0.8, 0.5) -> ankle (0.8, 0.8)
      // Upright spine: shoulders (0.4, 0.25) & (0.6, 0.25), hips (0.4, 0.5) & (0.6, 0.5)
      // Horizontal arms: right shoulder (0.6, 0.25) -> elbow (0.85, 0.25); left shoulder (0.4, 0.25) -> elbow (0.15, 0.25)
      const validWarriorKps = createSyntheticKeypoints({
        11: { x: 0.4, y: 0.25, score: 0.9 },
        12: { x: 0.6, y: 0.25, score: 0.9 },
        13: { x: 0.15, y: 0.25, score: 0.9 },
        14: { x: 0.85, y: 0.25, score: 0.9 },
        23: { x: 0.4, y: 0.5, score: 0.9 },
        24: { x: 0.6, y: 0.5, score: 0.9 },
        25: { x: 0.2, y: 0.5, score: 0.9 },
        26: { x: 0.8, y: 0.5, score: 0.9 },
        27: { x: 0.2, y: 0.8, score: 0.9 },
        28: { x: 0.8, y: 0.8, score: 0.9 },
      });

      const frame = createFrame({ state: 'tracking', keypoints: validWarriorKps });
      expect(shouldEvaluateFrame(frame)).toBe(true);

      const evalResult = evaluateWarrior2(validWarriorKps, 'right');
      expect(evalResult.currentRom).toBe(90);
      expect(evalResult.formChecks.every((c) => c.passed)).toBe(true);
      expect(isEvaluationComplete(evalResult)).toBe(true);

      const allChecksPass = isEvaluationComplete(evalResult) && evalResult.formChecks.every((c) => c.passed);
      expect(allChecksPass).toBe(true);

      const hold = new HoldAccumulator();
      let now = 1000;
      for (let i = 0; i <= 50; i++) {
        hold.update(allChecksPass, now);
        now += 100;
      }
      expect(hold.getHoldSeconds()).toBe(5);
    });
  });

  describe('Wall Slide rep counting with real ROM', () => {
    it('reps only count from real numeric ROM values through proper inflection', () => {
      const counter = new RepCounter({ lowerThreshold: 75, upperThreshold: 130, minRepDurationMs: 500 });
      let now = 1000;

      // Start at lower threshold
      counter.update(60, now);
      now += 200;
      expect(counter.getReps()).toBe(0);

      // Ascend
      counter.update(95, now);
      now += 300;

      // Reach upper threshold
      counter.update(135, now);
      now += 400;
      expect(counter.getReps()).toBe(0);

      // Descend back to lower threshold
      const res = counter.update(65, now);
      expect(res.repCompleted).toBe(true);
      expect(counter.getReps()).toBe(1);
    });
  });
});
