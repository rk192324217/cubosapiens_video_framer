/**
 * DropZone.jsx
 * Drag-and-drop + click-to-browse video upload area.
 */
import { useState, useRef, useCallback } from 'react';
import { Upload, Film, FolderOpen } from 'lucide-react';

const FORMATS = ['MP4', 'WebM', 'MOV', 'AVI', 'MKV', 'OGV'];

export default function DropZone({ onVideoSelected }) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onVideoSelected(file);
  }, [onVideoSelected]);

  const handleChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (file) onVideoSelected(file);
  }, [onVideoSelected]);

  return (
    <div className="flex flex-col items-center gap-8 py-8">
      {/* Hero text */}
      <div className="text-center space-y-2">
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2.25rem', fontWeight: 700, lineHeight: 1.15 }}>
          <span className="gradient-text">Extract Frames</span>
          <br />
          <span style={{ color: 'rgba(226,232,240,0.8)' }}>from any video</span>
        </h2>
        <p style={{ color: 'rgba(226,232,240,0.45)', fontSize: '1rem' }}>
          Upload a video, choose your FPS, and download frames as a ZIP
        </p>
      </div>

      {/* Drop zone */}
      <div
        id="drop-zone"
        role="button"
        tabIndex={0}
        aria-label="Drop video file here or click to browse"
        className={`drop-zone w-full max-w-2xl py-16 px-8 flex flex-col items-center gap-5 ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragEnter={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/ogg,.mkv,.mov"
          onChange={handleChange}
          className="hidden"
          id="video-file-input"
        />

        {/* Icon */}
        <div
          style={{
            width: '5rem',
            height: '5rem',
            borderRadius: '1.25rem',
            background: isDragging
              ? 'linear-gradient(135deg, rgba(139,92,246,0.3), rgba(6,182,212,0.3))'
              : 'rgba(139,92,246,0.1)',
            border: '1px solid rgba(139,92,246,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.3s',
          }}
        >
          {isDragging
            ? <Film size={36} style={{ color: '#a78bfa' }} strokeWidth={1.5} />
            : <Upload size={36} style={{ color: 'rgba(139,92,246,0.7)' }} strokeWidth={1.5} />
          }
        </div>

        {/* Text */}
        <div className="text-center">
          <p style={{ fontSize: '1.125rem', fontWeight: 600, color: isDragging ? '#a78bfa' : 'rgba(226,232,240,0.85)' }}>
            {isDragging ? 'Release to load video' : 'Drag & drop your video here'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'rgba(226,232,240,0.4)', marginTop: '0.4rem' }}>
            or
          </p>
        </div>

        <button
          type="button"
          className="btn-glow px-5 py-2.5 flex items-center gap-2"
          style={{ fontSize: '0.9rem' }}
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          <FolderOpen size={16} />
          Browse Files
        </button>

        {/* Format badges */}
        <div className="flex flex-wrap justify-center gap-2">
          {FORMATS.map(fmt => (
            <span
              key={fmt}
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '2px 10px',
                borderRadius: '999px',
                background: 'rgba(139,92,246,0.1)',
                border: '1px solid rgba(139,92,246,0.2)',
                color: 'rgba(167,139,250,0.8)',
                letterSpacing: '0.05em',
              }}
            >
              {fmt}
            </span>
          ))}
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap justify-center gap-3">
        {['Canvas extraction', 'Manual Capture', 'ZIP download', 'GIF export', 'Object detection', 'Frame filters'].map(f => (
          <div
            key={f}
            className="glass-card px-4 py-2"
            style={{ fontSize: '0.78rem', color: 'rgba(226,232,240,0.6)' }}
          >
            ✦ {f}
          </div>
        ))}
      </div>
    </div>
  );
}
