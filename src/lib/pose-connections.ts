// MediaPipe Pose landmark connections for skeleton drawing
// Each pair represents [start_index, end_index] of connected landmarks
export const POSE_CONNECTIONS: [number, number][] = [
  // Torso
  [11, 12], // left shoulder -> right shoulder
  [11, 23], // left shoulder -> left hip
  [12, 24], // right shoulder -> right hip
  [23, 24], // left hip -> right hip

  // Left arm
  [11, 13], // left shoulder -> left elbow
  [13, 15], // left elbow -> left wrist

  // Right arm
  [12, 14], // right shoulder -> right elbow
  [14, 16], // right elbow -> right wrist

  // Left leg
  [23, 25], // left hip -> left knee
  [25, 27], // left knee -> left ankle
  [27, 29], // left ankle -> left heel
  [29, 31], // left heel -> left foot index

  // Right leg
  [24, 26], // right hip -> right knee
  [26, 28], // right knee -> right ankle
  [28, 30], // right ankle -> right heel
  [30, 32], // right heel -> right foot index

  // Face (simplified)
  [0, 1],   // nose -> left eye inner
  [1, 2],   // left eye inner -> left eye
  [2, 3],   // left eye -> left eye outer
  [3, 7],   // left eye outer -> left ear
  [0, 4],   // nose -> right eye inner
  [4, 5],   // right eye inner -> right eye
  [5, 6],   // right eye -> right eye outer
  [6, 8],   // right eye outer -> right ear

  // Mouth
  [9, 10],  // left mouth -> right mouth

  // Left hand
  [15, 17], // left wrist -> left pinky
  [17, 19], // left pinky -> left index
  [19, 21], // left index -> left thumb (adjusted)
  [15, 19], // left wrist -> left index (palm)

  // Right hand
  [16, 18], // right wrist -> right pinky
  [18, 20], // right pinky -> right index
  [20, 22], // right index -> right thumb (adjusted)
  [16, 20], // right wrist -> right index (palm)
];
