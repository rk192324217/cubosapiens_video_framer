/**
 * ProgressPanel.jsx
 * Animated progress bar with status message during extraction.
 */

export default function ProgressPanel({ progress, statusMsg }) {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'rgba(226,232,240,0.9)' }}>
          Extracting frames…
        </span>
        <span className="gradient-text" style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'Space Grotesk, sans-serif' }}>
          {progress}%
        </span>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      {statusMsg && (
        <p style={{ fontSize: '0.75rem', color: 'rgba(226,232,240,0.45)', fontFamily: 'monospace' }}>
          {statusMsg}
        </p>
      )}
    </div>
  );
}
