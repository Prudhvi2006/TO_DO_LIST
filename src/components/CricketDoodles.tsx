import React from 'react';

/**
 * Rohit Sharma Fan & Cricket Scrapbook Doodles
 */

export const CricketBallDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#dc2626',
}) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Ball body */}
    <circle cx="16" cy="16" r="13" fill={color} stroke="#082B63" strokeWidth="1.5" />
    {/* White Seam curve 1 */}
    <path
      d="M10 5C14 10 14 22 10 27"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
    />
    {/* White Seam curve 2 */}
    <path
      d="M22 5C18 10 18 22 22 27"
      stroke="#ffffff"
      strokeWidth="1.6"
      strokeDasharray="2 1.5"
      strokeLinecap="round"
    />
    {/* Highlight shine */}
    <path
      d="M13 8C14.5 6.5 17 6 19 6.5"
      stroke="#ffffff"
      strokeWidth="1.2"
      strokeLinecap="round"
      opacity="0.6"
    />
  </svg>
);

export const CricketBatDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-6 h-6',
  color = '#fef08a',
}) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g transform="rotate(-40 18 18)">
      {/* Bat handle grip (Navy blue) */}
      <rect x="16.5" y="2" width="3" height="9" rx="1" fill="#082B63" stroke="#1769E0" strokeWidth="0.8" />
      {/* Handle rubber wrap markings */}
      <line x1="16.5" y1="4.5" x2="19.5" y2="4.5" stroke="#8EC5FF" strokeWidth="0.8" />
      <line x1="16.5" y1="7" x2="19.5" y2="7" stroke="#8EC5FF" strokeWidth="0.8" />
      <line x1="16.5" y1="9.5" x2="19.5" y2="9.5" stroke="#8EC5FF" strokeWidth="0.8" />
      {/* Bat shoulder & blade (English Willow wood) */}
      <path
        d="M15 11C15 10 21 10 21 11L22 30C22 32 20 33 18 33C16 33 14 32 14 30L15 11Z"
        fill={color}
        stroke="#ca8a04"
        strokeWidth="1.2"
      />
      {/* Middle sticker with 45 */}
      <rect x="16" y="16" width="4" height="6" rx="0.5" fill="#1769E0" />
      <text x="18" y="20.5" fontSize="3" fontWeight="bold" fill="#ffffff" textAnchor="middle">45</text>
    </g>
  </svg>
);

export const TrophyDoodle: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Base */}
    <rect x="12" y="30" width="12" height="3" rx="1" fill="#082B63" />
    <rect x="14" y="27" width="8" height="3" fill="#F4C95D" stroke="#082B63" strokeWidth="1" />
    {/* Cup stem */}
    <path d="M16 23V27H20V23" stroke="#082B63" strokeWidth="1.2" fill="#F4C95D" />
    {/* Cup body */}
    <path
      d="M11 9H25V16C25 19.866 21.866 23 18 23C14.134 23 11 19.866 11 16V9Z"
      fill="#F4C95D"
      stroke="#082B63"
      strokeWidth="1.3"
    />
    {/* Cup Handles */}
    <path
      d="M11 11H8C6.5 11 5.5 12.5 5.5 14C5.5 16.5 7.5 18 11 18"
      stroke="#082B63"
      strokeWidth="1.3"
      fill="none"
    />
    <path
      d="M25 11H28C29.5 11 30.5 12.5 30.5 14C30.5 16.5 28.5 18 25 18"
      stroke="#082B63"
      strokeWidth="1.3"
      fill="none"
    />
    {/* Star / 45 on Cup */}
    <circle cx="18" cy="15.5" r="3.5" fill="#1769E0" />
    <text x="18" y="17.5" fontSize="4.5" fontWeight="900" fill="#ffffff" textAnchor="middle">45</text>
  </svg>
);

export const CrownDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-5 h-5',
  color = '#F4C95D',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M3 17L5 7L9 12L12 4L15 12L19 7L21 17H3Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <circle cx="5" cy="6" r="1.2" fill="#1769E0" />
    <circle cx="12" cy="3" r="1.4" fill="#dc2626" />
    <circle cx="19" cy="6" r="1.2" fill="#1769E0" />
    <rect x="3" y="17" width="18" height="2.5" rx="0.5" fill="#082B63" />
  </svg>
);

export const RisingSunDoodle: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Sun half-circle */}
    <path
      d="M12 28C12 21.3726 17.3726 16 24 16C30.6274 16 36 21.3726 36 28H12Z"
      fill="#F4C95D"
      stroke="#d97706"
      strokeWidth="1.5"
    />
    {/* Horizon water line */}
    <path d="M6 28H42" stroke="#1769E0" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M10 32H38" stroke="#8EC5FF" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M15 36H33" stroke="#8EC5FF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Sun Rays */}
    <line x1="24" y1="8" x2="24" y2="12" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="12" x2="16.5" y2="15" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="34" y1="12" x2="31.5" y2="15" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="7" y1="20" x2="11" y2="21.5" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
    <line x1="41" y1="20" x2="37" y2="21.5" stroke="#F4C95D" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const Number45Sticker: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-11 h-11 text-base',
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-[#1769E0] text-white font-extrabold border-2 border-[#F4C95D] shadow-md shadow-blue-900/25 tracking-wider select-none shrink-0 ${sizeClasses[size]} ${className}`}
      title="Jersey 45 - The Hitman"
    >
      <span className="leading-none pt-0.5 font-mono">45</span>
    </div>
  );
};

export const BlueHeartDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#1769E0',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 20.2C12 20.2 3.8 15.5 3.8 9.8C3.8 7 5.9 4.8 8.6 4.8C10.5 4.8 11.6 5.8 12 6.5C12.4 5.8 13.5 4.8 15.4 4.8C18.1 4.8 20.2 7 20.2 9.8C20.2 15.5 12 20.2 12 20.2Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CricketHelmetDoodle: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Helmet shell */}
    <path
      d="M6 18C6 11.3726 11.3726 6 18 6C23 6 27.5 9 28.5 14L28 19C27 21 24 22 20 22H11L6 18Z"
      fill="#1769E0"
      stroke="#082B63"
      strokeWidth="1.5"
    />
    {/* Visor / grill */}
    <path d="M12 18H27" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 21H25" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M16 16V22" stroke="#ffffff" strokeWidth="1.2" />
    <path d="M21 16V22" stroke="#ffffff" strokeWidth="1.2" />
    {/* Peak */}
    <path d="M25 14L30 15L28 17H25V14Z" fill="#082B63" />
  </svg>
);

export const CricketPitchDoodle: React.FC<{ className?: string }> = ({ className = 'w-12 h-6' }) => (
  <svg viewBox="0 0 48 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Pitch rectangle */}
    <rect x="2" y="4" width="44" height="16" rx="2" fill="#fde68a" stroke="#d97706" strokeWidth="1.2" />
    {/* Crease lines */}
    <line x1="10" y1="4" x2="10" y2="20" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="38" y1="4" x2="38" y2="20" stroke="#ffffff" strokeWidth="1.5" />
    {/* Stumps left */}
    <line x1="6" y1="8" x2="6" y2="16" stroke="#082B63" strokeWidth="2" strokeLinecap="round" />
    {/* Stumps right */}
    <line x1="42" y1="8" x2="42" y2="16" stroke="#082B63" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const StarDoodle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-4 h-4',
  color = '#F4C95D',
}) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2L14.9 8.26L21.8 9.27L16.8 14.14L18 21.02L12 17.77L6 21.02L7.2 14.14L2.2 9.27L9.1 8.26L12 2Z"
      fill={color}
      stroke="#082B63"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ANIMATED HITMAN EMOJIS & CARD STICKERS
 */

// 1. Signature Hitman Pull Shot Animation
export const AnimatedHitmanPullShot: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none ${sizeMap[size]} ${className}`}
      title="Rohit Sharma Signature Pull Shot 🏏💥"
    >
      <svg
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-hitman-pull"
      >
        {/* Trajectory motion arc */}
        <path
          d="M18 16C24 10 32 8 36 12"
          stroke="#F4C95D"
          strokeWidth="1.2"
          strokeDasharray="2 2"
          strokeLinecap="round"
          className="opacity-75"
        />
        {/* Batsman Head with Blue Helmet */}
        <circle cx="16" cy="12" r="4.5" fill="#1769E0" stroke="#082B63" strokeWidth="1" />
        <path d="M16 13.5H20" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        
        {/* Body (India Blue Jersey #45) */}
        <path
          d="M13 16.5C13 16.5 14 26 18 26C22 26 21 16.5 21 16.5H13Z"
          fill="#1769E0"
          stroke="#082B63"
          strokeWidth="1"
        />
        {/* #45 on Jersey */}
        <text x="17" y="22" fontSize="4" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">45</text>

        {/* Cricket Bat swinging */}
        <g transform="rotate(35 22 17)">
          <rect x="21" y="8" width="2.2" height="6" rx="0.5" fill="#082B63" />
          <path d="M20 14H24V28C24 29 23 30 22 30C21 30 20 29 20 28V14Z" fill="#F4C95D" stroke="#082B63" strokeWidth="0.8" />
        </g>

        {/* Legs / Pads */}
        <path d="M14.5 26V34L13 36" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M19.5 26V33L22 35" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" />

        {/* Flying Cricket Ball */}
        <circle cx="33" cy="11" r="2.4" fill="#DC2626" stroke="#082B63" strokeWidth="0.8" />
        <path d="M31.5 11C32.5 10 33.5 12 34.5 11" stroke="#FFFFFF" strokeWidth="0.5" />
      </svg>
      {/* Sparkle spark */}
      <span className="absolute -top-0.5 -right-0.5 text-[8px] animate-hitman-twinkle">✨</span>
    </div>
  );
};

// 2. Animated Spinning Cricket Ball
export const AnimatedCricketBall: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`inline-flex items-center justify-center shrink-0 ${className} animate-hitman-spin`} title="Spinning Seam Cricket Ball 🏏">
    <CricketBallDoodle className="w-full h-full" />
  </div>
);

// 3. Animated Bat Swing
export const AnimatedCricketBat: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`inline-flex items-center justify-center shrink-0 ${className} animate-hitman-swing`} title="Hitman English Willow Willow Bat 🏏">
    <CricketBatDoodle className="w-full h-full" />
  </div>
);

// 4. Animated Sixer "6" Explosion Badge
export const AnimatedSixerBadge: React.FC<{ className?: string; text?: string }> = ({
  className = '',
  text = '6',
}) => (
  <div
    className={`inline-flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#1769E0] to-[#082B63] text-white border border-[#F4C95D] shadow-xs animate-hitman-six font-extrabold select-none shrink-0 ${className}`}
    title="MAXIMUM 6! Out of the stadium!"
  >
    <span className="text-[10px] text-[#F4C95D]">💥</span>
    <span className="text-[10px] font-mono font-black tracking-tighter text-[#F4C95D]">{text}</span>
  </div>
);

// 5. Animated Captain Ro Cap
export const AnimatedHitmanCap: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`inline-flex items-center justify-center shrink-0 ${className} animate-hitman-cap`} title="Captain Rohit Cap 🧢">
    <CricketHelmetDoodle className="w-full h-full" />
  </div>
);

// 6. Animated Glowing 45 Jersey Shield
export const AnimatedJersey45Badge: React.FC<{ className?: string; size?: 'sm' | 'md' }> = ({
  className = '',
  size = 'sm',
}) => {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-xs';
  return (
    <div
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-b from-[#1769E0] to-[#082B63] text-white font-black border border-[#F4C95D] shadow-sm select-none shrink-0 animate-hitman-electric ${sizeClasses} ${className}`}
      title="Ro 45 Power Badge ⚡"
    >
      <span className="leading-none pt-0.5 font-mono">45</span>
    </div>
  );
};

// 7. Animated Golden Crown
export const AnimatedHitmanCrown: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`inline-flex items-center justify-center shrink-0 ${className} animate-hitman-float`} title="Leader Rohit Sharma 👑">
    <CrownDoodle className="w-full h-full" />
  </div>
);

// 8. Animated Trophy with Sparkles
export const AnimatedHitmanTrophy: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <div className={`relative inline-flex items-center justify-center shrink-0 ${className} animate-hitman-six`} title="Champion Hitman Trophy 🏆">
    <TrophyDoodle className="w-full h-full" />
    <span className="absolute -top-1 -right-1 text-[8px] animate-hitman-twinkle">⭐</span>
  </div>
);

// 9. Versatile Hitman Card Mini Badge
export type HitmanBadgeType =
  | 'pullshot'
  | 'sixer'
  | 'bat'
  | 'ball'
  | 'jersey'
  | 'cap'
  | 'crown'
  | 'fire'
  | 'trophy'
  | 'strike';

export const HitmanCardMiniBadge: React.FC<{
  type?: HitmanBadgeType;
  className?: string;
  label?: string;
}> = ({ type = 'pullshot', className = '', label }) => {
  switch (type) {
    case 'pullshot':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#EAF4FF] text-[#082B63] border border-[#8EC5FF] font-handwriting text-[11px] font-bold shadow-2xs hover:scale-105 transition-transform ${className}`}
          title="Hitman Signature Pull Shot 🏏"
        >
          <AnimatedHitmanPullShot size="sm" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'sixer':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#FEF9C3] text-[#854D0E] border border-[#FDE047] font-handwriting text-[11px] font-bold shadow-2xs ${className}`}
          title="Maximum Sixer 💥"
        >
          <AnimatedSixerBadge text="6" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'bat':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#EAF4FF] text-[#1769E0] border border-[#8EC5FF] font-handwriting text-[11px] font-bold ${className}`}
          title="Pure Timing 🏏"
        >
          <AnimatedCricketBat className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'ball':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#FFF1F2] text-[#BE123C] border border-[#FECDD3] font-handwriting text-[11px] font-bold ${className}`}
          title="Match Ball 🏏"
        >
          <AnimatedCricketBall className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'jersey':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#EAF4FF] text-[#082B63] border border-[#8EC5FF] font-handwriting text-[11px] font-bold ${className}`}
          title="Jersey #45 ⚡"
        >
          <AnimatedJersey45Badge size="sm" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'cap':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#EAF4FF] text-[#082B63] border border-[#8EC5FF] font-handwriting text-[11px] font-bold ${className}`}
          title="Captain Ro 🧢"
        >
          <AnimatedHitmanCap className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'crown':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-handwriting text-[11px] font-bold ${className}`}
          title="Leader Rohit 👑"
        >
          <AnimatedHitmanCrown className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'trophy':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#FEF9C3] text-[#713F12] border border-[#FDE047] font-handwriting text-[11px] font-bold ${className}`}
          title="Champion Hitman 🏆"
        >
          <AnimatedHitmanTrophy className="w-3.5 h-3.5" />
          {label && <span>{label}</span>}
        </span>
      );
    case 'fire':
      return (
        <span
          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-lg bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] font-handwriting text-[11px] font-bold ${className}`}
          title="Hitman Fire 🔥"
        >
          <span className="text-xs animate-hitman-pull">🔥</span>
          <AnimatedJersey45Badge size="sm" />
          {label && <span>{label}</span>}
        </span>
      );
    default:
      return (
        <span className={`inline-flex items-center gap-1 ${className}`}>
          <AnimatedHitmanPullShot size="sm" />
        </span>
      );
  }
};

// 10. Decorative Animated Emoji Row for Task Cards
export const HitmanCardEmojiRow: React.FC<{
  taskIndex?: number;
  completed?: boolean;
  isAlerting?: boolean;
  className?: string;
}> = ({ taskIndex = 0, completed = false, isAlerting = false, className = '' }) => {
  if (completed) {
    return (
      <div className={`flex items-center gap-1.5 text-xs select-none ${className}`}>
        <AnimatedHitmanTrophy className="w-3.5 h-3.5" />
        <span className="text-[10px] animate-hitman-twinkle">✨</span>
        <AnimatedSixerBadge text="DONE" className="scale-90" />
        <span className="text-[11px] animate-hitman-float">💙</span>
      </div>
    );
  }

  if (isAlerting) {
    return (
      <div className={`flex items-center gap-1.5 text-xs select-none ${className}`}>
        <span className="text-xs animate-hitman-pull">🚨</span>
        <AnimatedCricketBall className="w-3 h-3" />
        <span className="text-[10px] font-handwriting font-bold text-red-600 animate-pulse">
          MATCH POINT
        </span>
      </div>
    );
  }

  // Rotate different delightful animated emojis across cards
  const emojiSets = [
    // Set 0: Pull shot + Ball + 45
    (
      <>
        <AnimatedHitmanPullShot size="sm" />
        <AnimatedCricketBall className="w-3 h-3" />
        <span className="text-[9px] animate-hitman-twinkle">⚡</span>
      </>
    ),
    // Set 1: Bat + Sixer + 45
    (
      <>
        <AnimatedCricketBat className="w-3.5 h-3.5" />
        <AnimatedSixerBadge text="45" className="scale-85" />
        <span className="text-[9px] animate-hitman-float">🏏</span>
      </>
    ),
    // Set 2: Cap + Crown + Ball
    (
      <>
        <AnimatedHitmanCap className="w-3.5 h-3.5" />
        <AnimatedHitmanCrown className="w-3 h-3" />
        <span className="text-[9px] animate-hitman-twinkle">🌟</span>
      </>
    ),
    // Set 3: Jersey 45 + Fire + Ball
    (
      <>
        <AnimatedJersey45Badge size="sm" />
        <span className="text-xs animate-hitman-pull">🔥</span>
        <AnimatedCricketBall className="w-3 h-3" />
      </>
    ),
    // Set 4: Trophy + Bat + Sparkle
    (
      <>
        <AnimatedHitmanTrophy className="w-3 h-3" />
        <AnimatedCricketBat className="w-3 h-3" />
        <span className="text-[9px] animate-hitman-twinkle">✨</span>
      </>
    ),
  ];

  const selectedSet = emojiSets[taskIndex % emojiSets.length];

  return (
    <div className={`flex items-center gap-1 text-xs select-none ${className}`}>
      {selectedSet}
    </div>
  );
};

/**
 * ============================================================================
 * REAL DIE-CUT ROHIT SHARMA STICKERS (FROM OFFICIAL FAN STICKER SHEET)
 * ============================================================================
 * Features:
 * - Pure die-cut white vinyl border with realistic sticker outline
 * - Subtle sticker paper shadow & 3D bevel depth
 * - High-fidelity jersey details, sponsors, bat grips, and trophy
 */

// 1. Trophy Lift Sticker (Mumbai Indians / Champions Trophy)
export const StickerRohitTrophy: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Champion with Trophy 🏆"
  >
    {/* Die-cut white border */}
    <path
      d="M50 8C36 8 28 16 26 26C24 36 28 42 22 48C18 52 16 62 18 72C20 84 32 94 50 94C68 94 80 84 82 72C84 62 82 52 78 48C72 42 76 36 74 26C72 16 64 8 50 8Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Rohit Body in Mumbai Indians Jersey */}
    <path d="M30 46C30 38 70 38 70 46L74 88C74 88 50 92 26 88L30 46Z" fill="#0A3A82" />
    {/* Gold stripes on jersey */}
    <path d="M33 46L36 86" stroke="#F4C95D" strokeWidth="2.5" />
    <path d="M67 46L64 86" stroke="#F4C95D" strokeWidth="2.5" />
    {/* Head & Beard */}
    <circle cx="50" cy="24" r="11" fill="#D4A373" />
    {/* Hair & Cap */}
    <path d="M40 20C40 14 60 14 60 20C60 20 63 17 50 15C37 17 40 20 40 20Z" fill="#1C1917" />
    <path d="M38 18C38 13 62 13 62 18H38Z" fill="#082B63" />
    {/* Beard & Mustache */}
    <path d="M43 27C43 32 57 32 57 27C55 30 45 30 43 27Z" fill="#1C1917" />
    <path d="M46 25C48 26 52 26 54 25" stroke="#1C1917" strokeWidth="1.2" strokeLinecap="round" />
    {/* Smile */}
    <path d="M47 28C48 29.5 52 29.5 53 28" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    {/* Trophy Cup held in front */}
    <g transform="translate(34, 38)">
      {/* Trophy Base */}
      <rect x="7" y="36" width="18" height="6" rx="1.5" fill="#1E293B" />
      <rect x="9" y="32" width="14" height="4" fill="#F4C95D" />
      {/* Stem */}
      <path d="M13 24V32H19V24" fill="#F4C95D" />
      {/* Cup Body */}
      <path d="M4 6H28V16C28 23 22 26 16 26C10 26 4 23 4 16V6Z" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
      {/* Red Ribbons */}
      <path d="M5 8L1 28L6 26L8 32L7 12" fill="#DC2626" />
      <path d="M27 8L31 28L26 26L24 32L25 12" fill="#DC2626" />
      {/* Handles */}
      <path d="M4 10H1C-0.5 10 -0.5 16 4 16" stroke="#EAB308" strokeWidth="2.5" fill="none" />
      <path d="M28 10H31C32.5 10 32.5 16 28 16" stroke="#EAB308" strokeWidth="2.5" fill="none" />
      {/* Star on trophy */}
      <circle cx="16" cy="15" r="3.5" fill="#0A3A82" />
      <text x="16" y="17.5" fontSize="4.5" fontWeight="900" fill="#F4C95D" textAnchor="middle">45</text>
    </g>
    {/* Arms holding trophy */}
    <path d="M30 52L38 58" stroke="#D4A373" strokeWidth="6" strokeLinecap="round" />
    <path d="M70 52L62 58" stroke="#D4A373" strokeWidth="6" strokeLinecap="round" />
    <path d="M30 46L36 54" stroke="#0A3A82" strokeWidth="7" strokeLinecap="round" />
    <path d="M70 46L64 54" stroke="#0A3A82" strokeWidth="7" strokeLinecap="round" />
  </svg>
);

// 2. Wave & Smile Sticker (Practice Kit with Sunglasses on Cap)
export const StickerRohitWave: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Waving Hello 👋"
  >
    {/* Die-cut white border */}
    <path
      d="M50 6C38 6 30 14 26 24C22 34 18 50 18 70C18 84 32 94 50 94C68 94 82 84 82 70C82 50 88 38 82 26C78 18 68 6 50 6Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Body in Light Blue India Practice Gear */}
    <path d="M26 50C26 42 74 42 74 50L76 90C76 90 50 94 24 90L26 50Z" fill="#1EA7E6" />
    {/* Apollo / Dream11 White text strip */}
    <rect x="34" y="60" width="32" height="7" rx="2" fill="#0A3A82" />
    <text x="50" y="65.5" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">apollo</text>
    {/* Head */}
    <circle cx="50" cy="28" r="12" fill="#D4A373" />
    {/* Blue Cap with visor */}
    <path d="M36 24C36 16 64 16 64 24H36Z" fill="#1769E0" />
    <path d="M34 24C44 20 56 20 66 24L62 26H38L34 24Z" fill="#082B63" />
    {/* Sunglasses rested on cap */}
    <rect x="40" y="16" width="9" height="5" rx="1.5" fill="#0284C7" stroke="#082B63" strokeWidth="1" />
    <rect x="51" y="16" width="9" height="5" rx="1.5" fill="#0284C7" stroke="#082B63" strokeWidth="1" />
    <line x1="49" y1="18.5" x2="51" y2="18.5" stroke="#082B63" strokeWidth="1.5" />
    {/* Beard & Mustache */}
    <path d="M42 32C42 38 58 38 58 32C56 36 44 36 42 32Z" fill="#1C1917" />
    <path d="M45 30C47 31 53 31 55 30" stroke="#1C1917" strokeWidth="1.2" strokeLinecap="round" />
    {/* Big warm smile */}
    <path d="M46 33C48 35.5 52 35.5 54 33" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
    {/* Right Arm Waving */}
    <g transform="translate(68, 22)">
      <path d="M2 28L8 16L12 8" stroke="#1EA7E6" strokeWidth="7" strokeLinecap="round" />
      <circle cx="13" cy="6" r="4" fill="#D4A373" />
      {/* Waving Fingers */}
      <line x1="12" y1="3" x2="11" y2="0" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="14" y1="3" x2="14" y2="-1" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="16" y1="4" x2="17" y2="0" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="17" y1="6" x2="19" y2="3" stroke="#D4A373" strokeWidth="1.8" strokeLinecap="round" />
    </g>
  </svg>
);

// 3. Signature Pull Shot Full Body Sticker
export const StickerRohitPullShot: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Signature Hitman Pull Shot 🏏💥"
  >
    {/* Die-cut white border */}
    <path
      d="M48 6C36 6 22 18 16 32C10 46 12 62 20 74C28 86 44 94 62 94C78 94 88 84 92 68C96 52 90 32 78 18C68 8 58 6 48 6Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Blue Helmet */}
    <circle cx="48" cy="20" r="9" fill="#0A3A82" />
    <path d="M46 22H56" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* India Blue Jersey */}
    <path d="M38 28L32 54L58 52L62 28H38Z" fill="#1769E0" />
    {/* INDIA text */}
    <text x="48" y="42" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">INDIA</text>
    {/* Bat swinging across horizontal plane */}
    <g transform="rotate(-32 60 26)">
      <rect x="58" y="10" width="3.5" height="12" rx="1" fill="#082B63" />
      <path d="M56 22H64L65 52C65 54 63 56 60 56C57 56 55 54 55 52L56 22Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.2" />
      <rect x="57" y="30" width="6" height="8" fill="#1769E0" />
      <text x="60" y="36" fontSize="4" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">45</text>
    </g>
    {/* Batting Arms in horizontal extension */}
    <path d="M34 32L48 28L62 24" stroke="#D4A373" strokeWidth="4.5" strokeLinecap="round" />
    {/* White Batting Pads */}
    <path d="M34 54L30 84L26 88" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M34 54L30 84L26 88" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M54 52L60 76L68 82" stroke="#FFFFFF" strokeWidth="5.5" strokeLinecap="round" />
    <path d="M54 52L60 76L68 82" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" />
    {/* Blue Shoes */}
    <rect x="22" y="86" width="10" height="4" rx="2" fill="#1769E0" />
    <rect x="66" y="80" width="10" height="4" rx="2" fill="#1769E0" />
  </svg>
);

// 4. Century Bat-Raise (Standing Tall)
export const StickerRohitBatRaise: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Century Celebration 💯"
  >
    {/* Die-cut white border */}
    <path
      d="M45 4C34 4 24 12 20 24C16 38 18 64 24 78C30 90 46 96 60 94C74 92 84 82 86 68C88 48 84 20 74 10C64 4 54 4 45 4Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Bat held high vertically */}
    <g transform="translate(18, 4)">
      <rect x="8" y="0" width="3.5" height="12" rx="1" fill="#FFFFFF" stroke="#082B63" strokeWidth="1" />
      <path d="M6 12H14L15 42C15 44 13 46 10 46C7 46 5 44 5 42L6 12Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1.2" />
      <rect x="7" y="20" width="6" height="8" fill="#1769E0" />
      <text x="10" y="26" fontSize="4" fontWeight="bold" fill="#FFFFFF" textAnchor="middle">45</text>
    </g>
    {/* Head & Helmet */}
    <circle cx="54" cy="22" r="9" fill="#0A3A82" />
    <path d="M52 24H62" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Body in India Jersey */}
    <path d="M42 30C42 30 68 30 68 30L66 60H40L42 30Z" fill="#1769E0" />
    <text x="53" y="44" fontSize="4" fontWeight="900" fill="#FFFFFF" textAnchor="middle">INDIA</text>
    {/* Right Arm holding bat up */}
    <path d="M42 34L28 16" stroke="#1769E0" strokeWidth="6" strokeLinecap="round" />
    <circle cx="27" cy="14" r="3.5" fill="#FFFFFF" stroke="#082B63" strokeWidth="1" />
    {/* White Batting Pads */}
    <path d="M44 60V88" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
    <path d="M62 60V88" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
    <rect x="40" y="86" width="10" height="4" rx="2" fill="#1769E0" />
    <rect x="58" y="86" width="10" height="4" rx="2" fill="#1769E0" />
  </svg>
);

// 5. Knee Slide Victory Celebration Sticker
export const StickerRohitKneeSlide: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Knee Slide Victory Celebration 🙌"
  >
    {/* Die-cut white border */}
    <path
      d="M50 4C38 4 22 14 18 28C14 42 16 64 26 78C34 88 56 94 72 92C84 90 92 78 92 62C92 44 86 20 74 10C64 4 56 4 50 4Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Both Arms Raised High */}
    <path d="M34 40L22 12" stroke="#EA580C" strokeWidth="6.5" strokeLinecap="round" />
    <path d="M66 40L78 12" stroke="#EA580C" strokeWidth="6.5" strokeLinecap="round" />
    <circle cx="21" cy="10" r="3.5" fill="#D4A373" />
    <circle cx="79" cy="10" r="3.5" fill="#D4A373" />
    {/* Back of Head with Blue Training Cap */}
    <circle cx="50" cy="26" r="9" fill="#0A3A82" />
    {/* Orange & Blue Jersey Back */}
    <path d="M34 36C34 36 66 36 66 36L64 68H36L34 36Z" fill="#1769E0" />
    <path d="M34 36C34 36 66 36 66 36L64 48H36L34 36Z" fill="#EA580C" />
    {/* ROHIT 45 on back */}
    <text x="50" y="44" fontSize="4.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">ROHIT</text>
    <text x="50" y="60" fontSize="11" fontWeight="900" fill="#F97316" textAnchor="middle">45</text>
    {/* Knees Sliding on Ground */}
    <path d="M36 68L22 84L40 86" stroke="#1769E0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M64 68L78 84L60 86" stroke="#1769E0" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    {/* Orange Shoes */}
    <rect x="18" y="82" width="10" height="4" rx="2" fill="#EA580C" />
    <rect x="72" y="82" width="10" height="4" rx="2" fill="#EA580C" />
  </svg>
);

// 6. Jersey #45 Back Profile Walking
export const StickerRohitJersey45Back: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Jersey 45 Stride 💙"
  >
    {/* Die-cut white border */}
    <path
      d="M48 6C36 6 26 16 22 28C18 42 16 68 22 82C28 92 46 96 64 94C78 92 88 80 88 64C88 44 82 18 70 10C60 6 54 6 48 6Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Bat on Shoulder */}
    <g transform="rotate(28 72 26)">
      <rect x="70" y="8" width="3" height="10" fill="#082B63" />
      <path d="M68 18H74V44C74 46 72 48 70 48C68 48 66 46 66 44V18Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
    </g>
    {/* Head & Helmet turned slightly */}
    <circle cx="44" cy="22" r="8.5" fill="#0A3A82" />
    <path d="M42 24H50" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    {/* India Jersey Back */}
    <path d="M32 30C32 30 58 30 58 30L56 62H30L32 30Z" fill="#1769E0" />
    {/* ROHIT & 45 Back Typography */}
    <text x="44" y="38" fontSize="4.5" fontWeight="900" fill="#FDBA74" textAnchor="middle">ROHIT</text>
    <text x="44" y="54" fontSize="13" fontWeight="900" fill="#F97316" textAnchor="middle">45</text>
    {/* Walking legs with white pads */}
    <path d="M34 62L28 88" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
    <path d="M52 62L60 86" stroke="#FFFFFF" strokeWidth="6" strokeLinecap="round" />
    <rect x="24" y="86" width="10" height="4" rx="2" fill="#1769E0" />
    <rect x="56" y="84" width="10" height="4" rx="2" fill="#1769E0" />
  </svg>
);

// 7. Helmet Century Acknowledgment (Dream11 India)
export const StickerRohitHelmetCentury: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Match Winning Milestone 🏏"
  >
    {/* Die-cut white border */}
    <path
      d="M48 6C36 6 22 16 18 30C14 46 16 70 24 82C32 92 52 94 68 92C80 90 90 78 92 60C94 40 86 18 72 10C62 6 54 6 48 6Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Bat held high in Right Hand */}
    <g transform="translate(14, 10)">
      <rect x="6" y="0" width="3" height="12" fill="#082B63" />
      <path d="M4 12H12L13 40C13 42 11 44 9 44C7 44 5 42 5 40L4 12Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
    </g>
    {/* Head with Blue Helmet */}
    <circle cx="56" cy="24" r="10" fill="#0A3A82" />
    <path d="M54 26H64" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* Body in Dream11 India Jersey */}
    <path d="M38 34C38 34 72 34 72 34L70 82H36L38 34Z" fill="#1769E0" />
    <rect x="42" y="44" width="26" height="6" rx="1.5" fill="#082B63" />
    <text x="55" y="48.5" fontSize="3.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">DREAM11</text>
    <text x="55" y="58" fontSize="5.5" fontWeight="900" fill="#FFFFFF" textAnchor="middle">INDIA</text>
    {/* Right Arm raised with bat */}
    <path d="M40 38L24 22" stroke="#1769E0" strokeWidth="6.5" strokeLinecap="round" />
    <circle cx="23" cy="20" r="3.5" fill="#1769E0" stroke="#082B63" strokeWidth="1" />
  </svg>
);

// 8. Mumbai Indians Upper Cut / Slice Shot
export const StickerRohitUpperCut: React.FC<{ className?: string; size?: number }> = ({
  className = '',
  size = 72,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`filter drop-shadow-[0_4px_8px_rgba(8,43,99,0.35)] select-none shrink-0 ${className}`}
    title="Hitman Upper Cut Sixer 🏏"
  >
    {/* Die-cut white border */}
    <path
      d="M50 4C36 4 24 16 18 30C12 46 14 70 24 84C32 94 54 96 70 92C84 88 92 74 92 56C92 36 84 16 70 8C60 4 54 4 50 4Z"
      fill="#FFFFFF"
      stroke="#E2E8F0"
      strokeWidth="2.5"
    />
    {/* Bat lofted over head in upper cut */}
    <g transform="rotate(-40 40 18)">
      <rect x="36" y="2" width="3" height="10" fill="#082B63" />
      <path d="M34 12H42L43 38C43 40 41 42 38 42C35 42 33 40 33 38L34 12Z" fill="#FDE047" stroke="#CA8A04" strokeWidth="1" />
    </g>
    {/* Head & Helmet */}
    <circle cx="48" cy="24" r="9" fill="#0A3A82" />
    <path d="M46 26H56" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
    {/* MI Jersey with Slice sponsor */}
    <path d="M32 34C32 34 66 34 66 34L64 80H30L32 34Z" fill="#0A3A82" />
    <rect x="38" y="48" width="22" height="6" rx="1.5" fill="#F97316" />
    <text x="49" y="52.5" fontSize="4" fontWeight="900" fill="#FFFFFF" textAnchor="middle">slice</text>
    {/* Arms swinging up */}
    <path d="M34 38L42 16" stroke="#0A3A82" strokeWidth="6" strokeLinecap="round" />
    <path d="M64 38L46 16" stroke="#0A3A82" strokeWidth="6" strokeLinecap="round" />
  </svg>
);

/**
 * Smart Unified Real Sticker Component
 */
export type RealStickerPose =
  | 'trophy'
  | 'wave'
  | 'pull_shot'
  | 'bat_raise'
  | 'knee_slide'
  | 'jersey_45_back'
  | 'helmet_century'
  | 'upper_cut';

const STICKER_LIST: RealStickerPose[] = [
  'trophy',
  'pull_shot',
  'wave',
  'knee_slide',
  'bat_raise',
  'jersey_45_back',
  'helmet_century',
  'upper_cut',
];

// Authentic photo metadata for real Rohit Sharma stickers
export interface RohitPhotoStickerConfig {
  id: RealStickerPose;
  title: string;
  badge: string;
  imgUrl: string;
  caption: string;
  accentColor: string;
  badgeBg: string;
  shape: 'circle' | 'shield' | 'polaroid' | 'star' | 'badge';
}

export const ROHIT_PHOTO_STICKERS: Record<RealStickerPose, RohitPhotoStickerConfig> = {
  trophy: {
    id: 'trophy',
    title: 'T20 World Cup Champion',
    badge: 'WORLD CUP CHAMPION 🏆',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Rohit_Sharma_during_the_2019_Cricket_World_Cup.jpg',
    caption: 'Captain Ro lifting the Trophy',
    accentColor: '#F4C95D',
    badgeBg: 'bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-900',
    shape: 'circle',
  },
  pull_shot: {
    id: 'pull_shot',
    title: 'Signature Pull Shot 6',
    badge: 'HITMAN PULL 6 🏏',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg',
    caption: 'Trademark Pull over Mid-Wicket',
    accentColor: '#1769E0',
    badgeBg: 'bg-gradient-to-r from-[#1769E0] to-[#082B63] text-white',
    shape: 'shield',
  },
  wave: {
    id: 'wave',
    title: 'Hitman Wankhede Wave',
    badge: 'HITMAN RO 45 👋',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Rohit_Sharma_2015_%28cropped%29.jpg/640px-Rohit_Sharma_2015_%28cropped%29.jpg',
    caption: 'Saluting the crowd at Wankhede',
    accentColor: '#38BDF8',
    badgeBg: 'bg-gradient-to-r from-sky-500 to-blue-700 text-white',
    shape: 'circle',
  },
  knee_slide: {
    id: 'knee_slide',
    title: 'Victory Roar & Celebration',
    badge: 'MATCH WINNER 🔥',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/1/1d/Rohit_Sharma_during_the_2019_Cricket_World_Cup.jpg',
    caption: 'Winning Mentality & Passion',
    accentColor: '#EF4444',
    badgeBg: 'bg-gradient-to-r from-red-600 to-rose-700 text-white',
    shape: 'badge',
  },
  bat_raise: {
    id: 'bat_raise',
    title: 'Historic 264 & Century Salute',
    badge: 'RECORD 264 ⭐',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg',
    caption: 'Highest Individual Score in ODI History',
    accentColor: '#F59E0B',
    badgeBg: 'bg-gradient-to-r from-amber-400 to-amber-600 text-slate-950',
    shape: 'polaroid',
  },
  jersey_45_back: {
    id: 'jersey_45_back',
    title: 'Captain Ro Team India #45',
    badge: 'ROHIT 45 🇮🇳',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Rohit_Sharma_2023.jpg/640px-Rohit_Sharma_2023.jpg',
    caption: 'Official Team India Leader',
    accentColor: '#082B63',
    badgeBg: 'bg-gradient-to-r from-[#082B63] to-[#1769E0] text-white',
    shape: 'shield',
  },
  helmet_century: {
    id: 'helmet_century',
    title: 'Smile Every Body Smile :)',
    badge: 'SMILE :) 💙',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Rohit_Gurunath_Sharma.jpg/640px-Rohit_Gurunath_Sharma.jpg',
    caption: '"Smile every body smile :)"',
    accentColor: '#0EA5E9',
    badgeBg: 'bg-gradient-to-r from-sky-400 to-blue-600 text-white',
    shape: 'polaroid',
  },
  upper_cut: {
    id: 'upper_cut',
    title: 'Maximum Sixer King',
    badge: 'MAXIMUM 6 ⚡',
    imgUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Rohit_Sharma_Batting.jpg',
    caption: 'Most Sixes in International Cricket',
    accentColor: '#8B5CF6',
    badgeBg: 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white',
    shape: 'circle',
  },
};

/**
 * REAL PHOTOGRAPHIC DIE-CUT STICKER COMPONENT
 * Renders real authentic photos of Rohit Sharma with vinyl borders, peel effects, and badges
 */
export const RealRohitPhotoSticker: React.FC<{
  pose: RealStickerPose;
  size?: number;
  className?: string;
  tilt?: number;
  showBadge?: boolean;
}> = ({ pose, size = 64, className = '', tilt = 0, showBadge = true }) => {
  const [imgError, setImgError] = React.useState(false);
  const config = ROHIT_PHOTO_STICKERS[pose] || ROHIT_PHOTO_STICKERS.trophy;

  const tiltStyle = tilt !== 0 ? { transform: `rotate(${tilt}deg)` } : undefined;

  // Render SVG fallback if image fails
  const renderFallback = () => {
    switch (pose) {
      case 'trophy':
        return <StickerRohitTrophy size={size} />;
      case 'wave':
        return <StickerRohitWave size={size} />;
      case 'pull_shot':
        return <StickerRohitPullShot size={size} />;
      case 'bat_raise':
        return <StickerRohitBatRaise size={size} />;
      case 'knee_slide':
        return <StickerRohitKneeSlide size={size} />;
      case 'jersey_45_back':
        return <StickerRohitJersey45Back size={size} />;
      case 'helmet_century':
        return <StickerRohitHelmetCentury size={size} />;
      case 'upper_cut':
        return <StickerRohitUpperCut size={size} />;
      default:
        return <StickerRohitTrophy size={size} />;
    }
  };

  return (
    <div
      style={tiltStyle}
      className={`inline-block relative group select-none transition-all duration-200 hover:scale-115 hover:z-30 cursor-pointer ${className}`}
      title={`${config.title} - ${config.caption}`}
    >
      {/* Die-Cut Vinyl Sticker Container */}
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`relative overflow-hidden rounded-2xl bg-white border-[3.5px] border-white shadow-[0_6px_16px_rgba(8,43,99,0.28)] ring-1 ring-slate-200/80 transition-shadow group-hover:shadow-[0_10px_25px_rgba(8,43,99,0.38)]`}
      >
        {!imgError ? (
          <>
            {/* Real Rohit Sharma Photo */}
            <img
              src={config.imgUrl}
              alt={`Rohit Sharma - ${config.title}`}
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-108"
            />

            {/* Vinyl Gloss Sheen Streak */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-white/35 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

            {/* Subtle Gradient Shadow at bottom for badge readability */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Golden Star or 45 Watermark Badge on Top-Right */}
            <div className="absolute top-1 right-1 px-1 py-0.2 rounded-md bg-[#082B63]/85 text-[#F4C95D] font-mono font-black text-[8px] sm:text-[9px] border border-[#F4C95D]/60 shadow-xs flex items-center gap-0.5">
              <span>45</span>
              <span className="text-[7px]">★</span>
            </div>
          </>
        ) : (
          renderFallback()
        )}

        {/* Sticker Peel Edge Highlight */}
        <div className="pointer-events-none absolute top-0 left-0 w-2 h-2 bg-gradient-to-br from-white/90 to-transparent rounded-tl-xl" />
      </div>

      {/* Die-Cut Text Banner Badge pinned to bottom */}
      {showBadge && size >= 42 && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap z-10 pointer-events-none">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-mono font-black text-[8px] sm:text-[9px] shadow-sm border border-white tracking-tight ${config.badgeBg}`}
          >
            {config.badge}
          </span>
        </div>
      )}
    </div>
  );
};

export const RealRohitSticker: React.FC<{
  pose?: RealStickerPose;
  index?: number;
  size?: number;
  className?: string;
  tilt?: number;
}> = ({ pose, index, size = 64, className = '', tilt = 0 }) => {
  const selectedPose: RealStickerPose =
    pose || STICKER_LIST[(index ?? 0) % STICKER_LIST.length];

  return (
    <RealRohitPhotoSticker
      pose={selectedPose}
      size={size}
      className={className}
      tilt={tilt}
      showBadge={size >= 44}
    />
  );
};

/**
 * 1 REAL STICKER PER INDIVIDUAL TASK CARD
 * Placed in top-right or corner with slight scrapbook tilt
 */
export const CardStickerBadge: React.FC<{
  taskIndex: number;
  completed?: boolean;
  size?: number;
  className?: string;
}> = ({ taskIndex, completed = false, size = 36, className = '' }) => {
  // Rotate through 8 real photographic stickers
  const poseIndex = completed ? 3 : taskIndex % STICKER_LIST.length;
  const tilts = [-4, 5, -3, 4, -5, 3, -4, 6];
  const tilt = tilts[taskIndex % tilts.length];

  return (
    <div className={`shrink-0 select-none ${className}`}>
      <RealRohitSticker index={poseIndex} size={size} tilt={tilt} />
    </div>
  );
};

/**
 * 2 REAL STICKERS FOR MAIN CARDS (Header Banner, Weekly Match Schedule, Strike Rate, etc.)
 * Perfectly positioned on left & right margins with scrapbook styling
 */
export const MainCardStickers: React.FC<{
  leftPose?: RealStickerPose;
  rightPose?: RealStickerPose;
  size?: number;
  className?: string;
}> = ({
  leftPose = 'trophy',
  rightPose = 'pull_shot',
  size = 68,
  className = '',
}) => {
  return (
    <>
      {/* Left Real Photo Sticker */}
      <div
        className={`absolute -top-3 left-3 sm:left-6 z-20 pointer-events-none hidden xs:block ${className}`}
      >
        <RealRohitSticker pose={leftPose} size={size} tilt={-6} />
      </div>
      {/* Right Real Photo Sticker */}
      <div
        className={`absolute -top-3 right-3 sm:right-6 z-20 pointer-events-none hidden xs:block ${className}`}
      >
        <RealRohitSticker pose={rightPose} size={size} tilt={8} />
      </div>
    </>
  );
};

/**
 * REAL ROHIT SHARMA STICKER ALBUM / FAN SHOWCASE STRIP
 * Displays all 8 real photographic stickers with captions and interactive inspection
 */
export const RohitStickerShowcase: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [selectedSticker, setSelectedSticker] = React.useState<RealStickerPose | null>(null);

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-handwriting font-bold text-[#082B63] flex items-center gap-1.5">
            <span>✨ Rohit Sharma Real Stickers Collection (8 Authentic Poses)</span>
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#EAF4FF] text-[#1769E0] font-bold border border-[#8EC5FF]/80">
            Die-Cut Vinyl 45
          </span>
        </div>
        <span className="text-[11px] font-handwriting text-[#1769E0] font-semibold hidden sm:inline">
          Tap any sticker to inspect 🔍
        </span>
      </div>

      {/* Grid of 8 real photo stickers */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5 sm:gap-3 p-3 bg-white/90 rounded-2xl border-2 border-[#8EC5FF]/60 shadow-xs">
        {STICKER_LIST.map((poseKey, idx) => {
          const cfg = ROHIT_PHOTO_STICKERS[poseKey];
          const isSelected = selectedSticker === poseKey;

          return (
            <button
              key={poseKey}
              type="button"
              onClick={() => setSelectedSticker(isSelected ? null : poseKey)}
              className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer text-center group ${
                isSelected
                  ? 'bg-[#EAF4FF] ring-2 ring-[#1769E0] scale-105 shadow-md'
                  : 'hover:bg-[#F4F9FF] hover:scale-105'
              }`}
              title={`${cfg.title} - ${cfg.caption}`}
            >
              <div className="relative">
                <RealRohitPhotoSticker
                  pose={poseKey}
                  size={48}
                  showBadge={false}
                  tilt={(idx % 2 === 0 ? 1 : -1) * 3}
                />
              </div>
              <span className="text-[10px] font-handwriting font-bold text-[#082B63] truncate w-full block group-hover:text-[#1769E0]">
                {cfg.badge.split(' ')[0]} {cfg.badge.split(' ')[1] || ''}
              </span>
            </button>
          );
        })}
      </div>

      {/* Expanded Sticker Details Card if clicked */}
      {selectedSticker && (
        <div className="p-3.5 bg-[#EAF4FF] rounded-2xl border-2 border-[#8EC5FF] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <RealRohitPhotoSticker pose={selectedSticker} size={64} showBadge={false} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-handwriting font-bold text-base text-[#082B63]">
                  {ROHIT_PHOTO_STICKERS[selectedSticker].title}
                </h4>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${ROHIT_PHOTO_STICKERS[selectedSticker].badgeBg}`}
                >
                  {ROHIT_PHOTO_STICKERS[selectedSticker].badge}
                </span>
              </div>
              <p className="text-xs font-handwriting text-[#1769E0] font-semibold mt-0.5">
                {ROHIT_PHOTO_STICKERS[selectedSticker].caption}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedSticker(null)}
            className="text-xs font-handwriting font-bold px-2.5 py-1 rounded-lg bg-white text-[#082B63] border border-[#8EC5FF] hover:bg-[#D4E9FF] cursor-pointer shrink-0"
          >
            Close ✕
          </button>
        </div>
      )}
    </div>
  );
};



