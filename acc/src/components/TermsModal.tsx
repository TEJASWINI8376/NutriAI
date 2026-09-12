import React from 'react';
import { X, ShieldCheck, FileText, Lock, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose, onAccept }) => {
  if (!isOpen) return null;

  return (
    <div
      id="terms-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-[#e2e8f0] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#f8f9ff] border-b border-[#e2e8f0] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#e5eeff] text-[#006194] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#006194]" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-[#0b1c30]">
                Terms of Service & Health Data Protection
              </h3>
              <p className="text-[11px] text-[#475569]">HIPAA Title II Security Rule & AES-256 Protocol</p>
            </div>
          </div>
          <button
            id="close-terms-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-[#475569] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs md:text-sm text-[#3f4850] leading-relaxed bg-white">
          <section className="space-y-1.5">
            <h4 className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#006a61]" />
              1. 256-bit AES Clinical Encryption
            </h4>
            <p>
              NutriAi and CarePulse encrypt all Protected Health Information (PHI), biometric telemetry,
              and physician-patient communications at rest and in transit via FIPS 140-2 validated 256-bit
              AES cryptography.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#006194]" />
              2. Individual Patient Ownership
            </h4>
            <p>
              Your health telemetry belongs strictly to you. Telemetry feeds (including blood glucose,
              heart rate variability, and nutritional intake) are processed on secure micro-services
              and are never monetized or distributed without explicit authorized authorization.
            </p>
          </section>

          <section className="space-y-1.5">
            <h4 className="font-semibold text-[#0b1c30] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#006947]" />
              3. Clinical Caregiver Collaboration
            </h4>
            <p>
              When you designate a primary care physician (such as Dr. Elena Vance or your personal clinic),
              you consent to shared diagnostic telemetry to facilitate customized nutritional plans
              and preventative metabolic alerts.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#f8f9ff] border-t border-[#e2e8f0] flex items-center justify-end gap-2">
          <button
            id="terms-cancel-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-[#475569] hover:bg-[#e2e8f0] transition-colors"
          >
            Close
          </button>
          <button
            id="terms-accept-btn"
            onClick={() => {
              if (onAccept) onAccept();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#006194] text-white hover:bg-[#004b73] transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>I Understand & Agree</span>
          </button>
        </div>
      </div>
    </div>
  );
};
