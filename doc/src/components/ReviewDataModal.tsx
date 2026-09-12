import React, { useState } from "react";
import { MedicalReport } from "../types";
import { X, AlertTriangle, Check, ShieldCheck, FileEdit, Sparkles } from "lucide-react";
import { NutriAILogo } from "./NutriAILogo";

interface ReviewDataModalProps {
  report: MedicalReport | null;
  onClose: () => void;
  onConfirmed: (updatedReport: MedicalReport) => void;
}

export const ReviewDataModal: React.FC<ReviewDataModalProps> = ({
  report,
  onClose,
  onConfirmed,
}) => {
  if (!report) return null;

  // Initialize selected values from reviewItems
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    report.reviewItems?.forEach((item) => {
      // Default to the higher confidence or alternative option
      initial[item.id] = item.alternativeCandidate || item.ocrCandidate;
    });
    return initial;
  });

  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signedBy, setSignedBy] = useState("Dr. Sarah Jenkins, MD");

  const handleSelect = (itemId: string, val: string) => {
    setSelectedValues((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleCustomChange = (itemId: string, val: string) => {
    setCustomValues((prev) => ({ ...prev, [itemId]: val }));
    setSelectedValues((prev) => ({ ...prev, [itemId]: val }));
  };

  const handleConfirmAndVerify = async () => {
    setIsSubmitting(true);
    try {
      const confirmedList = report.reviewItems?.map((item) => ({
        field: item.field,
        value: customValues[item.id] || selectedValues[item.id] || item.ocrCandidate,
      })) || [];

      const res = await fetch(`/api/reports/${report.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmReview: true,
          confirmedValues: confirmedList,
          verifiedBy: `Verified by ${signedBy} • NutriAI Cryptographic Vault`,
        }),
      });

      const data = await res.json();
      if (data.success && data.report) {
        onConfirmed(data.report);
      }
    } catch (err) {
      console.error("Failed to verify report:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden border border-[#e5eeff] max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#fffbeb] via-[#fef3c7] to-[#fffbeb] border-b border-[#fde68a] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#f59e0b] text-white flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#78350f] font-['Plus_Jakarta_Sans']">
                Review Handwritten Notes
              </h2>
              <p className="text-xs text-[#92400e]">
                NutriAI OCR flagged ambiguous values requiring clinical confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-500 hover:text-slate-800 hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-[#0b1c30]">
          {/* Report Context Banner */}
          <div className="bg-[#f8faff] rounded-xl p-3 border border-[#e2e8f0] flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#0b1c30]">{report.title}</div>
              <div className="text-xs text-[#64748b]">{report.facility} • {report.date}</div>
            </div>
            <div className="flex items-center gap-1.5 bg-[#eff4ff] px-2.5 py-1 rounded-lg text-xs font-semibold text-[#006194]">
              <FileEdit className="w-3.5 h-3.5" />
              <span>2 Items Pending</span>
            </div>
          </div>

          {/* Review Items */}
          <div className="space-y-4">
            {report.reviewItems?.map((item, idx) => {
              const currentChoice = selectedValues[item.id];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-4 border border-[#e2e8f0] shadow-xs hover:border-[#006194]/30 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#006194] bg-[#eff4ff] px-2.5 py-0.5 rounded-md">
                      Value #{idx + 1}: {item.field}
                    </span>
                    <span className="text-xs text-[#64748b] font-medium">
                      Confidence: <strong className="text-[#0b1c30]">{item.confidence}</strong>
                    </span>
                  </div>

                  {/* Context note from physical scan */}
                  <div className="bg-[#f8fafc] border-l-2 border-[#f59e0b] px-3 py-2 text-xs text-[#475569] italic rounded-r-lg">
                    {item.context}
                  </div>

                  {/* Option Choice A & B */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {/* Choice A: Primary OCR reading */}
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id, item.ocrCandidate)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                        currentChoice === item.ocrCandidate
                          ? "border-[#006194] bg-[#eff4ff] ring-1 ring-[#006194]"
                          : "border-[#e2e8f0] hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium text-[#64748b]">OCR Candidate A</div>
                        <div className="text-sm font-bold text-[#0b1c30] mt-0.5">{item.ocrCandidate}</div>
                      </div>
                      {currentChoice === item.ocrCandidate && (
                        <Check className="w-4 h-4 text-[#006194] shrink-0 mt-0.5" />
                      )}
                    </button>

                    {/* Choice B: Contextual Clinical Reading */}
                    <button
                      type="button"
                      onClick={() => handleSelect(item.id, item.alternativeCandidate)}
                      className={`p-3 rounded-xl border text-left flex items-start justify-between transition-all ${
                        currentChoice === item.alternativeCandidate
                          ? "border-[#10b981] bg-[#ecfdf5] ring-1 ring-[#10b981]"
                          : "border-[#e2e8f0] hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <div className="text-[11px] font-medium text-[#047857] flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#10b981]" />
                          Recommended (Margin Note)
                        </div>
                        <div className="text-sm font-bold text-[#0b1c30] mt-0.5">{item.alternativeCandidate}</div>
                      </div>
                      {currentChoice === item.alternativeCandidate && (
                        <Check className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Custom manual override input */}
                  <div className="pt-1">
                    <label className="text-[11px] text-[#64748b] block mb-1">
                      Or type custom clinician verified value:
                    </label>
                    <input
                      type="text"
                      placeholder={`e.g. ${item.alternativeCandidate}`}
                      value={customValues[item.id] || ""}
                      onChange={(e) => handleCustomChange(item.id, e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#f8fafc] border border-[#cbd5e1] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006194]"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Clinician Signature Field */}
          <div className="bg-[#eff4ff]/60 border border-[#dbeafe] rounded-xl p-3">
            <label className="text-xs font-semibold text-[#006194] block mb-1">
              Verifying Clinician / Attending Doctor:
            </label>
            <input
              type="text"
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#bfdbfe] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006194]"
            />
            <p className="text-[11px] text-[#64748b] mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10b981]" />
              Signature will be cryptographically hashed and sealed in the NutriAI persistent vault.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#f8faff] border-t border-[#e2e8f0] flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#cbd5e1] text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmAndVerify}
            disabled={isSubmitting}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Sealing in NutriAI Vault...</span>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Confirm & Mark Verified</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
