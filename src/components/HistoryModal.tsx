import React from 'react';
import { X, CheckCircle2, AlertCircle, ChevronRight, Sparkles } from 'lucide-react';
import { InspectionProduct } from '../types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: InspectionProduct[];
  activeProductId: string;
  onSelectProduct: (product: InspectionProduct) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  products,
  activeProductId,
  onSelectProduct,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[85vh]">
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-semibold text-[18px] text-[#131b2e]">
              Inspection Vault ({products.length})
            </h3>
            <p className="text-[12px] text-[#3d4a42]">
              Archived product OCR readings & verified nutrition profiles
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-2.5 modal-scroll">
          {products.map((p) => {
            const isSelected = p.id === activeProductId;
            const isConfirmed = p.status === 'confirmed';
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className={`w-full p-3.5 rounded-xl text-left border flex items-center gap-3 transition-all ${
                  isSelected
                    ? 'border-[#006948] bg-[#006948]/5 ring-1 ring-[#006948]'
                    : 'border-[#eaedff] bg-white hover:bg-[#faf8ff]'
                }`}
              >
                <img
                  src={p.imageThumbnail}
                  alt={p.title}
                  className="w-14 h-14 rounded-lg object-cover bg-[#eaedff] shrink-0 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isConfirmed ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#006948] bg-[#006948]/10 px-2 py-0.2 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Confirmed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#ba1a1a] bg-[#ffdad6] px-2 py-0.2 rounded-full">
                        <AlertCircle className="w-3 h-3" /> Needs Review
                      </span>
                    )}
                    <span className="text-[11px] font-bold text-[#3d4a42]">
                      {p.aggregateScore}% fidelity
                    </span>
                  </div>
                  <h4 className="font-semibold text-[14px] text-[#131b2e] truncate">
                    {p.title}
                  </h4>
                  <p className="text-[11px] text-[#3d4a42] truncate">
                    {p.fields.length} detected fields • {p.categorySubtitle}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-[#6d7a72] shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
