# VideoFramer – Production-Ready Video Frame Extractor

A high-performance, premium web application for extracting frames from video files. Supports both client-side (Canvas) and server-side (FFmpeg) processing.

## 🚀 Features

- **Dual Extraction Engines**:
  - **Browser Engine**: Uses HTML5 Canvas for zero-latency extraction of small-to-medium videos.
  - **FFmpeg Engine**: Uses a Node.js backend for heavy-duty processing of large videos using system processor.
- **Drag & Drop UI**: Sleek, modern interface with glassmorphism and animated backgrounds.
- **Real-time Progress**: Visual feedback via SSE (Server-Sent Events) for backend processing.
- **Frame Gallery**: Responsive grid with full-size previews and individual downloads.
- **Bonus Features**:
  - **GIF Export**: Convert your extracted frames into a high-quality GIF.
  - **Object Detection**: AI-powered object detection using TensorFlow.js (COCO-SSD).
  - **Image Filters**: Apply Grayscale, Sepia, Blur, and more during extraction.
  - **ZIP Download**: Package all frames into a single ZIP file instantly.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS v4, Lucide Icons, Axios.
- **Backend**: Node.js, Express, Multer (uploads), Fluent-FFmpeg.
- **Utilities**: JSZip (archiving), GIF.js (animations), TensorFlow.js (AI).

## 📦 Setup & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [FFmpeg](https://ffmpeg.org/) (Required for backend mode. Ensure it's in your system PATH)

### 1. Backend Setup
```bash
cd backend
npm install
# Create .env file based on .env.example if needed
npm start
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## 💡 How to Use
1. **Upload**: Drag a video file (MP4, WebM, MOV) onto the drop zone.
2. **Settings**: Choose your desired FPS (Frames Per Second) and optional filters.
3. **Extraction**:
   - Toggle "FFmpeg backend" in the header if you want server-side processing.
   - Click "Extract Frames".
4. **Manage**:
   - Preview frames in the gallery.
   - Click the 🔍 icon on a frame to run AI Object Detection.
5. **Download**: Click "Download ZIP" to save all frames or "Export as GIF" to create an animation.

## 📝 License
MIT
