import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  HeartPulse,
  Pill,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Scan,
  User,
  Activity,
  Layers,
  ChevronDown,
  Lock,
  Leaf,
  Flame,
  Wheat,
  Scale,
  Mail,
  Key,
  UserPlus,
  Loader2,
  Check,
} from 'lucide-react';
import { NutriScene3D } from './NutriScene3D';
import { api } from '../../../loginpage/src/api.ts';
import type { User as AuthUser } from '../../../loginpage/src/types.ts';

interface ScrollJourneyProps {
  onOpenScanner: () => void;
  onOpenPortal: () => void;
  onOpenAuth: () => void;
  onLoginSuccess?: (user: AuthUser) => void;
  isAuthenticated?: boolean;
  userName?: string;
}

export const ScrollJourney: React.FC<ScrollJourneyProps> = ({
  onOpenScanner,
  onOpenPortal,
  onOpenAuth,
  onLoginSuccess,
  isAuthenticated = false,
  userName,
}) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });

  // Stage 5 interactive Sign In / Sign Up state
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authIdentifier, setAuthIdentifier] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [forceAuthForm, setForceAuthForm] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (!authIdentifier.trim()) {
      setAuthError('Please enter your email or phone number.');
      return;
    }
    if (!authPassword.trim()) {
      setAuthError('Please enter your password.');
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === 'login') {
        const res = await api.login(authIdentifier, authPassword);
        setAuthSuccess('Authenticated successfully! Redirecting...');
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else {
          onOpenPortal();
        }
      } else {
        const res = await api.register({
          name: authFullName.trim() || undefined,
          email: authIdentifier.includes('@') ? authIdentifier : `${authIdentifier.replace(/\D/g, '')}@nutriai.patient`,
          phone: authIdentifier,
          password: authPassword,
        });
        setAuthSuccess('Account created and verified! Redirecting...');
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        } else {
          onOpenPortal();
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Mouse Parallax listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMouseOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll listener tracking 0 to 1
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const rect = scrollContainerRef.current.getBoundingClientRect();
      const totalScrollable = rect.height - window.innerHeight;
      if (totalScrollable <= 0) return;
      const current = Math.max(0, -rect.top);
      const p = Math.max(0, Math.min(1, current / totalScrollable));
      setScrollProgress(p);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Compute active stage (1 to 5)
  const currentStage =
    scrollProgress < 0.20 ? 1 :
    scrollProgress < 0.42 ? 2 :
    scrollProgress < 0.62 ? 3 :
    scrollProgress < 0.80 ? 4 : 5;

  const jumpToStage = (stageNum: number) => {
    if (!scrollContainerRef.current) return;
    const totalHeight = scrollContainerRef.current.scrollHeight - window.innerHeight;
    const targetMap: Record<number, number> = {
      1: 0,
      2: 0.28,
      3: 0.50,
      4: 0.70,
      5: 0.95,
    };
    const targetP = targetMap[stageNum] ?? ((stageNum - 1) / 4);
    window.scrollTo({
      top: targetP * totalHeight,
      behavior: 'smooth',
    });
  };

  // Rock-solid stage interpolation with guaranteed 100% solid opacity plateau windows
  const getStageTransform = (stageIndex: number) => {
    // STAGE 1: INTRO HERO (0% to 20%)
    if (stageIndex === 1) {
      if (scrollProgress <= 0.15) {
        return {
          opacity: 1,
          transform: 'translateY(0px) scale(1)',
          pointerEvents: 'auto' as const,
          zIndex: 20,
        };
      } else if (scrollProgress <= 0.22) {
        const factor = (0.22 - scrollProgress) / 0.07;
        return {
          opacity: Math.max(0, Math.min(1, factor)),
          transform: `translateY(${(1 - factor) * -25}px) scale(${0.96 + factor * 0.04})`,
          pointerEvents: factor > 0.4 ? ('auto' as const) : ('none' as const),
          zIndex: 20,
        };
      } else {
        return {
          opacity: 0,
          transform: 'translateY(-30px) scale(0.96)',
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
    }

    // STAGE 2: REAL PHONE SCANNING PRODUCT (18% to 42%)
    if (stageIndex === 2) {
      if (scrollProgress < 0.16 || scrollProgress > 0.44) {
        return {
          opacity: 0,
          transform: `translateY(${scrollProgress < 0.16 ? 30 : -30}px) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let factor = 1;
      if (scrollProgress < 0.22) {
        factor = (scrollProgress - 0.16) / 0.06;
      } else if (scrollProgress > 0.38) {
        factor = (0.44 - scrollProgress) / 0.06;
      }
      const clamped = Math.max(0, Math.min(1, factor));
      return {
        opacity: clamped,
        transform: `translateY(${(1 - clamped) * (scrollProgress < 0.22 ? 25 : -25)}px) scale(${0.95 + clamped * 0.05})`,
        pointerEvents: clamped > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 3: REAL PHONE SCANNING + PATIENT PROFILE & CLINICAL TELEMETRY (38% to 64%)
    if (stageIndex === 3) {
      if (scrollProgress < 0.36 || scrollProgress > 0.64) {
        return {
          opacity: 0,
          transform: `translateY(${scrollProgress < 0.36 ? 30 : -30}px) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let factor = 1;
      if (scrollProgress < 0.42) {
        factor = (scrollProgress - 0.36) / 0.06;
      } else if (scrollProgress > 0.58) {
        factor = (0.64 - scrollProgress) / 0.06;
      }
      const clamped = Math.max(0, Math.min(1, factor));
      return {
        opacity: clamped,
        transform: `translateY(${(1 - clamped) * (scrollProgress < 0.42 ? 25 : -25)}px) scale(${0.95 + clamped * 0.05})`,
        pointerEvents: clamped > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 4: AI AGENT REASONING ENGINE (58% to 82%)
    if (stageIndex === 4) {
      if (scrollProgress < 0.58 || scrollProgress > 0.82) {
        return {
          opacity: 0,
          transform: `translateY(${scrollProgress < 0.58 ? 30 : -30}px) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let factor = 1;
      if (scrollProgress < 0.64) {
        factor = (scrollProgress - 0.58) / 0.06;
      } else if (scrollProgress > 0.76) {
        factor = (0.82 - scrollProgress) / 0.06;
      }
      const clamped = Math.max(0, Math.min(1, factor));
      return {
        opacity: clamped,
        transform: `translateY(${(1 - clamped) * (scrollProgress < 0.64 ? 25 : -25)}px) scale(${0.95 + clamped * 0.05})`,
        pointerEvents: clamped > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 5: FINAL SLIDE — LOGIN / CREATE ACCOUNT (76% to 100%)
    if (stageIndex === 5) {
      if (scrollProgress < 0.76) {
        return {
          opacity: 0,
          transform: 'translateY(30px) scale(0.95)',
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      const factor = Math.max(0, Math.min(1, (scrollProgress - 0.76) / 0.08));
      return {
        opacity: factor,
        transform: `translateY(${(1 - factor) * 20}px) scale(${0.96 + factor * 0.04})`,
        pointerEvents: factor > 0.2 ? ('auto' as const) : ('none' as const),
        zIndex: 30,
      };
    }

    return { opacity: 0, transform: 'translateY(0px)', pointerEvents: 'none' as const, zIndex: 0 };
  };

  // Stage 4 timeline animation steps
  const agentTimelineProgress = Math.max(0, Math.min(1, (scrollProgress - 0.6) / 0.2));
  const timelineSteps = [
    { label: 'Extracting optical diagnostic nutrition panel...', threshold: 0.15 },
    { label: 'Cross-verifying against FDA & Open Food Facts databases...', threshold: 0.35 },
    { label: 'Analyzing patient conditions: Type 2 Diabetes & Hypertension...', threshold: 0.55 },
    { label: 'Checking drug-nutrient interactions with Lisinopril & Metformin...', threshold: 0.75 },
    { label: 'Formulating clinical safety decision & dietary recommendations...', threshold: 0.92 },
  ];

  return (
    <div
      ref={scrollContainerRef}
      className="relative w-full bg-gradient-to-b from-[#ffffff] via-[#f4fcf7] to-[#eef9f2] text-slate-900 overflow-x-hidden"
      style={{ height: '520vh' }}
    >
      {/* 1. Three.js Background WebGL Canvas (stays fixed z-0) */}
      <NutriScene3D scrollProgress={scrollProgress} />

      {/* 2. Fixed Viewport Container Housing the 5-Stage Story Arc (guaranteed locked in viewport) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 px-4 sm:px-8">
        <div className="relative w-full max-w-7xl h-full flex items-center justify-center">

          {/* ============================================================== */}
          {/* STAGE 1: NUTRIAGENT INTRO — CLEAN HERO & FEATURE HIGHLIGHTS    */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-8 text-center transition-all duration-300 pointer-events-none"
            style={getStageTransform(1)}
          >
            {/* Centered Hero Text Container — Big, bold, impactful typography */}
            <div
              className="w-full text-center z-20 pointer-events-auto max-w-4xl mx-auto"
              style={{
                transform: `translate3d(${mouseOffset.x * 8}px, ${mouseOffset.y * 8}px, 0)`,
              }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-emerald-100 border-2 border-emerald-400 shadow-md mb-6">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#004d34]" />
                </span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#003824]">
                  AI-Powered Nutrition & Health Intelligence
                </span>
              </div>

              {/* Dominant Large Hero Headline */}
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl xl:text-[5.8rem] font-black text-[#002f1f] tracking-tight leading-[1.04] mb-5 font-sans drop-shadow-sm">
                Eat Smart. <span className="text-[#047857]">Live Better.</span>
              </h1>

              {/* Large, High-Contrast Supporting Subtitle */}
              <p className="text-xl sm:text-2xl lg:text-[1.7rem] text-[#0f172a] font-extrabold max-w-4xl mx-auto mb-8 leading-relaxed">
                Personalized nutrition and health intelligence, powered by AI.
              </p>

              {/* 3 Clinical Intelligence Feature Cards — Larger text and icons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8 text-left">
                <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-200/90 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Scan className="w-5 h-5 text-[#006948]" />
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">Optical Food Scan</h4>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    Real-time camera OCR extracts complex nutrition panels & ingredients in 60 FPS.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-200/90 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                      <HeartPulse className="w-5 h-5 text-[#006948]" />
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">Clinical EHR Cross-Check</h4>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    Cross-analyzes sodium, sugars, and allergens against your diagnosed medical conditions.
                  </p>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-200/90 shadow-sm hover:border-emerald-400 transition-all flex flex-col justify-between">
                  <div className="flex items-center gap-3 mb-2.5">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
                      <Pill className="w-5 h-5 text-[#006948]" />
                    </div>
                    <h4 className="text-sm sm:text-base font-black text-slate-900">Rx Drug Safety</h4>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed">
                    Automated safety validation with your active prescriptions to prevent adverse reactions.
                  </p>
                </div>
              </div>

              {/* Subtle Animated Scroll Cue with Larger Text */}
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-emerald-50/95 border-2 border-emerald-300 shadow-xs text-xs sm:text-sm font-black text-[#004d34]">
                <ChevronDown className="w-5 h-5 text-[#006948] animate-bounce" />
                <span>Scroll down to experience 3D optical scan journey</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 2: REALISTIC TILTED PHONE SCANNING THE LABEL (20% - 40%) */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col justify-between max-w-6xl mx-auto px-4 py-5 sm:py-8 transition-all duration-300 pointer-events-none"
            style={getStageTransform(2)}
          >
            {/* Top Scanning Header */}
            <div className="w-full text-center max-w-2xl mx-auto z-20 pointer-events-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 text-xs sm:text-sm font-black uppercase text-[#003824] border-2 border-emerald-400 mb-2.5 shadow-xs">
                <Scan className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948]" />
                Step 2: Real-Time Optical Food Scan
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#002f1f] tracking-tight">
                Product & Label Analysis
              </h2>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-2 max-w-xl mx-auto">
                Your smartphone camera frames and scans the package nutrition facts with active laser OCR.
              </p>
            </div>

            {/* Bottom Live Scan Telemetry HUD Bar (Framing the 3D Package on Left & 3D Phone on Right) */}
            <div className="w-full max-w-4xl mx-auto z-20 pointer-events-auto pb-4">
              <div className="p-3.5 sm:p-4 rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_10px_35px_rgba(0,77,52,0.14)] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 text-xs sm:text-sm font-black text-[#003824]">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#006948]" />
                  </span>
                  <span>Active 3D Optical Scan: Nature's Harvest Organic Trail Mix</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono font-black">
                  <span className="bg-emerald-50 text-[#004d34] px-2.5 py-1 rounded-lg border border-emerald-300">140 kcal</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2.5 py-1 rounded-lg border border-emerald-300">45mg Sodium</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2.5 py-1 rounded-lg border border-emerald-300">6g Sugars</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2.5 py-1 rounded-lg border border-emerald-300">4g Protein</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 3: REAL PHONE SCANNING + PATIENT PROFILE (40% - 60%)     */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between max-w-6xl mx-auto px-4 py-5 sm:py-8 transition-all duration-300 pointer-events-none"
            style={getStageTransform(3)}
          >
            {/* Top Stage Header */}
            <div className="text-center max-w-2xl mx-auto z-20 pointer-events-auto">
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-100 text-xs sm:text-sm font-black uppercase text-[#003824] border-2 border-emerald-400 mb-2 shadow-xs">
                <Activity className="w-4 h-4 text-[#006948]" />
                Step 3: Real Phone Scanning Meets Patient Health Profile
              </span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#002f1f] tracking-tight">
                Live Clinical Telemetry Cross-Check
              </h2>
              <p className="text-sm sm:text-base font-bold text-slate-800 mt-1 max-w-xl mx-auto">
                Your phone directly checks the scanned food against Eleanor's conditions and active prescriptions.
              </p>
            </div>

            {/* Main Stage 3 Grid: 3D Product & Phone on Left + Patient Health Record Card on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-center my-auto pointer-events-auto z-20">
              
              {/* LEFT / CENTER: Clear viewport space showcasing 3D Package & 3D Phone with AR Telemetry Badge */}
              <div className="lg:col-span-6 flex flex-col justify-center items-start pl-2 sm:pl-6 pointer-events-none">
                <div className="pointer-events-auto p-4 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-emerald-300 shadow-md max-w-sm space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-[#006948]" />
                    <span className="text-xs font-black text-[#003824] uppercase tracking-wider">3D Clinical Telemetry</span>
                  </div>
                  <p className="text-xs font-bold text-slate-700 leading-relaxed">
                    Smartphone camera optical sensor is continuously cross-referencing package nutrition data with Eleanor's clinical record.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] font-mono font-bold text-[#004d34]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Lisinopril &amp; Metformin: SAFE</span>
                  </div>
                </div>
              </div>

              {/* RIGHT: Patient Electronic Health Record (EHR) Card */}
              <div className="lg:col-span-6 space-y-3.5">
                {/* Patient Vitals & Identification */}
                <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_15px_40px_rgba(0,77,52,0.12)]">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-[#003824] flex items-center justify-center font-black text-base shadow-xs">
                        EV
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-base">Eleanor Vance</h3>
                        <p className="text-xs font-bold text-slate-600">MRN: #NTR-94281 • Age 42 • Female</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 border-2 border-emerald-300 text-[#004d34] text-xs font-black">
                      EHR Active
                    </span>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[10px] text-slate-600 font-bold block uppercase">Blood Pressure</span>
                      <span className="font-black text-slate-900 text-sm">132/84</span>
                      <span className="text-[10px] font-bold text-amber-700 block">Stage 1 HTN</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[10px] text-slate-600 font-bold block uppercase">Heart Rate</span>
                      <span className="font-black text-slate-900 text-sm">72 bpm</span>
                      <span className="text-[10px] font-bold text-emerald-700 block">Normal Sinus</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[10px] text-slate-600 font-bold block uppercase">Fasting Glucose</span>
                      <span className="font-black text-slate-900 text-sm">114 mg/dL</span>
                      <span className="text-[10px] font-bold text-blue-700 block">HbA1c 6.8%</span>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions & Clinical Targets */}
                <div className="p-5 rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_15px_40px_rgba(0,77,52,0.12)]">
                  <div className="flex items-center gap-2 mb-3">
                    <HeartPulse className="w-5 h-5 text-[#006948]" />
                    <h4 className="font-black text-slate-900 text-sm">Clinical Profile & Prescriptions</h4>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-950 border-2 border-amber-300 text-xs font-black">
                      Hypertension
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-blue-100 text-blue-950 border-2 border-blue-300 text-xs font-black">
                      Type 2 Diabetes
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-100 text-[#003824] border-2 border-emerald-300 text-xs font-black">
                      Low Sodium Protocol (&lt;1500mg)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#006948]" />
                        <span className="font-black text-xs text-slate-900">Lisinopril</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">10mg / daily</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 border-2 border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-[#006948]" />
                        <span className="font-black text-xs text-slate-900">Metformin</span>
                      </div>
                      <span className="text-[11px] font-bold text-slate-600">500mg / BID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Step Indicator */}
            <div className="text-center z-20">
              <p className="text-xs font-black text-[#004d34]">
                Scroll down to see the AI Multi-Agent reasoning engine in Step 4 →
              </p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 4: AI AGENT REASONING ENGINE (60% - 80%)                 */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 py-6 transition-all duration-300 pointer-events-none"
            style={getStageTransform(4)}
          >
            <div className="w-full max-w-3xl mx-auto pointer-events-auto z-20">
              {/* Header */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-xs font-black uppercase text-[#003824] border-2 border-emerald-400 mb-2 shadow-xs">
                  <Layers className="w-4 h-4 text-[#006948]" />
                  Step 4: AI Multi-Agent Reasoning Pipeline
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#002f1f] tracking-tight">
                  Autonomous Clinical Verification
                </h2>
                <p className="text-xs sm:text-sm font-bold text-slate-800 mt-1">
                  Watch NutriAgent's clinical models analyze nutrient ratios, contraindications, and patient vitals in real time.
                </p>
              </div>

              {/* Multi-Agent Reasoning Card */}
              <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 sm:p-7 shadow-[0_25px_60px_-10px_rgba(0,77,52,0.22)] border-2 border-emerald-300">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#006948]" />
                    <h4 className="text-base font-black text-slate-900">Clinical Verification Pipeline</h4>
                  </div>
                  <span className="text-xs font-black text-[#004d34] bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    Running Multi-Agent Synthesis
                  </span>
                </div>

                {/* Timeline Checklist */}
                <div className="space-y-3">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = agentTimelineProgress >= step.threshold;
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${
                          isCompleted
                            ? 'bg-emerald-50/90 border-emerald-400 text-[#003824]'
                            : 'bg-slate-50/80 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                              isCompleted ? 'bg-[#006948] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                          </div>
                          <span className={`text-xs font-black ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-[10px] font-mono font-black text-[#004d34] bg-emerald-200/80 px-2 py-0.5 rounded-full shrink-0">
                            VERIFIED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 5: FINAL SLIDE — LOGIN / CREATE ACCOUNT                 */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex items-center justify-center max-w-6xl mx-auto px-4 py-4 pointer-events-auto z-30 transition-all duration-300"
            style={getStageTransform(5)}
          >
            {/* Scrollable Container so everything fits on any screen height */}
            <div className="w-full max-h-[92vh] overflow-y-auto modal-scroll pr-1 pb-6">
              
              {/* Header */}
              <div className="text-center mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-xs sm:text-sm font-black uppercase text-[#003824] border-2 border-emerald-400 mb-2 shadow-xs">
                  <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948]" />
                  Final Step: Get Started with NutriAgent
                </span>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#002f1f] tracking-tight leading-[1.1] mb-2">
                  Personalize Your Nutrition Intelligence
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 mt-2 max-w-2xl mx-auto">
                  Log in or create your account to unlock continuous clinical food decisions and health profile tracking.
                </p>
              </div>

              {/* Centered NutriAgent Login / Create Account Card */}
              <div className="max-w-lg sm:max-w-xl md:max-w-2xl w-full mx-auto">
                <div
                  className="bg-white/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[36px] p-7 sm:p-10 shadow-[0_30px_70px_-10px_rgba(0,77,52,0.25)] border-2 border-emerald-300 flex flex-col justify-between"
                  style={{
                    transform: `perspective(1000px) rotateY(${mouseOffset.x * 2}deg) rotateX(${mouseOffset.y * 2}deg)`,
                  }}
                >
                  {/* Brand Header: Logo + NutriAgent title + Tagline */}
                  <div>
                    <div className="flex items-center gap-4 mb-4 pb-4 border-b border-emerald-200">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                        <Leaf className="w-7 h-7 sm:w-8 sm:h-8 text-[#006948]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#004d34] tracking-tight">
                            NutriAgent
                          </h3>
                          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-700 bg-slate-100 px-3 py-1 rounded-full border border-slate-300">
                            <Lock className="w-3.5 h-3.5 text-[#006948]" />
                            <span>HIPAA</span>
                          </div>
                        </div>
                        <p className="text-sm sm:text-base font-black text-[#059669]">
                          Welcome to NutriAgent
                        </p>
                        <p className="text-xs sm:text-sm font-bold text-slate-700">
                          Eat Smart. Live Better.
                        </p>
                      </div>
                    </div>

                    {/* Authenticated banner if already signed in, but allow switching to login / signup anytime! */}
                    {isAuthenticated && !forceAuthForm ? (
                      <div className="space-y-4 my-3">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-xs sm:text-sm font-black uppercase text-[#004d34] border-2 border-emerald-300 shadow-xs">
                          <Check className="w-4 h-4 text-[#006948]" />
                          Patient Session Active
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          Signed In: {userName || 'Eleanor Vance'}
                        </h4>
                        <p className="text-sm sm:text-base font-medium text-slate-700 leading-relaxed">
                          Your medical records and biometric profiles are securely connected to the clinical engine.
                        </p>

                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2.5">
                          <div className="flex justify-between text-sm sm:text-base">
                            <span className="text-slate-600 font-bold">Record Number:</span>
                            <span className="font-black text-slate-900 font-mono">#NTR-94281</span>
                          </div>
                          <div className="flex justify-between text-sm sm:text-base">
                            <span className="text-slate-600 font-bold">Attending Physician:</span>
                            <span className="font-black text-[#004d34]">Dr. Sarah Jenkins, MD</span>
                          </div>
                        </div>

                        <div className="space-y-3 pt-2">
                          <button
                            onClick={onOpenPortal}
                            className="w-full h-13 sm:h-14 rounded-2xl bg-[#006948] hover:bg-[#005238] active:scale-98 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <User className="w-5 h-5" />
                            <span>Open Patient Portal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setForceAuthForm(true)}
                            className="w-full h-12 sm:h-13 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                          >
                            <UserPlus className="w-4 h-4 text-[#006948]" />
                            <span>Sign In With Different Account / Create Account</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Interactive Login / Create Account Form */
                      <div>
                        {/* Mode Toggle Tabs: Login vs Create Account */}
                        <div className="flex p-1.5 rounded-2xl bg-slate-100 border-2 border-slate-200 mb-5 text-sm sm:text-base font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('login');
                              setAuthError('');
                            }}
                            className={`flex-1 py-3 sm:py-3.5 rounded-xl transition-all cursor-pointer text-center text-sm sm:text-base ${
                              authMode === 'login'
                                ? 'bg-[#006948] text-white shadow-md font-black'
                                : 'text-slate-700 hover:text-slate-900 font-extrabold'
                            }`}
                          >
                            Login
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('register');
                              setAuthError('');
                            }}
                            className={`flex-1 py-3 sm:py-3.5 rounded-xl transition-all cursor-pointer text-center text-sm sm:text-base ${
                              authMode === 'register'
                                ? 'bg-[#006948] text-white shadow-md font-black'
                                : 'text-slate-700 hover:text-slate-900 font-extrabold'
                            }`}
                          >
                            Create Account
                          </button>
                        </div>

                        {/* Clean Standard Login / Register Form */}
                        <form onSubmit={handleAuthSubmit} className="space-y-4">
                          {authMode === 'register' && (
                            <div>
                              <label className="block text-xs sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1.5">
                                Full Name
                              </label>
                              <div className="relative">
                                <User className="w-5 h-5 text-[#006948] absolute left-3.5 top-3.5 sm:top-4" />
                                <input
                                  type="text"
                                  value={authFullName}
                                  onChange={(e) => setAuthFullName(e.target.value)}
                                  placeholder="e.g. Eleanor Vance"
                                  className="w-full h-12 sm:h-13 pl-11 pr-4 rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1.5">
                              Email or Phone Number
                            </label>
                            <div className="relative">
                              <Mail className="w-5 h-5 text-[#006948] absolute left-3.5 top-3.5 sm:top-4" />
                              <input
                                type="text"
                                value={authIdentifier}
                                onChange={(e) => setAuthIdentifier(e.target.value)}
                                placeholder="Enter email or phone number"
                                className="w-full h-12 sm:h-13 pl-11 pr-4 rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1.5">
                              Password
                            </label>
                            <div className="relative">
                              <Key className="w-5 h-5 text-[#006948] absolute left-3.5 top-3.5 sm:top-4" />
                              <input
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-12 sm:h-13 pl-11 pr-4 rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-sm sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {authError && (
                            <div className="p-3 rounded-2xl bg-red-50 text-red-900 text-xs sm:text-sm font-bold border-2 border-red-300 flex items-center gap-2.5">
                              <AlertTriangle className="w-5 h-5 shrink-0 text-red-600" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {authSuccess && (
                            <div className="p-3 rounded-2xl bg-emerald-50 text-[#004d34] text-xs sm:text-sm font-black border-2 border-emerald-300 flex items-center gap-2.5">
                              <Check className="w-5 h-5 shrink-0 text-[#006948]" />
                              <span>{authSuccess}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full h-13 sm:h-14 mt-2 rounded-2xl bg-[#006948] hover:bg-[#005238] active:scale-98 text-white font-black text-sm sm:text-base shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {authLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin text-white" />
                            ) : authMode === 'login' ? (
                              <>
                                <span>Login to NutriAgent</span>
                                <ArrowRight className="w-5 h-5" />
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-5 h-5" />
                                <span>Create Account & Start</span>
                              </>
                            )}
                          </button>

                          {isAuthenticated && forceAuthForm && (
                            <button
                              type="button"
                              onClick={() => setForceAuthForm(false)}
                              className="w-full text-center text-xs sm:text-sm font-bold text-slate-600 hover:text-slate-900 pt-1 cursor-pointer"
                            >
                              ← Return to active session ({userName || 'Eleanor'})
                            </button>
                          )}
                        </form>
                      </div>
                    )}
                  </div>

                  {/* Sub-Footer note */}
                  <p className="text-xs sm:text-sm font-bold text-slate-600 text-center mt-4 flex items-center justify-center gap-2 pt-3 border-t border-slate-100">
                    <ShieldCheck className="w-4 h-4 text-[#006948]" />
                    <span>Healthy choices. Powered by AI.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Floating Stage Progress Tracker */}
      <div className="fixed bottom-6 inset-x-0 mx-auto w-fit z-40 px-4 py-2 rounded-full bg-white/95 backdrop-blur-xl border-2 border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-3 pointer-events-auto">
        <span className="text-[11px] font-black text-[#004d34] uppercase tracking-wider hidden sm:block">
          Step 0{currentStage} / 05
        </span>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => jumpToStage(i)}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                currentStage === i ? 'w-7 bg-[#006948]' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
              }`}
              title={`Jump to Stage ${i}`}
            />
          ))}
        </div>
        <button
          onClick={() => {
            if (currentStage < 5) jumpToStage(currentStage + 1);
            else jumpToStage(1);
          }}
          className="text-xs font-black text-[#006948] hover:text-[#005238] flex items-center gap-1 cursor-pointer"
        >
          <span>{currentStage < 5 ? 'Next' : 'Restart'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
