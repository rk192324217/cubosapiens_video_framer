# 📘 VideoFramer: Client-Side Features & Functionality Guide

This document provides a comprehensive breakdown of every feature, component, and utility integrated into the VideoFramer application.

---

## 🏗️ 1. Core Architecture
VideoFramer is built as a **purely client-side** application. All video processing, frame extraction, and file packaging happen directly in the user's browser, ensuring maximum privacy and zero server costs.

- **Frontend**: React (Vite) + Tailwind CSS v4.
- **Processing**: HTML5 Canvas API.
- **Packaging**: JSZip (for ZIPs) and GIF.js (for GIFs).

---

## 🎨 2. Key Features (A-Z)

### ● Animated Background Orbs
A premium visual layer using CSS-animated radial gradients that float behind the UI. This provides depth and a "SaaS-ready" aesthetic without impacting performance.

### ● Download Options (ZIP & GIF)
- **ZIP Export**: Uses `JSZip` to bundle all extracted frames into a single archive in memory before downloading.
- **GIF Export**: Uses `gif.js` to compile the frames into an animated GIF at the selected FPS.

### ● Drag & Drop UI
A robust `DropZone` component supporting native file dragging and manual browsing. It validates file types (MP4, WebM, MOV, etc.) before loading.

### ● Frame Filtering
Apply real-time CSS filters during the extraction process.
- *Supported Filters*: Grayscale, Sepia, Invert, Blur, Brightness, Contrast, and Saturation.

### ● Frame Gallery & Modal
A responsive grid that renders extracted frames. Clicking any frame opens a high-resolution modal preview with bounding boxes if object detection was run.

### ● Manual Frame Capture
A dedicated button on the video player allows users to seek to an exact timestamp and "snap" a frame manually, adding it to the gallery.

### ● Metadata Overlay
Automatically extracts and displays video duration, resolution, file name, and size immediately after a file is loaded.

### ● Object Detection (AI-Powered)
Integrated **TensorFlow.js (COCO-SSD)**. Users can click the "Scan" icon on any frame to run a local AI model that identifies objects (people, cars, animals, etc.) and draws bounding boxes with confidence scores.

### ● Progress Tracking
A centralized progress panel that provides visual feedback during batch extraction processes.

---

## 🧩 3. Component Directory

| Component | Responsibility |
| :--- | :--- |
| `App.jsx` | State orchestrator; manages the transition between IDLE, READY, and DONE. |
| `Header.jsx` | Branding and navigation. |
| `DropZone.jsx` | File ingestion and initial validation. |
| `VideoPlayer.jsx` | HTML5 video rendering and manual frame capture logic. |
| `ExtractControls.jsx` | The "Brain" of the UI—handles FPS selection, filters, and batch triggers. |
| `FrameGallery.jsx` | Renders the results; handles AI detection logic and modal views. |
| `BackgroundOrbs.jsx` | Purely aesthetic floating background elements. |

---

## 🛠️ 4. Utility Functions

### `canvasExtractor.js`
The core engine. It seeks through the video and draws frames onto a hidden canvas, then captures them via `canvas.toDataURL()`.

### `gifMaker.js`
Allocates web workers to process image data in the background, creating a `.gif` file without locking the main UI thread.

---

## 📈 5. Performance Optimization
- **Worker Scripts**: GIF generation runs in background workers.
- **On-Device AI**: TensorFlow.js runs in the browser, avoiding any data transmission to servers.
- **Efficient Seeking**: Canvas extraction waits for the `seeked` event before capturing a frame to ensure high-quality images.
