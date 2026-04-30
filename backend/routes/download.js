/**
 * routes/download.js
 * Serves individual frames or bundles all frames into a ZIP file.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

const router = express.Router();

const FRAMES_DIR = path.join(__dirname, '..', 'temp', 'frames');

/**
 * GET /api/download/frame/:sessionId/:filename
 * Serve a single frame image.
 */
router.get('/frame/:sessionId/:filename', (req, res) => {
  const { sessionId, filename } = req.params;

  // Basic security: prevent path traversal
  const safeName = path.basename(filename);
  const framePath = path.join(FRAMES_DIR, sessionId, safeName);

  if (!framePath.startsWith(FRAMES_DIR)) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (!fs.existsSync(framePath)) {
    return res.status(404).json({ error: 'Frame not found' });
  }

  res.sendFile(framePath);
});

/**
 * GET /api/download/zip/:sessionId
 * Bundle all extracted frames into a ZIP and stream to client.
 */
router.get('/zip/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const framesDir = path.join(FRAMES_DIR, sessionId);

  if (!fs.existsSync(framesDir)) {
    return res.status(404).json({ error: 'Session not found or frames not extracted yet.' });
  }

  const frames = fs.readdirSync(framesDir).filter(f => f.endsWith('.jpg')).sort();
  if (frames.length === 0) {
    return res.status(404).json({ error: 'No frames found for this session.' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', `attachment; filename="frames_${sessionId.slice(0, 8)}.zip"`);

  const archive = archiver('zip', { zlib: { level: 6 } });

  archive.on('error', (err) => {
    console.error('[Archiver Error]', err);
    res.status(500).end();
  });

  archive.pipe(res);

  frames.forEach(frame => {
    archive.file(path.join(framesDir, frame), { name: frame });
  });

  archive.finalize();
});

/**
 * GET /api/download/list/:sessionId
 * Returns a JSON list of frame filenames and their URLs.
 */
router.get('/list/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const framesDir = path.join(FRAMES_DIR, sessionId);

  if (!fs.existsSync(framesDir)) {
    return res.status(404).json({ error: 'Session not found.' });
  }

  const frames = fs.readdirSync(framesDir)
    .filter(f => f.endsWith('.jpg'))
    .sort()
    .map(name => ({
      name,
      url: `/api/download/frame/${sessionId}/${name}`,
    }));

  res.json({ sessionId, totalFrames: frames.length, frames });
});

/**
 * DELETE /api/download/session/:sessionId
 * Clean up all session files (uploads + frames).
 */
router.delete('/session/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const uploadsDir = path.join(__dirname, '..', 'temp', 'uploads', sessionId);
  const framesDir = path.join(FRAMES_DIR, sessionId);

  [uploadsDir, framesDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  res.json({ message: 'Session cleaned up successfully.' });
});

module.exports = router;
