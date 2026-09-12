import React from 'react';
import { Camera, CheckCircle2, Database, Sparkles, QrCode } from 'lucide-react';

interface ContextCardProps {
  imageThumbnail: string;
  categorySubtitle: string;
  title: string;
  captureSource: string;
  explanationTitle: string;
  explanationDescription: string;
  barcode?: string;
  dataSource?: 'open_food_facts' | 'gemini_ocr' | 'hybrid' | 'mock';
  onPreviewImage?: () => void;
}

export const ContextCard: React.FC<ContextCardProps> = ({
  imageThumbnail,
  categorySubtitle,
  title,
  captureSource,
  explanationTitle,
  explanationDescription,
  barcode,
  dataSource,
  onPreviewImage,
}) => {
  const renderSourcePill = () => {
    if (dataSource === 'open_food_facts') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="inline-flex items-center gap-1 bg-[#006948]/10 text-[#006948] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#006948]/20">
            <Database className="w-3 h-3 text-[#006948]" />
            <span>Open Food Facts Verified</span>
          </span>
          {barcode && (
            <span className="inline-flex items-center gap-1 bg-[#e2e7ff] text-[#131b2e] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#dae2fd]">
              <QrCode className="w-3 h-3 text-[#006948]" />
              <span>UPC: {barcode}</span>
            </span>
          )}
        </div>
      );
    }

    if (dataSource === 'hybrid') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
            <Database className="w-3 h-3 text-blue-600" />
            <span>OFF Verified + Vision OCR</span>
          </span>
          {barcode && (
            <span className="inline-flex items-center gap-1 bg-[#e2e7ff] text-[#131b2e] text-[10px] font-mono px-2 py-0.5 rounded-full border border-[#dae2fd]">
              <QrCode className="w-3 h-3 text-blue-700" />
              <span>UPC: {barcode}</span>
            </span>
          )}
        </div>
      );
    }

    if (dataSource === 'gemini_ocr') {
      return (
        <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
          <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>Gemini Vision OCR</span>
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <section
      id="productContextCard"
      className="mt-3 bg-white rounded-xl shadow-sm p-4 flex flex-col gap-3 border border-[#eaedff]"
    >
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
            {dataSource === 'open_food_facts' ? (
              <>
                <Database className="w-2.5 h-2.5 text-[#006948]" />
                <span className="font-bold text-[9px] leading-[14px] tracking-wider text-[#006948]">
                  VERIFIED
                </span>
              </>
            ) : (
              <>
                <Camera className="w-2.5 h-2.5 text-[#006948]" />
                <span className="font-bold text-[10px] leading-[14px] tracking-wider">
                  {dataSource === 'hybrid' ? 'HYBRID' : 'OCR'}
                </span>
              </>
            )}
          </div>
        </button>

        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#006948]/10 text-[#006948]">
              <CheckCircle2 className="w-3 h-3 text-[#006948]" />
            </span>
            <span className="font-semibold text-[12px] leading-[16px] text-[#006948] truncate">
              {dataSource === 'open_food_facts' ? 'Food Record Verified' : 'Label Scan Complete'}
            </span>
          </div>

          <h2 className="font-semibold text-[18px] leading-[24px] text-[#131b2e] truncate mt-0.5">
            {categorySubtitle || title}
          </h2>

          {renderSourcePill()}

          <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42] truncate mt-0.5">
            {captureSource}
          </p>
        </div>
      </div>

      {/* Header Explanation Block */}
      <div className="bg-[#f2f3ff] rounded-lg p-3 flex flex-col gap-1 border border-[#eaedff]/60">
        <h3 className="font-semibold text-[16px] leading-[22px] text-[#131b2e]">
          {explanationTitle}
        </h3>
        <p className="font-normal text-[13px] leading-[18px] text-[#3d4a42]">
          {explanationDescription}
        </p>
      </div>
    </section>
  );
};
