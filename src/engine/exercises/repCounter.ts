export interface RepCounterConfig {
  upperThreshold: number;     // Value to trigger inflection (e.g. 130 degrees for wall slide)
  lowerThreshold: number;     // Base return threshold (e.g. 75 degrees)
  minRepDurationMs?: number;  // Minimum elapsed time for a full valid rep cycle (default 700ms)
}

export class RepCounter {
  private upperThreshold: number;
  private lowerThreshold: number;
  private minRepDurationMs: number;

  private repCount: number = 0;
  private state: 'at_lower' | 'ascending' | 'reached_upper' = 'at_lower';
  private repStartTime: number | null = null;

  constructor(config: RepCounterConfig) {
    if (config.upperThreshold <= config.lowerThreshold) {
      throw new Error('upperThreshold must be strictly greater than lowerThreshold for hysteresis');
    }
    this.upperThreshold = config.upperThreshold;
    this.lowerThreshold = config.lowerThreshold;
    this.minRepDurationMs = config.minRepDurationMs ?? 700;
  }

  update(value: number, timestamp: number): { repCount: number; repCompleted: boolean } {
    let repCompleted = false;

    if (this.state === 'at_lower') {
      if (value >= this.upperThreshold) {
        this.state = 'reached_upper';
        this.repStartTime = timestamp;
      } else if (value > this.lowerThreshold) {
        this.state = 'ascending';
        this.repStartTime = timestamp;
      }
    } else if (this.state === 'ascending') {
      if (value >= this.upperThreshold) {
        this.state = 'reached_upper';
      } else if (value <= this.lowerThreshold) {
        // Did not reach upper threshold before falling back down (partial rep) -> reject
        this.state = 'at_lower';
        this.repStartTime = null;
      }
    } else if (this.state === 'reached_upper') {
      if (value <= this.lowerThreshold) {
        // Returned below lower threshold
        const duration = this.repStartTime !== null ? timestamp - this.repStartTime : 0;
        if (duration >= this.minRepDurationMs) {
          this.repCount++;
          repCompleted = true;
        }
        // Reset state for subsequent rep cycle
        this.state = 'at_lower';
        this.repStartTime = null;
      }
    }

    return {
      repCount: this.repCount,
      repCompleted,
    };
  }

  getReps(): number {
    return this.repCount;
  }

  reset(): void {
    this.repCount = 0;
    this.state = 'at_lower';
    this.repStartTime = null;
  }
}
