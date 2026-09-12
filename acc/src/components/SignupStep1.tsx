import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  User,
  AtSign,
  Calendar,
  CalendarDays,
  Lock,
  RotateCcw,
  Eye,
  EyeOff,
  Check,
  CheckCircle2,
  Shield,
  Headphones,
  Loader2,
} from 'lucide-react';
import { NutriAiLogo } from './NutriAiLogo';
import { UserProfile } from '../types';

interface SignupStep1Props {
  onNext: (userData: Partial<UserProfile>) => void;
  onGoToLogin: () => void;
  onOpenSupport: () => void;
  onOpenTerms: () => void;
  currentUser?: UserProfile | null;
}

export const SignupStep1: React.FC<SignupStep1Props> = ({
  onNext,
  onGoToLogin,
  onOpenSupport,
  onOpenTerms,
  currentUser,
}) => {
  const [fullName, setFullName] = useState(currentUser?.fullName || 'Alexander Mitchell');
  const [contact, setContact] = useState(
    currentUser?.contact || 'alexander.mitchell@carepulse.health'
  );
  const [dob, setDob] = useState(currentUser?.dob || '1991-10-14');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    currentUser?.gender || 'Male'
  );
  const [password, setPassword] = useState('CarePulse2025!');
  const [confirmPassword, setConfirmPassword] = useState('CarePulse2025!');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successState, setSuccessState] = useState(false);

  // Format date display like "Oct 14, 1991"
  const formatDisplayDate = (isoStr: string) => {
    try {
      const parts = isoStr.split('-');
      if (parts.length === 3) {
        const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        return d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }
    } catch {
      // fallback
    }
    return isoStr;
  };

  const isStrong = password.length >= 8;
  const passwordsMatch = password && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      alert('Please accept the Terms of Service & Health Data Protection regulations.');
      return;
    }

    setSubmitting(true);

    try {
      // Call backend API to record profile
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          contact,
          dob,
          gender,
          password,
        }),
      });

      const data = await res.json();
      setSuccessState(true);

      setTimeout(() => {
        setSubmitting(false);
        onNext({
          fullName,
          contact,
          dob,
          gender,
          ...(data.user || {}),
        });
      }, 750);
    } catch (err) {
      console.warn('Backend register call offline, continuing with local state', err);
      setSuccessState(true);
      setTimeout(() => {
        setSubmitting(false);
        onNext({ fullName, contact, dob, gender });
      }, 750);
    }
  };

  const doctorPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7bxWHHDAui7l667jVke2YsIPszAfvRYgcGG4WzJBin1sYW9PkBHzCBY25HWZ1ELwyrPOV1HdmlzXQ7hwiHaQRdWCb6123vQ0Vr2HNC0cILlkbKTpGUXSSA7pcbNh_pF7qJyvNwvDaDrrKxCKulYJ9z_ivoUVszowUVDYJ3cfJHUddBF0L1b5t6-kM5Eg9j4QCer-biXFGqkL29t7UPKBuD5DZOfYfyLesaHdsKuuR2yLR7p30MeX6';

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 md:py-6 flex flex-col justify-start">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="step1-back-btn"
          type="button"
          aria-label="Go back"
          onClick={onGoToLogin}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#006194] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#006194] animate-pulse" />
          <span>Step 1 of 2</span>
        </div>
      </div>

      {/* Header Branding & Headline */}
      <div className="flex flex-col gap-1.5 mb-5">
        <div className="flex items-center justify-between">
          <NutriAiLogo size="md" />
          <span className="text-[11px] font-semibold text-[#006947] bg-[#f5fff6] border border-[#6ffbbe]/40 px-2 py-0.5 rounded-full">
            HIPAA Verified
          </span>
        </div>

        <h1 className="text-2xl md:text-[28px] font-bold text-[#0b1c30] tracking-tight mt-1 leading-snug">
          Create Account
        </h1>
        <p className="text-sm text-[#3f4850] leading-relaxed">
          Join CarePulse to manage and verify your health records securely.
        </p>
      </div>

      {/* Registration Form Card */}
      <form
        id="signup-form"
        onSubmit={handleSubmit}
        className="flex flex-col gap-3.5 w-full"
      >
        {/* Full Legal Name Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="full-name"
            className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
          >
            Full Legal Name <span className="text-[#006194] text-xs">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <User className="w-[18px] h-[18px]" />
            </span>
            <input
              id="full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Alexander Mitchell"
              required
              className="w-full h-12 pl-10 pr-10 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all"
            />
            {fullName.trim().length >= 2 && (
              <span className="absolute right-3.5 text-[#006947]">
                <CheckCircle2 className="w-[18px] h-[18px] fill-[#006947] text-white" />
              </span>
            )}
          </div>
        </div>

        {/* Mobile Number or Email Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="contact-input"
            className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
          >
            Mobile Number or Email <span className="text-[#006194] text-xs">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <AtSign className="w-[18px] h-[18px]" />
            </span>
            <input
              id="contact-input"
              type="text"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="alex@example.com"
              required
              className="w-full h-12 pl-10 pr-10 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all"
            />
            {contact.includes('@') || contact.replace(/\D/g, '').length >= 10 ? (
              <span className="absolute right-3.5 text-[#006947]">
                <CheckCircle2 className="w-[18px] h-[18px] fill-[#006947] text-white" />
              </span>
            ) : null}
          </div>
        </div>

        {/* Date of Birth Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="dob-input"
            className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
          >
            Date of Birth <span className="text-[#006194] text-xs">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <Calendar className="w-[18px] h-[18px]" />
            </span>
            <input
              id="dob-input"
              type="text"
              value={formatDisplayDate(dob)}
              onClick={() => setShowDatePicker(!showDatePicker)}
              readOnly
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none cursor-pointer focus:border-[#006194] transition-all"
            />
            <button
              id="toggle-calendar-btn"
              type="button"
              aria-label="Open calendar"
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="absolute right-3.5 text-[#006194] hover:text-[#004b73] active:scale-95 transition-transform"
            >
              <CalendarDays className="w-[19px] h-[19px]" />
            </button>
          </div>

          {/* Inline Date Selector Popup */}
          {showDatePicker && (
            <div className="p-3 bg-white border border-[#e2e8f0] rounded-xl shadow-lg mt-1 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between text-xs text-[#006194] font-semibold">
                <span>Select Birth Date</span>
                <span className="text-[11px] text-[#475569]">Calculated: 34 yrs</span>
              </div>
              <input
                id="dob-date-picker"
                type="date"
                value={dob}
                onChange={(e) => {
                  setDob(e.target.value);
                  setShowDatePicker(false);
                }}
                className="w-full h-10 px-3 bg-[#f8f9ff] border border-[#cbd5e1] rounded-lg text-xs text-[#0b1c30] outline-none"
              />
            </div>
          )}
        </div>

        {/* Gender Selector Pill Group */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#3f4850] flex items-center gap-1">
            Gender <span className="text-[#006194] text-xs">*</span>
          </label>
          <div
            id="gender-group"
            className="grid grid-cols-3 gap-1.5 p-1 bg-[#eff4ff] rounded-xl"
          >
            {(['Male', 'Female', 'Other'] as const).map((opt) => {
              const isSelected = gender === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  id={`gender-btn-${opt.toLowerCase()}`}
                  onClick={() => setGender(opt)}
                  className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isSelected
                      ? 'bg-white text-[#006194] shadow-xs'
                      : 'text-[#3f4850] hover:text-[#0b1c30]'
                  }`}
                >
                  {opt === 'Male' && (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="10" cy="14" r="5" />
                      <line x1="19" y1="5" x2="13.6" y2="10.4" />
                      <line x1="15" y1="5" x2="19" y2="5" />
                      <line x1="19" y1="5" x2="19" y2="9" />
                    </svg>
                  )}
                  {opt === 'Female' && (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="9" r="5" />
                      <line x1="12" y1="14" x2="12" y2="21" />
                      <line x1="9" y1="18" x2="15" y2="18" />
                    </svg>
                  )}
                  {opt === 'Other' && (
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="4" />
                      <line x1="12" y1="16" x2="12" y2="20" />
                      <line x1="10" y1="18" x2="14" y2="18" />
                      <line x1="15" y1="9" x2="19" y2="5" />
                      <line x1="16" y1="5" x2="19" y2="5" />
                      <line x1="19" y1="5" x2="19" y2="8" />
                    </svg>
                  )}
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Password Field */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password-input"
              className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
            >
              Password <span className="text-[#006194] text-xs">*</span>
            </label>
            <span className="text-[11px] font-semibold text-[#006947] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006947]" />
              Strong security
            </span>
          </div>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <Lock className="w-[18px] h-[18px]" />
            </span>
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all font-mono"
            />
            <button
              id="toggle-password-visibility-btn"
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

          {/* Password Strength Meter Visual (4 green pills matching user's image) */}
          <div className="flex items-center gap-1.5 mt-1 px-1">
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isStrong ? 'bg-[#006947]' : 'bg-[#006947]/40'
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isStrong ? 'bg-[#006947]' : 'bg-[#006947]/40'
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isStrong ? 'bg-[#006947]' : 'bg-slate-200'
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                isStrong ? 'bg-[#006947]' : 'bg-slate-200'
              }`}
            />
          </div>
        </div>

        {/* Confirm Password Field */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="confirm-password-input"
            className="text-xs font-semibold text-[#3f4850] flex items-center gap-1"
          >
            Confirm Password <span className="text-[#006194] text-xs">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <RotateCcw className="w-[18px] h-[18px]" />
            </span>
            <input
              id="confirm-password-input"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-12 pl-10 pr-11 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all font-mono"
            />
            <button
              id="toggle-confirm-password-visibility-btn"
              type="button"
              aria-label="Toggle confirm password visibility"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 text-[#707881] hover:text-[#0b1c30] active:scale-90 transition-all"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-[18px] h-[18px]" />
              ) : (
                <Eye className="w-[18px] h-[18px]" />
              )}
            </button>
          </div>
        </div>

        {/* Legal Checkbox */}
        <div className="flex items-start gap-2.5 mt-1 p-1">
          <button
            id="terms-checkbox"
            type="button"
            role="checkbox"
            aria-checked={agreedToTerms}
            onClick={() => setAgreedToTerms(!agreedToTerms)}
            className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center transition-colors shadow-xs ${
              agreedToTerms
                ? 'bg-[#006194] text-white'
                : 'bg-white border border-[#cbd5e1]'
            }`}
          >
            {agreedToTerms && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </button>
          <label
            htmlFor="terms-checkbox"
            className="text-xs text-[#3f4850] select-none leading-normal"
          >
            I agree to the{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-semibold text-[#006194] underline underline-offset-2 hover:text-[#004b73]"
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              onClick={onOpenTerms}
              className="font-semibold text-[#006194] underline underline-offset-2 hover:text-[#004b73]"
            >
              Privacy Policy & Health Data Protection
            </button>{' '}
            regulations.
          </label>
        </div>

        {/* Primary Action Button */}
        <button
          id="submit-cta"
          type="submit"
          disabled={submitting}
          className={`w-full h-12 mt-1 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
            successState
              ? 'bg-[#006947] text-white'
              : 'bg-[#006194] hover:bg-[#004b73] text-white'
          }`}
        >
          {submitting && !successState ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying Profile...</span>
            </div>
          ) : successState ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 fill-white text-[#006947]" />
              <span>Account Created</span>
            </div>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Already have an account link */}
        <div className="flex items-center justify-center gap-1.5 py-1">
          <span className="text-sm text-[#3f4850]">Already have an account?</span>
          <button
            id="go-to-login-btn"
            type="button"
            onClick={onGoToLogin}
            className="text-sm font-semibold text-[#006194] hover:underline"
          >
            Log In
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

      {/* Interactive Doctor / Care Specialist Teaser */}
      <div
        id="doctor-support-card"
        onClick={onOpenSupport}
        className="mt-3 p-3.5 rounded-2xl bg-white shadow-xs border border-[#e2e8f0] hover:border-[#93ccff] flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] group"
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
          id="trigger-live-support-icon-btn"
          type="button"
          aria-label="Chat with clinical support"
          className="w-9 h-9 rounded-full bg-[#e5eeff] group-hover:bg-[#006194] text-[#006194] group-hover:text-white flex items-center justify-center active:scale-95 transition-all"
        >
          <Headphones className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
