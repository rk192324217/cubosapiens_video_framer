/**
 * routes/upload.js
 * Handles video file uploads using multer.
 * Validates file type and size, saves to temp/uploads/<sessionId>/
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'temp', 'uploads');
const MAX_SIZE_BYTES = (parseInt(process.env.MAX_UPLOAD_SIZE_MB) || 500) * 1024 * 1024;

const ALLOWED_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-matroska',
  'video/ogg',
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = uuidv4();
    req.sessionId = sessionId;
    const dest = path.join(UPLOADS_DIR, sessionId);
    fs.mkdirSync(dest, { recursive: true });
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    // Sanitize filename
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, safe);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed: mp4, webm, mov, avi, mkv, ogv`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_BYTES },
});

// POST /api/upload
router.post('/', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file received.' });
  }

  // Extract sessionId from the folder path
  const sessionId = path.basename(path.dirname(req.file.path));

  res.json({
    sessionId,
    filename: req.file.filename,
    originalName: req.file.originalname,
    size: req.file.size,
    mimetype: req.file.mimetype,
    path: req.file.path,
  });
});

module.exports = router;
