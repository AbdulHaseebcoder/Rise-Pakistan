import React from 'react';

/**
 * Microphone-inspired visual motifs providing subtle brand continuity across RISE Pakistan
 */

// 1. Subtle Vintage Microphone Grille Texture (Horizontal Louvers)
export const StudioGrillePattern: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div
    className={`pointer-events-none select-none opacity-20 ${className}`}
    style={{
      backgroundImage: `repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.08) 0px,
        rgba(255, 255, 255, 0.08) 1px,
        transparent 1px,
        transparent 12px
      )`,
    }}
    aria-hidden="true"
  />
);

// 2. Circular Recording Status Motif (Apple/Studio Precision)
export const RecordingIndicator: React.FC<{ label?: string; className?: string }> = ({
  label = 'LIVE ARCHIVE',
  className = '',
}) => (
  <div className={`inline-flex items-center gap-2 text-[11px] font-mono tracking-widest uppercase ${className}`}>
    <span className="relative flex h-2 w-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
    </span>
    <span className="text-neutral-300 font-medium">{label}</span>
  </div>
);

// 3. Restrained Audio Waveform Graphic Motif
export const WaveformMotif: React.FC<{ className?: string; barCount?: number }> = ({
  className = '',
  barCount = 18,
}) => {
  const bars = [14, 28, 42, 68, 92, 54, 32, 76, 100, 84, 60, 40, 72, 88, 50, 30, 20, 10];
  return (
    <div className={`flex items-center gap-[3px] h-6 ${className}`} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => {
        const heightPercent = bars[i % bars.length];
        return (
          <span
            key={i}
            className="w-[2px] rounded-full bg-gradient-to-t from-emerald-500/40 to-emerald-400"
            style={{
              height: `${Math.max(15, heightPercent * 0.75)}%`,
              opacity: 0.5 + (heightPercent / 100) * 0.5,
              animation: `pulse 1.6s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.08).toFixed(2)}s`,
            }}
          />
        );
      })}
    </div>
  );
};

// 4. Subtle Studio Rim Light Glow Accent
export const StudioRimAccent: React.FC<{ position?: 'top-right' | 'top-left' | 'center'; className?: string }> = ({
  position = 'top-right',
  className = '',
}) => {
  const posClasses =
    position === 'top-right'
      ? 'top-0 right-0'
      : position === 'top-left'
      ? 'top-0 left-0'
      : 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2';

  return (
    <div
      className={`absolute ${posClasses} w-[480px] h-[480px] bg-gradient-to-br from-emerald-500/10 via-emerald-950/5 to-transparent rounded-full blur-[130px] pointer-events-none -z-10 ${className}`}
      aria-hidden="true"
    />
  );
};
