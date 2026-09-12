import React, { useState } from 'react';
import { X, User, HeartPulse, Pill, ShieldAlert, Sparkles, Check, Plus } from 'lucide-react';
import { PatientProfile } from '../types';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PatientProfile;
  onSave: (updated: PatientProfile) => void;
}

const COMMON_CONDITIONS = [
  'Diabetes',
  'Hypertension',
  'Cardiovascular',
  'Chronic Kidney Disease',
  'High Cholesterol',
];

const COMMON_MEDICINES = [
  'Warfarin',
  'Levothyroxine',
  'Metformin',
  'Lisinopril',
  'Atorvastatin',
  'Amlodipine',
];

const COMMON_RESTRICTIONS = [
  'Low Sugar',
  'Low Sodium',
  'Gluten-Free',
  'Dairy-Free',
  'Low Fat',
];

const PRESETS: Array<{
  name: string;
  badge: string;
  profile: PatientProfile;
}> = [
  {
    name: 'Hypertension Patient',
    badge: 'Low Sodium Focus',
    profile: {
      conditions: ['Hypertension'],
      medicines: ['Lisinopril'],
      dietaryRestrictions: ['Low Sodium'],
    },
  },
  {
    name: 'Diabetic Patient',
    badge: 'Sugar & Carbs Focus',
    profile: {
      conditions: ['Diabetes'],
      medicines: ['Metformin'],
      dietaryRestrictions: ['Low Sugar'],
    },
  },
  {
    name: 'Cardiovascular (Anticoagulant)',
    badge: 'Warfarin Interaction',
    profile: {
      conditions: ['Cardiovascular', 'Hypertension'],
      medicines: ['Warfarin'],
      dietaryRestrictions: ['Low Sodium', 'Low Fat'],
    },
  },
];

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [conditions, setConditions] = useState<string[]>(profile.conditions || []);
  const [medicines, setMedicines] = useState<string[]>(profile.medicines || []);
  const [restrictions, setRestrictions] = useState<string[]>(profile.dietaryRestrictions || []);

  const [newCondition, setNewCondition] = useState('');
  const [newMedicine, setNewMedicine] = useState('');
  const [newRestriction, setNewRestriction] = useState('');

  if (!isOpen) return null;

  const toggleCondition = (item: string) => {
    setConditions((prev) =>
      prev.some((c) => c.toLowerCase() === item.toLowerCase())
        ? prev.filter((c) => c.toLowerCase() !== item.toLowerCase())
        : [...prev, item],
    );
  };

  const toggleMedicine = (item: string) => {
    setMedicines((prev) =>
      prev.some((m) => m.toLowerCase() === item.toLowerCase())
        ? prev.filter((m) => m.toLowerCase() !== item.toLowerCase())
        : [...prev, item],
    );
  };

  const toggleRestriction = (item: string) => {
    setRestrictions((prev) =>
      prev.some((r) => r.toLowerCase() === item.toLowerCase())
        ? prev.filter((r) => r.toLowerCase() !== item.toLowerCase())
        : [...prev, item],
    );
  };

  const handleApplyPreset = (p: PatientProfile) => {
    setConditions(p.conditions);
    setMedicines(p.medicines);
    setRestrictions(p.dietaryRestrictions);
  };

  const handleSave = () => {
    onSave({
      conditions,
      medicines,
      dietaryRestrictions: restrictions,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between bg-[#faf8ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#006948]/10 text-[#006948] flex items-center justify-center">
              <HeartPulse className="w-5 h-5 text-[#006948]" />
            </div>
            <div>
              <h3 className="font-semibold text-[18px] text-[#131b2e] leading-tight">
                Patient Health Profile
              </h3>
              <p className="text-[12px] text-[#3d4a42]">
                Active context used for AI dietary decisions & medicine checks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5 overflow-y-auto">
          {/* Quick Presets */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#006948]" />
              <span className="text-[12px] font-bold text-[#131b2e] uppercase tracking-wider">
                Clinical Demo Presets
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleApplyPreset(p.profile)}
                  className="p-2.5 text-left rounded-xl border border-[#eaedff] bg-[#f2f3ff] hover:bg-[#e2e7ff] transition-all cursor-pointer flex flex-col"
                >
                  <span className="font-semibold text-[12px] text-[#131b2e]">{p.name}</span>
                  <span className="text-[10px] text-[#006948] font-medium">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-1.5">
                <HeartPulse className="w-4 h-4 text-[#ba1a1a]" />
                Diagnosed Conditions ({conditions.length})
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CONDITIONS.map((cond) => {
                const active = conditions.some((c) => c.toLowerCase() === cond.toLowerCase());
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => toggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      active
                        ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                        : 'bg-[#faf8ff] text-[#3d4a42] border-[#eaedff] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                    {cond}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newCondition}
                onChange={(e) => setNewCondition(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newCondition.trim()) {
                    e.preventDefault();
                    toggleCondition(newCondition.trim());
                    setNewCondition('');
                  }
                }}
                placeholder="Add custom condition (e.g. Celiac disease)"
                className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-[#eaedff] focus:outline-none focus:border-[#006948] bg-[#faf8ff]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newCondition.trim()) {
                    toggleCondition(newCondition.trim());
                    setNewCondition('');
                  }
                }}
                className="px-3 py-1.5 bg-[#f2f3ff] text-[#131b2e] rounded-lg text-[12px] font-semibold hover:bg-[#e2e7ff] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Active Medicines */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-1.5">
                <Pill className="w-4 h-4 text-[#006948]" />
                Active Prescriptions / Medicines ({medicines.length})
              </label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_MEDICINES.map((med) => {
                const active = medicines.some((m) => m.toLowerCase() === med.toLowerCase());
                return (
                  <button
                    key={med}
                    type="button"
                    onClick={() => toggleMedicine(med)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      active
                        ? 'bg-[#006948] text-white border-[#006948]'
                        : 'bg-[#faf8ff] text-[#3d4a42] border-[#eaedff] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                    {med}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newMedicine}
                onChange={(e) => setNewMedicine(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newMedicine.trim()) {
                    e.preventDefault();
                    toggleMedicine(newMedicine.trim());
                    setNewMedicine('');
                  }
                }}
                placeholder="Add medicine (e.g. Warfarin, Aspirin)"
                className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-[#eaedff] focus:outline-none focus:border-[#006948] bg-[#faf8ff]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newMedicine.trim()) {
                    toggleMedicine(newMedicine.trim());
                    setNewMedicine('');
                  }
                }}
                className="px-3 py-1.5 bg-[#f2f3ff] text-[#131b2e] rounded-lg text-[12px] font-semibold hover:bg-[#e2e7ff] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Dietary Restrictions */}
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-[#131b2e] flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-[#7c5800]" />
              Dietary Restrictions ({restrictions.length})
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_RESTRICTIONS.map((res) => {
                const active = restrictions.some((r) => r.toLowerCase() === res.toLowerCase());
                return (
                  <button
                    key={res}
                    type="button"
                    onClick={() => toggleRestriction(res)}
                    className={`px-3 py-1.5 rounded-full text-[12px] font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
                      active
                        ? 'bg-[#7c5800] text-white border-[#7c5800]'
                        : 'bg-[#faf8ff] text-[#3d4a42] border-[#eaedff] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    {active && <Check className="w-3 h-3 text-white" />}
                    {res}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2 mt-1">
              <input
                type="text"
                value={newRestriction}
                onChange={(e) => setNewRestriction(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newRestriction.trim()) {
                    e.preventDefault();
                    toggleRestriction(newRestriction.trim());
                    setNewRestriction('');
                  }
                }}
                placeholder="Add restriction (e.g. Low Potassium)"
                className="flex-1 px-3 py-1.5 text-[12px] rounded-lg border border-[#eaedff] focus:outline-none focus:border-[#006948] bg-[#faf8ff]"
              />
              <button
                type="button"
                onClick={() => {
                  if (newRestriction.trim()) {
                    toggleRestriction(newRestriction.trim());
                    setNewRestriction('');
                  }
                }}
                className="px-3 py-1.5 bg-[#f2f3ff] text-[#131b2e] rounded-lg text-[12px] font-semibold hover:bg-[#e2e7ff] transition-all flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-[#eaedff] text-[#3d4a42] text-[13px] font-semibold hover:bg-[#f2f3ff] transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-[#006948] text-white text-[13px] font-semibold hover:bg-[#005137] shadow-sm transition-all cursor-pointer"
          >
            Save Health Profile
          </button>
        </div>
      </div>
    </div>
  );
};
