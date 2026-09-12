import React from "react";

interface CarePulseLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const CarePulseLogo: React.FC<CarePulseLogoProps> = ({
  className = "",
  size = "md",
}) => {
  const sizeMap = {
    sm: { icon: "w-7 h-7 rounded-lg", text: "text-lg", plus: "w-3.5 h-3.5" },
    md: { icon: "w-9 h-9 rounded-xl", text: "text-xl", plus: "w-4.5 h-4.5" },
    lg: { icon: "w-11 h-11 rounded-2xl", text: "text-2xl", plus: "w-5.5 h-5.5" },
  };

  const s = sizeMap[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Cyan/Teal Rounded Badge with White Medical Cross */}
      <div
        className={`${s.icon} bg-[#008ba3] flex items-center justify-center text-white shadow-sm shadow-cyan-900/15`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={s.plus}
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>

      {/* Brand Wordmark */}
      <span className={`font-bold tracking-tight text-[#006194] font-['Plus_Jakarta_Sans'] ${s.text}`}>
        CarePulse
      </span>
    </div>
  );
};
