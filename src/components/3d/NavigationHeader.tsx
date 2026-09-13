import React from 'react';
import { Sparkles, Scan, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';

interface NavigationHeaderProps {
  currentStage: number; // 1 to 5
  onJumpToStage: (stage: number) => void;
  onOpenScanner: () => void;
  onOpenPortal: () => void;
  onOpenAuth: () => void;
  isAuthenticated: boolean;
  userName?: string;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  currentStage,
  onJumpToStage,
  onOpenScanner,
  onOpenPortal,
  onOpenAuth,
  isAuthenticated,
  userName,
}) => {
  const stageLabels = [
    { num: 1, name: 'Intro' },
    { num: 2, name: 'Patient' },
    { num: 3, name: 'Food Scan' },
    { num: 4, name: 'AI Reasoning' },
    { num: 5, name: 'Decision' },
  ];

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-8 py-3.5 pointer-events-auto">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 p-2 sm:px-5 sm:py-2.5 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/70 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 p-0.5 flex items-center justify-center shadow-xs">
            <img
              src="/nutriai-logo.svg"
              alt="NutriAgent"
              className="w-full h-full object-contain filter invert brightness-200"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-[17px] text-slate-900 tracking-tight">
                Nutri<span className="text-emerald-600">Agent</span>
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                3D Experience
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium hidden md:block">
              Eat Smart. Live Better.
            </p>
          </div>
        </div>

        {/* 5-Stage Step Navigation Pills (Desktop & Tablet) */}
        <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          {stageLabels.map((s) => (
            <button
              key={s.num}
              onClick={() => onJumpToStage(s.num)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                currentStage === s.num
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="text-[10px] opacity-60 mr-1">0{s.num}</span>
              {s.name}
            </button>
          ))}
        </nav>

        {/* Quick App Entry CTAs */}
        <div className="flex items-center gap-2">
          {/* Direct Scanner trigger */}
          <button
            onClick={onOpenScanner}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer active:scale-95"
            title="Launch Interactive Food Inspector"
          >
            <Scan className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Food Inspector</span>
          </button>

          {/* Portal or Auth Button */}
          {isAuthenticated ? (
            <button
              onClick={onOpenPortal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="truncate max-w-[100px]">{userName || 'Patient Portal'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Sign In</span>
              <ArrowRight className="w-3 h-3 ml-0.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
