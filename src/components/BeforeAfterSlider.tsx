import React, { useState, useRef, useCallback } from 'react';
import { Sparkles, Sliders, CheckCircle2 } from 'lucide-react';

interface BeforeAfterSliderProps {
  originalImage?: string;
  enhancedImage?: string;
  originalLabel?: string;
  enhancedLabel?: string;
  aspectRatio?: string;
  className?: string;
  showBadges?: boolean;
}

export const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  originalImage = '/assets/studio.jpg',
  enhancedImage = '/assets/host.jpg',
  originalLabel = 'SOURCE RAW (WEBCAM)',
  enhancedLabel = 'RISE AI ENHANCED MASTER',
  aspectRatio = 'aspect-[16/10]',
  className = '',
  showBadges = true,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50); // percentage 0 - 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  }, []);

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  return (
    <div className={`relative select-none overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 ${className}`}>
      <div
        ref={containerRef}
        className={`relative w-full ${aspectRatio} overflow-hidden cursor-ew-resize`}
        onMouseDown={(e) => {
          setIsDragging(true);
          handleMove(e.clientX);
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={(e) => {
          setIsDragging(true);
          handleMove(e.touches[0].clientX);
        }}
        onTouchEnd={() => setIsDragging(false)}
        onTouchMove={handleTouchMove}
      >
        {/* Layer 1: Enhanced Image (Background) */}
        <div className="absolute inset-0 w-full h-full">
          <img
            src={enhancedImage}
            alt="Enhanced Studio Master"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter contrast-[1.08] saturate-[1.05] brightness-[1.02]"
          />
          {/* Subtle cinematic vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Layer 2: Original Image (Clipped overlay) */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${sliderPosition}%` }}
        >
          <img
            src={originalImage}
            alt="Original Remote Stream"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover filter blur-[0.4px] contrast-[0.92] brightness-[0.94] grayscale-[15%]"
            style={{ width: containerRef.current?.clientWidth || '100%', maxWidth: 'none' }}
          />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />
        </div>

        {/* Divider Line & Handle */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-emerald-400 shadow-[0_0_12px_rgba(0,166,81,0.8)] z-20 pointer-events-none"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-neutral-900 border-2 border-emerald-400 shadow-xl flex items-center justify-center text-emerald-400">
            <Sliders className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Top Floating Badges */}
        {showBadges && (
          <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none z-10 text-[10px] font-mono tracking-wider">
            <span className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded text-neutral-300 border border-white/10 uppercase">
              {originalLabel}
            </span>
            <span className="bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded text-emerald-300 border border-emerald-500/40 uppercase flex items-center gap-1.5 font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>{enhancedLabel}</span>
            </span>
          </div>
        )}

        {/* Bottom Metadata Guarantee Bar */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-[11px] text-neutral-300 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 z-10 pointer-events-none">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white font-medium">Identity Preserved</span>
            <span className="text-neutral-500">·</span>
            <span className="text-neutral-400 hidden sm:inline">Zero Face Morphing or Deepfake Artifacts</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest hidden md:inline">
            DRAG TO INSPECT
          </span>
        </div>
      </div>
    </div>
  );
};
