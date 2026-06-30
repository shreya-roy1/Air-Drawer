import React, { useState, useEffect, useRef } from 'react';
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
  MousePointer2,
  HelpCircle
} from 'lucide-react';



const COLORS = [
  '#00ffff', // Neon Cyan
  '#ff00ff', // Neon Pink
  '#ffff00', // Neon Yellow
  '#00ff00', // Neon Green
  '#ff0000', // Neon Red
  '#ffffff', // Pure White
];

const ControlPanel = ({
  settings,
  onSettingsChange,
  onClear,
  onUndo,
  onRedo,
  onSave,
  onToggleCamera,
  cameraVisible,
  gestureVisible,
  onToggleGestures,
  onHelp
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isLightBg, setIsLightBg] = useState(false);
  const containerRef = useRef(null);
  const offscreenCanvasRef = useRef(null);

  useEffect(() => {
    if (!cameraVisible) {
      setIsLightBg(false);
      return;
    }

    const checkBrightness = () => {
      const video = document.querySelector('video');
      const container = containerRef.current;
      if (!video || !container || video.paused || video.ended) return;

      // Ensure video metadata is loaded
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      const rect = container.getBoundingClientRect();
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      // Calculate scale of object-fit: cover video
      const scale = Math.max(windowWidth / videoWidth, windowHeight / videoHeight);

      // Crop offsets in video coordinate space
      const cropX = (videoWidth - windowWidth / scale) / 2;
      const cropY = (videoHeight - windowHeight / scale) / 2;

      // Map mirrored screen X range [rect.left, rect.right] to unmirrored screen range
      const screenLeftUnmirrored = windowWidth - rect.right;
      const screenRightUnmirrored = windowWidth - rect.left;

      // Calculate sample box coordinates on raw video
      const videoXStart = Math.max(0, cropX + screenLeftUnmirrored / scale);
      const videoXEnd = Math.min(videoWidth, cropX + screenRightUnmirrored / scale);
      const videoYStart = Math.max(0, cropY + rect.top / scale);
      const videoYEnd = Math.min(videoHeight, cropY + rect.bottom / scale);

      const width = videoXEnd - videoXStart;
      const height = videoYEnd - videoYStart;

      if (width <= 0 || height <= 0) return;

      // Create offscreen canvas if it doesn't exist
      if (!offscreenCanvasRef.current) {
        offscreenCanvasRef.current = document.createElement('canvas');
      }
      const canvas = offscreenCanvasRef.current;
      canvas.width = 30; // Small canvas to sample area average
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
          // Relative luminance calculation
          const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
          totalLuminance += luminance;
          count++;
        }

        const avgLuminance = count > 0 ? totalLuminance / count : 0;
        
        // Hysteresis thresholds to prevent flickering
        const thresholdLight = 145;
        const thresholdDark = 125;

        setIsLightBg(prev => {
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
    // Run once immediately
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
        }}
      >
        <Settings size={22} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass-meta"
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
              marginTop: '12px'
            }}
          >
            {/* Color Palette */}
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                fontSize: '14px',
                fontWeight: 600,
                color: isLightBg ? 'rgba(0, 0, 0, 0.7)' : 'rgba(255, 255, 255, 0.7)'
              }}>
                <Palette size={16} /> Color Palette
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '10px' }}>
                {COLORS.map((c) => (
                  <motion.div
                    key={c}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSettingsChange({ color: c, isEraser: false })}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: c,
                      cursor: 'pointer',
                      border: settings.color === c ? (isLightBg ? '2px solid #000' : '2px solid #fff') : 'none',
                      boxShadow: settings.color === c ? `0 0 15px ${c}` : 'none',
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
                  style={{ width: '100%', accentColor: settings.color }}
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
                  style={{ width: '100%', accentColor: settings.color }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <ActionButton icon={<Undo2 size={18} />} label="Undo" onClick={onUndo} isLightBg={isLightBg} />
              <ActionButton icon={<Redo2 size={18} />} label="Redo" onClick={onRedo} isLightBg={isLightBg} />
              <ActionButton icon={<Trash2 size={18} />} label="Clear" onClick={onClear} isLightBg={isLightBg} />
              <ActionButton icon={<Download size={18} />} label="Save" onClick={onSave} isLightBg={isLightBg} />
              <ActionButton
                icon={cameraVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                label={cameraVisible ? "Hide Cam" : "Show Cam"}
                onClick={onToggleCamera}
                isLightBg={isLightBg}
              />
              <ActionButton
                icon={<Zap size={18} />}
                label={gestureVisible ? "Gestures On" : "Gestures Off"}
                onClick={onToggleGestures}
                active={gestureVisible}
                isLightBg={isLightBg}
              />
              <ActionButton
                icon={<HelpCircle size={18} />}
                label="Help"
                onClick={onHelp}
                isLightBg={isLightBg}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>


    </div>
  );
};

const ActionButton = ({ icon, label, onClick, active = false, isLightBg = false }) => (
  <motion.button
    className="glass-meta"
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    style={{
      borderRadius: '12px',
      padding: '10px',
      color: isLightBg ? '#000' : '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '4px',
      cursor: 'pointer',
      fontSize: '10px',
      transition: 'all 0.2s',
      boxShadow: active ? (isLightBg ? '0 0 10px rgba(0, 0, 0, 0.25)' : '0 0 10px rgba(255, 255, 255, 0.5)') : 'none',
      border: active ? (isLightBg ? '1px solid rgba(0, 0, 0, 0.3)' : '1px solid rgba(255, 255, 255, 0.4)') : undefined
    }}
  >
    {icon}
    {label}
  </motion.button>
);

export default ControlPanel;
