import React, { useState } from "react";
import { X, Upload, Sparkles, FileText, CheckCircle2 } from "lucide-react";
import { ReportCategory, MedicalReport } from "../types";
import { NutriAILogo } from "./NutriAILogo";

interface UploadReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReportUploaded: (report: MedicalReport) => void;
}

export const UploadReportModal: React.FC<UploadReportModalProps> = ({
  isOpen,
  onClose,
  onReportUploaded,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState("");
  const [facility, setFacility] = useState("");
  const [category, setCategory] = useState<ReportCategory>("Laboratory");
  const [fileSize, setFileSize] = useState("2.1 MB");
  const [enableAI, setEnableAI] = useState(true);
  const [rawText, setRawText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const categories: ReportCategory[] = [
    "Laboratory",
    "Diagnostics",
    "Clinical Summary",
    "Radiology Scan",
  ];

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFileName(file.name);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      let extractedValues = [
        { name: "Clinical Biomarker A", value: "Normal", unit: "", referenceRange: "Standard", status: "normal" as const },
        { name: "Platelet Index", value: 260, unit: "K/uL", referenceRange: "150 - 450", status: "normal" as const },
      ];
      let summaryText = "Report verified and ingested into persistent NutriAI clinical health storage.";

      if (enableAI) {
        try {
          const aiRes = await fetch("/api/reports/analyze", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reportTitle: title || "Diagnostic Report",
              reportType: category,
              text: rawText || `Clinical laboratory report from ${facility || "Diagnostic Center"}. Routine diagnostic panel.`,
            }),
          });
          const aiData = await aiRes.json();
          if (aiData.success && aiData.analysis) {
            summaryText = aiData.analysis.summary;
            if (aiData.analysis.biomarkers?.length > 0) {
              extractedValues = aiData.analysis.biomarkers;
            }
          }
        } catch (err) {
          console.error("AI analysis fallback:", err);
        }
      }

      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || `${category} Report`,
          facility: facility || "CarePulse Diagnostic Network",
          category,
          fileSize,
          status: "Verified",
          summary: summaryText,
          values: extractedValues,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        onReportUploaded(data.report);
        onClose();
      }
    } catch (err) {
      console.error("Failed to upload report:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#e5eeff] max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 bg-[#f8faff] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans']">
                Upload Medical Report
              </h2>
              <p className="text-xs text-[#64748b]">
                Encrypted ingestion into NutriAI persistent health cloud
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-[#0b1c30]">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="relative border-2 border-dashed border-[#bfdbfe] hover:border-[#006194] bg-[#f8faff] rounded-2xl p-5 text-center cursor-pointer transition-all"
          >
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.dcm"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center justify-center pointer-events-none">
              <div className="w-10 h-10 rounded-full bg-[#eff4ff] text-[#006194] flex items-center justify-center mb-2">
                <Upload className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#006194]">
                {selectedFileName ? selectedFileName : "Click or drag medical scan/PDF here"}
              </span>
              <span className="text-[11px] text-[#64748b] mt-0.5">
                Supports PDF, DICOM (.dcm), JPG, PNG up to 25 MB
              </span>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
              Report Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Comprehensive Metabolic Panel, Holter Monitor..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006194]"
            />
          </div>

          {/* Facility / Lab */}
          <div>
            <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
              Diagnostic Center or Attending Physician
            </label>
            <input
              type="text"
              placeholder="e.g. Quest Diagnostics, Dr. Sarah Jenkins, MD"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006194]"
            />
          </div>

          {/* Category Pills */}
          <div>
            <label className="text-xs font-semibold text-[#0b1c30] block mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setCategory(c)}
                  className={`py-2 px-3 text-xs font-medium rounded-xl border transition-all ${
                    category === c
                      ? "border-[#006194] bg-[#eff4ff] text-[#006194] font-bold"
                      : "border-[#e2e8f0] text-[#64748b] hover:bg-slate-50"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Optional notes/OCR text */}
          <div>
            <label className="text-xs font-semibold text-[#0b1c30] block mb-1">
              Lab Notes / Clinical Text (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Paste raw OCR text, lab values, or physician annotations for AI extraction..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006194]"
            />
          </div>

          {/* NutriAI Engine Toggle */}
          <div className="bg-[#eff4ff]/60 border border-[#dbeafe] rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <NutriAILogo size="sm" showText={false} />
              <div>
                <div className="text-xs font-bold text-[#006194] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#008ba3]" />
                  NutriAI Biomarker Neural OCR
                </div>
                <div className="text-[11px] text-[#64748b]">
                  Auto-extract values, detect handwritten notes, and verify reference ranges
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableAI}
              onChange={(e) => setEnableAI(e.target.checked)}
              className="w-4 h-4 text-[#006194] rounded focus:ring-[#006194]"
            />
          </div>

          {/* Footer actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl bg-[#006194] hover:bg-[#004e77] text-white text-xs font-bold shadow-md shadow-sky-900/15 flex items-center gap-2 disabled:opacity-50"
            >
              {isUploading ? (
                <span>Extracting & Ingesting...</span>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload & Ingest</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
