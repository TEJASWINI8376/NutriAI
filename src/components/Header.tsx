import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';

interface HeaderProps {
  onBack?: () => void;
  onOpenHistory?: () => void;
  historyCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ onBack, onOpenHistory, historyCount = 0 }) => {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-[#faf8ff]/90 backdrop-blur-xl pt-safe shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-[#eaedff]">
      <div className="h-16 max-w-xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            id="backBtn"
            aria-label="Back"
            className="w-11 h-11 flex items-center justify-center rounded-full text-[#131b2e] hover:bg-[#e2e7ff] active:scale-95 transition-all"
            onClick={onBack}
            type="button"
          >
            <ArrowLeft className="w-6 h-6 text-[#131b2e]" />
          </button>
          <div className="flex items-center gap-2">
            <img
              alt="NutriAI Logo"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnYvgsvVrIbKMYWwMm-OHiQxDEn8Ijzg0TsD-j_c0BlRaNTVttMHLF94qvqoUp166EceRlePJJtHFZbirPi_iVb8dyDyU98eS6WzQ-1ITTUzsPeBzRZ428utVRPxGJg7m04pT8V6CrjhDQp-jI6_hygkWIgU5c4mCwDKabhSfO46enxK25YPbX8oHanM3NLm7HrBrTPyOWH2iBHB7SfoVgM8SfCMJDSJWG9hvB2EyCY90NNZnPij2A"
            />
            <h1 className="font-semibold text-[18px] leading-[24px] text-[#131b2e] tracking-tight">
              Product Inspection Details
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onOpenHistory && (
            <button
              id="historyBtn"
              onClick={onOpenHistory}
              title="Inspection History"
              className="relative p-2 rounded-full text-[#3d4a42] hover:bg-[#e2e7ff] transition-colors"
            >
              <Clock className="w-5 h-5" />
              {historyCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#006948] text-white text-[10px] font-bold flex items-center justify-center">
                  {historyCount}
                </span>
              )}
            </button>
          )}
          <img
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover shadow-[0_2px_6px_rgba(0,0,0,0.08)] ring-1 ring-emerald-500/20"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCYTePcv1xZgqSPswYzQhP8HyU44HZG_Th9s_IBGOy7M_SRfVSP5K3HaTWugilzl9yn8Qcqw64YfNUc5-IVTwfPpkNT26kkhLEvbz6N_mGff78MdnUPLznEdkXcMR0xMeL0Xl_qfibhiNIHxttYm2mIbqmsGsOYPOfjSS0H4LkVhmGGeUNJibVFF4lqYFjytQntE257bQXNv_Hl2Bv9Jl5DrDXxdGGVRQM459SS16ZOY63dVkRm-5Mi"
          />
        </div>
      </div>
    </header>
  );
};
