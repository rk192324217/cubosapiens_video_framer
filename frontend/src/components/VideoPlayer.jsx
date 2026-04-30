/**
 * VideoPlayer.jsx
 * HTML5 video player with metadata overlay.
 */
import { useRef, useState, useEffect } from 'react';
import { Clock, Film, HardDrive } from 'lucide-react';

function formatDuration(secs) {
  if (!secs || isNaN(secs)) return '--:--';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);
  return h > 0
    ? `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`
    : `${m}:${String(s).padStart(2,'0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;
}

export default function VideoPlayer({ videoUrl, videoFile }) {
  const videoRef = useRef(null);
  const [duration, setDuration] = useState(null);
  const [dimensions, setDimensions] = useState(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onMeta = () => {
      setDuration(v.duration);
      setDimensions({ w: v.videoWidth, h: v.videoHeight });
    };
    v.addEventListener('loadedmetadata', onMeta);
    return () => v.removeEventListener('loadedmetadata', onMeta);
  }, [videoUrl]);

  if (!videoUrl) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Video element */}
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        preload="metadata"
        id="video-player"
        style={{ width: '100%', display: 'block', maxHeight: '420px', background: '#000' }}
      />

      {/* Metadata strip */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.25rem',
          padding: '0.875rem 1.25rem',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <MetaItem icon={<Film size={13} />} label="Name" value={videoFile?.name || '—'} />
        <MetaItem icon={<Clock size={13} />} label="Duration" value={formatDuration(duration)} />
        <MetaItem
          icon={<Film size={13} />}
          label="Resolution"
          value={dimensions ? `${dimensions.w}×${dimensions.h}` : '—'}
        />
        <MetaItem icon={<HardDrive size={13} />} label="Size" value={formatSize(videoFile?.size)} />
      </div>
    </div>
  );
}

function MetaItem({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ color: 'rgba(139,92,246,0.7)' }}>{icon}</span>
      <span style={{ fontSize: '0.72rem', color: 'rgba(226,232,240,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {label}
      </span>
      <span style={{ fontSize: '0.8rem', color: 'rgba(226,232,240,0.8)', fontWeight: 500, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {value}
      </span>
    </div>
  );
}
