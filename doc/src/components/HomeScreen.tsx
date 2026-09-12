import React from "react";
import { UserProfile, MedicalReport, HealthVital } from "../types";
import {
  Activity,
  Heart,
  Droplet,
  Wind,
  PlusCircle,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { NutriAILogo } from "./NutriAILogo";

interface HomeScreenProps {
  user: UserProfile | null;
  reports: MedicalReport[];
  vitals: HealthVital[];
  onOpenUpload: () => void;
  onGoToReports: () => void;
  onReviewReport: (report: MedicalReport) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  user,
  reports,
  vitals,
  onOpenUpload,
  onGoToReports,
  onReviewReport,
}) => {
  const needsReviewReports = reports.filter((r) => r.status === "Needs Review");
  const verifiedCount = reports.filter((r) => r.status === "Verified").length;

  const vitalIcons: Record<string, any> = {
    "Blood Pressure": Activity,
    "Resting Heart Rate": Heart,
    "Fasting Glucose": Droplet,
    "Blood Oxygen (SpO2)": Wind,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome & NutriAI Vault Status Banner */}
      <div className="bg-gradient-to-r from-[#006194] to-[#004e77] text-white rounded-3xl p-5 sm:p-6 shadow-lg shadow-sky-900/10 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider bg-white/20 px-2.5 py-1 rounded-full text-white/95 flex items-center gap-1.5 backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              NutriAI Verified Vault
            </span>
            <span className="text-[11px] font-mono text-sky-200">
              {user?.nutriAiId || "NAI-VAULT-88910-X"}
            </span>
          </div>

          <h2 className="text-2xl font-bold font-['Plus_Jakarta_Sans'] mt-3">
            Hello, {user?.name || "Patient"}
          </h2>
          <p className="text-xs text-sky-100/90 mt-1 max-w-sm">
            All diagnostic records are synchronized and encrypted with AES-256 persistent hardware storage.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenUpload}
              className="px-4 py-2 bg-white text-[#006194] rounded-xl text-xs font-bold hover:bg-sky-50 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload New Report</span>
            </button>
            <button
              onClick={onGoToReports}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition-all flex items-center gap-1.5"
            >
              <span>View Reports ({reports.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Ambient Decorative Graphic */}
        <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Needs Review Alert Tile (if any) */}
      {needsReviewReports.length > 0 && (
        <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-4 flex items-start justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#f59e0b] text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-[#78350f]">
                {needsReviewReports.length} Report Requires Verification
              </h3>
              <p className="text-[11px] text-[#92400e] mt-0.5">
                Handwritten notes detected in "{needsReviewReports[0].title}". Confirm values to seal report.
              </p>
            </div>
          </div>
          <button
            onClick={() => onReviewReport(needsReviewReports[0])}
            className="px-3 py-1.5 bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold rounded-lg shrink-0 transition-colors"
          >
            Review
          </button>
        </div>
      )}

      {/* Vitals Metric Tiles (Two-column layout as specified in guidelines) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
            Vitals & Physiological Metrics
          </h3>
          <span className="text-[11px] text-[#006194] font-medium">
            Sync: {user?.lastSync || "Live"}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {vitals.map((vit) => {
            const Icon = vitalIcons[vit.label] || Activity;
            return (
              <div
                key={vit.id}
                className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]"
              >
                <div className="flex items-center justify-between text-[#64748b]">
                  <span className="text-xs font-medium truncate">{vit.label}</span>
                  <div className="w-7 h-7 rounded-lg bg-[#eff4ff] text-[#006194] flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2.5 flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                    {vit.value}
                  </span>
                  <span className="text-xs text-[#64748b] font-medium">{vit.unit}</span>
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px]">
                  <span className="text-[#047857] font-semibold bg-[#ecfdf5] px-2 py-0.5 rounded-md">
                    {vit.status}
                  </span>
                  <span className="text-[#94a3b8] text-[10px]">{vit.lastRecorded}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* NutriAI Engine Insight */}
      <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] flex items-center gap-3.5 shadow-xs">
        <NutriAILogo size="sm" showText={false} />
        <div className="flex-1">
          <div className="flex items-center gap-1 text-xs font-bold text-[#006194]">
            <Sparkles className="w-3.5 h-3.5 text-[#008ba3]" />
            NutriAI Health Diagnostic Summary
          </div>
          <p className="text-[12px] text-[#475569] mt-0.5">
            {verifiedCount} verified clinical tests indicate stable renal, hepatic, and metabolic parameters within standard ranges.
          </p>
        </div>
      </div>
    </div>
  );
};
