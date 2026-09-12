import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2 } from 'lucide-react';
import { NutritionField } from '../types';

interface EditFieldModalProps {
  field: NutritionField | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (fieldId: string, updates: Partial<NutritionField>) => void;
}

export const EditFieldModal: React.FC<EditFieldModalProps> = ({
  field,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !field) return null;

  const [value, setValue] = useState(field.value);
  const [subValue, setSubValue] = useState(field.subValue || '');
  const [tags, setTags] = useState<string[]>(field.tags || []);
  const [newTag, setNewTag] = useState('');

  useEffect(() => {
    setValue(field.value);
    setSubValue(field.subValue || '');
    setTags(field.tags || []);
  }, [field]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = () => {
    onSave(field.id, {
      value,
      subValue: subValue || undefined,
      tags: field.key === 'allergens' ? tags : undefined,
      confirmed: true,
      confidence: 99,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-[#eaedff] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between">
          <div>
            <span className="font-bold text-[10px] text-[#3d4a42] uppercase tracking-wider">
              EDIT FIELD
            </span>
            <h3 className="font-semibold text-[18px] text-[#131b2e]">{field.label}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-semibold text-[#3d4a42] mb-1">
              Primary Value
            </label>
            {field.key === 'ingredients' ? (
              <textarea
                rows={4}
                className="w-full p-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] font-normal text-[13px] leading-relaxed focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter complete ingredients list..."
              />
            ) : (
              <input
                type="text"
                className="w-full h-11 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] font-semibold text-[15px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. 1 Bar (40g)"
              />
            )}
          </div>

          {field.key === 'allergens' ? (
            <div>
              <label className="block text-[12px] font-semibold text-[#3d4a42] mb-1.5">
                Allergen Tags
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 bg-[#e2e7ff] text-[#131b2e] text-[12px] font-medium px-2.5 py-1 rounded-full"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 h-10 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[13px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                  placeholder="Add allergen (e.g. Peanuts, Soy)"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 bg-[#006948] text-white rounded-lg text-[12px] font-semibold flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[12px] font-semibold text-[#3d4a42] mb-1">
                Subtext / Daily Value Notes (optional)
              </label>
              <input
                type="text"
                className="w-full h-11 px-3 rounded-lg bg-[#f2f3ff] border border-[#eaedff] text-[#131b2e] text-[14px] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
                value={subValue}
                onChange={(e) => setSubValue(e.target.value)}
                placeholder="e.g. Includes 7g Added Sugars (14% DV)"
              />
            </div>
          )}

          <div className="bg-[#f2f3ff] rounded-lg p-3 text-[12px] text-[#3d4a42] flex items-center gap-2 border border-[#eaedff]">
            <Check className="w-4 h-4 text-[#006948]" />
            <span>Editing this field will record manual clinical confirmation (100% confidence).</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-3 bg-[#faf8ff] border-t border-[#eaedff] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-[14px] font-semibold text-[#3d4a42] hover:bg-[#eaedff] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 text-[14px] font-semibold text-white bg-[#006948] hover:bg-[#005137] rounded-lg shadow-xs flex items-center gap-1.5 transition-all"
          >
            <Check className="w-4 h-4" />
            <span>Save & Confirm</span>
          </button>
        </div>
      </div>
    </div>
  );
};
