import React, { useRef, useEffect } from 'react';
import { PoseKeypoint } from '@/engine/pose/poseSource';

export interface SkeletonCanvasProps {
  keypoints: PoseKeypoint[];
  highlightJoint?: string | null;
  className?: string;
}

export const SkeletonCanvas: React.FC<SkeletonCanvasProps> = ({
  keypoints,
  highlightJoint,
  className = 'w-full h-full',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI displays
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    if (!keypoints || keypoints.length === 0) return;

    // Map keypoints by name
    const kpMap = new Map<string, { x: number; y: number }>();
    keypoints.forEach((k) => {
      kpMap.set(k.name, { x: k.x * w, y: k.y * h });
    });

    const drawLine = (fromName: string, toName: string, strokeColor = 'rgba(221, 235, 228, 0.55)', lineWidth = 2.5) => {
      const p1 = kpMap.get(fromName);
      const p2 = kpMap.get(toName);
      if (!p1 || !p2) return;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();
    };

    // 1. Draw Skeleton Connections (Calm Soft Sage)
    // Shoulders
    drawLine('left_shoulder', 'right_shoulder');
    // Arms
    drawLine('left_shoulder', 'left_elbow');
    drawLine('left_elbow', 'left_wrist');
    drawLine('right_shoulder', 'right_elbow');
    drawLine('right_elbow', 'right_wrist');
    // Torso
    drawLine('left_shoulder', 'left_hip');
    drawLine('right_shoulder', 'right_hip');
    drawLine('left_hip', 'right_hip');
    // Legs
    drawLine('left_hip', 'left_knee');
    drawLine('left_knee', 'left_ankle');
    drawLine('right_hip', 'right_knee');
    drawLine('right_knee', 'right_ankle');

    // Neck / Head
    const ls = kpMap.get('left_shoulder');
    const rs = kpMap.get('right_shoulder');
    const nose = kpMap.get('nose');
    if (ls && rs && nose) {
      const midShoulder = { x: (ls.x + rs.x) / 2, y: (ls.y + rs.y) / 2 };
      ctx.beginPath();
      ctx.moveTo(midShoulder.x, midShoulder.y);
      ctx.lineTo(nose.x, nose.y);
      ctx.strokeStyle = 'rgba(221, 235, 228, 0.45)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Head circle
      ctx.beginPath();
      ctx.arc(nose.x, nose.y - 12, 16, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(221, 235, 228, 0.55)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 2. Draw Joint Dots
    keypoints.forEach((k) => {
      if (['left_eye', 'right_eye', 'left_ear', 'right_ear'].includes(k.name)) return;
      const pt = kpMap.get(k.name);
      if (!pt) return;

      const isHighlighted = highlightJoint === k.name;

      if (isHighlighted) {
        // Soft coral gentle pulse ring (NEVER glowing neon)
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 14, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(233, 169, 154, 0.7)';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
        ctx.fillStyle = '#E9A99A';
        ctx.fill();
      } else {
        // Normal joint dot
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#DDEBE4';
        ctx.fill();
      }
    });
  }, [keypoints, highlightJoint]);

  return <canvas ref={canvasRef} className={className} />;
};
