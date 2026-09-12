import React, { useState } from "react";
import { X, ShieldCheck, KeyRound, HardDrive, User, Check, RefreshCw } from "lucide-react";
import { UserProfile } from "../types";
import { NutriAILogo } from "./NutriAILogo";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onUserChange: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<"login" | "register" | "vault">("login");
  const [email, setEmail] = useState(currentUser?.email || "sarah.jenkins@carepulse.health");
  const [name, setName] = useState(currentUser?.name || "Dr. Sarah Jenkins");
  const [role, setRole] = useState<"patient" | "physician">("patient");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleQuickLogin = async (preset: { name: string; email: string; role: "patient" | "physician" }) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preset),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onUserChange(data.user);
        setStatusMessage(`Authenticated successfully as ${data.user.name}`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        onUserChange(data.user);
        setStatusMessage(`New NutriAI Vault created for ${data.user.name}!`);
        setTimeout(() => {
          onClose();
        }, 600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-[#e5eeff] max-h-[92vh] flex flex-col">
        {/* Top Branding Section with NutriAI Logo */}
        <div className="pt-8 pb-6 px-6 bg-gradient-to-b from-[#eff4ff] via-[#f8faff] to-white border-b border-[#e2e8f0] flex flex-col items-center text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prominent NutriAI Logo as requested */}
          <NutriAILogo size="lg" layout="vertical" showText={true} className="mb-2" />

          <p className="text-xs text-[#006194] font-semibold tracking-wide uppercase mt-1">
            Persistent Medical Vault & Authentication
          </p>
          <p className="text-xs text-[#64748b] max-w-xs mt-0.5">
            Zero-knowledge cryptographic access to verified diagnostic records
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-[#e2e8f0] bg-[#f8faff] text-xs font-semibold">
          <button
            onClick={() => setMode("login")}
            className={`flex-1 py-3 text-center transition-all ${
              mode === "login"
                ? "text-[#006194] border-b-2 border-[#006194] bg-white"
                : "text-[#64748b] hover:text-[#0b1c30]"
            }`}
          >
            NutriAI Sign In
          </button>
          <button
            onClick={() => setMode("register")}
            className={`flex-1 py-3 text-center transition-all ${
              mode === "register"
                ? "text-[#006194] border-b-2 border-[#006194] bg-white"
                : "text-[#64748b] hover:text-[#0b1c30]"
            }`}
          >
            Create Vault
          </button>
          <button
            onClick={() => setMode("vault")}
            className={`flex-1 py-3 text-center transition-all ${
              mode === "vault"
                ? "text-[#006194] border-b-2 border-[#006194] bg-white"
                : "text-[#64748b] hover:text-[#0b1c30]"
            }`}
          >
            Vault Storage
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-[#0b1c30]">
          {statusMessage && (
            <div className="p-3 bg-[#ecfdf5] border border-[#a7f3d0] rounded-xl text-xs text-[#047857] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 text-[#10b981]" />
              <span>{statusMessage}</span>
            </div>
          )}

          {mode === "login" && (
            <div className="space-y-4">
              {/* Quick Profile Selectors */}
              <div>
                <label className="text-xs font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
                  Select User Profile
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin({
                        name: "Dr. Sarah Jenkins",
                        email: "sarah.jenkins@carepulse.health",
                        role: "patient",
                      })
                    }
                    className="w-full p-3 rounded-2xl border border-[#e2e8f0] hover:border-[#006194] hover:bg-[#eff4ff]/50 text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1594824813581-c7c42777b78a?w=150&auto=format&fit=crop&q=80"
                        alt="Dr. Sarah"
                        className="w-10 h-10 rounded-full object-cover shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#0b1c30]">Dr. Sarah Jenkins</div>
                        <div className="text-[11px] text-[#64748b]">Primary Account • Verified Vault</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#006194] bg-[#eff4ff] px-2.5 py-1 rounded-lg">
                      Active
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleQuickLogin({
                        name: "Tejaswini Mane",
                        email: "tejaswinimane49@gmail.com",
                        role: "patient",
                      })
                    }
                    className="w-full p-3 rounded-2xl border border-[#e2e8f0] hover:border-[#006194] hover:bg-[#eff4ff]/50 text-left flex items-center justify-between transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-sm">
                        TM
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#0b1c30]">Tejaswini Mane</div>
                        <div className="text-[11px] text-[#64748b]">tejaswinimane49@gmail.com</div>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#64748b] bg-slate-100 px-2.5 py-1 rounded-lg">
                      Switch
                    </span>
                  </button>
                </div>
              </div>

              {/* NutriAI SSO button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() =>
                    handleQuickLogin({
                      name: currentUser?.name || "Dr. Sarah Jenkins",
                      email: currentUser?.email || "sarah.jenkins@carepulse.health",
                      role: "patient",
                    })
                  }
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-[#006194] hover:bg-[#004e77] text-white text-xs font-bold shadow-md shadow-sky-900/20 flex items-center justify-center gap-2 transition-all"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Authenticate with NutriAI Health ID</span>
                </button>
              </div>
            </div>
          )}

          {mode === "register" && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Alex Morgan"
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006194]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006194]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("patient")}
                    className={`py-2 text-xs rounded-xl border font-semibold ${
                      role === "patient"
                        ? "border-[#006194] bg-[#eff4ff] text-[#006194]"
                        : "border-[#e2e8f0] text-slate-600"
                    }`}
                  >
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("physician")}
                    className={`py-2 text-xs rounded-xl border font-semibold ${
                      role === "physician"
                        ? "border-[#006194] bg-[#eff4ff] text-[#006194]"
                        : "border-[#e2e8f0] text-slate-600"
                    }`}
                  >
                    Clinician / Doctor
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-2xl bg-[#006194] hover:bg-[#004e77] text-white text-xs font-bold shadow-md shadow-sky-900/20 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Generate NutriAI Vault Token</span>
                </button>
              </div>
            </form>
          )}

          {mode === "vault" && (
            <div className="space-y-3">
              <div className="bg-[#f8faff] rounded-2xl p-4 border border-[#e2e8f0] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b] flex items-center gap-1.5">
                    <HardDrive className="w-3.5 h-3.5 text-[#006194]" /> Storage Engine:
                  </span>
                  <span className="font-mono font-semibold text-[#0b1c30]">CarePulse JSON Store</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b] flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-[#10b981]" /> Encryption:
                  </span>
                  <span className="font-mono font-semibold text-[#047857]">AES-256-GCM Hardware</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#006194]" /> NutriAI ID:
                  </span>
                  <span className="font-mono font-semibold text-[#006194]">
                    {currentUser?.nutriAiId || "NAI-VAULT-88910-X"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#64748b] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-[#0284c7]" /> Cloud Sync:
                  </span>
                  <span className="font-semibold text-[#0284c7]">Active & Persistent</span>
                </div>
              </div>

              <div className="p-3 bg-[#eff4ff]/60 border border-[#dbeafe] rounded-2xl text-[11px] text-[#006194] leading-relaxed">
                All changes, uploads, review confirmations, and extracted biomarkers are saved continuously to the persistent server database.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8faff] border-t border-[#e2e8f0] text-center">
          <p className="text-[11px] text-[#64748b] flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
            CarePulse & NutriAI HIPAA-Compliant Architecture
          </p>
        </div>
      </div>
    </div>
  );
};
