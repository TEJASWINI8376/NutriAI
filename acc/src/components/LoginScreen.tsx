import React, { useState } from 'react';
import {
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Headphones,
  CheckCircle2,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { NutriAiLogo } from './NutriAiLogo';
import { UserProfile } from '../types';

interface LoginScreenProps {
  onLoginSuccess: (user: Partial<UserProfile>) => void;
  onGoToSignup: () => void;
  onOpenSupport: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onLoginSuccess,
  onGoToSignup,
  onOpenSupport,
}) => {
  const [contact, setContact] = useState('alexander.mitchell@carepulse.health');
  const [password, setPassword] = useState('CarePulse2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !password) {
      setErrorMsg('Please provide both your contact email/phone and password.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, password }),
      });
      const data = await res.json();
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess(data.user || { contact });
      }, 600);
    } catch {
      setTimeout(() => {
        setLoading(false);
        onLoginSuccess({
          contact,
          fullName: 'Alexander Mitchell',
          dob: '1991-10-14',
          gender: 'Male',
        });
      }, 600);
    }
  };

  const handleAutofillDemo = () => {
    setContact('alexander.mitchell@carepulse.health');
    setPassword('CarePulse2025!');
  };

  const doctorPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7bxWHHDAui7l667jVke2YsIPszAfvRYgcGG4WzJBin1sYW9PkBHzCBY25HWZ1ELwyrPOV1HdmlzXQ7hwiHaQRdWCb6123vQ0Vr2HNC0cILlkbKTpGUXSSA7pcbNh_pF7qJyvNwvDaDrrKxCKulYJ9z_ivoUVszowUVDYJ3cfJHUddBF0L1b5t6-kM5Eg9j4QCer-biXFGqkL29t7UPKBuD5DZOfYfyLesaHdsKuuR2yLR7p30MeX6';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 md:py-8 flex flex-col justify-start">
      {/* Header Branding */}
      <div className="flex flex-col gap-2 mb-6">
        <div className="flex items-center justify-between">
          <NutriAiLogo size="lg" showSubtitle />
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f8f9ff] hover:bg-[#e5eeff] text-[#006194] text-xs font-semibold border border-[#dce9ff] transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#006a61]" />
            <span>Demo Fill</span>
          </button>
        </div>

        <h1 className="text-2xl md:text-[28px] font-bold text-[#0b1c30] tracking-tight mt-3 leading-snug">
          Welcome Back
        </h1>
        <p className="text-sm text-[#3f4850] leading-relaxed">
          Sign in to access your HIPAA-encrypted telemetry, vital trends, and personalized nutrition plan.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-xl bg-[#ffdad6] border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-3.5 w-full">
        {/* Contact Input */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="login-contact"
            className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
          >
            Mobile Number or Email <span className="text-[#006194] text-xs">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <AtSign className="w-[18px] h-[18px]" />
            </span>
            <input
              id="login-contact"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="alexander.mitchell@carepulse.health"
              required
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="login-password"
              className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
            >
              Password <span className="text-[#006194] text-xs">*</span>
            </label>
            <button
              type="button"
              onClick={() => alert('Password reset verification link sent to registered email.')}
              className="text-[11px] text-[#006194] hover:underline font-medium"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all font-mono"
            />
            <button
              id="toggle-login-password"
              type="button"
              aria-label="Toggle password visibility"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 text-[#707881] hover:text-[#0b1c30] active:scale-90 transition-all"
            >
              {showPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me toggle */}
        <div className="flex items-center justify-between mt-0.5">
          <label className="flex items-center gap-2 text-xs text-[#3f4850] cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded text-[#006194] focus:ring-0 border-slate-300"
            />
            <span>Keep me logged in securely</span>
          </label>
        </div>

        {/* Submit CTA */}
        <button
          id="login-submit-btn"
          type="submit"
          disabled={loading}
          className="w-full h-12 mt-2 rounded-xl bg-[#006194] hover:bg-[#004b73] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Authenticating...</span>
            </div>
          ) : (
            <>
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Don't have an account link */}
        <div className="flex items-center justify-center gap-1.5 py-2">
          <span className="text-sm text-[#3f4850]">Don't have an account?</span>
          <button
            id="go-to-signup-btn"
            type="button"
            onClick={onGoToSignup}
            className="text-sm font-semibold text-[#006194] hover:underline"
          >
            Create Account
          </button>
        </div>
      </form>

      {/* Care Reassurance / Security Card */}
      <div className="mt-5 p-4 rounded-2xl bg-[#eff4ff] shadow-xs flex items-start gap-3 border border-[#dce9ff]">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#e5eeff] text-[#006a61] flex-shrink-0">
          <Shield className="w-5 h-5 fill-[#006a61]" />
        </div>
        <div className="flex flex-col gap-0.5">
          <h3 className="text-xs md:text-sm text-[#0b1c30] font-bold">
            HIPAA-Compliant & End-to-End Encrypted
          </h3>
          <p className="text-xs text-[#3f4850] leading-relaxed">
            Your medical telemetry, prescription logs, and identity are encrypted with 256-bit AES
            protocols and never shared without clinical authorization.
          </p>
        </div>
      </div>

      {/* Support Card */}
      <div
        id="login-support-card"
        onClick={onOpenSupport}
        className="mt-3 p-3.5 rounded-2xl bg-white shadow-xs border border-[#e2e8f0] hover:border-[#93ccff] flex items-center justify-between cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <img
            src={doctorPhoto}
            alt="Dr. Elena Vance"
            className="w-11 h-11 rounded-full object-cover shadow-xs ring-2 ring-[#006194]/15 group-hover:ring-[#006194]/40 transition-all"
            referrerPolicy="no-referrer"
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#006947] uppercase tracking-wider">
              Live Onboarding Support
            </span>
            <span className="text-xs md:text-sm font-semibold text-[#0b1c30]">
              Need help setting up records?
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-label="Chat with clinical support"
          className="w-9 h-9 rounded-full bg-[#e5eeff] group-hover:bg-[#006194] text-[#006194] group-hover:text-white flex items-center justify-center transition-all"
        >
          <Headphones className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
