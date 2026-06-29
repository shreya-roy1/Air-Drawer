# 🌌 Air Drawer | AI Spatial Interface

Step into the future of digital creation. Air Draw is a high-performance web application that transforms your physical environment into a real-time, "Minority Report"-inspired spatial canvas using advanced AI hand tracking. Seamlessly sketch in mid-air with your dominant hand, while using your non-dominant hand to fluidly move, scale, and rotate your designs through intuitive gestures.

## ✨ Core Capabilities

* **✋ Dual-Hand Interaction Model**: 
    * **Dominant Hand (Right)**: Engineered for high-precision rendering, targeted erasing, and global canvas clearing.
    * **Secondary Hand (Left)**: Your spatial control center, dedicated to manipulating existing strokes via translation, scaling, and rotation.
* **📐 Non-Destructive Transformations**: Every stroke preserves its original coordinate data. All manipulations (TX, TY, Scale, Rotation) are mathematically applied at render time via matrix operations, ensuring zero data loss.
* **🕶️ Premium Glassmorphism UI**: A sleek, minimalist aesthetic featuring a real-time HUD and contextual visual guides.
* **⚡ WebGL Performance Engine**: Built on a native WebGL rendering pipeline optimized to deliver a fluid, 60FPS experience.
* **🌀 Physics-Driven Mechanics**: Experience natural momentum with smooth stroke inertia and crisp 45° angle snapping during rotations.
* **📖 Interactive Gesture Guide**: An integrated, accessible manual detailing every spatial command.

## 🛠️ Technology Architecture

* **Frontend Framework**: React + Vite
* **Computer Vision**: `@mediapipe/hands`
* **Motion & Animation**: Framer Motion
* **Iconography**: Lucide React (augmented with custom inline SVG fallbacks for brand elements)
* **Styling Engine**: Vanilla CSS (Modern Glassmorphism & Neon UI aesthetics)

## 🎮 Gesture Reference Guide

### ✍️ Canvas Control (Right Hand)

| Gesture | Triggered Action |
| :--- | :--- |
| ☝️ **Index Finger Up** | Initiate a new drawing stroke |
| 🤏 **Pinch** | Activate precision eraser (clears on fingertip intersection) |
| ✊ **Closed Fist** | Purge the entire canvas |

### 🖐️ Spatial Manipulation (Left Hand)

| Gesture | Triggered Action | HUD Visual Feedback |
| :--- | :--- | :--- |
| ✌️ **Two Fingers** | **Translate (Move)** nearest stroke | Blue crosshair + neon glow |
| 🤏 **Pinch & Spread** | **Scale** stroke dimensions | Concentric rings + active % label |
| 🤚 **Open Palm** | **Rotate** stroke along axis | Orange arc + snap-point indicators |

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
*Forged with a passion for AI and the future of Spatial Computing.*