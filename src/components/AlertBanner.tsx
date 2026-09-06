import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AlertBannerProps {
  title?: string;
  badge?: string;
  description?: string;
  isResolved?: boolean;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({
  title,
  badge,
  description,
  isResolved,
}) => {
  if (isResolved || !title) {
    return (
      <div className="mt-3 bg-[#e8f8f0] border border-[#85f8c4]/60 rounded-xl p-4 shadow-sm flex items-start gap-3 transition-all duration-300">
        <div className="w-8 h-8 rounded-full bg-[#006948] flex items-center justify-center shrink-0 text-white shadow-sm mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-white" />
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-[14px] leading-[20px] text-[#005137]">
              All Nutritional Fields Verified
            </h4>
            <span className="bg-white/90 text-[#006948] font-bold text-[10px] leading-[14px] px-2 py-0.5 rounded-full border border-[#006948]/20">
              Optimal Fidelity
            </span>
          </div>
          <p className="font-normal text-[12px] leading-[16px] text-[#005137]/90 mt-0.5">
            Manual correction reconciled with scanned package curvature. Ready for clinical sync.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="attentionAlertBanner" className="mt-3 bg-[#ffdad6] rounded-xl p-4 shadow-sm flex items-start gap-3 border border-[#ba1a1a]/20 transition-all duration-300">
      <div className="w-8 h-8 rounded-full bg-[#ba1a1a] flex items-center justify-center shrink-0 text-white shadow-sm mt-0.5">
        <AlertTriangle className="w-4 h-4 text-white" />
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-[14px] leading-[20px] text-[#93000a]">
            {title}
          </h4>
          {badge && (
            <span className="bg-white/80 text-[#93000a] font-bold text-[10px] leading-[14px] px-2 py-0.5 rounded-full shadow-2xs">
              {badge}
            </span>
          )}
        </div>
        <p className="font-normal text-[12px] leading-[16px] text-[#93000a] mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
};
