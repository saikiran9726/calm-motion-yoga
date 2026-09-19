import mockData from '@/data/mockPoseReplay.json';

export type PoseSourceState =
  | 'uninitialized'
  | 'requesting_permission'
  | 'permission_denied'
  | 'no_camera'
  | 'model_loading'
  | 'ready'
  | 'tracking'
  | 'user_out_of_frame'
  | 'step_back'
  | 'low_light'
  | 'paused'
  | 'completed'
  | 'error';

export interface PoseKeypoint {
  name: string;
  x: number; // 0.0 - 1.0 (normalized)
  y: number; // 0.0 - 1.0 (normalized)
  z?: number;
  score: number;
}

export interface FeedbackData {
  type: 'correction' | 'positive' | 'warning' | 'info';
  message: string;
  joint: string | null;
  checks: {
    spine: boolean;
    knee: boolean;
  };
}

export interface LivePoseFrame {
  timestamp: number;
  frameIndex: number;
  rep: number;
  totalReps: number;
  state: PoseSourceState;
  keypoints: PoseKeypoint[];
  feedback: FeedbackData;
}

export interface IPoseSource {
  start(): Promise<void>;
  stop(): void;
  pause(): void;
  resume(): void;
  getState(): PoseSourceState;
  setState(state: PoseSourceState): void;
  onFrame(listener: (frame: LivePoseFrame) => void): () => void;
  onStateChange(listener: (state: PoseSourceState) => void): () => void;
}

export class MockPoseSource implements IPoseSource {
  private state: PoseSourceState = 'uninitialized';
  private frameListeners: Set<(frame: LivePoseFrame) => void> = new Set();
  private stateListeners: Set<(state: PoseSourceState) => void> = new Set();
  private timer: number | null = null;
  private currentFrameIndex: number = 0;
  private repCounter: number = 8;
  private totalReps: number = 10;
  private simulatedTime: number = 0;

  async start(): Promise<void> {
    this.setState('ready');
    this.setState('tracking');

    this.timer = window.setInterval(() => {
      if (this.state === 'paused' || this.state === 'completed') return;

      this.simulatedTime += 100;
      this.currentFrameIndex = (this.currentFrameIndex + 1) % mockData.frames.length;

      const currentMock = mockData.frames[this.currentFrameIndex];
      // Increment rep smoothly
      if (this.currentFrameIndex === 0) {
        this.repCounter = Math.min(this.totalReps, this.repCounter + 1);
      }

      // Add gentle natural micro-sway to keypoints
      const naturalKeypoints = currentMock.keypoints.map((k) => ({
        ...k,
        x: k.x + Math.sin(this.simulatedTime / 600 + k.y * 10) * 0.005,
        y: k.y + Math.cos(this.simulatedTime / 700 + k.x * 10) * 0.004,
      }));

      const liveFrame: LivePoseFrame = {
        timestamp: Date.now(),
        frameIndex: this.currentFrameIndex,
        rep: currentMock.rep || this.repCounter,
        totalReps: this.totalReps,
        state: this.state,
        keypoints: naturalKeypoints,
        feedback: {
          type: currentMock.feedback.type as any,
          message: currentMock.feedback.message,
          joint: currentMock.feedback.joint,
          checks: currentMock.feedback.checks,
        },
      };

      this.frameListeners.forEach((listener) => listener(liveFrame));
    }, 120);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.setState('uninitialized');
  }

  pause(): void {
    this.setState('paused');
  }

  resume(): void {
    this.setState('tracking');
  }

  getState(): PoseSourceState {
    return this.state;
  }

  setState(newState: PoseSourceState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((listener) => listener(newState));
    }
  }

  onFrame(listener: (frame: LivePoseFrame) => void): () => void {
    this.frameListeners.add(listener);
    return () => this.frameListeners.delete(listener);
  }

  onStateChange(listener: (state: PoseSourceState) => void): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }
}

// Export singleton instance for easy drop-in replacement
export const activePoseSource: IPoseSource = new MockPoseSource();
