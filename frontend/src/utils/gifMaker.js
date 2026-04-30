/**
 * gifMaker.js
 * Utility for creating a GIF from a list of frame URLs.
 * Uses gif.js library.
 */
import GIF from 'gif.js';

export async function makeGif(frames, fps) {
  return new Promise((resolve, reject) => {
    try {
      const gif = new GIF({
        workers: 2,
        quality: 10,
        width: 480, // Downscale for GIF performance
        height: 270,
        workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js'
      });

      const delay = (1 / fps) * 1000;
      let loadedCount = 0;

      frames.forEach((frame, index) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = frame.url;
        
        img.onload = () => {
          gif.addFrame(img, { delay });
          loadedCount++;
          
          if (loadedCount === frames.length) {
            gif.on('finished', (blob) => {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `animation_${Date.now()}.gif`;
              link.click();
              resolve(url);
            });
            
            gif.render();
          }
        };

        img.onerror = (err) => {
          console.error(`Failed to load frame ${index}`, err);
          loadedCount++; // skip failed
          if (loadedCount === frames.length) gif.render();
        };
      });
    } catch (err) {
      reject(err);
    }
  });
}
