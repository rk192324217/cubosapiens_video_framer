/**
 * VideoPlayer.jsx
 * HTML5 video player with metadata overlay.
 */
import { useRef, useState, useEffect } from 'react';
import { Camera, Clock, Film, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

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

export default function VideoPlayer({ videoUrl, videoFile, onFrameCaptured }) {
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

  const handleCapture = () => {
    const v = videoRef.current;
    if (!v) return;

    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    
    const url = canvas.toDataURL('image/jpeg', 0.9);
    const timestamp = v.currentTime.toFixed(2);
    
    onFrameCaptured({
      url,
      name: `capture_${timestamp}s.jpg`,
      id: `manual_${Date.now()}`
    });
    
    toast.success(`Captured frame at ${timestamp}s`);
  };

  if (!videoUrl) return null;

  return (
    <div className="glass-card overflow-hidden">
      {/* Video element */}
      <div className="relative group">
        <video
          ref={videoRef}
          src={videoUrl}
          controls
          preload="metadata"
          id="video-player"
          style={{ width: '100%', display: 'block', maxHeight: '480px', background: '#000' }}
        />
        
        {/* Manual capture overlay button */}
        <button
          onClick={handleCapture}
          className="absolute top-4 right-4 bg-black/60 hover:bg-violet-600 text-white p-2.5 rounded-full backdrop-blur-md border border-white/10 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
          title="Capture current frame"
        >
          <Camera size={20} />
        </button>
      </div>

      {/* Metadata strip */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 p-4 border-top border-white/5 bg-white/[0.02]"
      >
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <MetaItem icon={<Film size={13} />} label="Name" value={videoFile?.name || '—'} />
          <MetaItem icon={<Clock size={13} />} label="Duration" value={formatDuration(duration)} />
          <MetaItem
            icon={<Film size={13} />}
            label="Resolution"
            value={dimensions ? `${dimensions.w}×${dimensions.h}` : '—'}
          />
          <MetaItem icon={<HardDrive size={13} />} label="Size" value={formatSize(videoFile?.size)} />
        </div>
        
        <button 
          onClick={handleCapture}
          className="btn-outline px-4 py-1.5 flex items-center gap-2 text-[0.8rem]"
        >
          <Camera size={14} /> Capture Frame
        </button>
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
