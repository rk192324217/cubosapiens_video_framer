/**
 * FrameGallery.jsx
 * Displays extracted frames in a responsive grid.
 * Includes object detection and per-frame download features.
 */
import { useState, useCallback } from 'react';
import { Download, Scan, Trash2, Maximize2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import '@tensorflow/tfjs';

export default function FrameGallery({ frames, setFrames }) {
  const [selectedFrame, setSelectedFrame] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const handleDelete = useCallback((index) => {
    const newFrames = [...frames];
    newFrames.splice(index, 1);
    setFrames(newFrames);
  }, [frames, setFrames]);

  const handleDownloadSingle = useCallback((frame) => {
    const link = document.createElement('a');
    link.href = frame.url;
    link.download = frame.name || 'frame.jpg';
    link.click();
  }, []);

  const handleDetectObjects = useCallback(async (frame, index) => {
    if (frame.detections) return; // already detected
    
    setDetecting(true);
    toast('Detecting objects...', { icon: '🔍' });

    try {
      const model = await cocoSsd.load();
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = frame.url;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const predictions = await model.detect(img);
      
      const newFrames = [...frames];
      // Store dimensions too so we can calculate relative positions
      newFrames[index] = { 
        ...frame, 
        detections: predictions,
        origW: img.width,
        origH: img.height
      };
      setFrames(newFrames);
      
      if (predictions.length > 0) {
        toast.success(`Found ${predictions.length} objects!`);
      } else {
        toast('No objects detected.', { icon: '⚪' });
      }
    } catch (err) {
      console.error(err);
      toast.error('Detection failed.');
    } finally {
      setDetecting(false);
    }
  }, [frames, setFrames]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'rgba(226,232,240,0.9)' }}>
          Extracted Frames ({frames.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {frames.map((frame, i) => (
          <div key={frame.id || i} className="frame-thumb group relative">
            <img src={frame.url} alt={`Frame ${i}`} className="w-full h-full object-cover" />
            
            {/* Object Detection Overlays */}
            {frame.detections?.map((det, di) => {
              const x = (det.bbox[0] / frame.origW) * 100;
              const y = (det.bbox[1] / frame.origH) * 100;
              const w = (det.bbox[2] / frame.origW) * 100;
              const h = (det.bbox[3] / frame.origH) * 100;
              
              return (
                <div 
                  key={di}
                  className="detection-badge"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    width: `${w}%`,
                    height: `${h}%`,
                    borderWidth: '1px',
                    borderColor: '#22d3ee'
                  }}
                >
                  <span className="detection-label" style={{ fontSize: '0.5rem', top: '-0.8rem' }}>
                    {det.class}
                  </span>
                </div>
              );
            })}

            <div className="frame-label">
              {frame.name || `frame_${String(i+1).padStart(5, '0')}.jpg`}
            </div>

            <div className="frame-overlay">
              <div className="frame-actions">
                <button 
                  onClick={() => setSelectedFrame(frame)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                  title="View full size"
                >
                  <Maximize2 size={16} />
                </button>
                <button 
                  onClick={() => handleDownloadSingle(frame)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                  title="Download frame"
                >
                  <Download size={16} />
                </button>
                <button 
                  onClick={() => handleDetectObjects(frame, i)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white backdrop-blur-sm transition-colors"
                  title="Detect objects"
                  disabled={detecting || !!frame.detections}
                >
                  <Scan size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(i)}
                  className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-lg text-red-200 backdrop-blur-sm transition-colors"
                  title="Remove frame"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Size Modal */}
      {selectedFrame && (
        <div className="modal-backdrop" onClick={() => setSelectedFrame(null)}>
          <div className="modal-content relative p-2" onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedFrame(null)}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white z-10"
            >
              <X size={20} />
            </button>
            <div className="relative">
              <img src={selectedFrame.url} className="max-w-full rounded-lg" alt="Full size frame" />
              {/* Also show detections in modal if available */}
              {selectedFrame.detections?.map((det, di) => (
                <div 
                  key={di}
                  className="detection-badge"
                  style={{
                    left: `${(det.bbox[0] / selectedFrame.origW) * 100}%`,
                    top: `${(det.bbox[1] / selectedFrame.origH) * 100}%`,
                    width: `${(det.bbox[2] / selectedFrame.origW) * 100}%`,
                    height: `${(det.bbox[3] / selectedFrame.origH) * 100}%`,
                  }}
                >
                  <span className="detection-label">{det.class} {Math.round(det.score * 100)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
