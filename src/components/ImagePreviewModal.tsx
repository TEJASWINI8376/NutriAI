import React from 'react';
import { X, ZoomIn, Scan } from 'lucide-react';

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[90vh]">
        <div className="px-5 py-3 border-b border-[#eaedff] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-[#006948]" />
            <h3 className="font-semibold text-[15px] text-[#131b2e] truncate">
              Raw Optical Scan: {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="relative bg-[#131b2e] p-4 flex items-center justify-center overflow-hidden flex-1 min-h-[300px]">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg"
          />
          {/* Visual Optical Grid & Targeting Reticle */}
          <div className="absolute inset-4 pointer-events-none border border-emerald-400/40 rounded-lg flex flex-col justify-between p-2">
            <div className="flex justify-between items-start text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
              <span>BOUNDING RECT: [142, 68, 890, 540]</span>
              <span>CALIBRATED 300 DPI</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded self-end">
              ISO 9001 CLINICAL ACCURACY
            </div>
          </div>
        </div>

        <div className="p-4 bg-white flex justify-between items-center text-[12px] text-[#3d4a42]">
          <span>Optical character clarity verified across 5 nutrition regions</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#006948] text-white rounded-lg font-semibold hover:bg-[#005137]"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
};
