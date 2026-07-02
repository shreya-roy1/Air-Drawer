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

    // Debounce frame count for destructive CLEAR (fist) gesture
    this.clearFrameCount = 0;
    this.clearFramesRequired = 8; // Require 8 consecutive frames of CLEAR to trigger canvas clear
  }

  detectGesture(landmarks) {
    if (!landmarks) return GESTURES.IDLE;

    const getDistance = (p1, p2) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const wrist = landmarks[0];
    const middleBase = landmarks[9]; // landmark 9 is middle finger MCP
    const handScale = getDistance(wrist, middleBase) || 1.0;

    // Standard fingers (index, middle, ring, pinky) checked via wrist-to-tip vs wrist-to-knuckle distance
    const isFingerUp = (fingerIndex) => {
      // Finger indices: 0:Thumb, 1:Index, 2:Middle, 3:Ring, 4:Pinky
      // Landmarks: Thumb(4), Index(8), Middle(12), Ring(16), Pinky(20)
      const wrist = landmarks[0];
      const knuckle = landmarks[fingerIndex * 4 + 1];
      const tip = landmarks[fingerIndex * 4 + 4];
      // If extended, tip is further from wrist than knuckle; if curled in palm, tip is closer
      return getDistance(wrist, tip) > getDistance(wrist, knuckle);
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
    // We only require index and middle to be up to trigger MOVE.
    if (indexUp && middleUp) {
      return GESTURES.MOVE;
    }

    // 4. Index Finger ONLY (Pointing hand) -> DRAW
    // We only require index to be up and middle to be down to trigger DRAW.
    // This allows ring and pinky fingers to relax, preventing dropouts.
    if (indexUp && !middleUp) {
      return GESTURES.DRAW;
    }

    return GESTURES.IDLE;
  }

  update(landmarks) {
    const detected = this.detectGesture(landmarks);
    
    let resolvedGesture = detected;

    // Debounce the destructive CLEAR gesture (fist shape)
    if (detected === GESTURES.CLEAR) {
      this.clearFrameCount++;
      if (this.clearFrameCount < this.clearFramesRequired) {
        // Fallback to IDLE to stop active drawing instantly without clearing the canvas yet
        resolvedGesture = GESTURES.IDLE;
      }
    } else {
      this.clearFrameCount = 0;
    }

    if (resolvedGesture !== this.currentGesture) {
      this.lastGesture = this.currentGesture;
      this.currentGesture = resolvedGesture;
      this.gestureStartTime = Date.now();
    }
    return this.currentGesture;
  }
}
