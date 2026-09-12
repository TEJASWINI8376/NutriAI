import React from 'react';

interface NutriAILogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const NutriAILogo: React.FC<NutriAILogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  // Dimensions mapping
  const iconSizes = {
    sm: { box: 'w-8 h-8', badge: 'w-3.5 h-3.5 -top-1 -right-1', text: 'text-lg tracking-tight' },
    md: { box: 'w-11 h-11', badge: 'w-4.5 h-4.5 -top-1.5 -right-1.5', text: 'text-2xl tracking-tight' },
    lg: { box: 'w-16 h-16', badge: 'w-6 h-6 -top-2 -right-2', text: 'text-3xl tracking-tight' },
    xl: { box: 'w-24 h-24', badge: 'w-8 h-8 -top-2.5 -right-2.5', text: 'text-4xl tracking-tight' },
  };

  const current = iconSizes[size];

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* App Icon Container */}
      <div className={`relative ${current.box} flex-shrink-0`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full drop-shadow-sm transition-transform duration-200 hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rounded Dark Squircle Background */}
          <rect
            x="4"
            y="4"
            width="92"
            height="92"
            rx="24"
            fill="#0B1C30"
            stroke="#1E324D"
            strokeWidth="2"
          />

          <defs>
            {/* Emerald Green Gradient for Left Half */}
            <linearGradient id="emeraldLeafGrad" x1="15" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#00E599" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>

            {/* Azure Blue Gradient for Right Half */}
            <linearGradient id="blueLeafGrad" x1="85" y1="15" x2="50" y2="85" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* Radial glow for nodes */}
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Left Leaf Half (Emerald / Sage) */}
          <path
            d="M48 20 C28 24 20 42 20 54 C20 68 32 80 48 84 Z"
            fill="url(#emeraldLeafGrad)"
          />

          {/* Right Leaf Half (Cerulean / Cyan) */}
          <path
            d="M52 20 C72 24 80 42 80 54 C80 68 68 80 52 84 Z"
            fill="url(#blueLeafGrad)"
          />

          {/* Dark inner shadow crease */}
          <path
            d="M48 22 Q42 50 48 78"
            stroke="#052E16"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />
          <path
            d="M52 22 Q58 50 52 78"
            stroke="#082F49"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Central Vertical Spine / Neural Stem */}
          <line
            x1="50"
            y1="18"
            x2="50"
            y2="86"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Neural Axon Horizontal Cross-Connections */}
          {/* Upper branch */}
          <line x1="32" y1="36" x2="50" y2="38" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.9" />
          <line x1="50" y1="38" x2="68" y2="36" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.9" />

          {/* Middle branch */}
          <line x1="26" y1="52" x2="50" y2="52" stroke="#E0F2FE" strokeWidth="2" strokeOpacity="0.95" />
          <line x1="50" y1="52" x2="74" y2="52" stroke="#E0F2FE" strokeWidth="2" strokeOpacity="0.95" />

          {/* Lower branch */}
          <line x1="33" y1="68" x2="50" y2="66" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.9" />
          <line x1="50" y1="66" x2="67" y2="68" stroke="#E0F2FE" strokeWidth="1.5" strokeOpacity="0.9" />

          {/* Synaptic Terminal Nodes (White glowing dots) */}
          {/* Left Nodes */}
          <circle cx="32" cy="36" r="3.2" fill="#FFFFFF" />
          <circle cx="26" cy="52" r="3.6" fill="#FFFFFF" />
          <circle cx="33" cy="68" r="3.2" fill="#FFFFFF" />

          {/* Right Nodes */}
          <circle cx="68" cy="36" r="3.2" fill="#FFFFFF" />
          <circle cx="74" cy="52" r="3.6" fill="#FFFFFF" />
          <circle cx="67" cy="68" r="3.2" fill="#FFFFFF" />

          {/* Central Neural Hub Node with double halo */}
          <circle cx="50" cy="52" r="8" fill="#10B981" fillOpacity="0.4" />
          <circle cx="50" cy="52" r="5.5" fill="#0B1C30" stroke="#00E599" strokeWidth="2" />
          <circle cx="50" cy="52" r="2.8" fill="#FFFFFF" />

          {/* Top terminal bulb */}
          <circle cx="50" cy="19" r="3" fill="#FFFFFF" />
        </svg>

        {/* Top-Right Scalloped Rosette Verified Clinical Badge */}
        <div className={`absolute ${current.badge} z-10 pointer-events-none drop-shadow-md`}>
          <svg viewBox="0 0 32 32" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Scalloped badge background */}
            <path
              d="M16 2L18.8 4.2L22.2 4.4L23.8 7.5L27 8.9L27.2 12.4L29.6 14.9L28.6 18.2L29.8 21.5L27.5 24.1L27.2 27.6L23.8 28.2L21.8 30.8L18.4 29.8L16 31.5L13.6 29.8L10.2 30.8L8.2 28.2L4.8 27.6L4.5 24.1L2.2 21.5L3.4 18.2L2.4 14.9L4.8 12.4L5 8.9L8.2 7.5L9.8 4.4L13.2 4.2L16 2Z"
              fill="#006A61"
              stroke="#FFFFFF"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Inner checkmark */}
            <path
              d="M10 16.5L14 20.5L22 12.5"
              stroke="#FFFFFF"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Brand Wordmark: NutriAI */}
      {showText && (
        <div className="flex flex-col leading-none select-none">
          <span className={`font-bold text-[#0B1C30] ${current.text} font-['Plus_Jakarta_Sans']`}>
            Nutri<span className="text-[#006194]">AI</span>
          </span>
          {size !== 'sm' && (
            <span className="text-[10px] font-semibold text-[#0D9488] uppercase tracking-wider mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
              Clinical Core
            </span>
          )}
        </div>
      )}
    </div>
  );
};
