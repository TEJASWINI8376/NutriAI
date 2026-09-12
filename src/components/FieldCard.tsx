import React from 'react';
import { CheckCircle2, Edit2 } from 'lucide-react';
import { NutritionField } from '../types';

interface FieldCardProps {
  field: NutritionField;
  onEdit: (field: NutritionField) => void;
}

export const FieldCard: React.FC<FieldCardProps> = ({ field, onEdit }) => {
  return (
    <div
      id={`fieldCard-${field.id}`}
      className="bg-white rounded-xl p-4 shadow-sm flex flex-col gap-1 border border-[#eaedff] transition-all hover:border-[#bccac0]"
    >
      {/* Header: Label & Confidence */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-[10px] leading-[14px] text-[#3d4a42] uppercase tracking-wider">
          {field.label}
        </span>

        <div className="flex items-center gap-1 bg-[#006948]/10 text-[#006948] px-2 py-0.5 rounded-full shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#006948]" />
          <span className="font-bold text-[10px] leading-[14px]">
            {field.confidence}% Confirmed
          </span>
        </div>
      </div>

      {/* Body: Value / SubValue / Tags / Dedicated Ingredients Box */}
      <div className="flex items-start justify-between mt-1 gap-2">
        {field.key === 'allergens' ? (
          <div className="flex flex-wrap gap-1.5 items-center flex-1">
            <span className="font-semibold text-[18px] leading-[24px] text-[#131b2e] mr-1">
              {field.value}
            </span>
            {field.tags && field.tags.length > 0 ? (
              field.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-[#e2e7ff] text-[#131b2e] font-semibold text-[12px] px-2.5 py-1 rounded-full border border-[#dae2fd]"
                >
                  {tag}
                </span>
              ))
            ) : (
              <span className="text-[14px] text-[#3d4a42]">None detected</span>
            )}
          </div>
        ) : field.key === 'ingredients' ? (
          <div className="flex-1 pr-1">
            <div className="bg-[#f8faf9] border border-[#e2e7e4] rounded-lg p-3 text-[13px] leading-[20px] text-[#222e26] font-normal max-h-40 overflow-y-auto">
              {field.value}
            </div>
            {field.subValue && (
              <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42] mt-1">
                {field.subValue}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1">
            <p className="font-semibold text-[18px] leading-[24px] text-[#131b2e]">
              {field.value}
            </p>
            {field.subValue && (
              <p className="font-normal text-[12px] leading-[16px] text-[#3d4a42] mt-0.5">
                {field.subValue}
              </p>
            )}
          </div>
        )}

        <button
          id={`editBtn-${field.id}`}
          aria-label={`Edit ${field.label}`}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-[#3d4a42] hover:bg-[#e2e7ff] hover:text-[#131b2e] transition-colors cursor-pointer shrink-0 mt-0.5"
          type="button"
          onClick={() => onEdit(field)}
        >
          <Edit2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
