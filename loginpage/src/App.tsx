import { useState, useEffect } from 'react';
import { AuthScreen } from './components/AuthScreen.tsx';
import { PatientPortal } from './components/PatientPortal.tsx';
import { Toast, type ToastMessage } from './components/Toast.tsx';
import { api } from './api.ts';
import type { User } from './types.ts';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (message: string, icon?: string, type: ToastMessage['type'] = 'info') => {
    setToast({
      id: Math.random().toString(),
      message,
      icon,
      type,
    });
  };

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const currentUser = await api.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      } catch {
        // No saved session
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkExistingAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
      showToast('Signed out of clinical gateway.', 'logout');
    } catch {
      setUser(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9ff]">
        <div className="relative flex items-center justify-center w-20 h-20 mb-3 rounded-3xl bg-white shadow-md p-2 border border-slate-100">
          <img
            alt="NutriAI emblem"
            className="w-full h-full object-contain rounded-2xl"
            src="/nutriai-logo.svg"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="inline-block w-5 h-5 border-2 border-[#00855b] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[12px] font-semibold text-[#707881] mt-3">Connecting to NutriAI Intelligence Gateway...</p>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <PatientPortal
          user={user}
          onLogout={handleLogout}
          showToast={showToast}
        />
      ) : (
        <AuthScreen
          onSuccess={(authenticatedUser) => setUser(authenticatedUser)}
          showToast={showToast}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
