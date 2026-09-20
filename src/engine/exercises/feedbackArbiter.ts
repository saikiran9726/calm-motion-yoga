export interface FormCheck {
  id: string;
  passed: boolean;
  priority: number; // Lower integer = higher priority (1 is highest)
  message: string;
  joint: string | null;
  category: 'knee' | 'spine' | 'shoulder' | 'arm' | 'general' | 'visibility';
}

export interface FeedbackOutput {
  type: 'correction' | 'positive';
  message: string;
  joint: string | null;
  allChecksPassed: boolean;
  checks: {
    spine: boolean;
    knee: boolean;
  };
}

/**
 * Arbitrates a list of form checks and returns the single highest priority correction.
 * If all checks pass, returns a positive encouragement feedback.
 */
export function arbitrateFeedback(checks: FormCheck[]): FeedbackOutput {
  const failedChecks = checks.filter((c) => !c.passed);

  const spinePassed = !checks.some((c) => c.category === 'spine' && !c.passed);
  const kneePassed = !checks.some((c) => c.category === 'knee' && !c.passed);

  if (failedChecks.length === 0) {
    return {
      type: 'positive',
      message: 'Good alignment and steady breath',
      joint: null,
      allChecksPassed: true,
      checks: {
        spine: spinePassed,
        knee: kneePassed,
      },
    };
  }

  // Sort by priority ascending (1 is highest priority)
  failedChecks.sort((a, b) => a.priority - b.priority);
  const highestPriorityError = failedChecks[0];

  return {
    type: 'correction',
    message: highestPriorityError.message,
    joint: highestPriorityError.joint,
    allChecksPassed: false,
    checks: {
      spine: spinePassed,
      knee: kneePassed,
    },
  };
}

/**
 * Debounces feedback to ensure any displayed cue remains on screen for at least 1500ms.
 */
export class FeedbackDebouncer {
  private currentFeedback: FeedbackOutput = {
    type: 'positive',
    message: 'Good movement',
    joint: null,
    allChecksPassed: true,
    checks: { spine: true, knee: true },
  };
  private lastChangeTime: number = 0;
  private minDurationMs: number;

  constructor(minDurationMs = 1500) {
    this.minDurationMs = minDurationMs;
  }

  update(incoming: FeedbackOutput, now: number): FeedbackOutput {
    const elapsed = now - this.lastChangeTime;
    const isNewCorrection = incoming.type === 'correction' && this.currentFeedback.type !== 'correction';

    // Allow correction to display if debounce time passed, or if switching from positive to a critical correction
    if (elapsed >= this.minDurationMs || (isNewCorrection && elapsed >= 500)) {
      if (
        incoming.message !== this.currentFeedback.message ||
        incoming.type !== this.currentFeedback.type
      ) {
        this.currentFeedback = incoming;
        this.lastChangeTime = now;
      }
    }

    // Always keep checks updated
    return {
      ...this.currentFeedback,
      checks: incoming.checks,
      allChecksPassed: incoming.allChecksPassed,
    };
  }

  getCurrent(): FeedbackOutput {
    return this.currentFeedback;
  }

  reset(): void {
    this.currentFeedback = {
      type: 'positive',
      message: 'Good movement',
      joint: null,
      allChecksPassed: true,
      checks: { spine: true, knee: true },
    };
    this.lastChangeTime = 0;
  }
}
