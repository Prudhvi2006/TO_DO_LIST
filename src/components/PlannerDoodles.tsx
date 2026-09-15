import React from 'react';

export const CalendarDoodle: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Spiral Rings */}
    <path d="M14 6V12M24 6V12M34 6V12" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
    {/* Notepad Page */}
    <rect
      x="8"
      y="9"
      width="32"
      height="33"
      rx="6"
      fill="#fff7f9"
      stroke="#fda4af"
      strokeWidth="2.2"
    />
    {/* Header banner */}
    <path
      d="M8.5 17.5C8.5 15.5 10 14 12 14H36C38 14 39.5 15.5 39.5 17.5V19.5H8.5V17.5Z"
      fill="#fecdd3"
    />
    {/* Cute Heart in Center */}
    <path
      d="M24 33C24 33 17 28.5 17 25C17 23.3431 18.3431 22 20 22C21.2 22 22.3 22.8 24 24.2C25.7 22.8 26.8 22 28 22C29.6569 22 31 23.3431 31 25C31 28.5 24 33 24 33Z"
      fill="#fb7185"
    />
  </svg>
);

export const HeartDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#f472b6',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 20.2C12 20.2 3.8 15.5 3.8 9.8C3.8 7 5.9 4.8 8.6 4.8C10.5 4.8 11.6 5.8 12 6.5C12.4 5.8 13.5 4.8 15.4 4.8C18.1 4.8 20.2 7 20.2 9.8C20.2 15.5 12 20.2 12 20.2Z"
      fill={color}
      stroke={color}
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SparkleDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#f59e0b',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2.5C12 7.8 7.8 12 2.5 12C7.8 12 12 16.2 12 21.5C12 16.2 16.2 12 21.5 12C16.2 12 12 7.8 12 2.5Z"
      fill={color}
      stroke={color}
      strokeWidth="0.8"
    />
  </svg>
);

export const FlowerDoodle: React.FC<{ className?: string; petalColor?: string; centerColor?: string }> = ({
  className = 'w-5 h-5',
  petalColor = '#fbcfe8',
  centerColor = '#fde047',
}) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="16" cy="8" r="5" fill={petalColor} />
    <circle cx="23.6" cy="13.5" r="5" fill={petalColor} />
    <circle cx="20.7" cy="22.5" r="5" fill={petalColor} />
    <circle cx="11.3" cy="22.5" r="5" fill={petalColor} />
    <circle cx="8.4" cy="13.5" r="5" fill={petalColor} />
    <circle cx="16" cy="16" r="4.5" fill={centerColor} stroke="#eab308" strokeWidth="0.8" />
  </svg>
);

export const BowDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-5',
  color = '#f472b6',
}) => (
  <svg viewBox="0 0 36 26" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Left loop */}
    <path
      d="M18 13C12 7 6 7.5 4.5 10C3 12.5 6 17 18 13Z"
      fill={color}
      fillOpacity="0.85"
      stroke={color}
      strokeWidth="1.2"
    />
    {/* Right loop */}
    <path
      d="M18 13C24 7 30 7.5 31.5 10C33 12.5 30 17 18 13Z"
      fill={color}
      fillOpacity="0.85"
      stroke={color}
      strokeWidth="1.2"
    />
    {/* Left ribbon tail */}
    <path
      d="M16.5 14.5C14 18 10 21.5 7 23C9 20.5 12 17.5 14.5 14"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Right ribbon tail */}
    <path
      d="M19.5 14.5C22 18 26 21.5 29 23C27 20.5 24 17.5 21.5 14"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    {/* Center knot */}
    <ellipse cx="18" cy="13" rx="3" ry="2.6" fill="#fb7185" stroke={color} strokeWidth="1" />
  </svg>
);

export const PencilIllustration: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="rotate(-35 20 20)">
      {/* Eraser */}
      <rect x="17" y="4" width="6" height="5" rx="1.5" fill="#fecdd3" stroke="#f43f5e" strokeWidth="1" />
      {/* Metal ring */}
      <rect x="17" y="9" width="6" height="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
      {/* Pencil body */}
      <rect x="17" y="12" width="6" height="17" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
      {/* Lead tip base */}
      <path d="M17 29L20 36L23 29H17Z" fill="#fed7aa" stroke="#ea580c" strokeWidth="1" />
      {/* Graphite */}
      <path d="M19 33.5L20 36L21 33.5H19Z" fill="#334155" />
    </g>
  </svg>
);

export const WashiTape: React.FC<{
  color?: 'pink' | 'yellow' | 'blue' | 'lavender';
  angle?: number;
  className?: string;
}> = ({ color = 'pink', angle = -4, className = 'w-16 h-4' }) => {
  const bgClasses = {
    pink: 'washi-tape-pink text-pink-700/60',
    yellow: 'washi-tape-yellow text-amber-700/60',
    blue: 'washi-tape-blue text-sky-700/60',
    lavender: 'washi-tape-lavender text-purple-700/60',
  };

  return (
    <div
      className={`rounded-xs opacity-90 transition-transform ${bgClasses[color]} ${className}`}
      style={{
        transform: `rotate(${angle}deg)`,
        clipPath: 'polygon(0% 12%, 4% 0%, 96% 0%, 100% 12%, 97% 88%, 100% 100%, 4% 100%, 0% 88%)',
      }}
    />
  );
};
