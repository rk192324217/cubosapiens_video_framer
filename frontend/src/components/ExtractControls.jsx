/**
 * ExtractControls.jsx
 * Side panel with FPS selector, extraction trigger, filter toggles, and download buttons.
 * Handles both canvas-based (frontend) and FFmpeg-based (backend) extraction.
 */

import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Zap, Download, RefreshCcw, Image, Loader, Sliders, Cpu } from 'lucide-react';
import JSZip from 'jszip';
import { APP_STATE } from '../App';
import { extractFramesCanvas } from '../utils/canvasExtractor';
import { makeGif } from '../utils/gifMaker';

const FPS_OPTIONS = [
  { label: '0.5 fps', value: 0.5 },
  { label: '1 fps',   value: 1   },
  { label: '2 fps',   value: 2   },
  { label: '3 fps',   value: 3   },
  { label: '5 fps',   value: 5   },
  { label: '10 fps',  value: 10  },
  { label: '15 fps',  value: 15  },
  { label: '24 fps',  value: 24  },
];

const FILTERS = [
  { id: 'grayscale',   label: 'Grayscale',    css: 'grayscale(100%)' },
  { id: 'sepia',       label: 'Sepia',        css: 'sepia(80%)' },
  { id: 'invert',      label: 'Invert',       css: 'invert(100%)' },
  { id: 'blur',        label: 'Blur',         css: 'blur(3px)' },
  { id: 'brightness',  label: 'Bright',       css: 'brightness(1.4)' },
  { id: 'contrast',    label: 'High Contrast',css: 'contrast(1.6)' },
  { id: 'saturate',    label: 'Vivid',        css: 'saturate(2)' },
];

export default function ExtractControls({
  videoFile, videoUrl, appState, setAppState,
  frames, setFrames, setProgress, setStatusMsg,
  onReset,
}) {
  const [fps,           setFps]           = useState(1);
  const [activeFilter,  setActiveFilter]  = useState(null);
  const [gifLoading,    setGifLoading]    = useState(false);
  const [zipLoading,    setZipLoading]    = useState(false);

  const isExtracting = appState === APP_STATE.EXTRACTING;

  // ── Start extraction ────────────────────────────────────────────────────
  const handleExtract = useCallback(async () => {
    if (!videoUrl && !videoFile) return;
    setFrames([]);
    setProgress(0);
    setAppState(APP_STATE.EXTRACTING);

    try {
      const videoEl = document.getElementById('video-player');
      if (!videoEl) throw new Error('Video element not found.');
      
      const extractedFrames = await extractFramesCanvas({
        videoEl,
        fps,
        filter: activeFilter ? FILTERS.find(f => f.id === activeFilter) : null,
        onProgress: (p, msg) => {
          setProgress(p);
          if (msg) setStatusMsg(msg);
        },
      });

      setFrames(extractedFrames);
      setProgress(100);
      setStatusMsg(`✓ ${extractedFrames.length} frames extracted`);
      setAppState(APP_STATE.DONE);
      toast.success(`Extracted ${extractedFrames.length} frames!`);
    } catch (err) {
      console.error('[Extract Error]', err);
      toast.error(err.message || 'Extraction failed.');
      setAppState(APP_STATE.VIDEO_READY);
      setProgress(0);
      setStatusMsg('');
    }
  }, [videoUrl, videoFile, fps, activeFilter, setAppState, setFrames, setProgress, setStatusMsg]);

  // ── Download ZIP ────────────────────────────────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (!frames.length) return;
    setZipLoading(true);

    try {
      const zip = new JSZip();
      const folder = zip.folder('frames');

      await Promise.all(
        frames.map(async (frame, i) => {
          const response = await fetch(frame.url);
          const blob     = await response.blob();
          folder.file(frame.name || `frame_${String(i + 1).padStart(5, '0')}.jpg`, blob);
        })
      );

      const content = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
      const link    = document.createElement('a');
      link.href     = URL.createObjectURL(content);
      link.download = `frames_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('ZIP downloaded!');
    } catch (err) {
      toast.error('Failed to create ZIP: ' + err.message);
    } finally {
      setZipLoading(false);
    }
  }, [frames]);

  // ── Export GIF ──────────────────────────────────────────────────────────
  const handleExportGif = useCallback(async () => {
    if (!frames.length) return;
    setGifLoading(true);
    toast('Creating GIF… this may take a moment', { icon: '🎞️' });

    try {
      await makeGif(frames, fps);
      toast.success('GIF exported!');
    } catch (err) {
      toast.error('GIF export failed: ' + err.message);
    } finally {
      setGifLoading(false);
    }
  }, [frames, fps]);

  return (
    <div className="glass-card p-5 space-y-5 sticky top-4">
      {/* Title */}
      <div className="flex items-center gap-2 pb-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Sliders size={16} style={{ color: '#8b5cf6' }} />
        <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Extraction Settings</span>
      </div>

      {/* FPS Selector */}
      <div className="space-y-2">
        <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(226,232,240,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Frame Rate
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {FPS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFps(opt.value)}
              disabled={isExtracting}
              style={{
                padding: '0.5rem 0',
                fontSize: '0.72rem',
                fontWeight: 500,
                borderRadius: '0.5rem',
                cursor: isExtracting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                border: fps === opt.value ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
                background: fps === opt.value ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                color: fps === opt.value ? '#a78bfa' : 'rgba(226,232,240,0.6)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Selector */}
      <div className="space-y-2">
        <label style={{ fontSize: '0.78rem', fontWeight: 500, color: 'rgba(226,232,240,0.6)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          Frame Filter
        </label>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setActiveFilter(null)}
            disabled={isExtracting}
            style={{
              padding: '0.3rem 0.75rem',
              fontSize: '0.7rem',
              fontWeight: 500,
              borderRadius: '999px',
              cursor: isExtracting ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              border: !activeFilter ? '1px solid rgba(139,92,246,0.6)' : '1px solid rgba(255,255,255,0.08)',
              background: !activeFilter ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
              color: !activeFilter ? '#a78bfa' : 'rgba(226,232,240,0.6)',
            }}
          >
            Original
          </button>
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              disabled={isExtracting}
              style={{
                padding: '0.3rem 0.75rem',
                fontSize: '0.7rem',
                fontWeight: 500,
                borderRadius: '999px',
                cursor: isExtracting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                border: activeFilter === f.id ? '1px solid rgba(6,182,212,0.6)' : '1px solid rgba(255,255,255,0.08)',
                background: activeFilter === f.id ? 'rgba(6,182,212,0.15)' : 'rgba(255,255,255,0.04)',
                color: activeFilter === f.id ? '#22d3ee' : 'rgba(226,232,240,0.6)',
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>


      {/* Extract button */}
      <button
        id="extract-btn"
        className="btn-glow w-full py-3 flex items-center justify-center gap-2"
        onClick={handleExtract}
        disabled={isExtracting}
        style={{ fontSize: '0.9rem' }}
      >
        {isExtracting ? (
          <><div className="spinner" /> Extracting…</>
        ) : (
          <><Zap size={16} /> Extract Frames</>
        )}
      </button>

      {/* Download buttons */}
      {frames.length > 0 && (
        <div className="space-y-2 pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            id="download-zip-btn"
            className="btn-glow w-full py-2.5 flex items-center justify-center gap-2"
            onClick={handleDownloadZip}
            disabled={zipLoading || isExtracting}
            style={{ fontSize: '0.875rem' }}
          >
            {zipLoading
              ? <><div className="spinner" /> Building ZIP…</>
              : <><Download size={15} /> Download ZIP ({frames.length})</>
            }
          </button>

          <button
            id="export-gif-btn"
            className="btn-outline w-full py-2.5 flex items-center justify-center gap-2"
            onClick={handleExportGif}
            disabled={gifLoading || isExtracting}
            style={{ fontSize: '0.875rem' }}
          >
            {gifLoading
              ? <><div className="spinner" style={{ borderTopColor: '#a78bfa' }} /> Creating GIF…</>
              : <><Image size={15} /> Export as GIF</>
            }
          </button>

          <button
            id="reset-btn"
            className="btn-outline w-full py-2.5 flex items-center justify-center gap-2"
            onClick={onReset}
            style={{ fontSize: '0.875rem', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(226,232,240,0.5)' }}
          >
            <RefreshCcw size={14} /> Start Over
          </button>
        </div>
      )}
    </div>
  );
}
