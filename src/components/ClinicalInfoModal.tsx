import React from 'react';
import { X, ShieldCheck, CheckCircle, Scale, Eye, Cpu } from 'lucide-react';
import { InspectionProduct } from '../types';

interface ClinicalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: InspectionProduct;
}

export const ClinicalInfoModal: React.FC<ClinicalInfoModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between bg-[#faf8ff] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#006948]/10 text-[#006948] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#006948]" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#131b2e]">
                NutriAI Diagnostic Standard
              </h3>
              <p className="text-[12px] text-[#3d4a42]">
                Aggregate optical fidelity: {product.aggregateScore}% ({product.scoreLabel})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4 modal-scroll">
          {/* Main Statement */}
          <div className="bg-[#f2f3ff] rounded-xl p-4 border border-[#eaedff]">
            <h4 className="font-semibold text-[14px] text-[#131b2e] mb-1">
              Zero-Estimation Clinical Policy
            </h4>
            <p className="text-[13px] leading-relaxed text-[#3d4a42]">
              Unlike generic consumer apps that guess calorie or sodium values, NutriAI binds each
              value directly to optical character polygons scanned from certified rear packaging tables.
              When package curvature compromises character segmentation below 90%, our system triggers
              an affirmative human verification step.
            </p>
          </div>

          {/* Diagnostic Pillars */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-white border border-[#eaedff] rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[#006948]">
                <Cpu className="w-4 h-4" />
                <span className="text-[12px] font-bold">Curvature Neural De-warp</span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Normalizes cylindrical package distortion across rounded corners before character inference.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#eaedff] rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[#006948]">
                <Eye className="w-4 h-4" />
                <span className="text-[12px] font-bold">Multi-Hypothesis OCR</span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Cross-references raw typography ("Sodiuin") against verified FDA nutrient dictionaries.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#eaedff] rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[#006948]">
                <Scale className="w-4 h-4" />
                <span className="text-[12px] font-bold">DV Mathematical Cross-check</span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Validates grams against stated % Daily Values to safeguard renal and diabetic profiles.
              </p>
            </div>

            <div className="p-3 bg-white border border-[#eaedff] rounded-xl flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5 text-[#006948]">
                <CheckCircle className="w-4 h-4" />
                <span className="text-[12px] font-bold">Audit-Ready Telemetry</span>
              </div>
              <p className="text-[11px] text-[#3d4a42]">
                Timestamps user-confirmed edits for seamless export to health record portals.
              </p>
            </div>
          </div>

          {/* Fields list in this product */}
          <div>
            <h5 className="text-[12px] font-bold text-[#3d4a42] uppercase tracking-wider mb-2">
              Optical Confidence Breakdown
            </h5>
            <div className="space-y-1.5">
              {product.fields.map((f) => (
                <div
                  key={f.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#faf8ff] border border-[#eaedff] text-[12px]"
                >
                  <span className="font-semibold text-[#131b2e] truncate max-w-[200px]">
                    {f.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[#3d4a42] font-mono">{f.confidence}%</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        f.confirmed ? 'bg-[#006948]' : 'bg-[#ba1a1a]'
                      }`}
                    ></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#006948] text-white font-semibold text-[13px] hover:bg-[#005137]"
          >
            Acknowledge Standard
          </button>
        </div>
      </div>
    </div>
  );
};
