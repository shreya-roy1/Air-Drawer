import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DrawingEngine } from '../modules/drawingEngine';
import { StrokeManager } from '../modules/strokeManager';
import { InteractionEngine } from '../modules/interactionEngine';
import { TransformEngine } from '../modules/transformEngine';

const DrawingCanvas = forwardRef(({ 
  settings, gesture, landmark,
  controlGesture, controlLandmark, controlPinchDelta, controlAngleDelta
}, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const managerRef = useRef(null);
  const interactionRef = useRef(null);
  const transformRef = useRef(null);

  // Current in-progress path
  const currentPathRef = useRef(null);
  const lastPointRef = useRef(null);

  // Track control gesture for rendering
  const controlGestureRef = useRef('CTRL_IDLE');

  useImperativeHandle(ref, () => ({
    clear: () => managerRef.current?.clear(),
    undo: () => managerRef.current?.undo(),
    redo: () => managerRef.current?.redo(),
    save: () => engineRef.current?.saveAsImage(),
    exportOBJ: () => {
      if (!managerRef.current) return '';
      const strokes = managerRef.current.getAllStrokes();
      let objText = "# AirDrawer 3D Export\n";
      objText += "# Coordinates in pixels, Y-axis inverted for 3D viewers\n\n";

      let vertexOffset = 1;
      
      strokes.forEach((stroke) => {
        const points = stroke.transform
          ? TransformEngine.getTransformedPoints(stroke)
          : stroke.points;
        
        if (!points || points.length === 0) return;

        objText += `# Stroke ${stroke.id}\n`;

        // Write vertices
        points.forEach((pt) => {
          const xVal = pt.x;
          // Invert Y coordinate for 3D coordinate systems (where Y is up)
          const yVal = canvasRef.current.height - pt.y;
          const zVal = pt.z !== undefined ? -pt.z : 0; // MediaPipe Z is inverted relative to standard WebGL Z
          objText += `v ${xVal.toFixed(3)} ${yVal.toFixed(3)} ${zVal.toFixed(3)}\n`;
        });

        // Write elements (line or point)
        if (points.length === 1) {
          objText += `p ${vertexOffset}\n\n`;
        } else {
          objText += "l";
          for (let i = 0; i < points.length; i++) {
            objText += ` ${vertexOffset + i}`;
          }
          objText += "\n\n";
        }

        vertexOffset += points.length;
      });

      return objText;
    }
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    managerRef.current = new StrokeManager();
    interactionRef.current = new InteractionEngine(managerRef.current);
    transformRef.current = new TransformEngine(managerRef.current);
    engineRef.current = new DrawingEngine(canvas);

    let animationFrameId;
    const renderLoop = () => {
      if (engineRef.current && managerRef.current) {
        const selectedId = transformRef.current?.getSelectedStrokeId() 
          ?? interactionRef.current?.getSelectedStrokeId() 
          ?? null;
        engineRef.current.draw(
          managerRef.current.getAllStrokes(),
          currentPathRef.current,
          selectedId,
          controlGestureRef.current
        );
      }
      animationFrameId = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const saveCurrentPath = () => {
    if (currentPathRef.current) {
      managerRef.current.addStroke(
        currentPathRef.current.points,
        currentPathRef.current.color,
        currentPathRef.current.lineWidth,
        currentPathRef.current.glowIntensity
      );
      currentPathRef.current = null;
      lastPointRef.current = null;
    }
  };

  // === PRIMARY HAND: Drawing gestures ===
  useEffect(() => {
    if (!landmark || !managerRef.current || !interactionRef.current) return;

    const x = (1 - landmark.x) * canvasRef.current.width;
    const y = landmark.y * canvasRef.current.height;

    switch (gesture) {
      case 'DRAW': {
        const rawZ = landmark.z * canvasRef.current.width;
        if (!currentPathRef.current) {
          currentPathRef.current = {
            points: [{ x, y, z: rawZ }],
            color: settings.color,
            lineWidth: settings.lineWidth,
            glowIntensity: settings.glowIntensity,
          };
          lastPointRef.current = { x, y, z: rawZ };
        } else {
          const smoothFactor = 0.75;
          const smoothedX = lastPointRef.current.x * smoothFactor + x * (1 - smoothFactor);
          const smoothedY = lastPointRef.current.y * smoothFactor + y * (1 - smoothFactor);
          
          // Adaptive Z-smoothing based on distance to filter out far-distance amplification noise.
          // Convert rawZ back to estimated depth: estimatedZ ranges from 2.5 (close) to 12.5 (far).
          const normalizedZVal = rawZ / canvasRef.current.width;
          const currentEstZ = 5.0 - (normalizedZVal / 0.15);
          const t = Math.max(0, Math.min(1, (currentEstZ - 2.5) / 10.0)); // 0 = close, 1 = far
          const zSmoothFactor = 0.70 + t * 0.24; // scales from 0.70 (responsive) to 0.94 (stable)

          const lastZ = lastPointRef.current.z !== undefined ? lastPointRef.current.z : rawZ;
          const smoothedZ = lastZ * zSmoothFactor + rawZ * (1 - zSmoothFactor);
          currentPathRef.current.points.push({ x: smoothedX, y: smoothedY, z: smoothedZ });
          lastPointRef.current = { x: smoothedX, y: smoothedY, z: smoothedZ };
        }
        break;
      }

      case 'ERASE':
        saveCurrentPath();
        interactionRef.current.handleErase(x, y);
        break;

      case 'CLEAR':
        saveCurrentPath();
        managerRef.current.clear();
        break;

      default:
        saveCurrentPath();
        break;
    }
  }, [gesture, landmark, settings]);

  // === SECONDARY HAND: Control gestures (move/scale/rotate) ===
  useEffect(() => {
    if (!transformRef.current) return;
    controlGestureRef.current = controlGesture || 'CTRL_IDLE';

    if (!controlLandmark) {
      transformRef.current.releaseAll();
      return;
    }

    const x = (1 - controlLandmark.x) * canvasRef.current.width;
    const y = controlLandmark.y * canvasRef.current.height;

    switch (controlGesture) {
      case 'CTRL_MOVE':
        transformRef.current.handleMove(x, y);
        break;

      case 'CTRL_SCALE':
        // First, select nearest if not already selected
        transformRef.current.selectNearest(x, y);
        transformRef.current.handleScale(controlPinchDelta || 0);
        break;

      case 'CTRL_ROTATE':
        transformRef.current.selectNearest(x, y);
        transformRef.current.handleRotate(controlAngleDelta || 0);
        break;

      default:
        transformRef.current.releaseAll();
        break;
    }
  }, [controlGesture, controlLandmark, controlPinchDelta, controlAngleDelta]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
});

export default DrawingCanvas;
