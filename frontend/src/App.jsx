/**
 * App.jsx – Root component
 * Manages global state and orchestrates the main application flow.
 */

import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

import Header from './components/Header';
import DropZone from './components/DropZone';
import VideoPlayer from './components/VideoPlayer';
import ExtractControls from './components/ExtractControls';
import ProgressPanel from './components/ProgressPanel';
import FrameGallery from './components/FrameGallery';
import BackgroundOrbs from './components/BackgroundOrbs';

// ── App States ──────────────────────────────────────────────────────────────
export const APP_STATE = {
  IDLE:        'idle',
  VIDEO_READY: 'video_ready',
  EXTRACTING:  'extracting',
  DONE:        'done',
};

export default function App() {
  // ── Core state ─────────────────────────────────────────────────────────
  const [appState,   setAppState]   = useState(APP_STATE.IDLE);
  const [videoFile,  setVideoFile]  = useState(null);       // File object
  const [videoUrl,   setVideoUrl]   = useState(null);       // ObjectURL
  const [frames,     setFrames]     = useState([]);         // [{url, name, id}]
  const [progress,   setProgress]   = useState(0);          // 0-100
  const [statusMsg,  setStatusMsg]  = useState('');

  // ── Handle video drop/select ────────────────────────────────────────────
  const handleVideoSelected = useCallback((file) => {
    if (!file) return;

    const ALLOWED = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/ogg'];
    if (!ALLOWED.includes(file.type)) {
      toast.error(`Unsupported format: ${file.type || 'unknown'}. Use MP4, WebM, MOV, AVI, or OGV.`);
      return;
    }

    // Clean up previous session
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setFrames([]);
    setProgress(0);
    setStatusMsg('');

    const url = URL.createObjectURL(file);
    setVideoFile(file);
    setVideoUrl(url);
    setAppState(APP_STATE.VIDEO_READY);
    toast.success(`Loaded: ${file.name}`);
  }, [videoUrl]);

  // ── Reset everything ────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoFile(null);
    setVideoUrl(null);
    setFrames([]);
    setProgress(0);
    setStatusMsg('');
    setAppState(APP_STATE.IDLE);
  }, [videoUrl]);

  return (
    <div className="noise relative min-h-screen">
      <BackgroundOrbs />

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-6">
        <Header />

        <main className="mt-8 space-y-6">
          {/* Step 1: Video upload */}
          {appState === APP_STATE.IDLE && (
            <DropZone onVideoSelected={handleVideoSelected} />
          )}

          {/* Steps 2-4: Video loaded */}
          {appState !== APP_STATE.IDLE && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Left: video + gallery */}
              <div className="space-y-6">
                <VideoPlayer 
                  videoUrl={videoUrl} 
                  videoFile={videoFile} 
                  onFrameCaptured={(frame) => setFrames(prev => [frame, ...prev])}
                />

                {appState === APP_STATE.EXTRACTING && (
                  <ProgressPanel progress={progress} statusMsg={statusMsg} />
                )}

                {frames.length > 0 && (
                  <FrameGallery
                    frames={frames}
                    setFrames={setFrames}
                  />
                )}
              </div>

              {/* Right: controls */}
              <div>
                <ExtractControls
                  videoFile={videoFile}
                  videoUrl={videoUrl}
                  appState={appState}
                  setAppState={setAppState}
                  frames={frames}
                  setFrames={setFrames}
                  setProgress={setProgress}
                  setStatusMsg={setStatusMsg}
                  onReset={handleReset}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
