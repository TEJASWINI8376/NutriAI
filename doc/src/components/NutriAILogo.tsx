import React from "react";

interface NutriAILogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  layout?: "horizontal" | "vertical";
  className?: string;
}

export const NutriAILogo: React.FC<NutriAILogoProps> = ({
  size = "md",
  showText = true,
  layout = "horizontal",
  className = "",
}) => {
  const dimensionMap = {
    sm: {
      iconSize: 30,
      badgeSize: 13,
      fontSize: "text-[16px]",
      gap: layout === "vertical" ? "gap-1.5" : "gap-2.5",
    },
    md: {
      iconSize: 38,
      badgeSize: 16,
      fontSize: "text-[20px]",
      gap: layout === "vertical" ? "gap-2" : "gap-2.5",
    },
    lg: {
      iconSize: 64,
      badgeSize: 24,
      fontSize: "text-[28px]",
      gap: layout === "vertical" ? "gap-3" : "gap-3.5",
    },
    xl: {
      iconSize: 92,
      badgeSize: 32,
      fontSize: "text-[36px]",
      gap: layout === "vertical" ? "gap-4" : "gap-4",
    },
  };

  const current = dimensionMap[size];

  return (
    <div
      className={`inline-flex ${
        layout === "vertical" ? "flex-col items-center justify-center text-center" : "flex-row items-center"
      } ${current.gap} ${className}`}
    >
      {/* NutriAI Icon Container with Verified Rosette Badge */}
      <div className="relative flex items-center justify-center shrink-0">
        {/* Outer White Card Framing matching user's upload */}
        <div
          style={{
            padding: `${Math.max(2, Math.round(current.iconSize * 0.07))}px`,
            borderRadius: `${Math.round(current.iconSize * 0.36)}px`,
          }}
          className="bg-white/90 shadow-[0_3px_12px_rgba(11,28,48,0.08)] border border-[#e5eeff]/80 flex items-center justify-center"
        >
          {/* Dark Squircle Container */}
          <div
            style={{
              width: `${current.iconSize}px`,
              height: `${current.iconSize}px`,
              borderRadius: `${Math.round(current.iconSize * 0.3)}px`,
            }}
            className="relative flex items-center justify-center bg-gradient-to-b from-[#0e2238] via-[#091829] to-[#040c17] shadow-inner overflow-visible p-1"
          >
            {/* Neural Leaf SVG */}
            <svg
              viewBox="0 0 100 100"
              className="w-full h-full"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Green Gradient */}
                <linearGradient id="greenLeaf" x1="12" y1="50" x2="50" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00E676" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>

                {/* Blue Gradient */}
                <linearGradient id="blueLeaf" x1="50" y1="50" x2="88" y2="50" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0077B6" />
                  <stop offset="100%" stopColor="#00B4D8" />
                </linearGradient>

                {/* Radial glow for nodes */}
                <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Left Leaf Lobe (Emerald Green) */}
              <path
                d="M50 14 C28 14 16 34 16 54 C16 70 32 86 50 86 Z"
                fill="url(#greenLeaf)"
                opacity="0.95"
              />

              {/* Right Leaf Lobe (Electric Cyan/Blue) */}
              <path
                d="M50 14 C72 14 84 34 84 54 C84 70 68 86 50 86 Z"
                fill="url(#blueLeaf)"
                opacity="0.95"
              />

              {/* Inner Dark Contour Shadow */}
              <path
                d="M50 14 C48 35 48 65 50 86 C54 75 58 55 50 14 Z"
                fill="#06111f"
                opacity="0.35"
              />

              {/* Neural Synaptic Lines - Left Side */}
              <line x1="28" y1="36" x2="50" y2="40" stroke="#E6FFFA" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <line x1="22" y1="54" x2="50" y2="54" stroke="#E6FFFA" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <line x1="28" y1="72" x2="50" y2="68" stroke="#E6FFFA" strokeWidth="2" strokeLinecap="round" opacity="0.95" />

              {/* Neural Synaptic Lines - Right Side */}
              <line x1="72" y1="36" x2="50" y2="40" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <line x1="78" y1="54" x2="50" y2="54" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <line x1="72" y1="72" x2="50" y2="68" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" opacity="0.95" />

              {/* Center White Neural Axis Stem */}
              <line x1="50" y1="12" x2="50" y2="88" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />

              {/* Synaptic Nodes (Glowing Dots) */}
              <circle cx="50" cy="14" r="3" fill="#FFFFFF" filter="url(#glow)" />
              <circle cx="28" cy="36" r="2.8" fill="#E6FFFA" filter="url(#glow)" />
              <circle cx="22" cy="54" r="3.2" fill="#FFFFFF" filter="url(#glow)" />
              <circle cx="28" cy="72" r="2.8" fill="#E6FFFA" filter="url(#glow)" />

              <circle cx="72" cy="36" r="2.8" fill="#BAE6FD" filter="url(#glow)" />
              <circle cx="78" cy="54" r="3.2" fill="#FFFFFF" filter="url(#glow)" />
              <circle cx="72" cy="72" r="2.8" fill="#BAE6FD" filter="url(#glow)" />

              {/* Center Heart Node (Pulsing Aqua Core) */}
              <circle cx="50" cy="54" r="5.5" fill="#00E676" />
              <circle cx="50" cy="54" r="3.2" fill="#FFFFFF" filter="url(#glow)" />
              <circle cx="50" cy="54" r="1.5" fill="#091524" />
            </svg>
          </div>
        </div>

        {/* Top-Right Scalloped Rosette Verified Badge */}
        <div
          style={{
            width: `${current.badgeSize}px`,
            height: `${current.badgeSize}px`,
            top: `-${Math.round(current.badgeSize * 0.3)}px`,
            right: `-${Math.round(current.badgeSize * 0.3)}px`,
          }}
          className="absolute z-10 flex items-center justify-center drop-shadow-md"
        >
          <svg viewBox="0 0 40 40" className="w-full h-full" fill="none">
            {/* Scalloped rosette seal */}
            <path
              d="M20 2 L22.8 4.2 L26.2 3.8 L28.2 6.7 L31.7 7.7 L32.3 11.2 L35.2 13.5 L34.4 17 L36.6 20 L34.4 23 L35.2 26.5 L32.3 28.8 L31.7 32.3 L28.2 33.3 L26.2 36.2 L22.8 35.8 L20 38 L17.2 35.8 L13.8 36.2 L11.8 33.3 L8.3 32.3 L7.7 28.8 L4.8 26.5 L5.6 23 L3.4 20 L5.6 17 L4.8 13.5 L7.7 11.2 L8.3 7.7 L11.8 6.7 L13.8 3.8 L17.2 4.2 Z"
              fill="#00665b"
            />
            <circle cx="20" cy="20" r="14.5" fill="#008374" stroke="#FFFFFF" strokeWidth="2" />
            {/* White Checkmark */}
            <path
              d="M13.5 20.5 L17.5 24.5 L26.5 15.5"
              stroke="#FFFFFF"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Typography Label */}
      {showText && (
        <span
          className={`font-extrabold tracking-tight text-[#071d37] font-['Plus_Jakarta_Sans'] ${current.fontSize} leading-none select-none`}
        >
          NutriAI
        </span>
      )}
    </div>
  );
};
