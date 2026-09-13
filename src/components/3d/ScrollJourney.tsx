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

  // RAF-based smooth scroll interpolation loop (cinema-grade exponential dampening)
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const totalScrollable = scrollContainerRef.current.scrollHeight - window.innerHeight;
      if (totalScrollable <= 0) return;
      const p = Math.max(0, Math.min(1, window.scrollY / totalScrollable));
      targetProgressRef.current = p;
    };

    const updateSmoothScroll = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;
      if (Math.abs(diff) > 0.00005) {
        currentProgressRef.current += diff * 0.12; // buttery smooth 12% spring dampening
        setScrollProgress(currentProgressRef.current);
      } else if (currentProgressRef.current !== targetProgressRef.current) {
        currentProgressRef.current = targetProgressRef.current;
        setScrollProgress(currentProgressRef.current);
      }
      rafId = requestAnimationFrame(updateSmoothScroll);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    currentProgressRef.current = targetProgressRef.current;
    setScrollProgress(targetProgressRef.current);
    rafId = requestAnimationFrame(updateSmoothScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(rafId);
    };
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

  // Rock-solid stage interpolation with smoothstep hermite easing & hardware acceleration
  const getStageTransform = (stageIndex: number) => {
    const smoothstep = (min: number, max: number, value: number) => {
      const x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    };

    // STAGE 1: INTRO HERO (0% to 20%)
    if (stageIndex === 1) {
      if (scrollProgress <= 0.14) {
        return {
          opacity: 1,
          transform: 'translate3d(0, 0px, 0) scale(1)',
          pointerEvents: 'auto' as const,
          zIndex: 20,
        };
      } else if (scrollProgress <= 0.22) {
        const ease = 1 - smoothstep(0.14, 0.22, scrollProgress);
        return {
          opacity: ease,
          transform: `translate3d(0, ${(1 - ease) * -28}px, 0) scale(${0.96 + ease * 0.04})`,
          pointerEvents: ease > 0.3 ? ('auto' as const) : ('none' as const),
          zIndex: 20,
        };
      } else {
        return {
          opacity: 0,
          transform: 'translate3d(0, -32px, 0) scale(0.96)',
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
          transform: `translate3d(0, ${scrollProgress < 0.16 ? 30 : -30}px, 0) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let ease = 1;
      if (scrollProgress < 0.23) {
        ease = smoothstep(0.16, 0.23, scrollProgress);
      } else if (scrollProgress > 0.37) {
        ease = 1 - smoothstep(0.37, 0.44, scrollProgress);
      }
      return {
        opacity: ease,
        transform: `translate3d(0, ${(1 - ease) * (scrollProgress < 0.23 ? 28 : -28)}px, 0) scale(${0.95 + ease * 0.05})`,
        pointerEvents: ease > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 3: REAL PHONE SCANNING + PATIENT PROFILE & CLINICAL TELEMETRY (38% to 64%)
    if (stageIndex === 3) {
      if (scrollProgress < 0.36 || scrollProgress > 0.64) {
        return {
          opacity: 0,
          transform: `translate3d(0, ${scrollProgress < 0.36 ? 30 : -30}px, 0) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let ease = 1;
      if (scrollProgress < 0.43) {
        ease = smoothstep(0.36, 0.43, scrollProgress);
      } else if (scrollProgress > 0.57) {
        ease = 1 - smoothstep(0.57, 0.64, scrollProgress);
      }
      return {
        opacity: ease,
        transform: `translate3d(0, ${(1 - ease) * (scrollProgress < 0.43 ? 28 : -28)}px, 0) scale(${0.95 + ease * 0.05})`,
        pointerEvents: ease > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 4: AI AGENT REASONING ENGINE (58% to 82%)
    if (stageIndex === 4) {
      if (scrollProgress < 0.58 || scrollProgress > 0.82) {
        return {
          opacity: 0,
          transform: `translate3d(0, ${scrollProgress < 0.58 ? 30 : -30}px, 0) scale(0.95)`,
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      let ease = 1;
      if (scrollProgress < 0.65) {
        ease = smoothstep(0.58, 0.65, scrollProgress);
      } else if (scrollProgress > 0.75) {
        ease = 1 - smoothstep(0.75, 0.82, scrollProgress);
      }
      return {
        opacity: ease,
        transform: `translate3d(0, ${(1 - ease) * (scrollProgress < 0.65 ? 28 : -28)}px, 0) scale(${0.95 + ease * 0.05})`,
        pointerEvents: ease > 0.3 ? ('auto' as const) : ('none' as const),
        zIndex: 20,
      };
    }

    // STAGE 5: FINAL SLIDE — LOGIN / CREATE ACCOUNT (76% to 100%)
    if (stageIndex === 5) {
      if (scrollProgress < 0.76) {
        return {
          opacity: 0,
          transform: 'translate3d(0, 30px, 0) scale(0.95)',
          pointerEvents: 'none' as const,
          zIndex: 0,
        };
      }
      const ease = smoothstep(0.76, 0.84, scrollProgress);
      return {
        opacity: ease,
        transform: `translate3d(0, ${(1 - ease) * 25}px, 0) scale(${0.96 + ease * 0.04})`,
        pointerEvents: ease > 0.2 ? ('auto' as const) : ('none' as const),
        zIndex: 30,
      };
    }

    return { opacity: 0, transform: 'translate3d(0, 0px, 0)', pointerEvents: 'none' as const, zIndex: 0 };
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
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-10 px-2 sm:px-8">
        <div className="relative w-full max-w-7xl h-full flex items-center justify-center">

          {/* ============================================================== */}
          {/* STAGE 1: NUTRIAGENT INTRO — CLEAN HERO & FEATURE HIGHLIGHTS    */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-8 text-center will-change-[transform,opacity] pointer-events-none"
            style={getStageTransform(1)}
          >
            {/* Centered Hero Text Container — Perfectly proportioned for phones */}
            <div
              className="w-full text-center z-20 pointer-events-auto max-w-4xl mx-auto my-auto"
              style={{
                transform: `translate3d(${mouseOffset.x * 8}px, ${mouseOffset.y * 8}px, 0)`,
              }}
            >
              {/* Dominant Hero Headline — Responsive so mobile never clips */}
              <h1 className="text-3xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-[5.5rem] font-black text-[#002f1f] tracking-tight leading-[1.08] mb-1.5 sm:mb-4 font-sans drop-shadow-sm">
                Eat Smart. <span className="text-[#047857]">Live Better.</span>
              </h1>

              {/* Supporting Subtitle */}
              <p className="text-sm sm:text-xl lg:text-[1.6rem] text-[#0f172a] font-extrabold max-w-xs sm:max-w-2xl mx-auto mb-6 sm:mb-10 leading-snug sm:leading-relaxed">
                Personalized nutrition and health intelligence, powered by AI.
              </p>

              {/* Animated Scroll Cue */}
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-2.5 rounded-full bg-emerald-50/95 border-2 border-emerald-300 shadow-xs text-xs sm:text-sm font-black text-[#004d34]">
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948] animate-bounce" />
                <span>Scroll down or tap Next below</span>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 2: REALISTIC TILTED PHONE SCANNING THE LABEL (20% - 40%) */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col justify-between max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-8 will-change-[transform,opacity] pointer-events-none"
            style={getStageTransform(2)}
          >
            {/* Top Scanning Header */}
            <div className="w-full text-center max-w-2xl mx-auto z-20 pointer-events-auto">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#002f1f] tracking-tight leading-tight">
                Product &amp; Label Analysis
              </h2>
              <p className="text-xs sm:text-base font-bold text-slate-800 mt-1 sm:mt-2 max-w-xl mx-auto">
                Your smartphone camera frames and scans the package nutrition facts with active laser OCR.
              </p>
            </div>

            {/* Bottom Live Scan Telemetry HUD Bar — pb-14 on mobile so it clears the bottom progress tracker */}
            <div className="w-full max-w-4xl mx-auto z-20 pointer-events-auto pb-14 sm:pb-4">
              <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_10px_35px_rgba(0,77,52,0.14)] flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-2 text-[11px] sm:text-sm font-black text-[#003824]">
                  <span className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-[#006948]" />
                  </span>
                  <span className="truncate">Active Scan: Nature's Harvest Trail Mix</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs font-mono font-black flex-wrap justify-center">
                  <span className="bg-emerald-50 text-[#004d34] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-300">140 kcal</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-300">45mg Sodium</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-300">6g Sugars</span>
                  <span className="bg-emerald-50 text-[#004d34] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg border border-emerald-300">4g Protein</span>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 3: REAL PHONE SCANNING + PATIENT PROFILE (40% - 60%)     */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-between max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-8 will-change-[transform,opacity] pointer-events-none"
            style={getStageTransform(3)}
          >
            {/* Top Stage Header */}
            <div className="text-center max-w-2xl mx-auto z-20 pointer-events-auto">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-[#002f1f] tracking-tight leading-tight">
                Live Clinical Telemetry Cross-Check
              </h2>
              <p className="text-xs sm:text-base font-bold text-slate-800 mt-0.5 sm:mt-1 max-w-xl mx-auto">
                Phone directly checks scanned food against Eleanor's conditions and active prescriptions.
              </p>
            </div>

            {/* Main Stage 3 Content: On mobile portrait, Eleanor's EHR card fits in the lower half smoothly */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 w-full items-center my-auto pointer-events-auto z-20 max-h-[62vh] sm:max-h-none overflow-y-auto modal-scroll pb-16 sm:pb-0">
              
              {/* LEFT / DESKTOP ONLY: AR Telemetry Badge (shown on desktop, hidden on small mobile to give room to EHR) */}
              <div className="hidden lg:flex lg:col-span-6 flex-col justify-center items-start pl-2 sm:pl-6 pointer-events-none">
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

              {/* RIGHT (or FULL on mobile): Patient Electronic Health Record (EHR) Card */}
              <div className="col-span-1 lg:col-span-6 space-y-2 sm:space-y-3.5 w-full max-w-xl mx-auto">
                {/* Patient Vitals & Identification */}
                <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_15px_40px_rgba(0,77,52,0.12)]">
                  <div className="flex items-center justify-between mb-2 sm:mb-3 pb-2 sm:pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-[#003824] flex items-center justify-center font-black text-sm sm:text-base shadow-xs">
                        EV
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 text-sm sm:text-base">Eleanor Vance</h3>
                        <p className="text-[11px] sm:text-xs font-bold text-slate-600">MRN: #NTR-94281 • Age 42 • Female</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-emerald-100 border-2 border-emerald-300 text-[#004d34] text-[10px] sm:text-xs font-black">
                      EHR Active
                    </span>
                  </div>

                  {/* Vitals Grid */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5 text-center">
                    <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block uppercase">Blood Pressure</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">132/84</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-amber-700 block">Stage 1 HTN</span>
                    </div>
                    <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block uppercase">Heart Rate</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">72 bpm</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 block">Normal Sinus</span>
                    </div>
                    <div className="p-1.5 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border-2 border-slate-200">
                      <span className="text-[9px] sm:text-[10px] text-slate-600 font-bold block uppercase">Fasting Glucose</span>
                      <span className="font-black text-slate-900 text-xs sm:text-sm">114 mg/dL</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-blue-700 block">HbA1c 6.8%</span>
                    </div>
                  </div>
                </div>

                {/* Chronic Conditions & Clinical Targets */}
                <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-emerald-300 shadow-[0_15px_40px_rgba(0,77,52,0.12)]">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3">
                    <HeartPulse className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948]" />
                    <h4 className="font-black text-slate-900 text-xs sm:text-sm">Clinical Profile &amp; Prescriptions</h4>
                  </div>

                  <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-amber-100 text-amber-950 border border-amber-300 sm:border-2 text-[10px] sm:text-xs font-black">
                      Hypertension
                    </span>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-blue-100 text-blue-950 border border-blue-300 sm:border-2 text-[10px] sm:text-xs font-black">
                      Type 2 Diabetes
                    </span>
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl bg-emerald-100 text-[#003824] border border-emerald-300 sm:border-2 text-[10px] sm:text-xs font-black">
                      Low Sodium Protocol (&lt;1500mg)
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 sm:gap-2.5">
                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 sm:border-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006948]" />
                        <span className="font-black text-[11px] sm:text-xs text-slate-900">Lisinopril</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">10mg / daily</span>
                    </div>

                    <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-50 border border-slate-200 sm:border-2 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Pill className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006948]" />
                        <span className="font-black text-[11px] sm:text-xs text-slate-900">Metformin</span>
                      </div>
                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-600">500mg / BID</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Step Indicator */}
            <div className="text-center z-20 pb-14 sm:pb-0">
              <p className="text-[11px] sm:text-xs font-black text-[#004d34]">
                Scroll down to see the AI Multi-Agent reasoning engine in Step 4 →
              </p>
            </div>
          </div>

          {/* ============================================================== */}
          {/* STAGE 4: AI AGENT REASONING ENGINE (60% - 80%)                 */}
          {/* ============================================================== */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center max-w-5xl mx-auto px-3 sm:px-4 py-4 sm:py-6 will-change-[transform,opacity] pointer-events-none"
            style={getStageTransform(4)}
          >
            <div className="w-full max-w-3xl mx-auto pointer-events-auto z-20 pb-12 sm:pb-0">
              {/* Header */}
              <div className="text-center mb-3 sm:mb-6">
                <h2 className="text-2xl sm:text-4xl font-black text-[#002f1f] tracking-tight leading-tight">
                  Autonomous Clinical Verification
                </h2>
                <p className="text-[11px] sm:text-sm font-bold text-slate-800 mt-0.5 sm:mt-1">
                  Watch NutriAgent's clinical models analyze nutrient ratios, contraindications, and patient vitals in real time.
                </p>
              </div>

              {/* Multi-Agent Reasoning Card */}
              <div className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-[0_25px_60px_-10px_rgba(0,77,52,0.22)] border-2 border-emerald-300">
                <div className="flex items-center justify-between mb-2.5 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948]" />
                    <h4 className="text-sm sm:text-base font-black text-slate-900">Clinical Verification Pipeline</h4>
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-[#004d34] bg-emerald-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-emerald-300">
                    Running Multi-Agent Synthesis
                  </span>
                </div>

                {/* Timeline Checklist */}
                <div className="space-y-2 sm:space-y-3">
                  {timelineSteps.map((step, idx) => {
                    const isCompleted = agentTimelineProgress >= step.threshold;
                    return (
                      <div
                        key={idx}
                        className={`p-2 sm:p-3 rounded-xl sm:rounded-2xl border-2 transition-all flex items-center justify-between ${
                          isCompleted
                            ? 'bg-emerald-50/90 border-emerald-400 text-[#003824]'
                            : 'bg-slate-50/80 border-slate-200 text-slate-500'
                        }`}
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          <div
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl flex items-center justify-center font-black text-[10px] sm:text-xs shrink-0 ${
                              isCompleted ? 'bg-[#006948] text-white shadow-xs' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
                          </div>
                          <span className={`text-[11px] sm:text-xs font-black truncate sm:whitespace-normal ${isCompleted ? 'text-slate-900' : 'text-slate-500'}`}>
                            {step.label}
                          </span>
                        </div>
                        {isCompleted && (
                          <span className="text-[9px] sm:text-[10px] font-mono font-black text-[#004d34] bg-emerald-200/80 px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ml-2">
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
            className="absolute inset-0 flex items-center justify-center max-w-6xl mx-auto px-3 sm:px-4 py-2 sm:py-4 pointer-events-auto z-30 will-change-[transform,opacity]"
            style={getStageTransform(5)}
          >
            {/* Scrollable Container so everything fits on any screen height */}
            <div className="w-full max-h-[88vh] sm:max-h-[92vh] overflow-y-auto modal-scroll px-1 pb-24 sm:pb-8">
              
              {/* Header */}
              <div className="text-center mb-3 sm:mb-6">
                <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#002f1f] tracking-tight leading-[1.1] mb-1 sm:mb-2">
                  Personalize Your Nutrition Intelligence
                </h2>
                <p className="text-xs sm:text-base md:text-lg lg:text-xl font-bold text-slate-800 mt-1 max-w-2xl mx-auto">
                  Log in or create your account to unlock continuous clinical food decisions and health profile tracking.
                </p>
              </div>

              {/* Centered NutriAgent Login / Create Account Card */}
              <div className="max-w-lg sm:max-w-xl md:max-w-2xl w-full mx-auto">
                <div
                  className="bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-[36px] p-4 sm:p-10 shadow-[0_30px_70px_-10px_rgba(0,77,52,0.25)] border-2 border-emerald-300 flex flex-col justify-between"
                  style={{
                    transform: `perspective(1000px) rotateY(${mouseOffset.x * 2}deg) rotateX(${mouseOffset.y * 2}deg)`,
                  }}
                >
                  {/* Brand Header: Logo + NutriAgent title + Tagline */}
                  <div>
                    <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-emerald-200">
                      <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center shadow-xs shrink-0">
                        <Leaf className="w-5 h-5 sm:w-8 sm:h-8 text-[#006948]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl sm:text-3xl md:text-4xl font-black text-[#004d34] tracking-tight">
                            NutriAgent
                          </h3>
                          <div className="flex items-center gap-1 text-[11px] sm:text-sm font-black text-slate-700 bg-slate-100 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-slate-300">
                            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#006948]" />
                            <span>HIPAA</span>
                          </div>
                        </div>
                        <p className="text-xs sm:text-base font-black text-[#059669]">
                          Welcome to NutriAgent
                        </p>
                        <p className="text-[11px] sm:text-sm font-bold text-slate-700">
                          Eat Smart. Live Better.
                        </p>
                      </div>
                    </div>

                    {/* Authenticated banner if already signed in, but allow switching to login / signup anytime! */}
                    {isAuthenticated && !forceAuthForm ? (
                      <div className="space-y-3 sm:space-y-4 my-2 sm:my-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-emerald-100 text-[10px] sm:text-sm font-black uppercase text-[#004d34] border-2 border-emerald-300 shadow-xs">
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006948]" />
                          Patient Session Active
                        </div>
                        <h4 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
                          Signed In: {userName || 'Eleanor Vance'}
                        </h4>
                        <p className="text-xs sm:text-base font-medium text-slate-700 leading-relaxed">
                          Your medical records and biometric profiles are securely connected to the clinical engine.
                        </p>

                        <div className="p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50 border-2 border-slate-200 space-y-2 sm:space-y-2.5">
                          <div className="flex justify-between text-xs sm:text-base">
                            <span className="text-slate-600 font-bold">Record Number:</span>
                            <span className="font-black text-slate-900 font-mono">#NTR-94281</span>
                          </div>
                          <div className="flex justify-between text-xs sm:text-base">
                            <span className="text-slate-600 font-bold">Attending Physician:</span>
                            <span className="font-black text-[#004d34]">Dr. Sarah Jenkins, MD</span>
                          </div>
                        </div>

                        <div className="space-y-2.5 pt-2">
                          <button
                            onClick={onOpenPortal}
                            className="w-full h-12 sm:h-14 rounded-xl sm:rounded-2xl bg-[#006948] hover:bg-[#005238] active:scale-98 text-white font-black text-sm sm:text-base shadow-md shadow-emerald-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <User className="w-5 h-5" />
                            <span>Open Patient Portal</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setForceAuthForm(true)}
                            className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs sm:text-sm border-2 border-slate-300 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
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
                        <div className="flex p-1 sm:p-1.5 rounded-xl sm:rounded-2xl bg-slate-100 border-2 border-slate-200 mb-4 sm:mb-5 text-xs sm:text-base font-bold">
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('login');
                              setAuthError('');
                            }}
                            className={`flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all cursor-pointer text-center text-xs sm:text-base ${
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
                            className={`flex-1 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl transition-all cursor-pointer text-center text-xs sm:text-base ${
                              authMode === 'register'
                                ? 'bg-[#006948] text-white shadow-md font-black'
                                : 'text-slate-700 hover:text-slate-900 font-extrabold'
                            }`}
                          >
                            Create Account
                          </button>
                        </div>

                        {/* Clean Standard Login / Register Form */}
                        <form onSubmit={handleAuthSubmit} className="space-y-3 sm:space-y-4">
                          {authMode === 'register' && (
                            <div>
                              <label className="block text-[11px] sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1 sm:mb-1.5">
                                Full Name
                              </label>
                              <div className="relative">
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948] absolute left-3.5 top-3 sm:top-4" />
                                <input
                                  type="text"
                                  value={authFullName}
                                  onChange={(e) => setAuthFullName(e.target.value)}
                                  placeholder="e.g. Eleanor Vance"
                                  className="w-full h-11 sm:h-13 pl-10 sm:pl-11 pr-4 rounded-xl sm:rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-xs sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                                />
                              </div>
                            </div>
                          )}

                          <div>
                            <label className="block text-[11px] sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1 sm:mb-1.5">
                              Email or Phone Number
                            </label>
                            <div className="relative">
                              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948] absolute left-3.5 top-3 sm:top-4" />
                              <input
                                type="text"
                                value={authIdentifier}
                                onChange={(e) => setAuthIdentifier(e.target.value)}
                                placeholder="Enter email or phone number"
                                className="w-full h-11 sm:h-13 pl-10 sm:pl-11 pr-4 rounded-xl sm:rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-xs sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] sm:text-sm font-black text-[#004d34] uppercase tracking-wider mb-1 sm:mb-1.5">
                              Password
                            </label>
                            <div className="relative">
                              <Key className="w-4 h-4 sm:w-5 sm:h-5 text-[#006948] absolute left-3.5 top-3 sm:top-4" />
                              <input
                                type="password"
                                value={authPassword}
                                onChange={(e) => setAuthPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full h-11 sm:h-13 pl-10 sm:pl-11 pr-4 rounded-xl sm:rounded-2xl border-2 border-slate-300 focus:border-[#006948] bg-white text-xs sm:text-base font-bold text-slate-900 placeholder:text-slate-400 outline-none transition-all shadow-inner"
                              />
                            </div>
                          </div>

                          {authError && (
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50 text-red-900 text-xs sm:text-sm font-bold border-2 border-red-300 flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-red-600" />
                              <span>{authError}</span>
                            </div>
                          )}

                          {authSuccess && (
                            <div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 text-[#004d34] text-xs sm:text-sm font-black border-2 border-emerald-300 flex items-center gap-2">
                              <Check className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-[#006948]" />
                              <span>{authSuccess}</span>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={authLoading}
                            className="w-full h-12 sm:h-14 mt-1 sm:mt-2 rounded-xl sm:rounded-2xl bg-[#006948] hover:bg-[#005238] active:scale-98 text-white font-black text-xs sm:text-base shadow-lg shadow-emerald-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                          >
                            {authLoading ? (
                              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-white" />
                            ) : authMode === 'login' ? (
                              <>
                                <span>Login to NutriAgent</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
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
                  <p className="text-[11px] sm:text-sm font-bold text-slate-600 text-center mt-3 sm:mt-4 flex items-center justify-center gap-1.5 sm:gap-2 pt-2 sm:pt-3 border-t border-slate-100">
                    <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#006948]" />
                    <span>Healthy choices. Powered by AI.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Floating Stage Progress Tracker — Compact on mobile */}
      <div className="fixed bottom-3 sm:bottom-6 inset-x-0 mx-auto w-fit z-40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/95 backdrop-blur-xl border-2 border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.12)] flex items-center gap-2 sm:gap-3 pointer-events-auto">
        <span className="text-[11px] font-black text-[#004d34] uppercase tracking-wider hidden sm:block">
          Step 0{currentStage} / 05
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => jumpToStage(i)}
              className={`h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                currentStage === i ? 'w-6 sm:w-7 bg-[#006948]' : 'w-2 sm:w-2.5 bg-slate-300 hover:bg-slate-400'
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
          className="text-xs font-black text-[#006948] hover:text-[#005238] flex items-center gap-1 cursor-pointer ml-1"
        >
          <span>{currentStage < 5 ? 'Next' : 'Restart'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
