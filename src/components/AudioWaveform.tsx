import React from 'react';

interface AudioWaveformProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
  accentColor?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isPlaying = true,
  barCount = 18,
  className = '',
  accentColor = '#00A651',
}) => {
  return (
    <div className={`flex items-center gap-[3px] h-6 ${className}`} aria-hidden="true">
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary base heights for realistic audio envelope
        const heightMultiplier = Math.sin((i / barCount) * Math.PI) * 0.7 + 0.3;
        const animationDelay = `${(i * 0.08) % 1.2}s`;
        const animationDuration = `${0.6 + (i % 5) * 0.15}s`;

        return (
          <span
            key={i}
            className="w-[2.5px] rounded-full transition-all duration-300"
            style={{
              backgroundColor: accentColor,
              height: isPlaying ? `${Math.max(15, heightMultiplier * 100)}%` : '15%',
              animation: isPlaying ? `waveformPulse ${animationDuration} ease-in-out infinite alternate ${animationDelay}` : 'none',
              opacity: isPlaying ? 0.9 : 0.35,
            }}
          />
        );
      })}
      <style>{`
        @keyframes waveformPulse {
          0% { height: 15%; opacity: 0.4; }
          50% { height: 85%; opacity: 1; }
          100% { height: 35%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
