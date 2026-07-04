import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

const WASM_PATH = '/wasm';
const MODEL_PATH = '/models/pose_landmarker_lite.task';

export async function initPoseLandmarker(): Promise<PoseLandmarker> {
  const vision = await FilesetResolver.forVisionTasks(WASM_PATH);

  const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: MODEL_PATH,
      // Switching to 'CPU' (WASM SIMD) is often much more stable in Android WebViews
      // because it avoids the overhead of GPU buffer transfers.
      delegate: 'CPU',
    },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
  });

  return poseLandmarker;
}
