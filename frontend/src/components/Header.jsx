/**
 * Header.jsx
 * App header with logo, tagline, and backend-mode toggle.
 */
import { Cpu } from 'lucide-react';
import logo from '../assets/logo.png';

export default function Header() {
  return (
    <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div
          className="animate-pulse-glow"
          style={{
            width: '2.75rem',
            height: '2.75rem',
            borderRadius: '0.75rem',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden',
          }}
        >
          <img src={logo} alt="VideoFramer Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div>
          <h1
            className="gradient-text"
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.625rem', fontWeight: 700, lineHeight: 1.1 }}
          >
            VideoFramer
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'rgba(226,232,240,0.5)', marginTop: '1px' }}>
            Extract · Filter · Download frames from any video
          </p>
        </div>
      </div>

      <div className="hidden sm:block">
        <span className="glass-card px-4 py-2 text-[0.7rem] uppercase tracking-wider text-violet-400 border-violet-500/20">
          Client-Side Only
        </span>
      </div>
    </header>
  );
}
