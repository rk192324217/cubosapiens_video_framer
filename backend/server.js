/**
 * Video Frame Extractor – Express Backend
 * Uses FFmpeg (via fluent-ffmpeg) to extract frames from uploaded videos,
 * then bundles them into a ZIP for download.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const uploadRouter = require('./routes/upload');
const extractRouter = require('./routes/extract');
const downloadRouter = require('./routes/download');

console.log('[Server] Initializing VideoFramer Backend...');

const app = express();
const PORT = process.env.PORT || 5000;

const ffmpeg = require('fluent-ffmpeg');

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Check for FFmpeg availability
ffmpeg.getAvailableFormats((err, formats) => {
  if (err) {
    console.error('❌ FFmpeg/FFprobe not found! Backend extraction will NOT work.');
    console.error('   Please install FFmpeg and add it to your PATH.');
  } else {
    console.log('✅ FFmpeg is available and ready.');
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure temp directories exist
const TEMP_DIR = path.join(__dirname, 'temp');
const UPLOADS_DIR = path.join(TEMP_DIR, 'uploads');
const FRAMES_DIR = path.join(TEMP_DIR, 'frames');

[TEMP_DIR, UPLOADS_DIR, FRAMES_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// ── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/upload', uploadRouter);
app.use('/api/extract', extractRouter);
app.use('/api/download', downloadRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Cleanup job: remove sessions older than 1 hour ──────────────────────────
setInterval(() => {
  const ONE_HOUR = 60 * 60 * 1000;
  const now = Date.now();
  [UPLOADS_DIR, FRAMES_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    fs.readdirSync(dir).forEach(name => {
      const fullPath = path.join(dir, name);
      try {
        const stat = fs.statSync(fullPath);
        if (now - stat.mtimeMs > ONE_HOUR) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`[Cleanup] Removed old session: ${fullPath}`);
        }
      } catch (_) {}
    });
  });
}, 15 * 60 * 1000); // every 15 minutes

// ── Global error handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('[Server Error]', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`✅ Video Frame Extractor backend running on http://localhost:${PORT}`);
});
