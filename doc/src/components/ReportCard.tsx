import React from "react";
import { MedicalReport } from "../types";
import {
  FlaskConical,
  HeartPulse,
  ClipboardList,
  Scan,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  RotateCw,
} from "lucide-react";

interface ReportCardProps {
  report: MedicalReport;
  onView: (report: MedicalReport) => void;
  onReview: (report: MedicalReport) => void;
}

export const ReportCard: React.FC<ReportCardProps> = ({
  report,
  onView,
  onReview,
}) => {
  // Category specific icon and colors
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Laboratory":
        return {
          icon: FlaskConical,
          bg: "bg-[#eff4ff]",
          text: "text-[#006194]",
        };
      case "Diagnostics":
        return {
          icon: HeartPulse,
          bg: "bg-[#ffebee]",
          text: "text-[#e11d48]",
        };
      case "Clinical Summary":
        return {
          icon: ClipboardList,
          bg: "bg-[#fef3c7]",
          text: "text-[#d97706]",
        };
      case "Radiology Scan":
        return {
          icon: Scan,
          bg: "bg-[#f3e8ff]",
          text: "text-[#9333ea]",
        };
      default:
        return {
          icon: FileSpreadsheet,
          bg: "bg-[#f1f5f9]",
          text: "text-[#64748b]",
        };
    }
  };

  const catStyle = getCategoryIcon(report.category);
  const Icon = catStyle.icon;

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_14px_-2px_rgba(0,97,148,0.08)] transition-all">
      {/* Header Row: Icon + Title & Subtitle */}
      <div className="flex items-start gap-3.5">
        {/* Leading Category Square Icon */}
        <div
          className={`w-11 h-11 rounded-xl ${catStyle.bg} ${catStyle.text} flex items-center justify-center shrink-0 shadow-xs`}
        >
          <Icon className="w-5 h-5" />
        </div>

        {/* Title and Metadata */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[16px] font-bold text-[#0b1c30] truncate font-['Plus_Jakarta_Sans'] leading-snug">
            {report.title}
          </h3>
          <p className="text-[13px] text-[#64748b] mt-0.5 truncate">
            {report.date} • {report.facility}
          </p>
        </div>
      </div>

      {/* Warning Banner for Handwritten Notes / Needs Review */}
      {report.warning && (
        <div className="mt-3 bg-[#fefce8] border border-[#fef08a] rounded-xl px-3 py-2 flex items-center gap-2 text-[12px] text-[#92400e]">
          <AlertTriangle className="w-4 h-4 text-[#f59e0b] shrink-0" />
          <span className="truncate font-medium">{report.warning}</span>
        </div>
      )}

      {/* Processing Progress Bar for Active OCR / DICOM Extraction */}
      {report.status === "Processing" && (
        <div className="mt-3 bg-[#eff6ff] border border-[#dbeafe] rounded-xl p-3">
          <div className="flex items-center justify-between text-[12px] font-semibold text-[#006194] mb-1.5">
            <div className="flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-[#006194]" />
              <span>{report.processingTask || "Extracting DICOM biomarkers"}</span>
            </div>
            <span>{report.progress || 78}%</span>
          </div>
          <div className="w-full bg-[#bfdbfe]/50 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#006194] h-full rounded-full transition-all duration-500"
              style={{ width: `${report.progress || 78}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer Row: Tags + Status + Action Button */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#f8f9ff]">
        <div className="flex flex-wrap items-center gap-2">
          {/* File/Page Tag */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#eff4ff] text-[#006194] text-[12px] font-medium">
            <FileSpreadsheet className="w-3.5 h-3.5 opacity-80" />
            <span>
              {report.category}
              {report.fileSize ? ` • ${report.fileSize}` : ""}
              {report.pages ? ` • ${report.pages}` : ""}
            </span>
          </div>

          {/* Status Badge */}
          {report.status === "Verified" && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-[#047857] text-[12px] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
              <span>Verified</span>
            </div>
          )}

          {report.status === "Needs Review" && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fef3c7] text-[#b45309] text-[12px] font-semibold">
              <AlertCircle className="w-3.5 h-3.5 text-[#f59e0b]" />
              <span>Needs Review</span>
            </div>
          )}

          {report.status === "Processing" && (
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#e0f2fe] text-[#0369a1] text-[12px] font-semibold">
              <span>Processing OCR</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        {report.status === "Needs Review" ? (
          <button
            onClick={() => onReview(report)}
            className="px-3.5 py-1.5 rounded-lg bg-[#f59e0b] hover:bg-[#d97706] text-white text-[13px] font-semibold shadow-sm transition-all focus:ring-2 focus:ring-[#f59e0b]/40"
          >
            Review Data
          </button>
        ) : (
          <button
            onClick={() => onView(report)}
            className="px-3.5 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#dbeafe] text-[#006194] text-[13px] font-semibold transition-all"
          >
            View
          </button>
        )}
      </div>
    </div>
  );
};
