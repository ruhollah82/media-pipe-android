import { useRef, useState, useEffect, useCallback } from "react";
import { App } from "@capacitor/app"; // Import Capacitor's App plugin

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isActive: boolean;
  error: string | null;
  start: () => Promise<void>;
  stop: () => void;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to access camera";
      setError(message);
      setIsActive(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.load(); // Force reset the video decoder to clear frozen states
    }
    setIsActive(false);
  }, []);

  useEffect(() => {
    // Use Capacitor's native lifecycle instead of document.visibilitychange
    const listener = App.addListener("appStateChange", async ({ isActive }) => {
      if (!isActive) {
        // App went to background: completely tear down the camera
        stop();
      } else {
        // App came to foreground: completely restart the camera
        // This avoids the Android WebView video-freeze bug entirely
        await start();
      }
    });

    return () => {
      listener.then((l) => l.remove());
    };
  }, [start, stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { videoRef, isActive, error, start, stop };
}
