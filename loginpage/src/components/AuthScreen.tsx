import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Key,
  CheckCircle2,
  Sparkles,
  X,
  MailCheck,
  Activity,
  Loader2,
  Leaf,
} from 'lucide-react';
import { api } from '../api.ts';
import type { User } from '../types.ts';

interface AuthScreenProps {
  onSuccess: (user: User) => void;
  showToast: (message: string, icon?: string) => void;
  onOpen3DJourney?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, showToast, onOpen3DJourney }) => {
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
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-10 bg-[#f8faff] overflow-hidden">
      {onOpen3DJourney && (
        <button
          onClick={onOpen3DJourney}
          className="fixed top-5 left-5 z-50 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-slate-200 text-slate-700 text-xs font-bold shadow-xs hover:bg-white active:scale-95 transition-all cursor-pointer"
        >
          <span>← Back to 3D Story</span>
        </button>
      )}

      {/* Soft Ambient Background Glows */}
      <div className="absolute top-10 -left-24 w-80 h-80 bg-emerald-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-24 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-md">
        {/* Top Brand Hub */}
        <div className="flex flex-col items-center text-center mb-6 px-2">
          {/* Brand Logo Emblem */}
          <div className="relative flex items-center justify-center w-20 h-20 mb-3 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 shadow-xl shadow-emerald-700/20 p-4 border border-emerald-400/30">
            <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white shadow-md border-2 border-white">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <div className="relative flex items-center justify-center text-white">
              <Leaf className="w-9 h-9 text-emerald-200" />
              <Activity className="w-5 h-5 text-white absolute -bottom-0.5" />
            </div>
          </div>

          {/* App Title & Subtitle */}
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-1 font-sans">
            Nutri<span className="text-emerald-600">AI</span>
          </h1>
          <p className="text-sm text-slate-600 max-w-xs leading-relaxed">
            Your AI-powered nutrition and health intelligence, verified.
          </p>

          {/* Gateway Status Badge */}
          <div className="inline-flex items-center gap-2 mt-3 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Clinical Gateway Online
            </span>
          </div>
        </div>

        {/* Primary Interactive Card */}
        <div className="w-full bg-white/95 backdrop-blur-md rounded-3xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.08)] border border-slate-200/80 p-6 sm:p-8 mb-5">
          {/* Segmented Mode Switcher */}
          <div className="relative flex p-1 mb-6 rounded-xl bg-slate-100/90 border border-slate-200/60" role="tablist">
            <button
              id="tab-login"
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-center cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              id="tab-register"
              type="button"
              onClick={() => setMode('register')}
              className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 text-center cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} id="auth-form">
            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 px-0.5" htmlFor="name-input">
                  Full Legal Name
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <input
                    id="name-input"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Eleanor Vance"
                    required={mode === 'register'}
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Identifier Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-700 px-0.5" htmlFor="identifier-input">
                Mobile Number or Email
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  id="identifier-input"
                  type="text"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                  className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 px-0.5" htmlFor="phone-input">
                  Mobile Phone for SMS Verification
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 234-5678"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between px-0.5">
                <label className="text-xs font-bold text-slate-700" htmlFor="password-input">
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
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full h-12 pl-11 pr-12 rounded-xl bg-slate-50 text-slate-900 text-sm placeholder:text-slate-400 border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  aria-label="Toggle password visibility"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember & Security Row */}
            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 accent-emerald-600 cursor-pointer"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Remember this device
                </span>
              </label>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trusted Unit</span>
              </span>
            </div>

            {/* Main Action CTA */}
            <button
              id="submit-cta"
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-1 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white text-sm font-bold shadow-md shadow-emerald-700/20 hover:shadow-lg hover:shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Visual Splitter */}
          <div className="relative flex items-center justify-center my-6">
            <div className="w-full h-px bg-slate-200"></div>
            <span className="absolute px-3 bg-white text-xs font-medium text-slate-500">
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
              className="flex items-center justify-center gap-2.5 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold active:scale-[0.98] transition-all border border-slate-200 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
              className="flex items-center justify-center gap-2 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold active:scale-[0.98] transition-all border border-slate-200 cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 1.01-2.85-.92.04-2.02.62-2.67 1.37-.58.66-1.08 1.72-1.03 2.76 1.04.08 2.07-.53 2.69-1.28z" />
              </svg>
              <span>Apple</span>
            </button>
          </div>

          {/* Quick Demo Credentials Fill Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={fillDemoAccount}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs group"
            >
              <Key className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform shrink-0" />
              <span>Auto-Fill Demo Patient Account</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            </button>
          </div>

          {/* Mode Switch Toggle Footer */}
          <div className="mt-4 pt-2 text-center">
            <p className="text-xs text-slate-600">
              <span>{mode === 'login' ? 'New to NutriAI?' : 'Already have an account?'}</span>{' '}
              <button
                id="footer-toggle-btn"
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="font-bold text-emerald-600 hover:text-emerald-700 hover:underline focus:outline-none ml-1 cursor-pointer"
              >
                {mode === 'login' ? 'Create Account' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>

        {/* Medical Care Team Spotlight */}
        <div className="w-full flex items-center gap-3.5 p-3.5 rounded-2xl bg-white/90 backdrop-blur-xs shadow-xs border border-slate-200/80 mb-5">
          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 bg-slate-100 border border-slate-200 shadow-2xs">
            <img
              className="w-full h-full object-cover"
              alt="Dr. Sarah Jenkins, MD"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgok82iLZmBm92-YmTHYPi-QN_60LyvTHBSNS-OIpktHH2mZgcJnfGhrd9J3bJEnnO9tXE2HFIeEnhko558DqvpahUre2heWL4ydeetViirU9zYJ4hinN3jLSPWCKmwUK0hpDIlqLJzmRjd834Zzf_FBFgKfUFvLSXU6aW7KooiUBFFgXqIFNBb_bg8Xbhd5k38m_Ju7FWXMDtWgpk2gwlMOpCuVzKjls0cGMUnIYsoOTTU2CY5rJx"
            />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 truncate">
                Dr. Sarah Jenkins, MD
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            </div>
            <p className="text-[11px] text-slate-600 truncate mt-0.5">
              "Your medical records are synchronized in real-time."
            </p>
          </div>
        </div>

        {/* Trust & Regulatory Micro-footer */}
        <div className="flex flex-col items-center justify-center gap-1 text-center px-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-bit HIPAA-compliant encryption</span>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Protected health information (PHI) verified • ISO 27001 Certified
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotPasswordOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">Password Recovery</h3>
              </div>
              <button
                onClick={() => setForgotPasswordOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {resetSent ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <MailCheck className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-900 mb-1">Recovery Code Sent</p>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Check your inbox or SMS for instructions to securely restore your clinical access credentials.
                </p>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(false)}
                  className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-colors cursor-pointer"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Enter your verified email or mobile number associated with your NutriAI clinical file to receive an authorized passkey link.
                </p>
                <input
                  type="text"
                  value={resetIdentifier}
                  onChange={(e) => setResetIdentifier(e.target.value)}
                  placeholder="name@example.com or phone"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-slate-50 text-slate-900 text-sm border border-slate-200 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:outline-none transition-all"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotPasswordOpen(false)}
                    className="flex-1 h-11 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-11 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
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
