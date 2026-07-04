import { useRef, useEffect, useCallback } from 'react';
import { usePoseStore } from '../store/usePoseStore';
import { POSE_CONNECTIONS } from '../lib/pose-connections';
import { BODY_REGIONS, LABELED_LANDMARKS } from '../lib/body-regions';
import type { NormalizedLandmark } from '../types';

const LANDMARK_COLOR = '#22c55e';
const SKELETON_COLOR = '#06b6d4';
const LABEL_COLOR = '#FFFFFF';
const LABEL_BG = 'rgba(0, 0, 0, 0.8)';
const POINT_RADIUS = 3.5;
const LINE_WIDTH = 2;
const VISIBILITY_THRESHOLD = 0.5;

export function PoseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const landmarksRef = useRef<NormalizedLandmark[] | null>(null);
  const rafIdRef = useRef<number>(0);

  // 1. Initialize Context with performance hints
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true, // Reduce latency in supported browsers
    });
  }, []);

  // 2. Subscribe to store changes OUTSIDE of React render cycle
  useEffect(() => {
    const unsubscribe = usePoseStore.subscribe((state) => {
      landmarksRef.current = state.landmarks;
    });
    return unsubscribe;
  }, []);

  // 3. Optimized Draw Function
  const draw = useCallback(() => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    const landmarks = landmarksRef.current;

    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!landmarks || landmarks.length === 0) return;

    const { width, height } = canvas;
    const mirrorX = (x: number) => (1 - x) * width;

    // Draw Skeleton
    ctx.strokeStyle = SKELETON_COLOR;
    ctx.lineWidth = LINE_WIDTH;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (const [i, j] of POSE_CONNECTIONS) {
      const a = landmarks[i];
      const b = landmarks[j];
      if (a?.visibility > VISIBILITY_THRESHOLD && b?.visibility > VISIBILITY_THRESHOLD) {
        ctx.moveTo(mirrorX(a.x), a.y * height);
        ctx.lineTo(mirrorX(b.x), b.y * height);
      }
    }
    ctx.stroke();

    // Draw Points
    ctx.fillStyle = LANDMARK_COLOR;
    ctx.beginPath();
    for (const lm of landmarks) {
      if (lm.visibility > VISIBILITY_THRESHOLD) {
        const x = mirrorX(lm.x);
        const y = lm.y * height;
        ctx.moveTo(x + POINT_RADIUS, y);
        ctx.arc(x, y, POINT_RADIUS, 0, 2 * Math.PI);
      }
    }
    ctx.fill();

    // Draw Labels (Simplified for performance)
    ctx.font = '600 10px sans-serif';
    ctx.fillStyle = LABEL_COLOR;
    for (const idx of LABELED_LANDMARKS) {
      const lm = landmarks[idx];
      if (lm?.visibility > VISIBILITY_THRESHOLD) {
        const label = BODY_REGIONS[idx];
        const x = mirrorX(lm.x) + 8;
        const y = lm.y * height;

        ctx.fillStyle = LABEL_BG;
        ctx.fillRect(x - 2, y - 7, label.length * 6 + 4, 14);
        ctx.fillStyle = LABEL_COLOR;
        ctx.fillText(label, x, y + 3);
      }
    }
  }, []);

  // 4. Constant Animation Loop
  useEffect(() => {
    const loop = () => {
      draw();
      rafIdRef.current = requestAnimationFrame(loop);
    };
    rafIdRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafIdRef.current);
  }, [draw]);

  // 5. Dimension Sync
  useEffect(() => {
    const canvas = canvasRef.current;
    const video = canvas?.parentElement?.querySelector('video');
    if (!canvas || !video) return;

    const sync = () => {
      if (video.videoWidth && (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight)) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    const interval = setInterval(sync, 1000);
    video.addEventListener('loadedmetadata', sync);
    return () => {
      clearInterval(interval);
      video.removeEventListener('loadedmetadata', sync);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10, willChange: 'transform' }}
    />
  );
}
