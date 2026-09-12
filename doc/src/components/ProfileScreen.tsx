import React from "react";
import { UserProfile } from "../types";
import {
  ShieldCheck,
  KeyRound,
  HardDrive,
  Mail,
  Fingerprint,
  HeartPulse,
  LogOut,
  AlertCircle,
  Clock,
} from "lucide-react";
import { NutriAILogo } from "./NutriAILogo";

interface ProfileScreenProps {
  user: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  user,
  onOpenAuth,
  onLogout,
}) => {
  if (!user) return null;

  return (
    <div className="space-y-6 pb-12">
      {/* Profile Card Header with NutriAI Verified Rosette */}
      <div className="bg-white rounded-3xl p-6 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] text-center relative overflow-hidden">
        {/* Background Subtle Accent */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-[#eff4ff] via-[#e0f2fe] to-[#eff4ff]" />

        <div className="relative pt-6 flex flex-col items-center">
          {/* Avatar with NutriAI Verified Emblem */}
          <div className="relative">
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#008374] border-2 border-white rounded-full flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-[#0b1c30] mt-3 font-['Plus_Jakarta_Sans']">
            {user.name}
          </h2>
          <div className="text-xs text-[#64748b] flex items-center gap-1 mt-0.5">
            <Mail className="w-3 h-3 text-[#006194]" />
            <span>{user.email}</span>
          </div>

          {/* NutriAI ID Pill */}
          <div className="mt-3 inline-flex items-center gap-2 bg-[#eff4ff] px-3.5 py-1.5 rounded-full border border-[#bfdbfe]">
            <Fingerprint className="w-3.5 h-3.5 text-[#006194]" />
            <span className="font-mono font-bold text-xs text-[#006194]">
              {user.nutriAiId}
            </span>
          </div>
        </div>
      </div>

      {/* Clinical Baseline Parameters */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] space-y-3">
        <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
          Clinical Baseline Profile
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#f8faff] p-3 rounded-2xl border border-[#e2e8f0]">
            <div className="text-xs text-[#64748b]">Blood Group</div>
            <div className="text-sm font-bold text-[#0b1c30] mt-0.5">{user.bloodType}</div>
          </div>

          <div className="bg-[#f8faff] p-3 rounded-2xl border border-[#e2e8f0]">
            <div className="text-xs text-[#64748b]">Known Allergies</div>
            <div className="text-xs font-semibold text-[#b45309] mt-0.5 truncate" title={user.allergies.join(", ")}>
              {user.allergies.join(", ")}
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Storage & Cryptographic Security */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <NutriAILogo size="sm" showText={false} />
            <div>
              <h3 className="text-sm font-bold text-[#0b1c30]">NutriAI Security Engine</h3>
              <p className="text-[11px] text-[#64748b]">Persistent storage & cryptographic integrity</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#047857] bg-[#ecfdf5] px-2.5 py-1 rounded-lg">
            Active
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 bg-[#f8faff] rounded-xl border border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <HardDrive className="w-3.5 h-3.5 text-[#006194]" /> Persistent Database
            </span>
            <span className="font-mono font-bold text-[#0b1c30]">data/carepulse-db.json</span>
          </div>

          <div className="p-3 bg-[#f8faff] rounded-xl border border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-[#10b981]" /> Hardware Vault Encryption
            </span>
            <span className="font-mono font-bold text-[#047857]">{user.vaultEncryption}</span>
          </div>

          <div className="p-3 bg-[#f8faff] rounded-xl border border-[#e2e8f0] flex items-center justify-between">
            <span className="text-[#64748b] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0284c7]" /> Last Synchronization
            </span>
            <span className="font-semibold text-[#0b1c30]">{user.lastSync}</span>
          </div>
        </div>

        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={onOpenAuth}
            className="flex-1 py-2.5 rounded-xl bg-[#eff4ff] hover:bg-[#dbeafe] text-[#006194] text-xs font-bold transition-colors text-center"
          >
            Manage NutriAI ID & Accounts
          </button>
        </div>
      </div>
    </div>
  );
};
