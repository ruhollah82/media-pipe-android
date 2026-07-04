import { useEffect, useRef, useState, memo } from 'react';
import { useCamera } from '../hooks/useCamera';
import { usePoseLandmarker } from '../hooks/usePoseLandmarker';
import { usePoseStore } from '../store/usePoseStore';
import { PoseCanvas } from './PoseCanvas';

// Small component to display landmark count without re-rendering the whole CameraView
const LandmarkBadge = memo(() => {
  const hasLandmarks = usePoseStore((s) => s.landmarks !== null);
  const count = usePoseStore((s) => s.landmarks?.length || 0);

  if (!hasLandmarks) return null;

  return (
    <div className="flex items-center justify-center mb-3">
      <div className="glass rounded-full px-4 py-2 flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-white/90 text-sm font-medium">{count} points</span>
        </div>
        <div className="w-px h-4 bg-white/20" />
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-white/90 text-sm font-medium">Live</span>
        </div>
      </div>
    </div>
  );
});

export function CameraView() {
  const { videoRef, isActive, error: cameraError, start } = useCamera();
  const { isReady, error: poseError, startDetection, stopDetection } = usePoseLandmarker();
  const status = usePoseStore((s) => s.status);
  const detectionStartedRef = useRef(false);
  const [fps, setFps] = useState(0);

  // Start camera on mount
  useEffect(() => {
    start();
  }, [start]);

  // Start detection when ready
  useEffect(() => {
    if (isReady && isActive && videoRef.current && !detectionStartedRef.current) {
      detectionStartedRef.current = true;
      startDetection(videoRef.current);
    }
  }, [isReady, isActive, videoRef, startDetection]);

  // Stop detection when camera stops
  useEffect(() => {
    if (!isActive) {
      detectionStartedRef.current = false;
      stopDetection();
    }
  }, [isActive, stopDetection]);

  // Optimized FPS counter
  useEffect(() => {
    if (!isActive) return;
    let frames = 0;
    let lastTime = performance.now();
    let rafId: number;

    const countFrame = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(Math.round((frames * 1000) / (now - lastTime)));
        frames = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(countFrame);
    };
    rafId = requestAnimationFrame(countFrame);

    return () => cancelAnimationFrame(rafId);
  }, [isActive]);

  const error = cameraError || poseError;
  const isDetecting = status === 'ready' && isActive;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden select-none">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)' }}
      />

      <PoseCanvas />

      {/* Overlays (Static mostly) */}
      <div className="absolute top-0 left-0 right-0 h-32 gradient-top pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 right-0 h-40 gradient-bottom pointer-events-none z-10" />

      {/* Top status bar */}
      <div className="absolute top-0 left-0 right-0 safe-area-top z-20">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isDetecting ? 'bg-green-400' : 'bg-amber-400'}`} />
            <span className="text-white/90 text-xs font-medium tracking-wide">
              {isDetecting ? 'TRACKING' : status.toUpperCase()}
            </span>
          </div>

          {isDetecting && (
            <div className="glass-light rounded-full px-3 py-1">
              <span className="text-white/80 text-xs font-mono">{fps} FPS</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-0 left-0 right-0 safe-area-bottom z-20">
        <div className="px-4 pb-4">
          <LandmarkBadge />

          {error && (
            <div className="glass rounded-2xl p-4 mb-3 border border-red-500/30">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm">Error</p>
                  <p className="text-white/60 text-xs mt-0.5 truncate">{error}</p>
                </div>
                <button onClick={start} className="px-3 py-1.5 bg-white/10 rounded-lg text-white text-xs">Retry</button>
              </div>
            </div>
          )}

          {!isActive && !cameraError && (
            <div className="glass rounded-2xl p-6 text-center">
              <h3 className="text-white font-semibold text-lg mb-1">Camera Access Required</h3>
              <button
                onClick={start}
                className="w-full mt-4 py-3 bg-blue-500 text-white rounded-xl font-semibold text-sm"
              >
                Enable Camera
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
