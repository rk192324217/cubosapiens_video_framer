/**
 * BackgroundOrbs.jsx
 * Animated gradient orbs behind everything for a premium dark UI feel.
 */
export default function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
      {/* Top-left violet orb */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          left: '-10%',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float1 8s ease-in-out infinite',
        }}
      />
      {/* Top-right cyan orb */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '-15%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float2 10s ease-in-out infinite',
        }}
      />
      {/* Bottom-center pink orb */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '40%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244,114,182,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'float3 12s ease-in-out infinite',
        }}
      />
      <style>{`
        @keyframes float1 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(40px,-30px) scale(1.05); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-30px,40px) scale(1.08); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(20px,-20px) scale(1.04); }
        }
      `}</style>
    </div>
  );
}
