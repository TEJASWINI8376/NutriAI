import React from 'react';
import { ShieldCheck, Shield } from 'lucide-react';

interface OcrScoreCardProps {
  score: number;
  scoreLabel: string;
  onOpenDetails?: () => void;
}

export const OcrScoreCard: React.FC<OcrScoreCardProps> = ({
  score,
  scoreLabel,
  onOpenDetails,
}) => {
  const strokeDash = `${score.toFixed(1)}, 100`;

  return (
    <section id="ocrScoreCard" className="mt-4 bg-white rounded-xl p-4 shadow-sm flex flex-col gap-4 border border-[#eaedff]">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="font-bold text-[10px] leading-[14px] text-[#3d4a42] uppercase tracking-wider">
            AGGREGATE OCR SCORE
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="font-extrabold text-[28px] leading-[32px] tracking-tight text-[#006948]">
              {score.toFixed(1)}%
            </span>
            <span className="font-semibold text-[12px] text-[#3d4a42]">
              {scoreLabel}
            </span>
          </div>
        </div>

        {/* Visual Accuracy Radial Indicator */}
        <button
          id="radialScoreBtn"
          type="button"
          onClick={onOpenDetails}
          className="relative w-14 h-14 flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          title="Click to view optical fidelity breakdown"
        >
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#e2e7ff]"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
            />
            <path
              className="text-[#006948] transition-all duration-700 ease-out"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeDasharray={strokeDash}
              strokeLinecap="round"
              strokeWidth="3.5"
            />
          </svg>
          <span className="absolute flex items-center justify-center text-[#006948]">
            <ShieldCheck className="w-5 h-5 text-[#006948]" />
          </span>
        </button>
      </div>

      <div
        onClick={onOpenDetails}
        className="flex items-start gap-2.5 bg-[#f2f3ff] rounded-lg p-3 border border-[#eaedff] cursor-pointer hover:bg-[#e8ebff] transition-colors"
      >
        <Shield className="w-5 h-5 text-[#006948] shrink-0 mt-0.5" />
        <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42]">
          <strong className="font-semibold text-[#131b2e]">NutriAI Diagnostic Standard:</strong> We
          never estimate or guess nutritional data. If uncertainty exists, we request quick manual
          verification to maintain clinical safety and personal dietary integrity.
        </p>
      </div>
    </section>
  );
};
