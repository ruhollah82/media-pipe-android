import { create } from 'zustand';
import type { NormalizedLandmark, PoseStatus } from '../types';

interface PoseState {
  landmarks: NormalizedLandmark[] | null;
  status: PoseStatus;
  error: string | null;
  setLandmarks: (landmarks: NormalizedLandmark[]) => void;
  clearLandmarks: () => void;
  setStatus: (status: PoseStatus) => void;
  setError: (error: string | null) => void;
}

export const usePoseStore = create<PoseState>((set) => ({
  landmarks: null,
  status: 'idle',
  error: null,
  setLandmarks: (landmarks) => set({ landmarks }),
  clearLandmarks: () => set({ landmarks: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error }),
}));
