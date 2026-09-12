import React, { useState } from 'react';
import {
  ClipboardList,
  User,
  ShieldCheck,
  Activity,
  FileText,
  Download,
  AlertTriangle,
  CheckCircle2,
  Share2,
  Calendar,
  Layers,
  Heart,
  Edit2,
  Save,
} from 'lucide-react';
import { PatientProfile, LabBiomarker } from '../types';

interface PatientRecordsScreenProps {
  patient: PatientProfile;
  labBiomarkers: LabBiomarker[];
  onUpdatePatient: (updated: PatientProfile) => void;
}

export const PatientRecordsScreen: React.FC<PatientRecordsScreenProps> = ({
  patient,
  labBiomarkers,
  onUpdatePatient,
}) => {
  const [editing, setEditing] = useState(false);
  const [formProfile, setFormProfile] = useState<PatientProfile>(patient);
  const [exported, setExported] = useState(false);

  const handleSave = () => {
    onUpdatePatient(formProfile);
    setEditing(false);
  };

  const handleExportSummary = () => {
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1C30] text-white flex items-center justify-center font-bold text-base border border-[#1E324D] shrink-0">
            TM
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0B1C30] tracking-tight">
                {patient.name}
              </h1>
              <span className="text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                ID: {patient.id}
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-0.5">
              {patient.age} yrs • {patient.gender} • Blood Group {patient.bloodType} • BMI: {patient.bmi} (Optimal)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setEditing(!editing)}
            className="px-4 py-2.5 rounded-xl border border-[#CBD5E1] hover:bg-[#F1F5F9] text-[#0B1C30] text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>{editing ? 'Cancel' : 'Edit Profile'}</span>
          </button>

          <button
            onClick={handleExportSummary}
            className="px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all"
          >
            {exported ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                <span>Exported PDF!</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Export Clinical Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editing Drawer if active */}
      {editing && (
        <div className="bg-[#EFF6FF] rounded-2xl p-5 border border-[#BFDBFE] shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#0284C7]" />
            Edit Clinical Profile Parameters
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="font-semibold text-[#0B1C30] block mb-1">Weight (kg):</label>
              <input
                type="number"
                step="0.1"
                value={formProfile.weightKg}
                onChange={(e) =>
                  setFormProfile({ ...formProfile, weightKg: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-[#0B1C30] block mb-1">Height (cm):</label>
              <input
                type="number"
                value={formProfile.heightCm}
                onChange={(e) =>
                  setFormProfile({ ...formProfile, heightCm: parseFloat(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-[#0B1C30] block mb-1">Daily Calorie Target:</label>
              <input
                type="number"
                value={formProfile.calorieTarget}
                onChange={(e) =>
                  setFormProfile({ ...formProfile, calorieTarget: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={() => setEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0284C7] text-white hover:bg-[#0369A1] shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Grid: Lab Biomarkers & Clinical Restrictions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Diagnostic Lab Biomarker Panel */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9]">
            <div>
              <h2 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0284C7]" />
                Recent Blood & Metabolic Biomarkers
              </h2>
              <p className="text-xs text-[#64748B]">
                Last synchronized lab draw: Aug 24, 2026 (Clinical Laboratory Services)
              </p>
            </div>
            <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-1 rounded-full">
              7 / 7 Within Range
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {labBiomarkers.map((bio) => (
              <div key={bio.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#0B1C30]">{bio.name}</span>
                    <span className="text-[10px] text-[#64748B]">Ref: {bio.referenceRange}</span>
                  </div>
                  <p className="text-xs text-[#475569] leading-relaxed">
                    {bio.clinicalInterpretation}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="text-base font-bold text-[#0B1C30]">{bio.value}</span>
                    <span className="text-xs text-[#64748B] ml-1">{bio.unit}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                    Optimal
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (4 cols): Medical Directives & Allergen Safeguards */}
        <div className="lg:col-span-4 space-y-5">
          {/* Allergies & Restrictions */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
              Verified Clinical Allergies
            </h3>

            <div className="flex flex-wrap gap-2">
              {patient.allergies.map((allergy, idx) => (
                <span
                  key={idx}
                  className="text-xs font-bold text-[#991B1B] bg-[#FEF2F2] border border-[#FCA5A5] px-3 py-1 rounded-full flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                  {allergy}
                </span>
              ))}
            </div>

            <h3 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2 pt-3 pb-2 border-b border-[#F1F5F9]">
              <Layers className="w-4 h-4 text-[#0284C7]" />
              Dietary Directives
            </h3>

            <div className="flex flex-wrap gap-1.5">
              {patient.dietaryRestrictions.map((res, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold text-[#006194] bg-[#E0F2FE] px-2.5 py-1 rounded-full"
                >
                  {res}
                </span>
              ))}
            </div>
          </div>

          {/* Daily Clinical Nutrition Prescription Summary */}
          <div className="bg-[#F8FAFC] rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2 pb-2 border-b border-[#E2E8F0]">
              <Heart className="w-4 h-4 text-[#0D9488]" />
              Target Prescription
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Daily Caloric Allowance</span>
                <strong className="text-[#0B1C30]">{patient.calorieTarget} kcal</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Hydration Minimum</span>
                <strong className="text-[#0B1C30]">{patient.waterTargetMl} mL</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Sodium Ceiling</span>
                <strong className="text-[#0B1C30]">&lt; {patient.macroTargets.sodiumMg} mg</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F1F5F9]">
                <span className="text-[#64748B]">Potassium Floor</span>
                <strong className="text-[#0B1C30]">&gt; {patient.macroTargets.potassiumMg} mg</strong>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#64748B]">Dietary Fiber Floor</span>
                <strong className="text-[#0B1C30]">&gt; {patient.macroTargets.fiberG} g</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
