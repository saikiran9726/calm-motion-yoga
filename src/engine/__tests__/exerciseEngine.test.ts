import { describe, it, expect } from 'vitest';
import { angle, torsoLean, shoulderLevelDifference } from '../exercises/geometry';
import { OneEuroFilter } from '../pose/oneEuro';
import { RepCounter } from '../exercises/repCounter';
import { HoldAccumulator } from '../exercises/holdAccumulator';
import { arbitrateFeedback, FormCheck } from '../exercises/feedbackArbiter';

describe('Geometry Engine: angle, torsoLean, shoulderLevelDifference', () => {
  it('calculates exact 90 degree angle for perpendicular vectors', () => {
    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 0, y: 1 };
    expect(angle(a, b, c)).toBe(90);
  });

  it('calculates exact 180 degree angle for a straight line', () => {
    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: -1, y: 0 };
    expect(angle(a, b, c)).toBe(180);
  });

  it('calculates 45 degree angle for diagonal', () => {
    const a = { x: 1, y: 0 };
    const b = { x: 0, y: 0 };
    const c = { x: 1, y: 1 };
    expect(angle(a, b, c)).toBe(45);
  });

  it('calculates 60 degree angle for equilateral triangle vertex', () => {
    const b = { x: 0, y: 0 };
    const a = { x: 1, y: 0 };
    const c = { x: 0.5, y: Math.sqrt(3) / 2 };
    expect(angle(a, b, c)).toBe(60);
  });

  it('computes 0 degree torso lean when spine is vertical', () => {
    const ls = { x: 0.4, y: 0.2 };
    const rs = { x: 0.6, y: 0.2 };
    const lh = { x: 0.4, y: 0.6 };
    const rh = { x: 0.6, y: 0.6 };
    expect(torsoLean(ls, rs, lh, rh)).toBe(0);
  });

  it('computes positive torso lean when spine tilts sideways', () => {
    const ls = { x: 0.6, y: 0.2 };
    const rs = { x: 0.8, y: 0.2 };
    const lh = { x: 0.4, y: 0.6 };
    const rh = { x: 0.6, y: 0.6 };
    // Midpoint shoulders (0.7, 0.2), Midpoint hips (0.5, 0.6)
    // dx = 0.2, dy = 0.4 -> atan2(0.2, 0.4) = ~26.56°
    const lean = torsoLean(ls, rs, lh, rh);
    expect(lean).toBeGreaterThan(20);
    expect(lean).toBeLessThan(32);
  });

  it('detects shoulder level differences', () => {
    const levelLeft = { x: 0.3, y: 0.3 };
    const levelRight = { x: 0.7, y: 0.3 };
    expect(shoulderLevelDifference(levelLeft, levelRight)).toBe(0);

    const tiltedLeft = { x: 0.3, y: 0.3 };
    const tiltedRight = { x: 0.7, y: 0.4 };
    expect(shoulderLevelDifference(tiltedLeft, tiltedRight)).toBeGreaterThan(10);
  });
});

describe('One Euro Filter', () => {
  it('smooths high-frequency noise', () => {
    const filter = new OneEuroFilter({ minCutoff: 1.0, beta: 0.007 });
    const baseline = 1.0;
    const noisyValues = [1.08, 0.92, 1.05, 0.96, 1.07, 0.94, 1.06, 0.95];
    const filteredValues: number[] = [];

    let t = 1000;
    for (const val of noisyValues) {
      filteredValues.push(filter.filter(val, t));
      t += 33; // ~30 FPS
    }

    // Variance of raw vs filtered
    const rawDeviations = noisyValues.map((v) => Math.abs(v - baseline));
    const rawMeanDev = rawDeviations.reduce((a, b) => a + b, 0) / rawDeviations.length;

    const filteredDeviations = filteredValues.map((v) => Math.abs(v - baseline));
    const filteredMeanDev = filteredDeviations.reduce((a, b) => a + b, 0) / filteredDeviations.length;

    expect(filteredMeanDev).toBeLessThan(rawMeanDev);
  });

  it('follows a step change over time', () => {
    const filter = new OneEuroFilter({ minCutoff: 1.0, beta: 0.01 });
    let t = 0;
    filter.filter(0, t);

    // Sudden step to 10
    let current = 0;
    for (let i = 1; i <= 30; i++) {
      t += 33;
      current = filter.filter(10, t);
    }
    // Should smoothly converge close to 10
    expect(current).toBeGreaterThan(9.5);
  });
});

describe('RepCounter with hysteresis and partial-rep rejection', () => {
  it('counts a full rep when rising above upperThreshold and returning below lowerThreshold', () => {
    const counter = new RepCounter({ upperThreshold: 130, lowerThreshold: 75, minRepDurationMs: 600 });
    let t = 1000;

    // Start at bottom
    expect(counter.update(60, t).repCompleted).toBe(false);

    // Ascend past lower threshold
    t += 200;
    expect(counter.update(100, t).repCompleted).toBe(false);

    // Reach upper threshold
    t += 300;
    expect(counter.update(135, t).repCompleted).toBe(false);

    // Descend back below lower threshold after >= 600ms total
    t += 350;
    const result = counter.update(70, t);
    expect(result.repCompleted).toBe(true);
    expect(result.repCount).toBe(1);
  });

  it('rejects partial reps that do not reach the upper threshold', () => {
    const counter = new RepCounter({ upperThreshold: 130, lowerThreshold: 75, minRepDurationMs: 600 });
    let t = 1000;

    counter.update(60, t);
    t += 200;
    counter.update(100, t); // Only reaches 100, not 130
    t += 300;
    counter.update(115, t);
    t += 300;
    const result = counter.update(60, t); // Drops back down

    expect(result.repCompleted).toBe(false);
    expect(result.repCount).toBe(0);
  });

  it('does not double count when jittering near the thresholds', () => {
    const counter = new RepCounter({ upperThreshold: 130, lowerThreshold: 75, minRepDurationMs: 600 });
    let t = 1000;

    counter.update(60, t);
    t += 100;
    // Jitter around lower threshold
    counter.update(74, t);
    t += 50;
    counter.update(76, t);
    t += 50;
    counter.update(74, t);
    expect(counter.getReps()).toBe(0);

    // Ascend to upper
    t += 300;
    counter.update(132, t);
    t += 50;
    // Jitter around upper threshold
    counter.update(129, t);
    t += 50;
    counter.update(131, t);
    expect(counter.getReps()).toBe(0);

    // Return to lower
    t += 600;
    counter.update(65, t);
    expect(counter.getReps()).toBe(1);
  });
});

describe('HoldAccumulator for yoga poses', () => {
  it('accumulates hold time only while form checks pass', () => {
    const hold = new HoldAccumulator();
    let t = 1000;

    // Start holding with form checks passed for 3 seconds (30 intervals of 100ms)
    for (let i = 0; i <= 30; i++) {
      hold.update(true, t);
      t += 100;
    }
    expect(hold.getHoldSeconds()).toBe(3);

    // Form breaks for 2 seconds
    for (let i = 0; i < 20; i++) {
      hold.update(false, t);
      t += 100;
    }
    // Hold time must remain paused at 3
    expect(hold.getHoldSeconds()).toBe(3);

    // Form resumes and passes for 2 more seconds (20 intervals of 100ms)
    for (let i = 0; i <= 20; i++) {
      hold.update(true, t);
      t += 100;
    }
    expect(hold.getHoldSeconds()).toBe(5);
  });
});

describe('Feedback Arbiter', () => {
  it('returns highest priority correction when multiple checks fail', () => {
    const checks: FormCheck[] = [
      { id: '1', passed: true, priority: 1, message: 'Knee OK', joint: null, category: 'knee' },
      { id: '2', passed: false, priority: 3, message: 'Shoulders uneven', joint: 'left_shoulder', category: 'shoulder' },
      { id: '3', passed: false, priority: 2, message: 'Spine leaning', joint: 'spine', category: 'spine' },
    ];

    const result = arbitrateFeedback(checks);
    expect(result.type).toBe('correction');
    expect(result.message).toBe('Spine leaning'); // Priority 2 is higher than 3
    expect(result.allChecksPassed).toBe(false);
  });

  it('returns positive feedback when all checks pass', () => {
    const checks: FormCheck[] = [
      { id: '1', passed: true, priority: 1, message: '', joint: null, category: 'knee' },
      { id: '2', passed: true, priority: 2, message: '', joint: null, category: 'spine' },
    ];

    const result = arbitrateFeedback(checks);
    expect(result.type).toBe('positive');
    expect(result.allChecksPassed).toBe(true);
  });
});
