import React, { useState, useRef, useCallback, useMemo } from 'react';
import CameraView from './components/CameraView';
import DrawingCanvas from './components/DrawingCanvas';
import HelpPanel from './components/HelpPanel';
import ControlPanel from './components/ControlPanel';
import { GestureInterpreter, CONTROL_GESTURES } from './modules/gestureInterpreter';
import { useCanvasSync } from './hooks/useCanvasSync';
import { GESTURES } from './modules/gestureController';
import './App.css';

function App() {
  // --- React State Declarations (Placed at top to prevent ReferenceError / Hoisting issues) ---
  const [settings, setSettings] = useState({
    color: '#00ffff',
    lineWidth: 8,
    glowIntensity: 20,
  });

  const [cameraVisible, setCameraVisible] = useState(true);
  const [gesturesEnabled, setGesturesEnabled] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [hasAcceptedOnboarding, setHasAcceptedOnboarding] = useState(false);

  // Central canvas synchronizer state hook
  const canvasSync = useCanvasSync();

  // Primary hand (drawing)
  const [gesture, setGesture] = useState(GESTURES.IDLE);
  const [landmark, setLandmark] = useState(null);
  const [fingertips, setFingertips] = useState([]);

  // Secondary hand (control)
  const [controlGesture, setControlGesture] = useState(CONTROL_GESTURES.IDLE);
  const [controlLandmark, setControlLandmark] = useState(null);
  const [controlFingertips, setControlFingertips] = useState([]);
  const [controlPinchDelta, setControlPinchDelta] = useState(0);
  const [controlAngleDelta, setControlAngleDelta] = useState(0);

  // Global 3D camera properties & overlays
  const [globalRotation, setGlobalRotation] = useState({ x: 0, y: 0 });
  const [gridVisible, setGridVisible] = useState(true);
  const [trackingResults, setTrackingResults] = useState(null);

  const canvasRef = useRef(null);
  const interpreter = useMemo(() => new GestureInterpreter(), []);
  const lastSecondaryLandmarkRef = useRef(null);

  const onResults = useCallback((results) => {
    // Keep raw tracking results for the joint skeleton overlays
    setTrackingResults(results);

    if (!gesturesEnabled) {
      setGesture(GESTURES.IDLE);
      setLandmark(null);
      setFingertips([]);
      setControlGesture(CONTROL_GESTURES.IDLE);
      setControlLandmark(null);
      setControlFingertips([]);
      lastSecondaryLandmarkRef.current = null;
      return;
    }

    const { primary, secondary } = interpreter.interpret(results);

    // Primary hand (drawing)
    setGesture(primary.gesture);
    setLandmark(primary.landmark);
    setFingertips(primary.fingertips);

    // Secondary hand (control)
    setControlGesture(secondary.gesture);
    setControlLandmark(secondary.landmark);
    setControlFingertips(secondary.fingertips);
    setControlPinchDelta(secondary.pinchDelta);
    setControlAngleDelta(secondary.angleDelta);

    // Bimanual rotation: update global scene rotation based on non-dominant hand X/Y deltas
    if (secondary.gesture === CONTROL_GESTURES.CLOSED_FIST && secondary.landmark) {
      if (lastSecondaryLandmarkRef.current) {
        const dx = secondary.landmark.x - lastSecondaryLandmarkRef.current.x;
        const dy = secondary.landmark.y - lastSecondaryLandmarkRef.current.y;

        setGlobalRotation(prev => ({
          x: Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, prev.x + dy * 3.5)), // limit pitch to prevent complete inversion
          y: prev.y - dx * 3.5 // yaw
        }));
      }
      lastSecondaryLandmarkRef.current = secondary.landmark;
    } else {
      lastSecondaryLandmarkRef.current = null;
    }
  }, [interpreter, gesturesEnabled]);

  const handleSave = () => {
    const dataUrl = canvasRef.current?.save();
    if (dataUrl) {
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `air-drawing-${Date.now()}.png`;
      link.click();
    }
  };

  const handleExportOBJ = () => {
    const objContent = canvasRef.current?.exportOBJ();
    if (objContent) {
      const blob = new Blob([objContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `air-drawing-${Date.now()}.obj`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Determine active mode label for the HUD
  const activeMode = controlGesture === 'CTRL_CLOSED_FIST'
    ? 'ROTATE CANVAS'
    : (controlGesture !== CONTROL_GESTURES.IDLE
      ? controlGesture.replace('CTRL_', '')
      : gesture);

  return (
    <div className="app-container" style={{ background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)' }}>
      {hasAcceptedOnboarding && cameraVisible && (
        <CameraView
          onResults={onResults}
        />
      )}

      <DrawingCanvas
        ref={canvasRef}
        settings={settings}
        gesture={gesture}
        landmark={landmark}
        controlGesture={controlGesture}
        controlLandmark={controlLandmark}
        controlPinchDelta={controlPinchDelta}
        controlAngleDelta={controlAngleDelta}
        canvasSync={canvasSync}
        globalRotation={globalRotation}
        gridVisible={gridVisible}
        estimatedZ={landmark ? 5.0 - (landmark.z / 0.15) : 5.0}
        handX={landmark ? (1 - landmark.x) * window.innerWidth : null}
        handY={landmark ? landmark.y * window.innerHeight : null}
        trackingResults={trackingResults}
      />

      <ControlPanel
        settings={settings}
        onSettingsChange={(newSettings) => setSettings(prev => ({ ...prev, ...newSettings }))}
        onClear={() => canvasSync.clear()}
        onUndo={() => canvasSync.undo()}
        onRedo={() => canvasSync.redo()}
        onSave={handleSave}
        onExportOBJ={handleExportOBJ}
        onToggleCamera={() => setCameraVisible(!cameraVisible)}
        cameraVisible={cameraVisible}
        gestureVisible={gesturesEnabled}
        onToggleGestures={() => setGesturesEnabled(!gesturesEnabled)}
        onHelp={() => setIsHelpOpen(true)}
        gridVisible={gridVisible}
        onToggleGrid={() => setGridVisible(!gridVisible)}
      />

      <HelpPanel isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} isWelcome={false} />
      <HelpPanel isOpen={!hasAcceptedOnboarding} onClose={() => setHasAcceptedOnboarding(true)} isWelcome={true} />

      {/* Floating Gesture Status */}
      <AnimatePresence>
        {activeMode !== 'IDLE' && activeMode !== CONTROL_GESTURES.IDLE && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="gesture-status glass-meta"
          >
            {activeMode} MODE
          </motion.div>
        )}
      </AnimatePresence>

      {/* Primary Hand Fingertip Indicators */}
      {fingertips.map((tip, i) => {
        if (!tip) return null;
        const x = (1 - tip.x) * window.innerWidth;
        const y = tip.y * window.innerHeight;

        let size = '6px';
        let opacity = 0.3;
        let color = settings.color;

        if (i === 1) { // Index finger (drawing tip)
          if (gesture === 'ERASE') {
            size = '60px';
            color = 'transparent';
            opacity = 1;
          } else {
            // Apply dynamic visual feedback based on absolute Z depth
            const depthFactor = landmark ? (landmark.z + 1.0) / 1.35 : 0.6;
            const clampedFactor = Math.max(0.4, Math.min(1.4, depthFactor));
            size = `${14 * clampedFactor}px`;
            opacity = Math.max(0.4, Math.min(1.0, 0.3 + 0.7 * clampedFactor));
          }
        }

        return (
          <div
            key={`p-${i}`}
            style={{
              position: 'fixed',
              left: x, top: y,
              width: size, height: size,
              backgroundColor: color,
              border: gesture === 'ERASE' ? '2px solid rgba(255, 50, 50, 0.8)' : 'none',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              opacity,
              zIndex: 40,
              pointerEvents: 'none',
              transition: 'width 0.1s, height 0.1s',
            }}
          />
        );
      })}

      {/* Secondary Hand Fingertip Indicators (distinct style) */}
      {controlFingertips.map((tip, i) => {
        if (!tip) return null;
        const x = (1 - tip.x) * window.innerWidth;
        const y = tip.y * window.innerHeight;

        let size = '6px';
        let opacity = 0.3;
        let color = 'transparent';
        let border = '1px solid rgba(255, 165, 0, 0.5)';

        // Index finger of control hand
        if (i === 1) {
          size = '14px';
          opacity = 0.8;
          if (controlGesture === CONTROL_GESTURES.MOVE) {
            border = '2px solid rgba(100, 180, 255, 0.9)';
          } else if (controlGesture === CONTROL_GESTURES.SCALE) {
            border = '2px solid rgba(0, 255, 200, 0.9)';
          } else if (controlGesture === CONTROL_GESTURES.ROTATE) {
            border = '2px solid rgba(255, 165, 0, 0.9)';
          } else if (controlGesture === CONTROL_GESTURES.CLOSED_FIST) {
            border = '2px solid rgba(255, 80, 80, 0.9)';
          }
        }

        return (
          <div
            key={`s-${i}`}
            style={{
              position: 'fixed',
              left: x, top: y,
              width: size, height: size,
              backgroundColor: color,
              border,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              opacity,
              zIndex: 40,
              pointerEvents: 'none',
              transition: 'width 0.1s, height 0.1s',
            }}
          />
        );
      })}

      {!landmark && !controlLandmark && (
        <div className="overlay-message" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                animation: 'wave-pulse 2.2s infinite ease-in-out',
                transformOrigin: '70% 70%',
                filter: 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.6))'
              }}
            >
              <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v5" />
              <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
              <path d="M10 10V5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v6" />
              <path d="M6 13V9a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v7c0 4.4 3.6 8 8 8h3c4.4 0 8-3.6 8-8v-3a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
              <circle cx="10" cy="5" r="1.2" fill="#fff" />
              <circle cx="14" cy="4" r="1.2" fill="#fff" />
              <circle cx="18" cy="6" r="1.2" fill="#fff" />
              <circle cx="6" cy="9" r="1.2" fill="#fff" />
              <circle cx="22" cy="11" r="1.2" fill="#fff" />
            </svg>
            <span style={{ fontSize: '24px', fontWeight: 600, color: '#fff', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
              Position your hand to begin drawing
            </span>
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.45)', fontWeight: 300 }}>
            Full camera view is active. Use the right panel to toggle features like the 3D grid
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
