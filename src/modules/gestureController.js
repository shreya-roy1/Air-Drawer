export const GESTURES = {
  IDLE: 'IDLE',
  DRAW: 'DRAW',
  ERASE: 'ERASE',
  CLEAR: 'CLEAR',
  MOVE: 'MOVE',
};

export class GestureController {
  constructor() {
    this.currentGesture = GESTURES.IDLE;
    this.lastGesture = GESTURES.IDLE;
    this.gestureStartTime = Date.now();
  }

  detectGesture(landmarks) {
    if (!landmarks) return GESTURES.IDLE;

    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const wrist = landmarks[0];
    const middleBase = landmarks[9]; // landmark 9 is middle finger MCP
    const handScale = getDistance(wrist, middleBase) || 1.0;

    // Standard fingers (index, middle, ring, pinky) are best checked via vertical coordinates when upright
    const isFingerUp = (fingerIndex) => {
      // Finger indices: 0:Thumb, 1:Index, 2:Middle, 3:Ring, 4:Pinky
      // Landmarks: Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
      const wrist = landmarks[0];
      const tip = landmarks[fingerIndex * 4 + 4];
      const pip = landmarks[fingerIndex * 4 + 2];
      // Rotation-invariant check: distance from wrist to tip vs wrist to PIP
      return getDistance(wrist, tip) > getDistance(wrist, pip);
    };

    // Thumb check using distance to index MCP relative to hand scale (prevents vertical ambiguity)
    const thumbTip = landmarks[4];
    const indexMCP = landmarks[5];
    const thumbUp = (getDistance(thumbTip, indexMCP) / handScale) > 0.35;

    const indexUp = isFingerUp(1);
    const middleUp = isFingerUp(2);
    const ringUp = isFingerUp(3);
    const pinkyUp = isFingerUp(4);

    // 1. Pinch (Thumb + Index close) -> ERASE
    const indexTip = landmarks[8];
    const distance = getDistance(thumbTip, indexTip);
    const relativeDistance = distance / handScale;

    if (relativeDistance < 0.25) {
      return GESTURES.ERASE;
    }

    // 2. Fist (No fingers up) -> CLEAR (Needs thumb to be folded too, so thumbs-up doesn't clear)
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && !thumbUp) {
      return GESTURES.CLEAR;
    }

    // 3. Two Fingers (Index + Middle) -> MOVE
    // Ignore thumb as thumb position can be ambiguous
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      return GESTURES.MOVE;
    }

    // 4. Index Finger ONLY (Pointing hand) -> DRAW
    // Ignore thumb as thumb position can be ambiguous while pointing
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return GESTURES.DRAW;
    }

    return GESTURES.IDLE;
  }

  update(landmarks) {
    const detected = this.detectGesture(landmarks);
    if (detected !== this.currentGesture) {
      this.lastGesture = this.currentGesture;
      this.currentGesture = detected;
      this.gestureStartTime = Date.now();
    }
    return this.currentGesture;
  }
}
