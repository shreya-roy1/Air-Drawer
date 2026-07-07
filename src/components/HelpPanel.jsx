import React from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Sparkles } from 'lucide-react';

// Custom Minimalist SVG Icons replacing standard OS emojis
const IndexFingerIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <path d="M12 2v9M12 11c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 2.2 1.8 4 4 4h1c2.2 0 4-1.8 4-4v-3c0-1.1-.9-2-2-2s-2 .9-2 2" />
  </svg>
);

const PinchIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <path d="M9 10c0-1.1.9-2 2-2s2 .9 2 2v3c0 .5-.5 1-1 1s-1-.5-1-1v-2" />
    <path d="M12 11c0-1.1.9-2 2-2s2 .9 2 2v2" />
    <path d="M15 13c0-1.1.9-2 2-2s2 .9 2 2v1" />
    <path d="M8 12c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v3" />
    <path d="M6 15c0 2.2 1.8 4 4 4h3c2.2 0 4-1.8 4-4v-1.5c0-.8-.7-1.5-1.5-1.5h-1c-.5 0-1 .5-1 1" />
  </svg>
);

const FistIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <path d="M8 10h8c1.1 0 2 .9 2 2v3c0 2.2-1.8 4-4 4h-4c-2.2 0-4-1.8-4-4v-3c0-1.1.9-2 2-2z" />
    <path d="M6 10V8c0-1.1.9-2 2-2s2 .9 2 2v2M10 10V8c0-1.1.9-2 2-2s2 .9 2 2v2M14 10V8c0-1.1.9-2 2-2s2 .9 2 2v2" />
  </svg>
);

const TwoFingersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <path d="M9 10V4c0-1.1.9-2 2-2s2 .9 2 2v6M13 10V5c0-1.1.9-2 2-2s2 .9 2 2v5M9 10c0-1.1-.9-2-2-2s-2 .9-2 2v6c0 2.2 1.8 4 4 4h3c2.2 0 4-1.8 4-4v-5c0-1.1-.9-2-2-2s-2 .9-2 2" />
  </svg>
);

const OpenPalmIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto' }}>
    <path d="M6 11V6c0-1.1.9-2 2-2s2 .9 2 2v5M10 11V4c0-1.1.9-2 2-2s2 .9 2 2v5M14 11V5c0-1.1.9-2 2-2s2 .9 2 2v6M18 12V8c0-1.1.9-2 2-2s2 .9 2 2v5c0 2.2-1.8 4-4 4h-5c-2.2 0-4-1.8-4-4V9.5c0-1.1.9-2 2-2s2 .9 2 2V12" />
  </svg>
);

const TipIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto', color: '#eab308' }}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .3 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const RulerIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto', color: '#06b6d4' }}>
    <path d="M22 22L2 2v20h20z" />
    <path d="M6 18l4-4" />
    <path d="M10 18l4-4" />
  </svg>
);

const SpiralIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: 'auto', color: '#a855f7' }}>
    <path d="M12 2a10 10 0 1 0 10 10c0-4.4-3.6-8-8-8s-6 3.6-6 8 3.6 4 4 4 2-1.8 2-4-1.8-2-2-2" />
  </svg>
);

const CameraIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px', color: '#00ffff' }}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const gestures = [
  {
    section: 'Right Hand (Draw)',
    items: [
      { icon: <IndexFingerIcon />, gesture: 'Index finger up', action: 'Draw lines in the air' },
      { icon: <PinchIcon />, gesture: 'Pinch (thumb + index)', action: 'Erase nearby strokes' },
      { icon: <FistIcon />, gesture: 'Fist', action: 'Clear all strokes' },
    ],
  },
  {
    section: 'Left Hand (Control & Transform)',
    items: [
      { icon: <TwoFingersIcon />, gesture: 'Two fingers up', action: 'Select & Move stroke' },
      { icon: <PinchIcon />, gesture: 'Pinch + spread/close', action: 'Scale stroke' },
      { icon: <OpenPalmIcon />, gesture: 'Open palm + twist', action: 'Rotate stroke' },
      { icon: <FistIcon />, gesture: 'Closed Fist (hold & drag)', action: 'Globally rotate 3D canvas' },
    ],
  },
  {
    section: 'System Tips',
    items: [
      { icon: <TipIcon />, gesture: 'One hand only', action: 'Auto-assigned as draw hand' },
      { icon: <RulerIcon />, gesture: 'Release rotate', action: 'Snaps to nearest 45°' },
      { icon: <SpiralIcon />, gesture: 'Release move', action: 'Slight inertia drift' },
    ],
  },
];

export default function HelpPanel({ isOpen, onClose, isWelcome = false }) {
  const displayedGestures = isWelcome
    ? [
      {
        section: 'Drawing Basics',
        items: [
          { icon: <IndexFingerIcon />, gesture: 'Index finger up', action: 'Draw lines in the air' },
          { icon: <PinchIcon />, gesture: 'Pinch (thumb + index)', action: 'Hold to erase lines' },
          { icon: <FistIcon />, gesture: 'Fist shape', action: 'Clear the entire canvas' },
        ],
      },
    ]
    : gestures;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={isWelcome ? undefined : onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isWelcome ? '#090514' : 'rgba(0, 0, 0, 0.6)',
            backdropFilter: isWelcome ? 'none' : 'blur(8px)',
          }}
        >
          <motion.div
            initial={isWelcome ? { scale: 1, opacity: 0 } : { scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={isWelcome ? { scale: 1, opacity: 0 } : { scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className={isWelcome ? "custom-scrollbar" : "glass-meta custom-scrollbar"}
            style={isWelcome ? {
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              padding: '40px 24px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              boxSizing: 'border-box',
              background: 'radial-gradient(circle at center, #111827 0%, #030712 100%)',
            } : {
              width: '380px',
              maxHeight: '80vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '24px',
              color: '#fff',
            }}
          >
            <div style={{
              maxWidth: isWelcome ? '460px' : '500px',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: isWelcome ? '32px' : '20px',
              marginTop: isWelcome ? 'auto' : undefined,
              marginBottom: isWelcome ? 'auto' : undefined,
            }}>
              {/* Header */}
              {isWelcome ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: '16px',
                  textAlign: 'center'
                }}>
                  <Sparkles size={48} style={{ color: '#00ffff', marginBottom: '16px' }} />
                  <span style={{
                    fontSize: '28px',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    color: '#fff',
                  }}>
                    Welcome to AirDrawer
                  </span>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '12px', fontWeight: 300, lineHeight: '1.6' }}>
                    Draw in 3D space using simple hand gestures right in front of your camera.
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={20} style={{ color: '#00ffff' }} />
                    <span style={{ fontSize: '16px', fontWeight: 800, letterSpacing: '0.05em', color: '#fff' }}>
                      Gesture Guide
                    </span>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'rgba(255,255,255,0.6)',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                    }}
                  >
                    <X size={18} />
                  </button>
                </div>
              )}

              {/* Privacy / Camera Alert Callout */}
              {isWelcome && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  borderRadius: '16px',
                  padding: '20px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  width: '100%',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#00ffff', marginBottom: '8px', fontSize: '14px' }}>
                    <CameraIcon /> Camera Access & Privacy
                  </div>
                  We request camera access solely to interpret hand movements locally.
                  <strong> No images or video feeds are ever recorded, saved, or transmitted to any server.</strong>
                  Your data stays entirely private and local to this tab.
                </div>
              )}

              {/* Gesture Sections */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                width: '100%',
              }}>
                {displayedGestures.map((section, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: 'rgba(255, 255, 255, 0.75)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '4px',
                    }}>
                      {section.section}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '12px 18px',
                            borderRadius: '16px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            backdropFilter: 'blur(16px)',
                            WebkitBackdropFilter: 'blur(16px)',
                          }}
                        >
                          <span style={{ width: '32px', display: 'flex', justifyContent: 'center' }}>{item.icon}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '13.5px', fontWeight: 600 }}>{item.gesture}</div>
                            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)' }}>{item.action}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Understood Action Button */}
              {isWelcome && (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <motion.button
                    whileHover={{ scale: 1.02, backgroundColor: '#00f0ff' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    style={{
                      width: '100%',
                      padding: '14px 20px',
                      borderRadius: '14px',
                      border: 'none',
                      background: '#00ffff',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '14px',
                      cursor: 'pointer',
                      marginTop: '20px',
                      boxShadow: '0 4px 14px rgba(0, 255, 255, 0.2)',
                      transition: 'background-color 0.2s, transform 0.1s',
                    }}
                  >
                    Understood & Start Drawing
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
