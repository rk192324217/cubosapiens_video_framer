# 📘 VideoFramer: A-Z Features & Functionality Guide

This document provides a comprehensive breakdown of every feature, component, and utility integrated into the VideoFramer application.

---

## 🏗️ 1. Core Architecture
VideoFramer is built as a **hybrid-engine** application. It allows users to choose between client-side processing (for speed and privacy) and server-side processing (for power and large file support).

- **Frontend**: React (Vite) + Tailwind CSS v4.
- **Backend**: Node.js + Express + FFmpeg.
- **Communication**: REST API for uploads and downloads; SSE (Server-Sent Events) for real-time progress streaming

---

## 🎨 2. Frontend Features (A-Z)

### ● Animated Background Orbs
A premium visual layer using CSS-animated radial gradients that float behind the UI. This provides depth and a "SaaS-ready" aesthetic without impacting performance.

### ● Backend Toggle (Engine Selector)
Located in the header, this switch lets the user toggle between the **Canvas Engine** (Frontend) and the **FFmpeg Engine** (Backend).
- *Canvas*: Best for webm/mp4 under 50MB.
- *FFmpeg*: Best for professional-grade extraction, large MOV files, and high-quality results.

### ● Download Options (ZIP & GIF)
- **ZIP Export**: Uses `JSZip` to bundle all extracted frames into a single archive in memory before downloading.
- **GIF Export**: Uses `gif.js` to compile the frames into an animated GIF at the selected FPS.

### ● Drag & Drop UI
A robust `DropZone` component supporting native file dragging and manual browsing. It validates file types (MP4, WebM, MOV, etc.) before loading.

### ● Frame Filtering
Apply real-time CSS filters during the extraction process.
- *Supported Filters*: Grayscale, Sepia, Invert, Blur, Brightness, Contrast, and Saturation.

### ● Frame Gallery & Modal
A responsive grid that renders extracted frames. Clicking any frame opens a high-resolution modal preview.

### ● Metadata Overlay
Automatically extracts and displays video duration, resolution, file name, and size immediately after a file is loaded.

### ● Object Detection (AI-Powered)
Integrated **TensorFlow.js (COCO-SSD)**. Users can click the "Scan" icon on any frame to run a local AI model that identifies objects (people, cars, animals, etc.) and draws bounding boxes with confidence scores.

### ● Progress Tracking
A centralized progress panel that maps various stages (Upload -> Extract -> Fetch) into a unified 0-100% progress bar.

---

## ⚙️ 3. Backend Features (A-Z)

### ● Automatic Cleanup Scheduler
The server runs a background job every 15 minutes to delete any session folders (uploads and frames) older than 1 hour, preventing storage bloat.

### ● FFmpeg Frame Extraction
Uses the `fluent-ffmpeg` library to talk to the system's FFmpeg binary. It supports high-quality JPEG output (`-q:v 2`) and custom FPS.

### ● Multipart Upload (Multer)
Handles large video files efficiently by streaming them directly to a session-specific folder on the disk.

### ● Server-Sent Events (SSE)
Instead of polling, the server "pushes" progress updates to the frontend during extraction. This provides a smooth, lag-free progress bar even for 10-minute long videos.

---

## 🧩 4. Component Directory

| Component | Responsibility |
| :--- | :--- |
| `App.jsx` | State orchestrator; manages the transition between IDLE, READY, and DONE. |
| `Header.jsx` | Branding and the Engine Selection toggle. |
| `DropZone.jsx` | File ingestion and initial validation. |
| `VideoPlayer.jsx` | HTML5 video rendering and metadata extraction. |
| `ExtractControls.jsx` | The "Brain" of the UI—handles FPS selection, filters, and triggers. |
| `FrameGallery.jsx` | Renders the results; handles AI detection logic. |
| `BackgroundOrbs.jsx` | Purely aesthetic floating background elements. |

---

## 🛠️ 5. Utility Functions

### `canvasExtractor.js`
Uses `requestVideoFrameCallback` (or manual seeking) to draw frames onto a hidden canvas, then captures them via `canvas.toDataURL()`.

### `backendExtractor.js`
Handles the 3-step backend workflow:
1. Upload video file via Axios.
2. Listen to SSE progress updates.
3. Fetch the final JSON list of frame URLs.

### `gifMaker.js`
Allocates web workers to process image data in the background, creating a `.gif` file without locking the main UI thread.

---

## 📈 6. Performance Optimization
- **Worker Scripts**: GIF generation runs in background workers.
- **Lazy Loading**: Frames in the gallery are rendered as they appear.
- **Downscaling**: GIFs are automatically downscaled to 480p to keep file sizes manageable.
- **Debounced Seeking**: Canvas extraction waits for the `seeked` event before capturing a frame to ensure no "blank" images.
