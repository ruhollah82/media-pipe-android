export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility: number;
}

export type PoseStatus = 'idle' | 'loading' | 'ready' | 'error';
