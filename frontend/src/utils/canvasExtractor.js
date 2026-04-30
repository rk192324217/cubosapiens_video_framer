/**
 * canvasExtractor.js
 * Utility for extracting frames from a video element using HTML5 Canvas.
 * This runs entirely in the browser.
 */

export async function extractFramesCanvas({ videoEl, fps, filter, onProgress }) {
  return new Promise(async (resolve, reject) => {
    try {
      const duration = videoEl.duration;
      const interval = 1 / fps;
      const totalFrames = Math.floor(duration * fps);
      const extractedFrames = [];

      // Create a canvas for drawing
      const canvas = document.createElement('canvas');
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const ctx = canvas.getContext('2d');

      // Save original time
      const originalTime = videoEl.currentTime;
      videoEl.pause();

      for (let i = 0; i < totalFrames; i++) {
        const time = i * interval;
        videoEl.currentTime = time;

        // Wait for video to seek
        await new Promise((resolveSeek) => {
          const onSeeked = () => {
            videoEl.removeEventListener('seeked', onSeeked);
            resolveSeek();
          };
          videoEl.addEventListener('seeked', onSeeked);
        });

        // Apply filter if any
        if (filter) {
          ctx.filter = filter.css;
        } else {
          ctx.filter = 'none';
        }

        // Draw current frame
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

        // Convert to data URL
        const url = canvas.toDataURL('image/jpeg', 0.85);
        extractedFrames.push({
          url,
          name: `frame_${String(i + 1).padStart(5, '0')}.jpg`,
          id: `canvas_${Date.now()}_${i}`
        });

        // Report progress
        const percent = Math.round(((i + 1) / totalFrames) * 100);
        onProgress(percent, `Processing frame ${i + 1} of ${totalFrames}...`);
      }

      // Restore video time
      videoEl.currentTime = originalTime;
      resolve(extractedFrames);
    } catch (err) {
      reject(err);
    }
  });
}
