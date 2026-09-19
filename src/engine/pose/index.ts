// Placeholder for on-device pose estimation engine (MediaPipe / TF.js WebAssembly)
export interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  score: number;
  name: string;
}

export interface PoseFrame {
  timestamp: number;
  keypoints: PoseKeypoint[];
}
