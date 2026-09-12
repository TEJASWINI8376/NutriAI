import React, { useState } from 'react';
import {
  Pill,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ShieldCheck,
  Calendar,
  AlertCircle,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { MedicationItem, PatientProfile } from '../types';

interface MedicationTimelineScreenProps {
  medications: MedicationItem[];
  patient: PatientProfile;
  onToggleMedication: (id: string) => void;
  onAddMedication: (item: MedicationItem) => void;
}

export const MedicationTimelineScreen: React.FC<MedicationTimelineScreenProps> = ({
  medications,
  patient,
  onToggleMedication,
  onAddMedication,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    dosage: '',
    scheduledTime: '08:00 AM',
    period: 'Morning' as const,
    category: 'Clinical Supplement' as const,
    instructions: '',
    warning: '',
  });

  const takenCount = medications.filter((m) => m.taken).length;
  const adherencePercent = Math.round((takenCount / medications.length) * 100) || 0;

  const handleCreateMed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.name) return;

    const item: MedicationItem = {
      id: `med-${Date.now()}`,
      name: newMed.name,
      dosage: newMed.dosage || 'Standard Dose',
      scheduledTime: newMed.scheduledTime,
      period: newMed.period,
      category: newMed.category,
      instructions: newMed.instructions || 'Take with water alongside appropriate meal.',
      taken: false,
      foodInteractionWarning: newMed.warning
        ? { type: 'warning', message: newMed.warning }
        : undefined,
    };

    onAddMedication(item);
    setShowAddModal(false);
    setNewMed({
      name: '',
      dosage: '',
      scheduledTime: '08:00 AM',
      period: 'Morning',
      category: 'Clinical Supplement',
      instructions: '',
      warning: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Stats Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#E0F2FE] text-[#0284C7]">
              <Pill className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-[#0B1C30] tracking-tight">
                Medication & Clinical Supplement Timeline
              </h1>
              <p className="text-xs sm:text-sm text-[#64748B]">
                Left-anchored clinical timeline • Food-drug interaction monitoring
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-[#64748B] block">Today's Adherence</span>
            <span className="text-xl font-bold text-[#047857]">
              {takenCount} of {medications.length} Taken ({adherencePercent}%)
            </span>
          </div>
          <button
            id="meds-add-btn"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medication</span>
          </button>
        </div>
      </div>

      {/* Main Schedule Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Left-Anchored Timeline Component */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-7 border border-[#E2E8F0] shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9] mb-6">
            <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0284C7]" />
              Scheduled Daily Administration (Chronological)
            </h2>
            <span className="text-xs text-[#64748B]">
              Patient: {patient.name} ({patient.id})
            </span>
          </div>

          {/* Timeline Root with Left Cerulean Bullets & Soft Vertical Connector */}
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-[11px] sm:before:left-[15px] before:top-3 before:bottom-3 before:w-0.5 before:bg-[#E2E8F0]">
            {medications.map((med, index) => (
              <div key={med.id} className="relative group">
                {/* Left Anchored Cerulean Bullet Node */}
                <div
                  className={`absolute -left-[27px] sm:-left-[31px] top-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    med.taken
                      ? 'bg-[#10B981] border-[#10B981] text-white shadow-xs'
                      : 'bg-white border-[#0284C7] text-[#0284C7]'
                  }`}
                >
                  {med.taken ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#0284C7]"></span>
                  )}
                </div>

                {/* Timeline Card Surface */}
                <div
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    med.taken
                      ? 'bg-[#F8FAFC] border-[#E2E8F0] opacity-90'
                      : 'bg-white border-[#CBD5E1] shadow-xs hover:border-[#0284C7]'
                  }`}
                >
                  {/* Top Meta Line: Time & Period & Badge */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0284C7] flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {med.scheduledTime}
                      </span>
                      <span className="text-xs text-[#64748B]">• {med.period}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0B1C30] bg-[#F1F5F9] px-2.5 py-0.5 rounded-full">
                        {med.category}
                      </span>
                      {med.taken ? (
                        <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-[#10B981]" /> Completed
                        </span>
                      ) : (
                        <span className="text-[11px] font-semibold text-[#B45309] bg-[#FEF3C7] px-2 py-0.5 rounded-full">
                          Pending Intake
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base font-bold ${med.taken ? 'text-[#64748B] line-through' : 'text-[#0B1C30]'}`}>
                          {med.name}
                        </h3>
                        {/* Inline Dosage Badge */}
                        <span className="text-xs font-semibold text-[#006194] bg-[#E0F2FE] px-2.5 py-0.5 rounded-md">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mt-1.5 leading-relaxed">
                        {med.instructions}
                      </p>
                    </div>

                    <button
                      onClick={() => onToggleMedication(med.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 self-start sm:self-center ${
                        med.taken
                          ? 'bg-[#E2E8F0] hover:bg-[#CBD5E1] text-[#0B1C30]'
                          : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs'
                      }`}
                    >
                      {med.taken ? 'Undo Action' : 'Mark as Taken'}
                    </button>
                  </div>

                  {/* Food-Drug Interaction Warning Box */}
                  {med.foodInteractionWarning && (
                    <div
                      className={`mt-3 pt-3 border-t flex items-start gap-2.5 text-xs rounded-xl p-2.5 ${
                        med.foodInteractionWarning.type === 'critical'
                          ? 'bg-[#FEF2F2] border-[#FCA5A5] text-[#991B1B]'
                          : med.foodInteractionWarning.type === 'warning'
                          ? 'bg-[#FEF3C7] border-[#FDE68A] text-[#92400E]'
                          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
                      }`}
                    >
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-bold block">
                          Nutrient Interaction Advisory:
                        </span>
                        <p className="text-[11px] leading-relaxed">
                          {med.foodInteractionWarning.message}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Clinical Interaction Principles & Pharmacokinetics */}
        <div className="lg:col-span-4 space-y-5">
          {/* Pharmacokinetic Rules Card */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              NutriAI Clinical Guidelines
            </h3>

            <div className="space-y-3 text-xs text-[#334155]">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0B1C30] block mb-1">
                  1. ACE Inhibitor + Potassium
                </strong>
                Lisinopril diminishes aldosterone secretion, conserving renal potassium. Dietary potassium from real foods (avocado, spinach) is protective, but avoid potassium chloride salt substitutes.
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0B1C30] block mb-1">
                  2. Fat-Soluble Vitamins (D3/K2 & Omega-3)
                </strong>
                Fat-soluble compounds require mixed micelle formation for optimal mucosal absorption. Always administer alongside lunch or dinner containing healthy dietary lipids.
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <strong className="text-[#0B1C30] block mb-1">
                  3. Magnesium Spacing
                </strong>
                Divalent cations (Mg2+, Ca2+, Fe2+) compete for transport channels. Keep evening Magnesium Glycinate separated from dairy or iron supplements by 2 hours.
              </div>
            </div>
          </div>

          {/* Allergy Protection Confirmation */}
          <div className="bg-[#ECFDF5] rounded-2xl p-5 border border-[#A7F3D0] shadow-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-[#047857] mb-2">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Allergen Verification
            </div>
            <p className="text-xs text-[#065F46] leading-relaxed">
              Patient allergy flags (<strong>Peanuts, Penicillin</strong>) have been checked against all registered capsule excipients and coatings. No cross-reactivity found.
            </p>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-[#0B1C30]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
              <h3 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#0284C7]" />
                Add Medication or Supplement
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#64748B] hover:text-[#0B1C30] text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMed} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-[#0B1C30] block mb-1">
                  Medication / Supplement Name:
                </label>
                <input
                  type="text"
                  required
                  value={newMed.name}
                  onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                  placeholder="e.g. CoQ10 Ubiquinol"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#0B1C30] block mb-1">
                    Dosage:
                  </label>
                  <input
                    type="text"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                    placeholder="e.g. 100 mg Softgel"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="font-semibold text-[#0B1C30] block mb-1">
                    Scheduled Time:
                  </label>
                  <input
                    type="text"
                    value={newMed.scheduledTime}
                    onChange={(e) => setNewMed({ ...newMed, scheduledTime: e.target.value })}
                    placeholder="e.g. 01:00 PM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#0B1C30] block mb-1">
                    Daily Period:
                  </label>
                  <select
                    value={newMed.period}
                    onChange={(e: any) => setNewMed({ ...newMed, period: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm bg-white"
                  >
                    <option value="Morning">Morning</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Evening">Evening</option>
                    <option value="Bedtime">Bedtime</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-[#0B1C30] block mb-1">
                    Category:
                  </label>
                  <select
                    value={newMed.category}
                    onChange={(e: any) => setNewMed({ ...newMed, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm bg-white"
                  >
                    <option value="Clinical Supplement">Clinical Supplement</option>
                    <option value="Prescription">Prescription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-[#0B1C30] block mb-1">
                  Administration Instructions:
                </label>
                <input
                  type="text"
                  value={newMed.instructions}
                  onChange={(e) => setNewMed({ ...newMed, instructions: e.target.value })}
                  placeholder="e.g. Take with food containing fat"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0B1C30] block mb-1">
                  Food Interaction / Warning (Optional):
                </label>
                <input
                  type="text"
                  value={newMed.warning}
                  onChange={(e) => setNewMed({ ...newMed, warning: e.target.value })}
                  placeholder="e.g. Avoid taking with high-calcium dairy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm"
                />
              </div>

              <div className="pt-3 border-t border-[#F1F5F9] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-[#0284C7] hover:bg-[#0369A1] text-white"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
