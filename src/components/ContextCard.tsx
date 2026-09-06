import React from 'react';
import { Camera, CheckCircle2 } from 'lucide-react';

interface ContextCardProps {
  imageThumbnail: string;
  categorySubtitle: string;
  title: string;
  captureSource: string;
  explanationTitle: string;
  explanationDescription: string;
  onPreviewImage?: () => void;
}

export const ContextCard: React.FC<ContextCardProps> = ({
  imageThumbnail,
  categorySubtitle,
  title,
  captureSource,
  explanationTitle,
  explanationDescription,
  onPreviewImage,
}) => {
  return (
    <section id="productContextCard" className="mt-3 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 border border-[#eaedff]">
      <div className="flex items-center gap-3">
        <button
          id="thumbnailPreviewBtn"
          type="button"
          onClick={onPreviewImage}
          className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#eaedff] shadow-sm group cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#006948]"
          title="Click to view full scan"
        >
          <img
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
            alt="Scanned nutrition table"
            src={imageThumbnail}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
          <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-sm rounded px-1 text-[#131b2e] flex items-center gap-0.5">
            <Camera className="w-2.5 h-2.5 text-[#006948]" />
            <span className="font-bold text-[10px] leading-[14px] tracking-wider">OCR</span>
          </div>
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#006948]/10 text-[#006948]">
              <CheckCircle2 className="w-3 h-3 text-[#006948]" />
            </span>
            <span className="font-semibold text-[12px] leading-[16px] text-[#006948] truncate">
              Label Scan Complete
            </span>
          </div>
          <h2 className="font-semibold text-[18px] leading-[24px] text-[#131b2e] truncate mt-0.5">
            {categorySubtitle || title}
          </h2>
          <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42] truncate">
            {captureSource}
          </p>
        </div>
      </div>

      {/* Header Explanation Block */}
      <div className="bg-[#f2f3ff] rounded-lg p-3 flex flex-col gap-1 border border-[#eaedff]/60">
        <h3 className="font-semibold text-[18px] leading-[24px] text-[#131b2e]">
          {explanationTitle}
        </h3>
        <p className="font-normal text-[14px] leading-[20px] text-[#3d4a42]">
          {explanationDescription}
        </p>
      </div>
    </section>
  );
};
