# VideoFramer – Client-Side Video Frame Extractor

A high-performance, premium web application for extracting frames from video files entirely in the browser. 

## 🚀 Features

- **Browser-Based Engine**: Uses HTML5 Canvas for zero-latency extraction directly in your browser.
- **Manual Capture**: Seek to any moment and capture the exact frame with a click.
- **Drag & Drop UI**: Sleek, modern interface with glassmorphism and animated backgrounds.
- **Real-time Progress**: Visual feedback during the extraction process.
- **Frame Gallery**: Responsive grid with full-size previews and individual downloads.
- **Bonus Features**:
  - **GIF Export**: Convert your extracted frames into a high-quality GIF.
  - **Object Detection**: AI-powered object detection using TensorFlow.js (COCO-SSD).
  - **Image Filters**: Apply Grayscale, Sepia, Blur, and more during extraction.
  - **ZIP Download**: Package all frames into a single ZIP file instantly using JSZip.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide Icons.
- **Utilities**: JSZip (archiving), GIF.js (animations), TensorFlow.js (AI).

## 📦 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)

### Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at the URL shown in your terminal (usually `http://localhost:5173`).

## 💡 How to Use
1. **Upload**: Drag a video file (MP4, WebM, MOV) onto the drop zone.
2. **Settings**: Choose your desired FPS (Frames Per Second) and optional filters.
3. **Extraction**: Click "Extract Frames" or use the "Capture Frame" button on the player for manual selection.
4. **Manage**:
   - Preview frames in the gallery.
   - Click the 🔍 icon on a frame to run AI Object Detection.
5. **Download**: Click "Download ZIP" to save all frames or "Export as GIF" to create an animation.

## 📝 License
MIT
