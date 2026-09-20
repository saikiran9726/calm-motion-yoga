import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import {
  IPoseSource,
  LivePoseFrame,
  PoseKeypoint,
  PoseSourceState,
  FeedbackData,
} from './poseSource';
import { OneEuroPoseFilter } from './oneEuro';

export const LANDMARK_NAMES = [
  'nose',             // 0
  'left_eye_inner',   // 1
  'left_eye',         // 2
  'left_eye_outer',   // 3
  'right_eye_inner',  // 4
  'right_eye',        // 5
  'right_eye_outer',  // 6
  'left_ear',         // 7
  'right_ear',        // 8
  'mouth_left',       // 9
  'mouth_right',      // 10
  'left_shoulder',    // 11
  'right_shoulder',   // 12
  'left_elbow',       // 13
  'right_elbow',      // 14
  'left_wrist',       // 15
  'right_wrist',      // 16
  'left_pinky',       // 17
  'right_pinky',      // 18
  'left_index',       // 19
  'right_index',      // 20
  'left_thumb',       // 21
  'right_thumb',      // 22
  'left_hip',         // 23
  'right_hip',        // 24
  'left_knee',        // 25
  'right_knee',       // 26
  'left_ankle',       // 27
  'right_ankle',      // 28
  'left_heel',        // 29
  'right_heel',       // 30
  'left_foot_index',  // 31
  'right_foot_index', // 32
];

export class MediaPipePoseSource implements IPoseSource {
  private video: HTMLVideoElement | null = null;
  private landmarker: PoseLandmarker | null = null;
  private state: PoseSourceState = 'uninitialized';
  private frameListeners: Set<(frame: LivePoseFrame) => void> = new Set();
  private stateListeners: Set<(state: PoseSourceState) => void> = new Set();

  private isRunning: boolean = false;
  private isPaused: boolean = false;
  private rafId: number | null = null;
  private rvfcId: number | null = null;

  private lastVideoTime: number = -1;
  private lastTimestamp: number = 0;
  private frameIndex: number = 0;

  // Smoothing filter
  private poseFilter: OneEuroPoseFilter = new OneEuroPoseFilter();

  // Metrics
  private frameTimestamps: number[] = [];
  private inferenceDurations: number[] = [];
  private delegate: 'GPU' | 'CPU' | null = null;

  // State evaluation helpers
  private outOfFrameStartTime: number | null = null;
  private lastLightCheckTime: number = 0;
  private lightCanvas: HTMLCanvasElement | null = null;
  private lightCtx: CanvasRenderingContext2D | null = null;
  private isLowLight: boolean = false;

  attachVideo(el: HTMLVideoElement): void {
    this.video = el;
  }

  getState(): PoseSourceState {
    return this.state;
  }

  setState(newState: PoseSourceState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.stateListeners.forEach((fn) => fn(newState));
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

  async start(): Promise<void> {
    if (this.isRunning) return;

    this.setState('model_loading');
    this.isRunning = true;
    this.isPaused = false;

    try {
      if (!this.landmarker) {
        const vision = await FilesetResolver.forVisionTasks('/mediapipe/wasm');

        try {
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/pose_landmarker_lite.task',
              delegate: 'GPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
          this.delegate = 'GPU';
        } catch (gpuError) {
          console.warn('GPU delegate failed for PoseLandmarker, falling back to CPU:', gpuError);
          this.landmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: '/models/pose_landmarker_lite.task',
              delegate: 'CPU',
            },
            runningMode: 'VIDEO',
            numPoses: 1,
          });
          this.delegate = 'CPU';
        }
      }

      this.setState('ready');
      this.setState('tracking');
      this.scheduleNextFrame();
    } catch (err: unknown) {
      console.error('Failed to load PoseLandmarker model:', err);
      this.setState('error');
      this.isRunning = false;
      throw err;
    }
  }

  pause(): void {
    this.isPaused = true;
    this.setState('paused');
  }

  resume(): void {
    if (!this.isRunning) {
      this.start().catch(() => {});
      return;
    }
    this.isPaused = false;
    this.setState('tracking');
    this.scheduleNextFrame();
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    this.cancelScheduledFrame();
    this.poseFilter.reset();
    this.setState('uninitialized');
  }

  dispose(): void {
    this.stop();
    if (this.landmarker) {
      try {
        this.landmarker.close();
      } catch {}
      this.landmarker = null;
    }
    this.frameListeners.clear();
    this.stateListeners.clear();
    this.video = null;
    this.lightCanvas = null;
    this.lightCtx = null;
  }

  getMetrics(): { fps: number | null; inferenceMs: number | null; delegate: 'GPU' | 'CPU' | null } {
    let fps: number | null = null;
    if (this.frameTimestamps.length >= 2) {
      const dt =
        (this.frameTimestamps[this.frameTimestamps.length - 1] - this.frameTimestamps[0]) /
        (this.frameTimestamps.length - 1);
      if (dt > 0) {
        fps = Math.round(1000 / dt);
      }
    }

    let inferenceMs: number | null = null;
    if (this.inferenceDurations.length > 0) {
      const avg =
        this.inferenceDurations.reduce((a, b) => a + b, 0) / this.inferenceDurations.length;
      inferenceMs = Math.round(avg * 10) / 10;
    }

    return {
      fps,
      inferenceMs,
      delegate: this.delegate,
    };
  }

  private scheduleNextFrame(): void {
    if (!this.isRunning || this.isPaused) return;

    if (
      this.video &&
      'requestVideoFrameCallback' in HTMLVideoElement.prototype &&
      typeof (this.video as any).requestVideoFrameCallback === 'function'
    ) {
      this.rvfcId = (this.video as any).requestVideoFrameCallback(() => this.processFrame());
    } else {
      this.rafId = requestAnimationFrame(() => this.processFrame());
    }
  }

  private cancelScheduledFrame(): void {
    if (
      this.rvfcId !== null &&
      this.video &&
      'cancelVideoFrameCallback' in HTMLVideoElement.prototype &&
      typeof (this.video as any).cancelVideoFrameCallback === 'function'
    ) {
      (this.video as any).cancelVideoFrameCallback(this.rvfcId);
      this.rvfcId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  private checkLowLight(video: HTMLVideoElement, now: number): boolean {
    if (now - this.lastLightCheckTime < 1000) {
      return this.isLowLight;
    }
    this.lastLightCheckTime = now;

    try {
      if (!this.lightCanvas) {
        this.lightCanvas = document.createElement('canvas');
        this.lightCanvas.width = 32;
        this.lightCanvas.height = 32;
        this.lightCtx = this.lightCanvas.getContext('2d', { willReadFrequently: true });
      }

      if (this.lightCtx && video.videoWidth > 0 && video.videoHeight > 0) {
        this.lightCtx.drawImage(video, 0, 0, 32, 32);
        const data = this.lightCtx.getImageData(0, 0, 32, 32).data;
        let sumLuminance = 0;
        const totalPixels = 32 * 32;
        for (let i = 0; i < data.length; i += 4) {
          sumLuminance += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }
        const meanLuminance = sumLuminance / totalPixels;
        this.isLowLight = meanLuminance < 35;
      }
    } catch {
      this.isLowLight = false;
    }

    return this.isLowLight;
  }

  private processFrame(): void {
    if (!this.isRunning || this.isPaused) return;

    const video = this.video;
    if (!video || !this.landmarker) {
      this.scheduleNextFrame();
      return;
    }

    // Process only when readyState >= 2 and frame is new
    if (video.readyState < 2 || video.currentTime === this.lastVideoTime) {
      this.scheduleNextFrame();
      return;
    }

    this.lastVideoTime = video.currentTime;
    const now = performance.now();

    // Track frame rate intervals
    this.frameTimestamps.push(now);
    if (this.frameTimestamps.length > 25) this.frameTimestamps.shift();

    // Low-light check once per second
    const isDark = this.checkLowLight(video, now);

    // Monotonic timestamp required by detectForVideo
    const frameTimestamp = Math.max(now, this.lastTimestamp + 1);
    this.lastTimestamp = frameTimestamp;

    let result;
    try {
      const t0 = performance.now();
      result = this.landmarker.detectForVideo(video, frameTimestamp);
      const inferenceDuration = performance.now() - t0;
      this.inferenceDurations.push(inferenceDuration);
      if (this.inferenceDurations.length > 25) this.inferenceDurations.shift();
    } catch (inferenceErr) {
      console.error('Inference error in MediaPipePoseSource:', inferenceErr);
      this.setState('error');
      this.scheduleNextFrame();
      return;
    }

    // Evaluate pose and emit real states
    const hasLandmarks = result && result.landmarks && result.landmarks.length > 0 && result.landmarks[0].length >= 33;
    const rawLandmarks = hasLandmarks ? result.landmarks[0] : null;

    let currentState: PoseSourceState = 'tracking';

    if (isDark) {
      currentState = 'low_light';
    } else if (!rawLandmarks) {
      if (this.outOfFrameStartTime === null) {
        this.outOfFrameStartTime = now;
      } else if (now - this.outOfFrameStartTime >= 500) {
        currentState = 'user_out_of_frame';
      }
    } else {
      // Check key landmarks: 11 (left_shoulder), 12 (right_shoulder), 23 (left_hip), 24 (right_hip)
      const ls = rawLandmarks[11];
      const rs = rawLandmarks[12];
      const lh = rawLandmarks[23];
      const rh = rawLandmarks[24];

      const lsVis = ls?.visibility ?? 1.0;
      const rsVis = rs?.visibility ?? 1.0;
      const lhVis = lh?.visibility ?? 1.0;
      const rhVis = rh?.visibility ?? 1.0;

      const keyVisible = lsVis >= 0.5 && rsVis >= 0.5 && lhVis >= 0.5 && rhVis >= 0.5;

      if (!keyVisible) {
        if (this.outOfFrameStartTime === null) {
          this.outOfFrameStartTime = now;
        } else if (now - this.outOfFrameStartTime >= 500) {
          currentState = 'user_out_of_frame';
        }
      } else {
        this.outOfFrameStartTime = null;

        // Check bounding box for step_back state
        let minX = 1, maxX = 0, minY = 1, maxY = 0;
        for (let i = 0; i < rawLandmarks.length; i++) {
          const pt = rawLandmarks[i];
          if (pt.x < minX) minX = pt.x;
          if (pt.x > maxX) maxX = pt.x;
          if (pt.y < minY) minY = pt.y;
          if (pt.y > maxY) maxY = pt.y;
        }

        const boxHeight = maxY - minY;
        const touchesEdge = minX < 0.02 || maxX > 0.98 || minY < 0.02 || maxY > 0.98;

        if (boxHeight > 0.92 || touchesEdge) {
          currentState = 'step_back';
        } else {
          currentState = 'tracking';
        }
      }
    }

    this.setState(currentState);

    // Map 33 landmarks to named keypoints with OneEuro filter
    let smoothedKeypoints: PoseKeypoint[] = [];
    if (rawLandmarks) {
      smoothedKeypoints = rawLandmarks.map((lm, idx) => {
        const smoothed = this.poseFilter.filter(idx, lm.x, lm.y, lm.z ?? 0, frameTimestamp);
        return {
          name: LANDMARK_NAMES[idx] || `landmark_${idx}`,
          x: smoothed.x,
          y: smoothed.y,
          z: smoothed.z,
          score: lm.visibility ?? 1.0,
        };
      });
    }

    this.frameIndex++;

    const feedback: FeedbackData = {
      type: currentState === 'tracking' ? 'positive' : 'info',
      message:
        currentState === 'step_back'
          ? 'Step back slightly for full frame view'
          : currentState === 'user_out_of_frame'
          ? 'Step into camera frame'
          : currentState === 'low_light'
          ? 'Increase room lighting'
          : 'Hold steady and breathe',
      joint: null,
      checks: {
        spine: true,
        knee: true,
      },
    };

    const liveFrame: LivePoseFrame = {
      timestamp: Date.now(),
      frameIndex: this.frameIndex,
      rep: 0,
      totalReps: 10,
      state: currentState,
      keypoints: smoothedKeypoints,
      feedback,
    };

    this.frameListeners.forEach((fn) => fn(liveFrame));
    this.scheduleNextFrame();
  }
}
