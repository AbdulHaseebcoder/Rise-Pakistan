import React, { useState } from 'react';

interface RiseLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const RiseLogo: React.FC<RiseLogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className={`flex items-center gap-3.5 select-none ${className}`}>
      {/* Official Circular Badge */}
      <div className={`relative ${sizeClasses} shrink-0 rounded-full overflow-hidden border border-emerald-500/40 bg-black shadow-[0_0_15px_rgba(0,166,81,0.2)] flex items-center justify-center`}>
        {!imageError ? (
          <img
            src="/assets/logo.jpg"
            alt="RISE Pakistan Official Logo Badge"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          /* High-Fidelity SVG Vector Badge Fallback */
          <svg viewBox="0 0 100 100" className="w-full h-full p-0.5">
            {/* Dark Background & Emerald Outer Ring */}
            <circle cx="50" cy="50" r="48" fill="#000000" stroke="#00A651" strokeWidth="3" />
            <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            
            {/* Arched Text Guides */}
            <path id="top-curve" d="M 18,50 A 32,32 0 0,1 82,50" fill="none" />
            <path id="bottom-curve" d="M 82,50 A 32,32 0 0,1 18,50" fill="none" />

            <text fontSize="6.5" fontWeight="bold" fill="#F3F3F1" letterSpacing="1.2">
              <textPath href="#top-curve" startOffset="50%" textAnchor="middle">
                REAL INSPIRING
              </textPath>
            </text>

            <text fontSize="5.2" fontWeight="bold" fill="#F3F3F1" letterSpacing="0.8">
              <textPath href="#bottom-curve" startOffset="50%" textAnchor="middle">
                STORIES &amp; EXPERIENCES
              </textPath>
            </text>

            {/* Central Banner */}
            <rect x="5" y="44" width="90" height="12" rx="6" fill="#00A651" />
            <rect x="6.5" y="45.5" width="87" height="9" rx="4.5" fill="#050505" />
            <text x="26" y="52" fontSize="7" fontWeight="900" fill="#FFFFFF" textAnchor="middle">RISE</text>
            <text x="74" y="52" fontSize="6.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">PAKISTAN</text>

            {/* Center Microphone Silhouette */}
            <g transform="translate(50, 48)">
              {/* Concentric soundwaves */}
              <circle cx="0" cy="0" r="16" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.5" />
              <circle cx="0" cy="0" r="22" fill="none" stroke="rgba(0,166,81,0.3)" strokeWidth="0.5" />
              {/* Vintage Mic */}
              <rect x="-4.5" y="-12" width="9" height="14" rx="4.5" fill="#E2E8F0" />
              <line x1="-3" y1="-8" x2="3" y2="-8" stroke="#1E293B" strokeWidth="0.8" />
              <line x1="-3" y1="-5" x2="3" y2="-5" stroke="#1E293B" strokeWidth="0.8" />
              <line x1="-3" y1="-2" x2="3" y2="-2" stroke="#1E293B" strokeWidth="0.8" />
              {/* Stand */}
              <path d="M -5.5,-4 A 5.5,5.5 0 0,0 5.5,-4" fill="none" stroke="#CBD5E1" strokeWidth="1" />
              <line x1="0" y1="1.5" x2="0" y2="7" stroke="#CBD5E1" strokeWidth="1.2" />
              <ellipse cx="0" cy="8" rx="6" ry="1.5" fill="#94A3B8" />
            </g>
          </svg>
        )}
      </div>

      {/* Typography Brand Lockup */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="font-display font-black text-base md:text-lg tracking-tight text-white leading-none">
            RISE
          </span>
          <span className="font-display font-light text-base md:text-lg tracking-wider text-emerald-400 leading-none">
            PAKISTAN
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-medium mt-1">
            Real Inspiring Stories &amp; Experiences
          </span>
        )}
      </div>
    </div>
  );
};
