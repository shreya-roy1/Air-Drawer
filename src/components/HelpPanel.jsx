import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, HelpCircle, Sparkles } from 'lucide-react';

const gestures = [
  {
    section: 'Right Hand (Draw)',
    items: [
      { emoji: '☝️', gesture: 'Index finger up', action: 'Draw strokes' },
      { emoji: '🤏', gesture: 'Pinch (thumb + index)', action: 'Erase nearby strokes' },
      { emoji: '✊', gesture: 'Fist', action: 'Clear all' },
    ],
  },
  {
    section: 'Left Hand (Control)',
    items: [
      { emoji: '✌️', gesture: 'Two fingers up', action: 'Select & Move stroke' },
      { emoji: '🤏', gesture: 'Pinch + spread/close', action: 'Scale stroke' },
      { emoji: '🖐️', gesture: 'Open palm + twist', action: 'Rotate stroke' },
    ],
  },
  {
    section: 'Tips',
    items: [
      { emoji: '💡', gesture: 'One hand only', action: 'Auto-assigned as draw hand' },
      { emoji: '📐', gesture: 'Release rotate', action: 'Snaps to nearest 45°' },
      { emoji: '🌀', gesture: 'Release move', action: 'Slight inertia drift' },
    ],
  },
];

export default function HelpPanel({ isOpen, onClose, isWelcome = false }) {
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
            className={isWelcome ? "" : "glass-meta"}
            style={isWelcome ? {
              width: '100%',
              height: '100%',
              overflowY: 'auto',
              padding: '60px 24px',
              color: '#fff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxSizing: 'border-box',
              background: 'radial-gradient(circle at center, #1b153a 0%, #07040d 100%)',
            } : {
              width: '380px',
              maxHeight: '80vh',
              overflowY: 'auto',
              borderRadius: '20px',
              padding: '24px',
              color: '#fff',
            }}
          >
            <div style={{ maxWidth: isWelcome ? '960px' : '500px', width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Header */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: isWelcome ? 'center' : 'stretch', 
                marginBottom: '10px',
                textAlign: isWelcome ? 'center' : 'left'
              }}>
                <div style={{ 
                  display: 'flex', 
                  flexDirection: isWelcome ? 'column' : 'row', 
                  alignItems: 'center', 
                  gap: isWelcome ? '16px' : '8px' 
                }}>
                  {isWelcome ? (
                    <Sparkles size={48} style={{ color: '#00ffff' }} />
                  ) : (
                    <HelpCircle size={20} style={{ color: '#00ffff' }} />
                  )}
                  <span style={{ 
                    fontSize: isWelcome ? '32px' : '16px', 
                    fontWeight: 800, 
                    letterSpacing: '0.05em',
                    background: isWelcome ? 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)' : 'none',
                    WebkitBackgroundClip: isWelcome ? 'text' : 'none',
                    WebkitTextFillColor: isWelcome ? 'transparent' : 'inherit',
                  }}>
                    {isWelcome ? 'Welcome to AirDrawer' : 'Gesture Guide'}
                  </span>
                </div>
                {isWelcome && (
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '12px', fontWeight: 300, lineHeight: '1.6' }}>
                    Experience drawing in 3D space using intuitive hand gestures right in front of your webcam.
                  </p>
                )}
                {!isWelcome && (
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
                )}
              </div>

              {/* Privacy / Camera Alert Callout */}
              {isWelcome && (
                <div style={{
                  backgroundColor: 'rgba(0, 255, 255, 0.04)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  borderRadius: '16px',
                  padding: '16px',
                  fontSize: '12.5px',
                  lineHeight: '1.6',
                  color: '#e2e8f0',
                  maxWidth: '700px',
                  width: '100%',
                  alignSelf: 'center',
                  boxSizing: 'border-box',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#00ffff', marginBottom: '8px', fontSize: '13px' }}>
                    <span>📷</span> Camera Access & Privacy
                  </div>
                  We request camera access solely to interpret hand movements locally. 
                  <strong> No images or video feeds are ever recorded, saved, or transmitted to any server.</strong> 
                  Your data stays entirely private and local to this tab.
                </div>
              )}

              {/* Gesture Sections in Row/Grid */}
              <div style={isWelcome ? {
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
                width: '100%',
              } : {
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}>
                {gestures.map((section, sIdx) => (
                  <div key={sIdx} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.4)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.12em',
                      marginBottom: '4px',
                    }}>
                      {section.section}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {section.items.map((item, iIdx) => (
                        <div
                          key={iIdx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.03)',
                            border: '1px solid rgba(255, 255, 255, 0.03)',
                          }}
                        >
                          <span style={{ fontSize: '22px', width: '32px', textAlign: 'center' }}>{item.emoji}</span>
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
                    whileHover={{ scale: 1.02, boxShadow: '0 0 25px rgba(0, 255, 255, 0.6)' }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onClose}
                    style={{
                      width: '100%',
                      maxWidth: '360px',
                      padding: '14px 20px',
                      borderRadius: '14px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #00ffff 0%, #ff00ff 100%)',
                      color: '#000',
                      fontWeight: 800,
                      fontSize: '14.5px',
                      cursor: 'pointer',
                      boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)',
                      transition: 'box-shadow 0.2s',
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
