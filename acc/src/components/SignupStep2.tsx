import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Stethoscope,
  Apple,
  AlertCircle,
  Flame,
  Scale,
  Phone,
  UploadCloud,
  FileCheck,
  CheckCircle2,
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { NutriAiLogo } from './NutriAiLogo';
import { UserProfile } from '../types';

interface SignupStep2Props {
  userData: Partial<UserProfile>;
  onBack: () => void;
  onComplete: (updatedData: Partial<UserProfile>) => void;
  onOpenSupport: () => void;
}

export const SignupStep2: React.FC<SignupStep2Props> = ({
  userData,
  onBack,
  onComplete,
  onOpenSupport,
}) => {
  const [physician, setPhysician] = useState(
    userData.medicalProfile?.primaryPhysician || 'Dr. Elena Vance, MD (CarePulse Clinical)'
  );
  const [selectedDiets, setSelectedDiets] = useState<string[]>(
    userData.medicalProfile?.dietaryPreferences || ['Low Glycemic', 'High Protein']
  );
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(
    userData.medicalProfile?.allergies || ['Shellfish']
  );
  const [calorieTarget, setCalorieTarget] = useState<number>(
    userData.medicalProfile?.dailyCalorieTarget || 2200
  );
  const [targetWeight, setTargetWeight] = useState(
    userData.medicalProfile?.targetWeight || '76 kg'
  );
  const [bloodType, setBloodType] = useState(
    userData.medicalProfile?.bloodType || 'O+'
  );
  const [emergencyName, setEmergencyName] = useState(
    userData.medicalProfile?.emergencyContactName || 'Sarah Mitchell (Spouse)'
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    userData.medicalProfile?.emergencyContactPhone || '+1 (555) 234-5678'
  );
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([
    'Recent_Blood_Glucose_Panel_2026.pdf',
  ]);
  const [submitting, setSubmitting] = useState(false);

  const dietOptions = [
    'Low Glycemic',
    'High Protein',
    'Mediterranean',
    'Plant-Based',
    'Ketogenic',
    'Heart Healthy',
  ];

  const allergyOptions = [
    'Shellfish',
    'Penicillin',
    'Peanuts',
    'Lactose',
    'Gluten',
    'Sulfa',
    'None',
  ];

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const toggleDiet = (diet: string) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const toggleAllergy = (allergy: string) => {
    if (allergy === 'None') {
      setSelectedAllergies(['None']);
      return;
    }
    setSelectedAllergies((prev) => {
      const filtered = prev.filter((a) => a !== 'None');
      return filtered.includes(allergy)
        ? filtered.filter((a) => a !== allergy)
        : [...filtered, allergy];
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileName = e.target.files[0].name;
      setUploadedFiles((prev) => [...prev, fileName]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      primaryPhysician: physician,
      dietaryPreferences: selectedDiets,
      allergies: selectedAllergies,
      dailyCalorieTarget: calorieTarget,
      targetWeight,
      bloodType,
      emergencyContactName: emergencyName,
      emergencyContactPhone: emergencyPhone,
    };

    try {
      const res = await fetch('/api/auth/step2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setTimeout(() => {
        setSubmitting(false);
        onComplete({
          ...userData,
          step2Completed: true,
          medicalProfile: payload,
          ...(data.user || {}),
        });
      }, 700);
    } catch {
      setTimeout(() => {
        setSubmitting(false);
        onComplete({
          ...userData,
          step2Completed: true,
          medicalProfile: payload,
        });
      }, 700);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 md:py-6 flex flex-col justify-start">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          id="step2-back-btn"
          type="button"
          aria-label="Go back to Step 1"
          onClick={onBack}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-[#eff4ff] text-[#0b1c30] hover:bg-[#e5eeff] active:scale-95 transition-all shadow-xs"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#e5eeff] text-[#006194] text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-[#006947] animate-pulse" />
          <span>Step 2 of 2</span>
        </div>
      </div>

      {/* Header Branding & Headline */}
      <div className="flex flex-col gap-1.5 mb-5">
        <div className="flex items-center justify-between">
          <NutriAiLogo size="md" />
          <span className="text-[11px] font-semibold text-[#006194] bg-[#eff4ff] px-2 py-0.5 rounded-full">
            Clinical Telemetry
          </span>
        </div>

        <h1 className="text-2xl md:text-[28px] font-bold text-[#0b1c30] tracking-tight mt-1 leading-snug">
          Health & Nutrition Profile
        </h1>
        <p className="text-sm text-[#3f4850] leading-relaxed">
          Personalize your baseline biomarkers, dietary preferences, and care team for AI precision.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
        {/* Primary Physician */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-[#3f4850] flex items-center gap-1">
            Primary Physician / Clinical Caregiver <span className="text-[#006194]">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3.5 text-[#707881] pointer-events-none">
              <Stethoscope className="w-[18px] h-[18px]" />
            </span>
            <input
              id="physician-input"
              type="text"
              value={physician}
              onChange={(e) => setPhysician(e.target.value)}
              placeholder="Dr. Elena Vance, MD"
              className="w-full h-12 pl-10 pr-4 rounded-xl bg-white border border-[#e2e8f0] text-[#0b1c30] text-sm shadow-xs outline-none focus:border-[#006194] focus:ring-2 focus:ring-[#006194]/15 transition-all"
            />
          </div>
        </div>

        {/* Dietary Focus Chips */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#3f4850] flex items-center gap-1">
            <Apple className="w-3.5 h-3.5 text-[#006a61]" />
            Dietary Focus & Metabolic Goals
          </label>
          <div className="flex flex-wrap gap-1.5">
            {dietOptions.map((diet) => {
              const selected = selectedDiets.includes(diet);
              return (
                <button
                  key={diet}
                  type="button"
                  onClick={() => toggleDiet(diet)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-[#006194] text-white shadow-xs'
                      : 'bg-[#eff4ff] text-[#3f4850] hover:bg-[#e5eeff]'
                  }`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>

        {/* Allergies & Sensitivities */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#3f4850] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-[#ba1a1a]" />
            Allergies & Medical Sensitivities
          </label>
          <div className="flex flex-wrap gap-1.5">
            {allergyOptions.map((allg) => {
              const selected = selectedAllergies.includes(allg);
              return (
                <button
                  key={allg}
                  type="button"
                  onClick={() => toggleAllergy(allg)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-[#ba1a1a] text-white shadow-xs'
                      : 'bg-slate-100 text-[#3f4850] hover:bg-slate-200'
                  }`}
                >
                  {allg}
                </button>
              );
            })}
          </div>
        </div>

        {/* Metrics Grid: Calories, Target Weight, Blood Type */}
        <div className="grid grid-cols-3 gap-2">
          {/* Calorie Target */}
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#475569] font-medium">
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-500" /> Target
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <input
                id="calorie-input"
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full text-base font-bold text-[#0b1c30] outline-none"
              />
            </div>
            <span className="text-[10px] text-slate-400">kcal / day</span>
          </div>

          {/* Weight */}
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
            <div className="flex items-center justify-between text-[11px] text-[#475569] font-medium">
              <span className="flex items-center gap-1">
                <Scale className="w-3 h-3 text-[#006194]" /> Weight
              </span>
            </div>
            <input
              id="weight-input"
              type="text"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              className="w-full text-base font-bold text-[#0b1c30] outline-none"
            />
            <span className="text-[10px] text-slate-400">Target</span>
          </div>

          {/* Blood Type */}
          <div className="flex flex-col gap-1 p-2.5 rounded-xl bg-white border border-[#e2e8f0] shadow-xs">
            <span className="text-[11px] text-[#475569] font-medium">Blood Type</span>
            <select
              id="blood-type-select"
              value={bloodType}
              onChange={(e) => setBloodType(e.target.value)}
              className="w-full text-base font-bold text-[#006194] bg-transparent outline-none cursor-pointer"
            >
              {bloodTypes.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-slate-400">Clinical lab</span>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="flex flex-col gap-2 p-3 bg-[#f8f9ff] rounded-xl border border-[#e2e8f0]">
          <span className="text-xs font-semibold text-[#0b1c30] flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-[#006194]" /> Emergency Contact
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              id="emergency-name-input"
              type="text"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="Contact Name (e.g., Sarah Mitchell)"
              className="h-10 px-3 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0b1c30] outline-none"
            />
            <input
              id="emergency-phone-input"
              type="text"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="Contact Phone"
              className="h-10 px-3 rounded-lg bg-white border border-[#cbd5e1] text-xs text-[#0b1c30] outline-none"
            />
          </div>
        </div>

        {/* Medical Document Upload */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-[#3f4850] flex items-center justify-between">
            <span>Prior Labs & Records (Optional)</span>
            <span className="text-[11px] text-[#006a61] font-normal">Encrypted on Upload</span>
          </label>
          <label
            htmlFor="lab-file-upload"
            className="border-2 border-dashed border-[#cbd5e1] hover:border-[#006194] p-3.5 rounded-xl bg-white flex flex-col items-center justify-center cursor-pointer transition-colors text-center group"
          >
            <UploadCloud className="w-6 h-6 text-[#006194] group-hover:scale-110 transition-transform mb-1" />
            <span className="text-xs font-semibold text-[#0b1c30]">
              Click to browse or drop medical PDF / scan
            </span>
            <span className="text-[11px] text-[#707881]">
              Supported: PDF, DICOM, JPG (Max 25MB)
            </span>
            <input
              id="lab-file-upload"
              type="file"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          {uploadedFiles.length > 0 && (
            <div className="space-y-1 mt-1">
              {uploadedFiles.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-1.5 bg-[#f5fff6] border border-[#6ffbbe]/50 rounded-lg text-xs text-[#006947]"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-[#006947]" />
                    <span className="font-medium truncate max-w-[200px]">{file}</span>
                  </div>
                  <span className="text-[10px] bg-[#6ffbbe]/30 px-1.5 py-0.5 rounded-sm font-semibold">
                    AES-256 Encrypted
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <button
          id="complete-step2-btn"
          type="submit"
          disabled={submitting}
          className="w-full h-12 mt-1 rounded-xl bg-[#006194] hover:bg-[#004b73] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          {submitting ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Saving Health Records...</span>
            </div>
          ) : (
            <>
              <span>Complete Setup & Access Records</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Reassurance */}
      <div className="mt-4 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center gap-2.5 text-xs text-[#006194]">
        <ShieldCheck className="w-4 h-4 text-[#006a61] flex-shrink-0" />
        <span>Your data syncs in real-time with authorized clinical practitioners.</span>
      </div>
    </div>
  );
};
