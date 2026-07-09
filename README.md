# 🌌 Air Drawer | AI Spatial Interface

Step into the future of digital creation. Air Drawer is a high-performance web application that transforms your physical environment into a real-time, "Minority Report"-inspired spatial canvas using advanced AI hand tracking. Seamlessly sketch in 3D space with your dominant hand, while using your non-dominant hand to fluidly move, scale, rotate individual strokes, or globally rotate the entire 3D canvas through intuitive gestures.

---

## ✨ Core Capabilities

* **✋ Dual-Hand Interaction Model**: 
    * **Dominant Hand (Right)**: Engineered for high-precision 3D line drawing, targeted erasing, and canvas clearing.
    * **Secondary Hand (Left)**: Your spatial control center, dedicated to manipulating stroke transform properties and rotating the global scene.
      
* **🌐 Dynamic 3D Perspective Projection**: True spatial rendering where strokes are projected dynamically onto a 3D viewport. Includes rotational controls (pitch and yaw) allowing full 3D manipulation.
  
* **✊ Bimanual Canvas Rotation**: Close your non-dominant hand into a fist to grab and rotate the entire 3D workspace. Adjust the pitch (vertical tilt) and yaw (horizontal rotation) in real-time simply by moving your hand.
  
* **🥅 3D Wireframe Perspective Grid**: An immersive background receding grid tunnel acting as a depth and spatial guide. Vanishing points shift dynamically based on active hand coordinates and depth, with toggle support directly in the control panel.
  
* **🕸️ Skeletal Hand Joint Mesh**: A real-time, semi-transparent wireframe joint tracker overlaid directly on your hands (cyan for dominant hand, orange for secondary hand) with glowing joint points.
* **📐 Non-Destructive Transformations**: Every stroke preserves its original coordinate data. All manipulations (translation, scale, rotation) are mathematically applied at render time, ensuring zero loss of stroke resolution.
  
* **🎥 Cinematic Blurred Camera Feed**: A beautifully styled, dark cinematic camera view featuring deep contrast and a 10px blur filter, seamlessly embedding the real-time webcam into a futuristic dark HUD.
  
* **👥 Real-Time Multiplayer Sync Prep**: Integrated `useMultiplayerState` and `useCanvasSync` React hooks to coordinate real-time drawing state, stroke additions, removals, and remote transforms over networks.
  
* **⚡ 60FPS Render Engine**: Built on a high-efficiency HTML5 canvas rendering pipeline optimized to deliver a fluid, lag-free creation experience.
  
* **📖 SVG-Powered Help Panel**: A sleek, context-aware onboarding guide featuring custom, high-fidelity inline SVG icons replacing OS-specific emojis for maximum styling consistency.

---

## 🛠️ Technology Architecture

* **Frontend Framework**: React + Vite
* **Computer Vision**: `@mediapipe/hands` (Local, client-side inference)
* **Motion & Animation**: Framer Motion
* **Iconography**: Lucide React + Custom SVG Brand Elements
* **Styling Engine**: Vanilla CSS (Metamorphic Glassmorphism & Neon UI aesthetics)

---

## 🎮 Gesture Reference Guide

### ✍️ Canvas Control (Dominant Hand / Right Hand)

| Gesture | Triggered Action | Details |
| :--- | :--- | :--- |
| ☝️ **Index Finger Up** | **Draw** | Initiate a new 3D drawing stroke at estimated depth |
| 🤏 **Pinch** (Thumb + Index) | **Erase** | Erase nearby lines based on fingertip intersection |
| ✊ **Closed Fist** | **Clear All** | Instantly clear the entire drawing workspace |

### 🖐️ Spatial Manipulation (Non-Dominant Hand / Left Hand)

| Gesture | Triggered Action | HUD Visual Feedback |
| :--- | :--- | :--- |
| ✌️ **Two Fingers Up** | **Translate (Move)** nearest stroke | Blue crosshair + neon tracker glow |
| 🤏 **Pinch & Drag** | **Scale** stroke size | Concentric rings + live percentage label |
| 🤚 **Open Palm** | **Rotate** stroke on Z-axis | Orange arc + snaps to 45° snaps |
| ✊ **Closed Fist & Drag** | **Rotate 3D Canvas** | Multi-axis global pitch/yaw scene rotation |

---

## 🚀 Installation & Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Launch the Development Server**:
    ```bash
    npm run dev
    ```
3.  **Initialize**: Grant camera permissions in your browser, step back, and raise your hands into the frame.

---

*🪄 Built with a passion for AI and Spatial Computing.*
