import { TransformEngine } from './transformEngine';

export class DrawingEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Project a 3D point (x, y, z) into 2D screen space with perspective and camera rotation.
   */
  projectPoint(pt, width, height, rotX, rotY) {
    const cx = width / 2;
    const cy = height / 2;

    // 1. Translate point to center of canvas
    const px = pt.x - cx;
    const py = pt.y - cy;
    const pz = pt.z !== undefined ? pt.z : 0;

    // 2. Rotate around Y-axis (yaw)
    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const x1 = px * cosY + pz * sinY;
    const z1 = -px * sinY + pz * cosY;
    const y1 = py;

    // 3. Rotate around X-axis (pitch)
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // 4. Perspective Projection
    const f = width * 0.85; // Focal length
    const scale = f / Math.max(10, f + z2);

    return {
      x: cx + x2 * scale,
      y: cy + y2 * scale,
      z: z2,
      scale: scale
    };
  }

  /**
   * Draw a full 3D receding wireframe grid room/tunnel covering the entire viewport.
   */
  drawGrid(width, height, estimatedZ, handX, handY, rotX, rotY, gridVisible) {
    if (!gridVisible) return;
    const ctx = this.ctx;
    ctx.save();

    // Scale factor based on hand distance (estimatedZ)
    const estZ = estimatedZ || 5.0;
    const scaleFactor = 5.0 / estZ;

    // Shifting vanishing point center dynamically based on hand coordinates
    const hX = handX !== undefined && handX !== null ? handX : width / 2;
    const hY = handY !== undefined && handY !== null ? handY : height / 2;
    const dx = (hX - width / 2) * 0.12;
    const dy = (hY - height / 2) * 0.12;
    const cx = width / 2 + dx;
    const cy = height / 2 + dy;

    // Grid color matching mockup: subtle cyan
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)'; 
    ctx.lineWidth = 1;

    const project = (x3d, y3d, z3d) => {
      const px = x3d;
      const py = y3d;
      const pz = z3d;

      // Rotate around Y-axis
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const x1 = px * cosY + pz * sinY;
      const z1 = -px * sinY + pz * cosY;
      const y1 = py;

      // Rotate around X-axis
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const x2 = x1;
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;

      const f = width * 0.85;
      const zScale = (z2 + f) * estZ / 5.0;
      const projScale = f / Math.max(10, zScale);

      return {
        x: cx + x2 * scaleFactor * projScale,
        y: cy + y2 * scaleFactor * projScale
      };
    };

    // Tunnel Dimensions (large box enclosing screen space)
    const halfW = width * 0.6;
    const halfH = height * 0.6;
    const zMin = -600;
    const zMax = 600;
    const zStep = 150;

    // 1. Longitudinal grid lines running along Z depth
    const ySegments = [-halfH, -halfH * 0.5, 0, halfH * 0.5, halfH];
    ySegments.forEach(y => {
      // Left wall
      ctx.beginPath();
      let pt1 = project(-halfW, y, zMin);
      let pt2 = project(-halfW, y, zMax);
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();

      // Right wall
      ctx.beginPath();
      let pt3 = project(halfW, y, zMin);
      let pt4 = project(halfW, y, zMax);
      ctx.moveTo(pt3.x, pt3.y);
      ctx.lineTo(pt4.x, pt4.y);
      ctx.stroke();
    });

    const xSegments = [-halfW, -halfW * 0.5, 0, halfW * 0.5, halfW];
    xSegments.forEach(x => {
      // Ceiling
      ctx.beginPath();
      let pt1 = project(x, -halfH, zMin);
      let pt2 = project(x, -halfH, zMax);
      ctx.moveTo(pt1.x, pt1.y);
      ctx.lineTo(pt2.x, pt2.y);
      ctx.stroke();

      // Floor
      ctx.beginPath();
      let pt3 = project(x, halfH, zMin);
      let pt4 = project(x, halfH, zMax);
      ctx.moveTo(pt3.x, pt3.y);
      ctx.lineTo(pt4.x, pt4.y);
      ctx.stroke();
    });

    // 2. Transverse Rectangles (rings depth segments)
    for (let z = zMin; z <= zMax; z += zStep) {
      ctx.beginPath();
      const p1 = project(-halfW, -halfH, z);
      const p2 = project(halfW, -halfH, z);
      const p3 = project(halfW, halfH, z);
      const p4 = project(-halfW, halfH, z);

      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.lineTo(p3.x, p3.y);
      ctx.lineTo(p4.x, p4.y);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Draw a subtle, semi-transparent 3D wireframe skeletal mesh of the hand directly
   * on the main canvas aligning with the user's physical hand coordinates.
   */
  drawHandMesh(width, height, trackingResults) {
    if (!trackingResults || !trackingResults.multiHandLandmarks) return;

    const ctx = this.ctx;

    trackingResults.multiHandLandmarks.forEach((landmarks, idx) => {
      const handedness = trackingResults.multiHandedness?.[idx];
      const isPrimary = handedness?.label === 'Left'; // MediaPipe 'Left' = User's Right (Primary)

      ctx.save();

      // Skeletal connections forming a detailed geometric cage/mesh
      const meshConnections = [
        // Standard fingers
        [0, 1], [1, 2], [2, 3], [3, 4],
        [0, 5], [5, 6], [6, 7], [7, 8],
        [9, 10], [10, 11], [11, 12],
        [13, 14], [14, 15], [15, 16],
        [0, 17], [17, 18], [18, 19], [19, 20],
        // Palm boundaries & cross webbing
        [5, 9], [9, 13], [13, 17],
        [1, 5], [2, 5],
        // Knuckle PIP cross lines (Index to Middle, Middle to Ring, etc.)
        [6, 10], [10, 14], [14, 18],
        // Knuckle DIP cross lines
        [7, 11], [11, 15], [15, 19],
        // Fingertip cross lines
        [8, 12], [12, 16], [16, 20]
      ];

      // Draw mesh wireframe lines
      ctx.beginPath();
      meshConnections.forEach(([i, j]) => {
        const pt1 = { x: (1 - landmarks[i].x) * width, y: landmarks[i].y * height };
        const pt2 = { x: (1 - landmarks[j].x) * width, y: landmarks[j].y * height };
        ctx.moveTo(pt1.x, pt1.y);
        ctx.lineTo(pt2.x, pt2.y);
      });
      ctx.strokeStyle = isPrimary ? 'rgba(6, 182, 212, 0.25)' : 'rgba(249, 115, 22, 0.25)'; // Cyan / Orange
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw glowing joint points
      landmarks.forEach((lm) => {
        const pt = { x: (1 - lm.x) * width, y: lm.y * height };
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3, 0, 2 * Math.PI);
        ctx.fillStyle = isPrimary ? '#06b6d4' : '#f97316';
        ctx.shadowBlur = 8;
        ctx.shadowColor = isPrimary ? '#06b6d4' : '#f97316';
        ctx.fill();
      });

      ctx.restore();
    });
  }

  /**
   * @param {Array} strokes - All committed strokes
   * @param {Object|null} currentPath - The in-progress drawing path
   * @param {number|null} selectedStrokeId - ID of stroke selected by control hand
   * @param {string} controlGesture - Current control gesture for visual guides
   * @param {Object} globalRotation - Global rotation state { x, y }
   * @param {boolean} gridVisible - Visibility toggle for the 3D perspective grid
   * @param {number} estimatedZ - Depth scale from dominant hand
   * @param {number} handX - X coordinate from dominant hand
   * @param {number} handY - Y coordinate from dominant hand
   * @param {Object} trackingResults - Raw MediaPipe tracking results
   */
  draw(
    strokes,
    currentPath = null,
    selectedStrokeId = null,
    controlGesture = 'CTRL_IDLE',
    globalRotation = { x: 0, y: 0 },
    gridVisible = true,
    estimatedZ = 5.0,
    handX = null,
    handY = null,
    trackingResults = null
  ) {
    this.clearCanvas();
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // 1. Draw global 3D perspective wireframe room grid in the background
    this.drawGrid(width, height, estimatedZ, handX, handY, globalRotation.x, globalRotation.y, gridVisible);

    // 2. Render all strokes (and in-progress path)
    const allStrokes = [...strokes];
    if (currentPath) allStrokes.push(currentPath);

    allStrokes.forEach((stroke) => {
      if (!stroke.points || stroke.points.length === 0) return;

      // Get transformed points if stroke has transform, otherwise use raw points
      const basePoints = stroke.transform
        ? TransformEngine.getTransformedPoints(stroke)
        : stroke.points;

      // Apply 3D perspective projection to each point
      const projectedPoints = basePoints.map(p =>
        this.projectPoint(p, width, height, globalRotation.x, globalRotation.y)
      );

      if (projectedPoints.length < 2 && projectedPoints.length !== 1) return;

      const isSelected = selectedStrokeId !== null && stroke.id === selectedStrokeId;

      ctx.save();

      // --- Draw the stroke ---
      ctx.beginPath();

      if (projectedPoints.length === 1) {
        ctx.arc(projectedPoints[0].x, projectedPoints[0].y, (stroke.lineWidth / 2) * projectedPoints[0].scale, 0, 2 * Math.PI);
        ctx.fillStyle = isSelected ? '#ffffff' : stroke.color;
        ctx.fill();
        ctx.restore();
        return;
      }

      ctx.moveTo(projectedPoints[0].x, projectedPoints[0].y);
      for (let i = 1; i < projectedPoints.length; i++) {
        ctx.lineTo(projectedPoints[i].x, projectedPoints[i].y);
      }

      ctx.strokeStyle = stroke.color;
      
      // Scale line width by average depth scale of its points to make closer segments look thicker
      const avgScale = projectedPoints.reduce((sum, p) => sum + p.scale, 0) / projectedPoints.length;
      ctx.lineWidth = stroke.lineWidth * (stroke.transform?.scale || 1) * avgScale;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isSelected) {
        ctx.shadowBlur = (stroke.glowIntensity || 15) * 2.5;
        ctx.shadowColor = '#ffffff';
        ctx.strokeStyle = '#ffffff';
      } else {
        ctx.shadowBlur = stroke.glowIntensity || 0;
        ctx.shadowColor = stroke.color;
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      // --- Visual Guides for Selected Stroke ---
      if (isSelected) {
        this._drawSelectionGuides(ctx, projectedPoints, stroke, controlGesture);
      }

      ctx.restore();
    });

    // 3. Draw subtle transparent 3D wireframe skeletal mesh overlay over active hands
    this.drawHandMesh(width, height, trackingResults);
  }

  /**
   * Draw visual guides around a selected stroke.
   */
  _drawSelectionGuides(ctx, points, stroke, controlGesture) {
    let cx = 0, cy = 0;
    for (const p of points) { cx += p.x; cy += p.y; }
    cx /= points.length;
    cy /= points.length;

    let maxR = 0;
    for (const p of points) {
      const d = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
      if (d > maxR) maxR = d;
    }
    const guideRadius = maxR + 20;

    ctx.save();

    ctx.beginPath();
    ctx.arc(cx, cy, guideRadius, 0, 2 * Math.PI);
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    if (controlGesture === 'CTRL_ROTATE') {
      const angle = stroke.transform?.rotation || 0;
      ctx.beginPath();
      ctx.arc(cx, cy, guideRadius + 8, -Math.PI / 2, -Math.PI / 2 + angle, angle < 0);
      ctx.strokeStyle = 'rgba(255, 165, 0, 0.7)';
      ctx.lineWidth = 3;
      ctx.stroke();

      const endAngle = -Math.PI / 2 + angle;
      const ax = cx + (guideRadius + 8) * Math.cos(endAngle);
      const ay = cy + (guideRadius + 8) * Math.sin(endAngle);
      ctx.beginPath();
      ctx.arc(ax, ay, 5, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 165, 0, 0.9)';
      ctx.fill();
    } else if (controlGesture === 'CTRL_SCALE') {
      const scale = stroke.transform?.scale || 1;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, guideRadius * (0.5 + i * 0.2), 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0, 255, 200, ${0.15 * (4 - i)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(0, 255, 200, 0.8)';
      ctx.font = '12px monospace';
      ctx.fillText(`${(scale * 100).toFixed(0)}%`, cx - 15, cy - guideRadius - 12);
    } else if (controlGesture === 'CTRL_MOVE') {
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(100, 180, 255, 0.6)';
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx - 12, cy); ctx.lineTo(cx + 12, cy);
      ctx.moveTo(cx, cy - 12); ctx.lineTo(cx, cy + 12);
      ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.restore();
  }

  saveAsImage() {
    return this.canvas.toDataURL('image/png');
  }
}
