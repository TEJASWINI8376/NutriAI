import React from 'react';
import {
  Activity,
  Sparkles,
  Pill,
  BookOpen,
  MessageSquare,
  ClipboardList,
  ShieldCheck,
  CheckCircle2,
  Bell,
  Search,
} from 'lucide-react';
import { NutriAILogo } from './NutriAILogo';
import { PatientProfile } from '../types';

export type ScreenId = 'dashboard' | 'scanner' | 'medications' | 'diet-plans' | 'advisor' | 'records';

interface NavbarProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  patient: PatientProfile;
  onOpenQuickScan: () => void;
  pendingMedsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onSelectScreen,
  patient,
  onOpenQuickScan,
  pendingMedsCount,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'dashboard', label: 'Clinical Vitals', icon: Activity },
    { id: 'scanner', label: 'AI Meal Scanner', icon: Sparkles, badge: 'Gemini' },
    { id: 'medications', label: 'Medications & Timeline', icon: Pill, badge: pendingMedsCount > 0 ? pendingMedsCount : undefined },
    { id: 'diet-plans', label: 'Diet Protocols', icon: BookOpen },
    { id: 'advisor', label: 'Clinical Advisor', icon: MessageSquare },
    { id: 'records', label: 'Biomarkers & Lab', icon: ClipboardList },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0] shadow-xs">
      {/* Top Clinical Assurance Bar */}
      <div className="bg-[#0B1C30] text-[#EAF1FF] text-xs py-1.5 px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#86F2E4]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
            CarePulse Clinical Intelligence v4.2
          </span>
          <span className="hidden md:inline text-white/40">|</span>
          <span className="hidden md:inline text-[#94A3B8]">
            Patient: <strong className="text-white font-medium">{patient.name}</strong> ({patient.id})
          </span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="inline-flex items-center gap-1 text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
            Gemini 3.8 AI Online
          </span>
          <span className="text-[#94A3B8] hidden sm:inline">
            Adherence: <span className="text-white font-semibold">92%</span>
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            id="nav-logo-btn"
            onClick={() => onSelectScreen('dashboard')}
            className="flex items-center text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0284C7] rounded-lg p-1 -ml-1"
          >
            <NutriAILogo size="md" />
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}-btn`}
                  onClick={() => onSelectScreen(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#E0F2FE] text-[#0284C7] shadow-xs font-semibold'
                      : 'text-[#64748B] hover:text-[#0B1C30] hover:bg-[#F1F5F9]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#0284C7]' : 'text-[#64748B]'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full leading-tight ${
                        isActive
                          ? 'bg-[#0284C7] text-white'
                          : item.id === 'scanner'
                          ? 'bg-[#ECFDF5] text-[#047857]'
                          : 'bg-[#FEF3C7] text-[#B45309]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2.5">
            {/* Quick AI Food Scan CTA */}
            <button
              id="header-quick-scan-btn"
              onClick={onOpenQuickScan}
              className="flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-semibold px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-[#86F2E4]" />
              <span className="whitespace-nowrap">Scan Meal</span>
            </button>

            {/* Patient Mini Avatar Pill */}
            <button
              id="header-patient-pill"
              onClick={() => onSelectScreen('records')}
              title="View Patient Clinical Record"
              className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-[#F8FAFC] hover:bg-white transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284C7] to-[#0D9488] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                TM
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-bold text-[#0B1C30] leading-tight">Tejaswini M.</span>
                <span className="text-[10px] text-[#0D9488] font-medium flex items-center gap-0.5">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#10B981]" /> Verified Patient
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Scroll */}
        <div className="lg:hidden flex items-center gap-1.5 overflow-x-auto py-2.5 no-scrollbar border-t border-[#F1F5F9]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap font-medium transition-all ${
                  isActive
                    ? 'bg-[#0284C7] text-white font-semibold'
                    : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B1C30]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[9px] px-1 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-white text-[#0B1C30]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
