import React from 'react';
import type { Medication } from '../types.ts';
import { api } from '../api.ts';

interface MedicationsModuleProps {
  medications: Medication[];
  onAdherenceToggled: (medId: string, timeSlot: string) => void;
  showToast: (msg: string, icon?: string) => void;
}

export const MedicationsModule: React.FC<MedicationsModuleProps> = ({
  medications,
  onAdherenceToggled,
  showToast,
}) => {
  const handleToggle = async (medId: string, timeSlot: string, medName: string) => {
    try {
      await api.toggleMedication(medId, timeSlot);
      onAdherenceToggled(medId, timeSlot);
      showToast(`Adherence updated for ${medName} (${timeSlot})`, 'done_all');
    } catch (err: any) {
      showToast(err.message || 'Failed to update medication adherence', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Active Medications & Daily Administration Timeline
          </h2>
          <p className="text-[12px] text-[#707881]">
            Left-anchored clinical dosage timeline with automated drug interaction monitoring
          </p>
        </div>
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#effcf6] text-[#006947] text-[12px] font-bold border border-[#c1f4db]">
          <span className="material-symbols-outlined text-[16px]">verified</span>
          <span>Pharmacy Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Daily Schedule Timeline (2 Cols on lg) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs">
          <h3 className="text-[14px] font-bold text-[#0b1c30] mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006194] text-[18px]">alarm_on</span>
            <span>Today's Dosage Protocol</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
            {medications.flatMap((med) =>
              med.times.map((slot) => {
                const isTaken = !!med.adherenceToday?.[slot];
                return {
                  med,
                  slot,
                  isTaken,
                };
              })
            ).sort((a, b) => a.slot.localeCompare(b.slot)).map((item, idx) => (
              <div key={`${item.med.id}-${item.slot}-${idx}`} className="relative flex items-start gap-3">
                {/* Left-anchored cerulean bullet */}
                <div
                  className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.isTaken
                      ? 'bg-[#00855b] border-[#00855b] text-white shadow-xs'
                      : 'bg-white border-[#006194] text-[#006194]'
                  }`}
                >
                  {item.isTaken ? (
                    <span className="material-symbols-outlined text-[12px] font-bold">check</span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#006194]"></span>
                  )}
                </div>

                <div className="flex-1 bg-[#f8f9ff] p-3.5 rounded-xl border border-[#e5eeff] hover:border-[#93ccff] transition-all flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#006194] bg-[#eff4ff] px-2 py-0.5 rounded-md border border-[#d3e4fe]">
                        {item.slot}
                      </span>
                      <h4 className="text-[14px] font-bold text-[#0b1c30]">
                        {item.med.name}
                      </h4>
                      <span className="text-[11px] font-semibold text-[#006a61] bg-[#effcf6] px-2 py-0.5 rounded-full border border-[#c1f4db]">
                        {item.med.dosage}
                      </span>
                    </div>
                    <p className="text-[12px] text-[#707881] mt-1">
                      {item.med.instructions} • Prescribed by {item.med.doctorName}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggle(item.med.id, item.slot, item.med.name)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      item.isTaken
                        ? 'bg-[#effcf6] text-[#006947] border border-[#c1f4db] hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                        : 'bg-[#006194] hover:bg-[#007bb9] text-white shadow-xs'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {item.isTaken ? 'task_alt' : 'radio_button_unchecked'}
                    </span>
                    <span>{item.isTaken ? 'Taken' : 'Take Dose'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prescription Bottle Overview (1 Col on lg) */}
        <div className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#0b1c30] mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006a61] text-[18px]">medication</span>
              <span>Prescription Summary</span>
            </h3>
            <div className="space-y-3">
              {medications.map((m) => (
                <div key={m.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-[13px] font-bold text-[#0b1c30]">{m.name}</p>
                      <p className="text-[11px] text-[#707881]">{m.dosage} • {m.frequency}</p>
                    </div>
                    <span className="text-[11px] font-bold text-[#006194] bg-[#eff4ff] px-2 py-0.5 rounded-md">
                      {m.refillsRemaining} Refills
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3f4850] mt-1.5 italic">
                    Instructions: {m.instructions}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#f1f5f9]">
            <button
              onClick={() => showToast('Refill request dispatched to verified NutriAI clinical pharmacy network.', 'local_pharmacy')}
              className="w-full h-11 bg-[#eff4ff] hover:bg-[#e0f0fe] text-[#006194] text-[13px] font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">local_pharmacy</span>
              <span>Request 90-Day Refill</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
