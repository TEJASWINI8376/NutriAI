import React from "react";
import { NutriAILogo } from "./NutriAILogo";
import { UserProfile } from "../types";
import { ShieldCheck } from "lucide-react";

interface HeaderProps {
  user: UserProfile | null;
  onOpenProfile: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenProfile,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#f8f9ff]/90 backdrop-blur-md px-4 sm:px-6 py-3.5 border-b border-[#e5eeff]/80 transition-all">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* NutriAI Brand Logo */}
        <div
          className="cursor-pointer select-none transition-transform hover:scale-[1.02] active:scale-95"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          title="NutriAI Health Platform"
        >
          <NutriAILogo size="md" layout="horizontal" showText={true} />
        </div>

        {/* User Avatar with NutriAI Verified Status */}
        <div className="flex items-center gap-2">
          {user ? (
            <button
              onClick={onOpenProfile}
              className="relative p-0.5 rounded-full ring-2 ring-[#006194]/20 hover:ring-[#006194] transition-all focus:outline-none focus:ring-2 focus:ring-[#006194]"
              title={`${user.name} (NutriAI ID: ${user.nutriAiId})`}
            >
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
              {user.verifiedVault && (
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-[#10b981] border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-2 h-2 text-white" />
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="text-xs font-semibold px-3 py-1.5 bg-[#006194] text-white rounded-lg shadow-sm hover:bg-[#004e77] transition-all"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
