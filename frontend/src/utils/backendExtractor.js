/**
 * backendExtractor.js
 * Utility for extracting frames using the Node.js + FFmpeg backend.
 * Streams progress via Server-Sent Events (SSE).
 */
import axios from 'axios';

export async function extractFramesBackend({ videoFile, fps, filter, onProgress, onSessionId }) {
  // 1. Upload video
  const formData = new FormData();
  formData.append('video', videoFile);

  const uploadRes = await axios.post('/api/upload', formData, {
    onUploadProgress: (progressEvent) => {
      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(Math.floor(percent / 2), `Uploading video: ${percent}%`);
    }
  });

  const { sessionId } = uploadRes.data;
  onSessionId(sessionId);

  // 2. Start extraction via SSE
  return new Promise((resolve, reject) => {
    const eventSource = new EventSource(`/api/extract/${sessionId}?fps=${fps}`);
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'start') {
        onProgress(50, 'Starting FFmpeg extraction...');
      } else if (data.type === 'progress') {
        // Map 0-100 to 50-95 (since 0-50 was upload)
        const totalProgress = 50 + Math.floor(data.percent * 0.45);
        onProgress(totalProgress, `Extracting frame ${data.frame}...`);
      } else if (data.type === 'done') {
        eventSource.close();
        onProgress(95, 'Fetching frame list...');
        
        // 3. Fetch list of frames
        axios.get(`/api/download/list/${sessionId}`)
          .then(res => {
            const frames = res.data.frames.map(f => ({
              ...f,
              url: `http://localhost:5000${f.url}`, // Absolute URL for frames
              id: `backend_${sessionId}_${f.name}`
            }));
            resolve(frames);
          })
          .catch(reject);
      } else if (data.type === 'error') {
        eventSource.close();
        reject(new Error(data.message));
      }
    };

    eventSource.onerror = (err) => {
      eventSource.close();
      reject(new Error('SSE connection failed.'));
    };
  });
}
