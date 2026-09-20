export class HoldAccumulator {
  private accumulatedMs: number = 0;
  private lastPassTime: number | null = null;

  update(allChecksPassed: boolean, timestamp: number): { holdSeconds: number; isHolding: boolean } {
    if (allChecksPassed) {
      if (this.lastPassTime !== null) {
        const delta = Math.max(0, timestamp - this.lastPassTime);
        // Guard against massive time jumps (e.g. background tab sleep > 1000ms)
        if (delta <= 1000) {
          this.accumulatedMs += delta;
        }
      }
      this.lastPassTime = timestamp;
    } else {
      this.lastPassTime = null;
    }

    return {
      holdSeconds: Math.floor(this.accumulatedMs / 1000),
      isHolding: allChecksPassed,
    };
  }

  getHoldSeconds(): number {
    return Math.floor(this.accumulatedMs / 1000);
  }

  getAccumulatedMs(): number {
    return this.accumulatedMs;
  }

  reset(): void {
    this.accumulatedMs = 0;
    this.lastPassTime = null;
  }

  pause(): void {
    this.lastPassTime = null;
  }

  resume(): void {
    this.lastPassTime = null;
  }
}
