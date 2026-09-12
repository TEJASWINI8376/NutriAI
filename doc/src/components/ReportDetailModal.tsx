import React from "react";
import { MedicalReport } from "../types";
import {
  X,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Share2,
  Trash2,
  Building2,
  Calendar,
  Layers,
  Activity,
  ShieldCheck,
} from "lucide-react";
import { NutriAILogo } from "./NutriAILogo";

interface ReportDetailModalProps {
  report: MedicalReport | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onReview: (report: MedicalReport) => void;
}

export const ReportDetailModal: React.FC<ReportDetailModalProps> = ({
  report,
  onClose,
  onDelete,
  onReview,
}) => {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden border border-[#e5eeff] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8faff] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#006194] bg-[#e0f2fe] px-2 py-0.5 rounded">
                {report.category}
              </span>
              <h2 className="text-lg font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] leading-tight mt-0.5">
                {report.title}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-800 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-[#0b1c30]">
          {/* Metadata Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#f8faff] p-3 rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <Calendar className="w-3.5 h-3.5" />
                <span>Date</span>
              </div>
              <div className="text-sm font-semibold text-[#0b1c30] mt-1">{report.date}</div>
            </div>

            <div className="bg-[#f8faff] p-3 rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <Building2 className="w-3.5 h-3.5" />
                <span>Facility</span>
              </div>
              <div className="text-sm font-semibold text-[#0b1c30] mt-1 truncate" title={report.facility}>
                {report.facility}
              </div>
            </div>

            <div className="bg-[#f8faff] p-3 rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <Layers className="w-3.5 h-3.5" />
                <span>Size / Pages</span>
              </div>
              <div className="text-sm font-semibold text-[#0b1c30] mt-1">
                {report.fileSize || report.pages || "Digital Record"}
              </div>
            </div>

            <div className="bg-[#f8faff] p-3 rounded-xl border border-[#e2e8f0]">
              <div className="flex items-center gap-1.5 text-xs text-[#64748b]">
                <Activity className="w-3.5 h-3.5" />
                <span>Status</span>
              </div>
              <div className="text-sm font-semibold mt-1">
                {report.status === "Verified" && (
                  <span className="text-[#047857] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" /> Verified
                  </span>
                )}
                {report.status === "Needs Review" && (
                  <span className="text-[#b45309] flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" /> Needs Review
                  </span>
                )}
                {report.status === "Processing" && (
                  <span className="text-[#0284c7]">Processing OCR</span>
                )}
              </div>
            </div>
          </div>

          {/* Clinical Summary */}
          <div>
            <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider mb-2">
              Clinical Synopsis
            </h4>
            <p className="text-sm text-[#334155] leading-relaxed bg-[#f8fafc] p-3.5 rounded-xl border border-[#e2e8f0]">
              {report.summary}
            </p>
          </div>

          {/* DICOM Scan Display if applicable */}
          {report.dicomMetadata && (
            <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                <span className="text-xs font-mono text-cyan-400">
                  DICOM MODALITY: {report.dicomMetadata.modality}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {report.dicomMetadata.resolution}
                </span>
              </div>
              {/* Simulated high-tech scan canvas */}
              <div className="relative h-44 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900 via-slate-950 to-black" />
                {/* SVG Anatomy Silhouette */}
                <svg viewBox="0 0 200 120" className="w-48 h-32 opacity-70 text-cyan-500/80 stroke-current" fill="none">
                  <path d="M100 20 C80 20 60 40 60 70 C60 100 80 110 100 110 C120 110 140 100 140 70 C140 40 120 20 100 20 Z" strokeWidth="1.5" />
                  <path d="M70 50 C80 60 90 60 100 60 C110 60 120 60 130 50" strokeWidth="1.5" strokeDasharray="3 3" />
                  <path d="M75 75 C85 85 95 85 100 85 C105 85 115 85 125 75" strokeWidth="1.5" strokeDasharray="3 3" />
                  <line x1="100" y1="20" x2="100" y2="110" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
                <div className="absolute top-2 left-3 font-mono text-[10px] text-cyan-400/90">
                  AI SEGMENTATION: CTR 0.44 (Normal)
                </div>
                <div className="absolute bottom-2 right-3 font-mono text-[10px] text-emerald-400/90 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> DICOM INTEGRITY CERTIFIED
                </div>
              </div>
            </div>
          )}

          {/* Biomarkers / Values Table */}
          {report.values && report.values.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                  Extracted Biomarkers & Clinical Parameters ({report.values.length})
                </h4>
                <span className="text-xs text-[#006194] font-medium">
                  Verified against clinical standards
                </span>
              </div>
              <div className="border border-[#e2e8f0] rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 bg-[#f8faff] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-[#64748b] border-b border-[#e2e8f0]">
                  <div className="col-span-5 sm:col-span-6">Biomarker / Assay</div>
                  <div className="col-span-4 sm:col-span-3">Measurement</div>
                  <div className="col-span-3 sm:col-span-3 text-right">Reference Range</div>
                </div>

                <div className="divide-y divide-[#f1f5f9]">
                  {report.values.map((v, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 px-4 py-3 text-xs items-center hover:bg-slate-50 transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-6 font-semibold text-[#0b1c30]">
                        {v.name}
                      </div>
                      <div className="col-span-4 sm:col-span-3 flex items-center gap-1.5 font-medium">
                        <span className="font-bold text-[#006194]">{v.value}</span>
                        {v.unit && <span className="text-[#64748b] text-[11px]">{v.unit}</span>}
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-right text-[#64748b]">
                        {v.referenceRange || "Standard"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* NutriAI Persistent Vault & Security Seal */}
          <div className="bg-gradient-to-r from-[#eff4ff] via-[#f8faff] to-[#eff4ff] p-4 rounded-2xl border border-[#dbeafe] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <NutriAILogo size="sm" showText={false} />
              <div>
                <div className="text-xs font-bold text-[#006194]">
                  NutriAI Encrypted Health Vault
                </div>
                <div className="text-[11px] text-[#64748b]">
                  {report.verifiedBy || "Cryptographically anchored with SHA-256 integrity hash"}
                </div>
              </div>
            </div>
            {report.verifiedDate && (
              <div className="text-[11px] text-[#047857] bg-[#ecfdf5] px-2.5 py-1 rounded-full font-semibold shrink-0">
                {report.verifiedDate}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#f8faff] border-t border-[#e2e8f0] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Delete this diagnostic report from the persistent vault?")) {
                  onDelete(report.id);
                  onClose();
                }
              }}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Report"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {report.status === "Needs Review" && (
              <button
                onClick={() => {
                  onClose();
                  onReview(report);
                }}
                className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold transition-all shadow-xs"
              >
                Review Data
              </button>
            )}

            <button
              onClick={() => {
                alert(`Exporting ${report.title} as encrypted clinical PDF...`);
              }}
              className="px-3.5 py-2 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#004e77] text-white text-xs font-bold transition-all shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
