import React from 'react';

interface AppLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  subtitle?: string;
  variant?: 'solid' | 'glow' | 'minimal';
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 'md',
  className = '',
  showWordmark = false,
  wordmarkClassName = '',
  subtitle = 'real-time workspace',
  variant = 'glow',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', px: 24, radius: 6 },
    sm: { box: 'w-8 h-8', px: 32, radius: 8 },
    md: { box: 'w-9 h-9', px: 36, radius: 10 },
    lg: { box: 'w-11 h-11', px: 44, radius: 12 },
    xl: { box: 'w-14 h-14', px: 56, radius: 15 },
    '2xl': { box: 'w-20 h-20', px: 80, radius: 20 },
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      {/* Visual Badge Icon */}
      <div
        className={`relative ${dim.box} shrink-0 group transition-transform duration-200 hover:scale-105`}
        style={{ filter: variant === 'glow' ? 'drop-shadow(0 4px 12px rgba(37, 99, 235, 0.28))' : undefined }}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            {/* Background Primary Gradient */}
            <linearGradient id="logoBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="45%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>

            {/* Inner Sheen Gradient */}
            <linearGradient id="logoSheen" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.15" />
            </linearGradient>

            {/* Check-Bolt Accent Gradient (Electric Amber / Coral into Radiant Gold) */}
            <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="70%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>

            {/* Checkmark Ribbon Accent (Pure Crisp White to Icy Cyan) */}
            <linearGradient id="checkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#E0F2FE" />
            </linearGradient>

            {/* Ambient Shadow Filter */}
            <filter id="innerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.35" />
            </filter>
          </defs>

          {/* Squircle Outer Base */}
          <rect
            x="1.5"
            y="1.5"
            width="45"
            height="45"
            rx="13"
            fill="url(#logoBgGrad)"
          />

          {/* Subtle Bevel Highlight Stroke */}
          <rect
            x="1.5"
            y="1.5"
            width="45"
            height="45"
            rx="13"
            stroke="url(#logoSheen)"
            strokeWidth="1.5"
          />

          {/* Background Geometric Grid Dot matrix (Modern High-Tech Aesthetic) */}
          <circle cx="11" cy="11" r="1" fill="#FFFFFF" fillOpacity="0.25" />
          <circle cx="37" cy="11" r="1" fill="#FFFFFF" fillOpacity="0.25" />
          <circle cx="11" cy="37" r="1" fill="#FFFFFF" fillOpacity="0.25" />
          <circle cx="37" cy="37" r="1" fill="#FFFFFF" fillOpacity="0.25" />

          {/* Primary Task & Momentum Glyph */}
          <g filter="url(#innerGlow)">
            {/* Dynamic Precision Checkmark Loop */}
            <path
              d="M13 25.5L19.5 32L35 16.5"
              stroke="url(#checkGrad)"
              strokeWidth="4.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Electric Energy Spark Overlap (Momentum / Real-Time Pulse) */}
            <path
              d="M27 12L19.5 24H27.5L24 36L34.5 22H27L30 12H27Z"
              fill="url(#boltGrad)"
            />
          </g>

          {/* Top-Right Ambient Star Sparkle */}
          <path
            d="M34 9L34.8 11.2L37 12L34.8 12.8L34 15L33.2 12.8L31 12L33.2 11.2L34 9Z"
            fill="#FFFFFF"
            fillOpacity="0.85"
          />
        </svg>
      </div>

      {/* Optional Wordmark */}
      {showWordmark && (
        <div className={`flex flex-col ${wordmarkClassName}`}>
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
              TO_DO_LIST
            </h2>
            <span className="px-1.5 py-0.5 rounded-md bg-blue-50 text-[10px] font-bold text-blue-600 border border-blue-200/60 uppercase tracking-wider">
              PRO
            </span>
          </div>
          {subtitle && (
            <span className="text-[11px] font-medium text-slate-500 tracking-wide mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
