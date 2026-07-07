import React, { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  Palette,
  Settings,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Eye,
  EyeOff,
  Zap,
  HelpCircle,
  Box,
  Grid
} from 'lucide-react';

const COLORS = [
  '#06b6d4', // Sophisticated Cyan
  '#f43f5e', // Sophisticated Rose/Pink
  '#f59e0b', // Sophisticated Amber/Yellow
  '#10b981', // Sophisticated Emerald/Green
  '#6366f1', // Sophisticated Indigo/Blue
  '#ffffff', // Pure White
];

const ControlPanel = ({
  settings,
  onSettingsChange,
  onClear,
  onUndo,
  onRedo,
  onSave,
  onExportOBJ,
  onToggleCamera,
  cameraVisible,
  gestureVisible,
  onToggleGestures,
  onHelp,
  gridVisible,
  onToggleGrid
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [rawIsLightBg, setRawIsLightBg] = useState(false);
  const containerRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  const isLightBg = cameraVisible && rawIsLightBg;

  useEffect(() => {
    if (!cameraVisible) {
      return;
    }

    const checkBrightness = () => {
      const video = document.querySelector('video');
      const container = containerRef.current;
      if (!video || !container || video.paused || video.ended) return;

      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const rect = container.getBoundingClientRect();
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      const scale = Math.max(windowWidth / videoWidth, windowHeight / videoHeight);

      const cropX = (videoWidth - windowWidth / scale) / 2;
      const cropY = (videoHeight - windowHeight / scale) / 2;

      const screenLeftUnmirrored = windowWidth - rect.right;
      const screenRightUnmirrored = windowWidth - rect.left;

      const videoXStart = Math.max(0, cropX + screenLeftUnmirrored / scale);
      const videoXEnd = Math.min(videoWidth, cropX + screenRightUnmirrored / scale);
      const videoYStart = Math.max(0, cropY + rect.top / scale);
      const videoYEnd = Math.min(videoHeight, cropY + rect.bottom / scale);

      const width = videoXEnd - videoXStart;
      const height = videoYEnd - videoYStart;

      if (width <= 0 || height <= 0) return;

      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }
      const canvas = offscreenCanvasRef.current;
      canvas.width = 30;
      canvas.height = 30;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      try {
        ctx.drawImage(video, videoXStart, videoYStart, width, height, 0, 0, canvas.width, canvas.height);
        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        let totalLuminance = 0;
        let count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          count++;
        }

        const avgLuminance = count > 0 ? totalLuminance / count : 0;

        const thresholdLight = 145;
        const thresholdDark = 125;

        setRawIsLightBg(prev => {
          if (prev) {
            return avgLuminance > thresholdDark;
          } else {
            return avgLuminance > thresholdLight;
          }
        });
      } catch (err) {
        console.warn('Unable to sample video frame brightness:', err);
      }
    };

    const interval = setInterval(checkBrightness, 500);
    checkBrightness();
    return () => clearInterval(interval);
  }, [cameraVisible]);

  return (
    <div
      ref={containerRef}
      className={isLightBg ? 'light-theme' : ''}
      style={{
        position: 'fixed',
        right: '24px',
        top: '24px',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        alignItems: 'flex-end',
      }}
    >
      <motion.button
        className="glass-meta"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '16px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          color: isLightBg ? '#000' : '#fff',
          border: 'none',
          boxShadow: 'none', // Explicitly no shadows or strokes
        }}
      >
        <Settings size={22} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-meta custom-scrollbar"
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            style={{
              borderRadius: '24px',
              padding: '24px',
              width: '280px',
              color: isLightBg ? '#000' : '#fff',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              marginTop: '12px',
              maxHeight: 'calc(100vh - 100px)',
              overflowY: 'auto',
              border: 'none',
              boxShadow: 'none', // Strictly borderless, solid-fill with backdrop blur
            }}
          >
            {/* Color Palette */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                fontSize: '14px',
                fontWeight: 600,
                color: isLightBg ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
              }}>
                <Palette size={16} /> Color Palette
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', padding: '0 4px' }}>
                {COLORS.map((c) => (
                  <motion.div
                    key={c}
                    whileHover={{ scale: 1.25 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSettingsChange({ color: c, isEraser: false })}
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: c,
                      cursor: 'pointer',
                      boxShadow: settings.color === c ? `0 0 10px ${c}` : 'none',
                      border: 'none',
                      scale: settings.color === c ? 1.2 : 1,
                      transition: 'scale 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sliders */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: isLightBg ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                  Brush Thickness: {settings.lineWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={settings.lineWidth}
                  onChange={(e) => onSettingsChange({ lineWidth: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    accentColor: settings.color,
                    '--thumb-color': settings.color
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: isLightBg ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.5)', marginBottom: '8px' }}>
                  Glow Intensity: {settings.glowIntensity}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={settings.glowIntensity}
                  onChange={(e) => onSettingsChange({ glowIntensity: parseInt(e.target.value) })}
                  style={{
                    width: '100%',
                    accentColor: settings.color,
                    '--thumb-color': settings.color
                  }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Canvas Controls Group */}
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', marginBottom: '-6px' }}>
                Canvas Controls
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                <ActionButton icon={<Undo2 size={18} />} onClick={onUndo} isLightBg={isLightBg} title="Undo" />
                <ActionButton icon={<Redo2 size={18} />} onClick={onRedo} isLightBg={isLightBg} title="Redo" />
                <ActionButton icon={<Trash2 size={18} />} onClick={onClear} isLightBg={isLightBg} title="Clear All" />
              </div>

              {/* Export Group */}
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', marginBottom: '-6px', marginTop: '4px' }}>
                Export
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={<Download size={18} />}
                    onClick={onSave}
                    isLightBg={isLightBg}
                    title="Save Flat PNG Image"
                  />
                  <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, fontWeight: 500 }}>PNG</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={<Box size={18} />}
                    onClick={onExportOBJ}
                    isLightBg={isLightBg}
                    title="Export 3D Spatial Model"
                  />
                  <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.6, fontWeight: 500 }}>OBJ</span>
                </div>
              </div>

              {/* System Group */}
              <div style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: isLightBg ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.4)', marginBottom: '-6px', marginTop: '4px' }}>
                System
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={cameraVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                    onClick={onToggleCamera}
                    isLightBg={isLightBg}
                    title={cameraVisible ? "Hide Camera" : "Show Camera"}
                  />
                  <span style={{ fontSize: '9px', marginTop: '4px', opacity: 0.6, fontWeight: 500, whiteSpace: 'nowrap' }}>Show Cam</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={<Zap size={18} />}
                    onClick={onToggleGestures}
                    active={gestureVisible}
                    isLightBg={isLightBg}
                    title={gestureVisible ? "Gestures Enabled" : "Gestures Disabled"}
                  />
                  <span style={{ fontSize: '9px', marginTop: '4px', opacity: 0.6, fontWeight: 500, whiteSpace: 'nowrap' }}>Gestures</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={<Grid size={18} />}
                    onClick={onToggleGrid}
                    active={gridVisible}
                    isLightBg={isLightBg}
                    title={gridVisible ? "Hide Perspective Grid" : "Show Perspective Grid"}
                  />
                  <span style={{ fontSize: '9px', marginTop: '4px', opacity: 0.6, fontWeight: 500, whiteSpace: 'nowrap' }}>Grid</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <ActionButton
                    icon={<HelpCircle size={18} />}
                    onClick={onHelp}
                    isLightBg={isLightBg}
                    title="Gesture Help Guide"
                  />
                  <span style={{ fontSize: '9px', marginTop: '4px', opacity: 0.6, fontWeight: 500, whiteSpace: 'nowrap' }}>Help</span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ActionButton = ({ icon, onClick, active = false, isLightBg = false, title }) => (
  <motion.button
    className="glass-meta"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={title}
    style={{
      borderRadius: '10px',
      width: '100%',
      height: '38px',
      color: isLightBg ? '#000' : '#fff',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      cursor: 'pointer',
      transition: 'background-color 0.2s',
      border: 'none',
      boxShadow: 'none', // Strictly no outer shadows
      background: active
        ? (isLightBg ? 'rgba(0, 0, 0, 0.15)' : 'rgba(255, 255, 255, 0.15)')
        : undefined,
    }}
  >
    {icon}
  </motion.button>
);

export default ControlPanel;
