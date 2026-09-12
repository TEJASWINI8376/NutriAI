import React, { useState, useEffect } from 'react';
import { SignupStep1 } from './components/SignupStep1';
import { SignupStep2 } from './components/SignupStep2';
import { LoginScreen } from './components/LoginScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { LiveSupportModal } from './components/LiveSupportModal';
import { TermsModal } from './components/TermsModal';
import { NutriAiLogo } from './components/NutriAiLogo';
import { AppScreen, UserProfile } from './types';
import { Shield, Layers } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('signup_step1');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isTermsOpen, setIsTermsOpen] = useState(false);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'usr_carepulse_001',
    fullName: 'Alexander Mitchell',
    contact: 'alexander.mitchell@carepulse.health',
    dob: '1991-10-14',
    gender: 'Male',
    createdAt: new Date().toISOString(),
    step2Completed: false,
    medicalProfile: {
      primaryPhysician: 'Dr. Elena Vance, MD (CarePulse Clinical)',
      dietaryPreferences: ['Low Glycemic', 'High Protein'],
      allergies: ['Shellfish', 'Penicillin'],
      dailyCalorieTarget: 2200,
      targetWeight: '76 kg',
      bloodType: 'O+',
      emergencyContactName: 'Sarah Mitchell (Spouse)',
      emergencyContactPhone: '+1 (555) 234-5678',
      notes: 'Active biomarker telemetry monitoring.',
    },
  });

  // Fetch initial profile from backend if available
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUserProfile((prev) => ({ ...prev, ...data.user }));
        }
      })
      .catch((err) => {
        console.log('App running in client mode or initial fetch:', err);
      });
  }, []);

  const handleStep1Next = (updatedFields: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updatedFields }));
    setCurrentScreen('signup_step2');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStep2Complete = (updatedFields: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updatedFields }));
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (loginData: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...loginData }));
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col items-center justify-start antialiased selection:bg-[#cce5ff] selection:text-[#001d31]">
      {/* Top Preview Bar for reviewing screens seamlessly */}
      <nav
        aria-label="Screen Navigation"
        className="w-full bg-white/95 backdrop-blur-xs border-b border-[#e2e8f0] py-2 px-4 sticky top-0 z-30 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <NutriAiLogo size="xs" />
        </div>

        {/* Screen switcher tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setCurrentScreen('signup_step1')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'signup_step1'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-[#475569] hover:bg-[#eff4ff] hover:text-[#006194]'
            }`}
          >
            1. Create Account
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('signup_step2')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'signup_step2'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-[#475569] hover:bg-[#eff4ff] hover:text-[#006194]'
            }`}
          >
            2. Health Profile
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('login')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'login'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-[#475569] hover:bg-[#eff4ff] hover:text-[#006194]'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => setCurrentScreen('dashboard')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              currentScreen === 'dashboard'
                ? 'bg-[#006194] text-white shadow-xs'
                : 'text-[#475569] hover:bg-[#eff4ff] hover:text-[#006194]'
            }`}
          >
            Records Dashboard
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex flex-col items-center justify-start pb-12">
        {currentScreen === 'signup_step1' && (
          <SignupStep1
            currentUser={userProfile}
            onNext={handleStep1Next}
            onGoToLogin={() => setCurrentScreen('login')}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenTerms={() => setIsTermsOpen(true)}
          />
        )}

        {currentScreen === 'signup_step2' && (
          <SignupStep2
            userData={userProfile}
            onBack={() => setCurrentScreen('signup_step1')}
            onComplete={handleStep2Complete}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}

        {currentScreen === 'login' && (
          <LoginScreen
            onLoginSuccess={handleLoginSuccess}
            onGoToSignup={() => setCurrentScreen('signup_step1')}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}

        {currentScreen === 'dashboard' && (
          <DashboardScreen
            user={userProfile}
            onLogout={() => setCurrentScreen('login')}
            onEditProfile={() => setCurrentScreen('signup_step2')}
            onOpenSupport={() => setIsSupportOpen(true)}
          />
        )}
      </main>

      {/* Modals */}
      <LiveSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
      />
    </div>
  );
}
