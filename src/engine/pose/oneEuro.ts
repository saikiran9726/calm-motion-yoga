/**
 * 1€ (One Euro) Filter
 * Adaptive low-pass filter that reduces jitter when movement is slow
 * and eliminates lag when movement is fast.
 * Reference: Casiez, Roussel, Vogel (CHI 2012)
 */

export interface OneEuroConfig {
  minCutoff?: number; // Minimum cutoff frequency (Hz)
  beta?: number;      // Speed coefficient
  dCutoff?: number;   // Cutoff frequency for derivative (Hz)
}

function alpha(rate: number, cutoff: number): number {
  const tau = 1.0 / (2 * Math.PI * cutoff);
  const te = 1.0 / rate;
  return 1.0 / (1.0 + tau / te);
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;

  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;

  constructor(config: OneEuroConfig = {}) {
    this.minCutoff = config.minCutoff ?? 1.0;
    this.beta = config.beta ?? 0.007;
    this.dCutoff = config.dCutoff ?? 1.0;
  }

  reset(): void {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }

  filter(x: number, timestamp: number): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.dxPrev = 0;
      this.tPrev = timestamp;
      return x;
    }

    // Elapsed time in seconds
    const dt = (timestamp - this.tPrev) / 1000;
    if (dt <= 0) {
      return this.xPrev;
    }

    this.tPrev = timestamp;
    const rate = 1.0 / dt;

    // Filtered derivative
    const dx = (x - this.xPrev) * rate;
    const aD = alpha(rate, this.dCutoff);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    this.dxPrev = dxHat;

    // Adaptive cutoff based on velocity
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = alpha(rate, cutoff);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.xPrev = xHat;

    return xHat;
  }
}

/**
 * Filter for an array of 2D/3D pose landmarks
 */
export class OneEuroPoseFilter {
  private filters: Map<number, { x: OneEuroFilter; y: OneEuroFilter; z: OneEuroFilter }> = new Map();
  private config: OneEuroConfig;

  constructor(config: OneEuroConfig = { minCutoff: 1.0, beta: 0.007, dCutoff: 1.0 }) {
    this.config = config;
  }

  reset(): void {
    this.filters.clear();
  }

  filter(index: number, x: number, y: number, z: number = 0, timestamp: number): { x: number; y: number; z: number } {
    let landmarkFilters = this.filters.get(index);
    if (!landmarkFilters) {
      landmarkFilters = {
        x: new OneEuroFilter(this.config),
        y: new OneEuroFilter(this.config),
        z: new OneEuroFilter(this.config),
      };
      this.filters.set(index, landmarkFilters);
    }

    return {
      x: landmarkFilters.x.filter(x, timestamp),
      y: landmarkFilters.y.filter(y, timestamp),
      z: landmarkFilters.z.filter(z, timestamp),
    };
  }
}
