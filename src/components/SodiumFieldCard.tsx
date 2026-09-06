import React, { useState, useEffect } from 'react';
import { ScanText, Check, Wand2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { NutritionField } from '../types';

interface SodiumFieldCardProps {
  field: NutritionField;
  onVerify: (value: string) => void;
  onReEdit?: () => void;
}

export const SodiumFieldCard: React.FC<SodiumFieldCardProps> = ({
  field,
  onVerify,
  onReEdit,
}) => {
  const [inputValue, setInputValue] = useState(field.value);
  const isVerified = field.confirmed;

  useEffect(() => {
    setInputValue(field.value);
  }, [field.value]);

  const handleVerifyClick = () => {
    onVerify(inputValue);
  };

  return (
    <div
      id="sodiumFieldCard"
      className={`rounded-xl p-4 transition-all duration-300 ${
        isVerified
          ? 'bg-white shadow-sm border border-[#006948]/30'
          : 'bg-gradient-to-b from-white to-[#f2f3ff] shadow-md border border-[#ffdad6]'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isVerified ? 'bg-[#006948]' : 'bg-[#ba1a1a] animate-pulse'
            }`}
          ></span>
          <span
            className={`font-bold text-[10px] leading-[14px] uppercase tracking-wider ${
              isVerified ? 'text-[#006948]' : 'text-[#ba1a1a]'
            }`}
          >
            {isVerified ? 'SODIUM CONTENT' : 'ACTION REQUIRED: SODIUM CONTENT'}
          </span>
        </div>

        {isVerified ? (
          <div className="flex items-center gap-1 bg-[#006948]/10 text-[#006948] px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#006948]" />
            <span className="font-bold text-[10px] leading-[14px]">99% Confirmed</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-[#ffdad6] text-[#93000a] px-2 py-0.5 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            <span className="font-bold text-[10px] leading-[14px]">Verify with Label</span>
          </div>
        )}
      </div>

      {!isVerified && (
        <div className="mt-2 bg-[#e2e7ff]/60 rounded-lg p-2.5 flex items-center gap-2 border border-[#eaedff]">
          <ScanText className="w-5 h-5 text-[#6d7a72] shrink-0" />
          <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42]">
            Detected raw string:{' '}
            <span className="font-semibold text-[#131b2e]">
              {field.detectedRawString || '“Sodiuin 65mg”'}
            </span>
            . Correct typo below:
          </p>
        </div>
      )}

      {/* Live Editable Input Box */}
      <div className="flex items-center gap-2 mt-2.5">
        <div className="relative flex-1">
          <input
            id="sodiumInput"
            className="w-full h-12 bg-[#f2f3ff] text-[#131b2e] font-extrabold text-[20px] rounded-lg px-4 pr-12 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948] transition-all border border-[#eaedff]"
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. 65"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-[12px] text-[#3d4a42]">
            {field.unit || 'mg'}
          </span>
        </div>

        <button
          id="confirmSodiumBtn"
          onClick={handleVerifyClick}
          className={`h-12 px-5 font-semibold text-[12px] rounded-lg shadow-sm flex items-center gap-1.5 active:scale-95 transition-all shrink-0 cursor-pointer ${
            isVerified
              ? 'bg-[#00855d] text-white'
              : 'bg-[#006948] text-white hover:bg-[#005137]'
          }`}
          type="button"
        >
          <Check className="w-4 h-4" />
          <span>{isVerified ? 'Verified!' : 'Verify'}</span>
        </button>
      </div>

      <div className="flex items-center justify-between text-[#3d4a42] pt-2">
        <span className="font-normal text-[12px] leading-[16px]">
          {field.matchExplanation || 'Matches “Sodium 65mg 3% DV” in scanned table'}
        </span>
        <span className="font-bold text-[10px] leading-[14px] text-[#006948] flex items-center gap-1">
          <Wand2 className="w-3.5 h-3.5" /> Auto-clean applied
        </span>
      </div>
    </div>
  );
};
