/**
 * routes/extract.js
 * Runs FFmpeg to extract frames from an uploaded video at a given FPS.
 * Streams progress via Server-Sent Events (SSE).
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

// Allow overriding ffmpeg path via env variable
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'temp', 'uploads');
const FRAMES_DIR = path.join(__dirname, '..', 'temp', 'frames');

/**
 * GET /api/extract/:sessionId?fps=1
 * Streams SSE events:
 *   { type: 'progress', percent: 0-100, frame: N }
 *   { type: 'done', totalFrames: N, sessionId }
 *   { type: 'error', message }
 */
router.get('/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const fps = Math.min(Math.max(parseFloat(req.query.fps) || 1, 0.1), 30);

  // ── Validate session ─────────────────────────────────────────────────────
  const uploadDir = path.join(UPLOADS_DIR, sessionId);
  if (!fs.existsSync(uploadDir)) {
    return res.status(404).json({ error: 'Session not found. Please upload a video first.' });
  }

  // Find the uploaded video file
  const files = fs.readdirSync(uploadDir);
  if (files.length === 0) {
    return res.status(404).json({ error: 'No video file found for this session.' });
  }
  const videoFile = path.join(uploadDir, files[0]);

  // ── Prepare output directory ─────────────────────────────────────────────
  const framesDir = path.join(FRAMES_DIR, sessionId);
  fs.mkdirSync(framesDir, { recursive: true });

  // ── Set up SSE ───────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering

  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // ── Get video duration first ─────────────────────────────────────────────
  ffmpeg.ffprobe(videoFile, (err, metadata) => {
    if (err) {
      send({ type: 'error', message: `FFprobe error: ${err.message}` });
      return res.end();
    }

    const duration = metadata.format.duration || 0;
    const estimatedFrames = Math.ceil(duration * fps);

    send({ type: 'start', duration, estimatedFrames, fps });

    let extractedFrames = 0;

    // ── Run FFmpeg ───────────────────────────────────────────────────────
    ffmpeg(videoFile)
      .outputOptions([
        `-vf fps=${fps}`,
        '-q:v 2',          // high quality JPEG
        '-threads 0',      // auto-detect optimal thread count
      ])
      .output(path.join(framesDir, 'frame_%05d.jpg'))
      .on('progress', (progress) => {
        // FFmpeg reports timemark as HH:MM:SS.ms
        const timemark = progress.timemark || '0:00:00.00';
        const parts = timemark.split(':');
        const seconds =
          parseFloat(parts[0]) * 3600 +
          parseFloat(parts[1]) * 60 +
          parseFloat(parts[2]);
        const percent = duration > 0 ? Math.min((seconds / duration) * 100, 99) : 0;
        extractedFrames = Math.floor(seconds * fps);

        send({ type: 'progress', percent: Math.round(percent), frame: extractedFrames });
      })
      .on('end', () => {
        // Count actual output frames
        const frameFiles = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg'));
        send({ type: 'done', totalFrames: frameFiles.length, sessionId });
        res.end();
      })
      .on('error', (err) => {
        console.error('[FFmpeg Error]', err.message);
        send({ type: 'error', message: err.message });
        res.end();
      })
      .run();
  });
});

module.exports = router;
