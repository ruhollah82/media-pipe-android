import { useRef, useState, useEffect, useCallback } from "react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { initPoseLandmarker } from "../lib/mediapipe";
import { usePoseStore } from "../store/usePoseStore";

const DETECTION_INTERVAL_MS = 40;

interface UsePoseLandmarkerReturn {
  isReady: boolean;
  error: string | null;
  startDetection: (video: HTMLVideoElement) => void;
  stopDetection: () => void;
}

export function usePoseLandmarker(): UsePoseLandmarkerReturn {
  const landmarkerRef = useRef<PoseLandmarker | null>(null);
  const rafIdRef = useRef<number>(0);
  const lastDetectionTimeRef = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setLandmarks = usePoseStore((s) => s.setLandmarks);
  const setStatus = usePoseStore((s) => s.setStatus);
  const clearLandmarks = usePoseStore((s) => s.clearLandmarks);

  useEffect(() => {
    let cancelled = false;
    async function init() {
      try {
        setStatus("loading");
        const landmarker = await initPoseLandmarker();
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setIsReady(true);
        setStatus("ready");
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error
              ? err.message
              : "Failed to initialize PoseLandmarker";
          setError(message);
          setStatus("error");
        }
      }
    }
    init();
    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [setStatus]);

  const detectFrame = useCallback(() => {
    // Safeguard: Ensure video is actually ready and has dimensions
    if (
      !landmarkerRef.current ||
      !videoRef.current ||
      videoRef.current.readyState < 2 ||
      videoRef.current.videoWidth === 0
    ) {
      rafIdRef.current = requestAnimationFrame(detectFrame);
      return;
    }

    // Use performance.now() to guarantee a strictly increasing timestamp.
    const now = performance.now();
    if (now - lastDetectionTimeRef.current < DETECTION_INTERVAL_MS) {
      rafIdRef.current = requestAnimationFrame(detectFrame);
      return;
    }
    lastDetectionTimeRef.current = now;

    try {
      const result = landmarkerRef.current.detectForVideo(
        videoRef.current,
        now,
      );
      if (result.landmarks && result.landmarks.length > 0) {
        setLandmarks(result.landmarks[0]);
      } else {
        clearLandmarks();
      }
    } catch (err) {
      // Skip frame on error
    }

    rafIdRef.current = requestAnimationFrame(detectFrame);
  }, [setLandmarks, clearLandmarks]);

  const startDetection = useCallback(
    (video: HTMLVideoElement) => {
      if (!isReady) return;
      videoRef.current = video;
      lastDetectionTimeRef.current = 0; // Reset timestamp to avoid frame skip issues on resume
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(detectFrame);
    },
    [isReady, detectFrame],
  );

  const stopDetection = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = 0;
    }
    videoRef.current = null;
    clearLandmarks();
  }, [clearLandmarks]);

  // Note: The visibilitychange listener was removed.
  // Lifecycle is now cleanly managed by useCamera toggling isActive,
  // which triggers startDetection/stopDetection via CameraView.tsx.

  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  return { isReady, error, startDetection, stopDetection };
}
