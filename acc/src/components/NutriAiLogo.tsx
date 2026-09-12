import React from 'react';

export interface NutriAiLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  showCard?: boolean;
  showText?: boolean;
}

export const NutriAiLogo: React.FC<NutriAiLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = false,
  showCard = false,
  showText = true,
}) => {
  // Dimensions for the icon container
  const iconDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  const cardPadding = {
    xs: 'p-1 rounded-xl',
    sm: 'p-1.5 rounded-2xl',
    md: 'p-2 rounded-2xl',
    lg: 'p-3 rounded-3xl',
    xl: 'p-4 rounded-3xl',
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const badgeTextSizes = {
    xs: 'text-[9px] px-1 py-0.2',
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-[11px] px-2 py-0.5',
    lg: 'text-xs px-2.5 py-1',
    xl: 'text-sm px-3 py-1',
  };

  const logoGraphic = (
    <div
      className={`relative flex-shrink-0 ${iconDimensions[size]} transition-transform duration-200 active:scale-95 select-none`}
      aria-label="NutriAi CarePulse Emblem"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-xs overflow-visible"
      >
        <defs>
          {/* Dark Navy Background Gradient */}
          <linearGradient id="nutriBgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0b233a" />
            <stop offset="60%" stopColor="#07192d" />
            <stop offset="100%" stopColor="#031020" />
          </linearGradient>

          {/* Left Lobe (Vivid Green) Gradient */}
          <linearGradient id="greenLobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00e676" />
            <stop offset="45%" stopColor="#00c853" />
            <stop offset="100%" stopColor="#00963e" />
          </linearGradient>

          {/* Right Lobe (Vivid Cyan-Cerulean) Gradient */}
          <linearGradient id="blueLobeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00b4d8" />
            <stop offset="50%" stopColor="#0084ff" />
            <stop offset="100%" stopColor="#0066cc" />
          </linearGradient>

          {/* Soft Node Glow */}
          <radialGradient id="cyanHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00ffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#00c8ff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0084ff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="greenHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#69f0ae" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00e676" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00c853" stopOpacity="0" />
          </radialGradient>

          {/* Verified Badge Shadow */}
          <filter id="badgeShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* 1. Main Dark Rounded Squircle Base */}
        <rect
          x="10"
          y="10"
          width="80"
          height="80"
          rx="24"
          fill="url(#nutriBgGrad)"
          stroke="#1b395a"
          strokeWidth="1"
        />

        {/* 2. Left Leaf Lobe (Green Cell) */}
        <path
          d="M48.5 25.5 C32 28, 22 41, 22 55.5 C22 69, 32 80, 48.5 82.5 Z"
          fill="url(#greenLobeGrad)"
        />

        {/* 3. Right Leaf Lobe (Blue Cell with inner organic contour) */}
        <path
          d="M51.5 25.5 C68 28, 78 41, 78 55.5 C78 69, 68 80, 51.5 82.5 C51.5 73, 56.5 65, 56.5 56 C56.5 45, 51.5 35, 51.5 25.5 Z"
          fill="url(#blueLobeGrad)"
        />

        {/* 4. Neural Circuit Connections & Traces */}
        {/* Left Circuit Lines */}
        <path
          d="M50 42 L34 35"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <path
          d="M50 55 L29 55"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <path
          d="M50 67 L36 74"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        {/* Right Circuit Lines */}
        <path
          d="M50 43 L65 36"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <path
          d="M50 55 L70 55"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />
        <path
          d="M50 66 L64 73"
          stroke="#ffffff"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeOpacity="0.95"
        />

        {/* 5. Central Vertical Spine / Stem */}
        <line
          x1="50"
          y1="23.5"
          x2="50"
          y2="83.5"
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Top Node of Central Stem */}
        <circle cx="50" cy="23.5" r="2.6" fill="#ffffff" />

        {/* 6. Glowing Nodes on Left Side */}
        {/* Upper Left Node */}
        <circle cx="34" cy="35" r="5" fill="url(#greenHalo)" />
        <circle cx="34" cy="35" r="2.3" fill="#ffffff" />

        {/* Mid Left Node */}
        <circle cx="29" cy="55" r="5" fill="url(#greenHalo)" />
        <circle cx="29" cy="55" r="2.3" fill="#ffffff" />

        {/* Lower Left Node */}
        <circle cx="36" cy="74" r="5" fill="url(#greenHalo)" />
        <circle cx="36" cy="74" r="2.3" fill="#ffffff" />

        {/* 7. Glowing Nodes on Right Side */}
        {/* Upper Right Node */}
        <circle cx="65" cy="36" r="5" fill="url(#cyanHalo)" />
        <circle cx="65" cy="36" r="2.3" fill="#ffffff" />

        {/* Mid Right Node */}
        <circle cx="70" cy="55" r="5" fill="url(#cyanHalo)" />
        <circle cx="70" cy="55" r="2.3" fill="#ffffff" />

        {/* Lower Right Node with bright radiant cyan flare */}
        <circle cx="64" cy="73" r="8" fill="url(#cyanHalo)" opacity="0.9" />
        <circle cx="64" cy="73" r="4.5" fill="#00e5ff" opacity="0.6" />
        <circle cx="64" cy="73" r="2.3" fill="#ffffff" />

        {/* 8. Center Node (Ring with mint emerald pupil) */}
        <circle
          cx="50"
          cy="55"
          r="5.2"
          fill="#07192d"
          stroke="#ffffff"
          strokeWidth="2.2"
        />
        <circle cx="50" cy="55" r="2.2" fill="#00ff9d" />

        {/* 9. Certified Healthcare Verified Seal (Top Right Corner) */}
        <g transform="translate(77, 13)" filter="url(#badgeShadow)">
          {/* White border background to pop out from squircle edge */}
          <circle cx="6" cy="6" r="11" fill="#ffffff" />

          {/* Scalloped rosette seal in medical teal */}
          {/* 12-point scalloped starburst rosette */}
          <path
            d="M 6 -4
               L 8.5 -2.5 L 11.5 -3.5 L 12.5 -0.5 L 15.5 1 L 14.5 4 L 16.5 7 L 14 9.5 L 14.5 12.5 L 11.5 13.5 L 10 16.5 L 7 15.5 L 4.5 17.5 L 2.5 15 L -0.5 15.5 L -1.5 12.5 L -4.5 11.5 L -3.5 8.5 L -5.5 6 L -3 3.5 L -3.5 0.5 L -0.5 -0.5 L 1 -3.5 L 4 -2.5 Z"
            fill="#006a61"
          />

          {/* Inner clean white ring */}
          <circle
            cx="6"
            cy="6"
            r="8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.2"
          />

          {/* Center dark teal circle */}
          <circle cx="6" cy="6" r="7" fill="#005a52" />

          {/* Crisp White Checkmark */}
          <path
            d="M 3 6.2 L 5.2 8.4 L 9.2 3.8"
            fill="none"
            stroke="#ffffff"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );

  const wrappedLogo = showCard ? (
    <div
      className={`inline-flex items-center justify-center bg-white shadow-xs border border-[#e2e8f0] ${cardPadding[size]} transition-shadow hover:shadow-md`}
    >
      {logoGraphic}
    </div>
  ) : (
    logoGraphic
  );

  if (!showText) {
    return wrappedLogo;
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {wrappedLogo}

      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span
            className={`font-bold tracking-tight text-[#006194] ${textSizes[size]}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            NutriAi
          </span>
          <span
            className={`font-bold text-[#006a61] rounded-full bg-[#86f2e4]/30 border border-[#006a61]/15 tracking-wide ${badgeTextSizes[size]}`}
          >
            CarePulse
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] text-[#475569] font-medium tracking-normal mt-0.5">
            Clinical Health & Nutrition Intelligence
          </span>
        )}
      </div>
    </div>
  );
};
