import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { DrawingEngine } from '../modules/drawingEngine';
import { StrokeManager } from '../modules/strokeManager';
import { TransformEngine } from '../modules/transformEngine';

const DrawingCanvas = forwardRef(({ 
  settings, 
  gesture, 
  landmark,
  controlGesture, 
  controlLandmark, 
  controlPinchDelta, 
  controlAngleDelta,
  canvasSync,
  globalRotation,
  gridVisible,
  estimatedZ,
  handX,
  handY,
  trackingResults
}, ref) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const managerRef = useRef(null);
  const transformRef = useRef(null);

  // Sync React state and context variables into refs for the high-frequency render loop
  const canvasSyncRef = useRef(canvasSync);
  const strokesRef = useRef([]);
  const currentPathRef = useRef(null);
  const controlGestureRef = useRef('CTRL_IDLE');
  
  const globalRotationRef = useRef(globalRotation);
  const gridVisibleRef = useRef(gridVisible);
  const estimatedZRef = useRef(estimatedZ);
  const handXRef = useRef(handX);
  const handYRef = useRef(handY);
  const trackingResultsRef = useRef(trackingResults);

  useEffect(() => { canvasSyncRef.current = canvasSync; }, [canvasSync]);
  useEffect(() => { trackingResultsRef.current = trackingResults; }, [trackingResults]);
  useEffect(() => { 
    strokesRef.current = canvasSync.strokes; 
    // Synchronize stroke data into local StrokeManager for hit-testing and select-nearest calculations
    if (managerRef.current) {
      managerRef.current.strokes = canvasSync.strokes;
    }
  }, [canvasSync.strokes]);
  useEffect(() => { currentPathRef.current = canvasSync.currentPath; }, [canvasSync.currentPath]);
  useEffect(() => { globalRotationRef.current = globalRotation; }, [globalRotation]);
  useEffect(() => { gridVisibleRef.current = gridVisible; }, [gridVisible]);
  useEffect(() => { estimatedZRef.current = estimatedZ; }, [estimatedZ]);
  useEffect(() => { handXRef.current = handX; }, [handX]);
  useEffect(() => { handYRef.current = handY; }, [handY]);

  useImperativeHandle(ref, () => ({
    clear: () => canvasSyncRef.current.clear(),
    undo: () => canvasSyncRef.current.undo(),
    redo: () => canvasSyncRef.current.redo(),
    save: () => engineRef.current?.saveAsImage(),
    exportOBJ: () => {
      const strokes = canvasSyncRef.current.strokes;
      if (!strokes || strokes.length === 0) return '';
      
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
          // Invert Y coordinate for 3D coordinates (where Y is up)
          const yVal = window.innerHeight - pt.y;
          const zVal = pt.z !== undefined ? -pt.z : 0;
          objText += `v ${xVal.toFixed(3)} ${yVal.toFixed(3)} ${zVal.toFixed(3)}\n`;
        });

        // Write elements
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
    transformRef.current = new TransformEngine(managerRef.current, (id, newTransform) => {
      canvasSyncRef.current.updateStrokeTransform(id, newTransform);
    });
    engineRef.current = new DrawingEngine(canvas);

    let animationFrameId;
    const renderLoop = () => {
      if (engineRef.current) {
        const selectedId = transformRef.current?.getSelectedStrokeId() ?? null;
        engineRef.current.draw(
          strokesRef.current,
          currentPathRef.current,
          selectedId,
          controlGestureRef.current,
          globalRotationRef.current,
          gridVisibleRef.current,
          estimatedZRef.current,
          handXRef.current,
          handYRef.current,
          trackingResultsRef.current
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

  // === PRIMARY HAND: Drawing gestures ===
  useEffect(() => {
    if (!landmark || !managerRef.current) return;

    // Lock drawing state if secondary hand is globally rotating the scene
    if (controlGesture === 'CTRL_CLOSED_FIST') {
      canvasSyncRef.current.endStroke();
      return;
    }

    const x = (1 - landmark.x) * window.innerWidth;
    const y = landmark.y * window.innerHeight;

    switch (gesture) {
      case 'DRAW': {
        const rawZ = landmark.z * window.innerWidth;
        if (!currentPathRef.current) {
          canvasSyncRef.current.startStroke(settings.color, settings.lineWidth, settings.glowIntensity);
        }
        canvasSyncRef.current.addPoint({ x, y, z: rawZ });
        break;
      }

      case 'ERASE': {
        canvasSyncRef.current.endStroke();
        const hits = managerRef.current.findIntersectingStrokes(x, y, 30);
        hits.forEach(id => canvasSyncRef.current.removeStroke(id));
        break;
      }

      case 'CLEAR':
        canvasSyncRef.current.endStroke();
        canvasSyncRef.current.clear();
        break;

      default:
        canvasSyncRef.current.endStroke();
        break;
    }
  }, [gesture, landmark, settings, controlGesture]);

  // === SECONDARY HAND: Control gestures (move/scale/rotate) ===
  useEffect(() => {
    if (!transformRef.current) return;
    controlGestureRef.current = controlGesture || 'CTRL_IDLE';

    if (!controlLandmark || controlGesture === 'CTRL_CLOSED_FIST') {
      transformRef.current.releaseAll();
      return;
    }

    const x = (1 - controlLandmark.x) * window.innerWidth;
    const y = controlLandmark.y * window.innerHeight;

    switch (controlGesture) {
      case 'CTRL_MOVE':
        transformRef.current.handleMove(x, y);
        break;

      case 'CTRL_SCALE':
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
