import React, { useState } from 'react';
import { api } from '../api.ts';
import type { User } from '../types.ts';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
  showToast: (message: string, icon?: string) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, showToast }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [resetIdentifier, setResetIdentifier] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      showToast('Please enter your email or mobile number.', 'warning');
      return;
    }
    if (!password.trim()) {
      showToast('Please enter your secure password.', 'lock');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'login') {
        const res = await api.login(identifier, password);
        showToast(res.message || 'Authenticated successfully.', 'verified_user');
        onSuccess(res.user);
      } else {
        const res = await api.register({
          name: fullName.trim() || undefined,
          email: identifier.includes('@') ? identifier : `${identifier.replace(/\D/g, '')}@nutriai.patient`,
          phone: phone || identifier,
          password,
        });
        showToast('Clinical account initialized & verified.', 'check_circle');
        onSuccess(res.user);
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication failed. Please verify credentials.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAuth = async (provider: 'Google' | 'Apple') => {
    setIsLoading(true);
    showToast(`Connecting to ${provider} Medical Identity Gateway...`, 'lock_reset');
    try {
      const res = await api.quickLogin(provider);
      showToast(`Authenticated via ${provider} Health ID.`, 'verified');
      onSuccess(res.user);
    } catch (err: any) {
      showToast(err.message || 'Single sign-on failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetIdentifier.trim()) {
      showToast('Enter your registered email or phone.', 'warning');
      return;
    }
    try {
      const res = await api.requestPasswordReset(resetIdentifier);
      setResetSent(true);
      showToast(res.message, 'mark_email_read');
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  const fillDemoAccount = () => {
    setMode('login');
    setIdentifier('eleanor.vance@example.com');
    setPassword('NutriAI2026!');
    showToast('Demo clinical credentials populated.', 'auto_awesome');
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full px-4 py-8 bg-[#f8f9ff]">
      <div className="flex flex-col items-center w-full max-w-md">
        {/* Top Ambient Graphic / Brand Identity Hub */}
        <div className="flex flex-col items-center text-center pt-2 pb-6 px-2">
          {/* Brand App Logo Badge */}
          <div className="relative flex items-center justify-center w-24 h-24 mb-4 rounded-3xl bg-[#ffffff] shadow-md p-2 border border-slate-100">
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-[#006a61] text-white shadow-sm">
              <span className="material-symbols-outlined text-[14px]">verified</span>
            </div>
            <img
              alt="NutriAI emblem"
              className="w-full h-full object-contain rounded-2xl"
              src="/nutriai-logo.svg"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* App Identity & Tagline */}
          <h1 className="text-[28px] font-bold text-[#0b1c30] tracking-tight mb-1 font-sans">
            NutriAI
          </h1>
          <p className="text-[14px] text-[#3f4850] max-w-xs leading-relaxed">
            Your AI-powered nutrition and health intelligence, verified.
          </p>

          {/* Clinical Gateway Status Pill */}
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full bg-[#eff4ff] text-[#006194] border border-[#d3e4fe]/50">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00855b] animate-pulse"></span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#006a61]">
              Clinical Gateway Online
            </span>
          </div>
        </div>

        {/* Primary Interactive Card */}
        <div className="w-full bg-[#ffffff] rounded-3xl shadow-sm border border-[#e5eeff] p-6 mb-6">
          {/* Segmented Mode Switcher */}
          <div className="relative flex p-1 mb-6 rounded-xl bg-[#eff4ff]" role="tablist">
            <button
              id="tab-login"
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 text-center ${
                mode === 'login'
                  ? 'bg-white text-[#006194] shadow-sm'
                  : 'text-[#3f4850] hover:text-[#0b1c30]'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-[14px] font-semibold transition-all duration-200 text-center ${
                mode === 'register'
                  ? 'bg-white text-[#006194] shadow-sm'
                  : 'text-[#3f4850] hover:text-[#0b1c30]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} id="auth-form">
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#3f4850] px-0.5" htmlFor="name-input">
                  Full Legal Name
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#707881] pointer-events-none text-[20px]">
                    person
                  </span>
                  <input
                    id="name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    required={mode === 'register'}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] placeholder:text-[#707881] focus:bg-white focus:ring-2 focus:ring-[#006194] focus:outline-none transition-all border border-transparent focus:border-[#006194]"
                  />
                </div>
              </div>
            )}

            {/* Identifier Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-[#3f4850] px-0.5" htmlFor="identifier-input">
                Mobile Number or Email
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#707881] pointer-events-none text-[20px]">
                  alternate_email
                </span>
                <input
                  id="identifier-input"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] placeholder:text-[#707881] focus:bg-white focus:ring-2 focus:ring-[#006194] focus:outline-none transition-all border border-transparent focus:border-[#006194]"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-semibold text-[#3f4850] px-0.5" htmlFor="phone-input">
                  Mobile Phone for SMS Verification
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3.5 text-[#707881] pointer-events-none text-[20px]">
                    phone
                  </span>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] placeholder:text-[#707881] focus:bg-white focus:ring-2 focus:ring-[#006194] focus:outline-none transition-all border border-transparent focus:border-[#006194]"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-[12px] font-semibold text-[#3f4850]" htmlFor="password-input">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setResetIdentifier(identifier);
                      setForgotPasswordOpen(true);
                      setResetSent(false);
                    }}
                    className="text-[12px] font-semibold text-[#006194] hover:underline focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#707881] pointer-events-none text-[20px]">
                  lock
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] placeholder:text-[#707881] focus:bg-white focus:ring-2 focus:ring-[#006194] focus:outline-none transition-all border border-transparent focus:border-[#006194]"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-[#707881] hover:text-[#0b1c30] transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]" id="password-eye-icon">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember & Security Row */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006194] focus:ring-0 cursor-pointer accent-[#006194]"
                />
                <span className="text-[12px] text-[#3f4850] select-none font-medium">
                  Remember this device
                </span>
              </label>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006947] bg-[#effcf6] px-2 py-0.5 rounded-md border border-[#c1f4db]">
                <span className="material-symbols-outlined text-[14px]">verified_user</span>
                Trusted Unit
              </span>
            </div>

            {/* Main Action CTA */}
            <button
              id="submit-cta"
              type="submit"
              disabled={isLoading}
              className="w-full h-[52px] mt-1 rounded-xl bg-[#006194] hover:bg-[#007bb9] active:scale-[0.99] text-white text-[14px] font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Login' : 'Create Account'}</span>
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          {/* Visual Splitter */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full h-px bg-[#d3e4fe]"></div>
            <span className="absolute px-3 bg-white text-[12px] font-medium text-[#707881]">
              or continue with
            </span>
          </div>

          {/* Federated Quick Auth */}
          <div className="grid grid-cols-2 gap-3">
            {/* Google */}
            <button
              type="button"
              onClick={() => handleQuickAuth('Google')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[14px] font-semibold active:scale-[0.98] transition-all border border-[#d3e4fe]/50 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Google</span>
            </button>

            {/* Apple */}
            <button
              type="button"
              onClick={() => handleQuickAuth('Apple')}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 h-12 rounded-xl bg-[#eff4ff] hover:bg-[#e5eeff] text-[#0b1c30] text-[14px] font-semibold active:scale-[0.98] transition-all border border-[#d3e4fe]/50 cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.02.62-2.67 1.37-.58.66-1.08 1.72-1.03 2.76 1.04.08 2.07-.53 2.69-1.28z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Quick Demo Credentials Fill Button */}
          <div className="mt-4 pt-3 border-t border-[#f1f5f9] text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium text-[#006194] bg-[#eff4ff] hover:bg-[#e0f0fe] rounded-lg transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">key</span>
              <span>Fill Verified Patient Demo Account</span>
            </button>
          </div>

          {/* Toggle Footer Lead */}
          <div className="mt-4 pt-2 text-center">
            <p className="text-[14px] text-[#3f4850]">
              <span>{mode === 'login' ? 'New to NutriAI?' : 'Already have an account?'}</span>{' '}
              <button
                id="footer-toggle-btn"
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-[#006194] hover:underline focus:outline-none ml-1 cursor-pointer"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Medical Care Team Spotlight / Reassurance Snapshot */}
        <div className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-sm border border-[#e5eeff] mb-6">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#d3e4fe] border border-slate-200">
            <img
              className="w-full h-full object-cover"
              alt="Dr. Sarah Jenkins, MD"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgok82iLZmBm92-YmTHYPi-QN_60LyvTHBSNS-OIpktHH2mZgcJnfGhrd9J3bJEnnO9tXE2HFIeEnhko558DqvpahUre2heWL4ydeetViirU9zYJ4hinN3jLSPWCKmwUK0hpDIlqLJzmRjd834Zzf_FBFgKfUFvLSXU6aW7KooiUBFFgXqIFNBb_bg8Xbhd5k38m_Ju7FWXMDtWgpk2gwlMOpCuVzKjls0cGMUnIYsoOTTU2CY5rJx"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                Dr. Sarah Jenkins, MD
              </span>
              <span className="material-symbols-outlined text-[#006a61] text-[16px]">
                check_circle
              </span>
            </div>
            <p className="text-[12px] text-[#3f4850] truncate">
              "Your medical records are synchronized in real-time."
            </p>
          </div>
        </div>

        {/* Trust & Regulatory Micro-footer */}
        <div className="flex flex-col items-center justify-center gap-1 text-center px-4">
          <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#006a61]">
            <span className="material-symbols-outlined text-[16px]">lock</span>
            <span>256-bit HIPAA-compliant encryption</span>
          </div>
          <p className="text-[11px] text-[#707881]">
            Protected health information (PHI) verified • ISO 27001 Certified
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#006194] text-[24px]">lock_reset</span>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Password Recovery</h3>
              </div>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-[#effcf6] text-[#006947] flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                </div>
                <p className="text-[14px] font-semibold text-[#0b1c30] mb-1">Recovery Code Sent</p>
                <p className="text-[12px] text-[#3f4850] mb-5">
                  Check your inbox or SMS for instructions to securely restore your clinical access credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full h-11 bg-[#006194] text-white rounded-xl text-[14px] font-bold"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <p className="text-[12px] text-[#3f4850] leading-relaxed">
                  Enter your verified email or mobile number associated with your NutriAI clinical file to receive an authorized passkey link.
                </p>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] focus:bg-white focus:ring-2 focus:ring-[#006194] focus:outline-none"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 h-11 bg-[#f1f5f9] text-[#3f4850] text-[14px] font-semibold rounded-xl hover:bg-[#e2e8f0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-[#006194] text-white text-[14px] font-bold rounded-xl hover:bg-[#007bb9]"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </main>
  );
};
