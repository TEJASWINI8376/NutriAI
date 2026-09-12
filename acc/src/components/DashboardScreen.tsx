import React, { useState, useEffect } from 'react';
import {
  Activity,
  Heart,
  Droplet,
  Flame,
  Pill,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Plus,
  Headphones,
} from 'lucide-react';
import { NutriAiLogo } from './NutriAiLogo';
import { UserProfile, TelemetryData, MedicationItem, VerifiedDocument } from '../types';

interface DashboardScreenProps {
  user: UserProfile;
  onLogout: () => void;
  onEditProfile: () => void;
  onOpenSupport: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  user,
  onLogout,
  onEditProfile,
  onOpenSupport,
}) => {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [documents, setDocuments] = useState<VerifiedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggedWater, setLoggedWater] = useState(2.4);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records');
      const data = await res.json();
      setTelemetry(data.vitals);
      setMedications(data.upcomingMedications);
      setDocuments(data.verifiedDocuments);
    } catch {
      // default baseline
      setTelemetry({
        heartRate: { value: 72, unit: 'bpm', status: 'Optimal', change: '+2 bpm' },
        bloodGlucose: { value: 98, unit: 'mg/dL', status: 'Normal fasting', change: '-4 mg/dL' },
        bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Optimal' },
        hydration: { currentLiters: 2.4, targetLiters: 3.0, unit: 'L', status: '80%' },
        calories: {
          consumed: 1850,
          target: user.medicalProfile?.dailyCalorieTarget || 2200,
          protein: '124g',
          carbs: '190g',
          fats: '58g',
        },
      });
      setMedications([
        { id: 'm1', name: 'Omega-3 EPA/DHA Pure', dose: '1,000 mg', time: '08:00 AM', status: 'Taken', badge: 'Daily Cardio' },
        { id: 'm2', name: 'Vitamin D3 + K2 Emulsion', dose: '2,000 IU', time: '12:30 PM', status: 'Pending', badge: 'Nutrition' },
        { id: 'm3', name: 'CoQ10 Ubiquinol', dose: '100 mg', time: '07:30 PM', status: 'Scheduled', badge: 'Cellular Health' },
      ]);
      setDocuments([
        { id: 'd1', title: 'Comprehensive Metabolic Panel (CMP)', date: 'Sept 04, 2026', doctor: 'Dr. Elena Vance', status: 'Verified' },
        { id: 'd2', title: 'NutriAi Microbiome & Glucose Assay', date: 'Aug 28, 2026', doctor: 'CarePulse Diagnostics', status: 'Verified' },
        { id: 'd3', title: 'HIPAA Consent & Clinical Telemetry Authorization', date: 'Sept 12, 2026', doctor: 'Compliance Registry', status: 'Encrypted' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleToggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id
          ? {
              ...med,
              status: med.status === 'Taken' ? 'Pending' : 'Taken',
            }
          : med
      )
    );
  };

  const addHydration = () => {
    setLoggedWater((prev) => Math.min(prev + 0.25, 4.0));
  };

  const doctorPhoto =
    'https://lh3.googleusercontent.com/aida-public/AB6AXuB7bxWHHDAui7l667jVke2YsIPszAfvRYgcGG4WzJBin1sYW9PkBHzCBY25HWZ1ELwyrPOV1HdmlzXQ7hwiHaQRdWCb6123vQ0Vr2HNC0cILlkbKTpGUXSSA7pcbNh_pF7qJyvNwvDaDrrKxCKulYJ9z_ivoUVszowUVDYJ3cfJHUddBF0L1b5t6-kM5Eg9j4QCer-biXFGqkL29t7UPKBuD5DZOfYfyLesaHdsKuuR2yLR7p30MeX6';

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 md:py-8 flex flex-col gap-6">
      {/* Top Header Bar */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-[#e2e8f0] shadow-xs">
        <div className="flex items-center gap-3">
          <NutriAiLogo size="md" showSubtitle />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0]">
            <div className="w-7 h-7 rounded-full bg-[#006194] text-white flex items-center justify-center font-bold text-xs">
              {user.fullName ? user.fullName[0] : 'A'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-[#0b1c30] truncate max-w-[140px]">
                {user.fullName || 'Alexander Mitchell'}
              </span>
              <span className="text-[10px] text-[#006947] font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#006947]" /> HIPAA Verified
              </span>
            </div>
          </div>

          <button
            id="edit-profile-btn"
            type="button"
            onClick={onEditProfile}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-[#006194] bg-[#eff4ff] hover:bg-[#e5eeff] transition-colors"
          >
            Edit Profile
          </button>

          <button
            id="logout-btn"
            type="button"
            onClick={onLogout}
            aria-label="Log Out"
            className="w-9 h-9 rounded-xl text-[#707881] hover:text-[#ba1a1a] hover:bg-red-50 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Patient Clinical Greeting Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-white via-[#f8f9ff] to-[#eff4ff] border border-[#dce9ff] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#e6f7ef] text-[#006947] text-[11px] font-bold">
              PATIENT ID #{user.id || 'CARE-9021'}
            </span>
            <span className="text-xs text-[#475569]">Last synced 2 minutes ago</span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-[#0b1c30]">
            Welcome, {user.fullName || 'Alexander Mitchell'}
          </h2>
          <p className="text-xs md:text-sm text-[#3f4850] max-w-xl leading-relaxed">
            Your physiological telemetry and nutritional biomarkers are actively balanced.
            Primary Physician: <span className="font-semibold text-[#006194]">{user.medicalProfile?.primaryPhysician || 'Dr. Elena Vance, MD'}</span>
          </p>
        </div>

        <button
          id="consult-dr-elena-btn"
          type="button"
          onClick={onOpenSupport}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-[#006194] hover:bg-[#004b73] text-white text-xs md:text-sm font-semibold shadow-sm transition-all flex-shrink-0 active:scale-95"
        >
          <img
            src={doctorPhoto}
            alt="Dr. Elena Vance"
            className="w-6 h-6 rounded-full object-cover ring-1 ring-white"
            referrerPolicy="no-referrer"
          />
          <span>Consult Dr. Elena Vance</span>
        </button>
      </div>

      {/* Vitals Metric Tiles: Two-column cards pairing large numerical readouts with baseline indicators */}
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-[#0b1c30] flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#006194]" />
            Live Biometric Telemetry & Nutrition
          </h3>
          <span className="text-xs text-[#006a61] font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            Active Sensors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Heart Rate */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-semibold flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20" /> Heart Rate
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#e6f7ef] text-[#006947] text-[10px] font-bold">
                Optimal
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0b1c30]">
                {telemetry?.heartRate?.value || 72}
              </span>
              <span className="text-xs text-[#475569] font-medium">bpm</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#006947]">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Resting baseline regular</span>
            </div>
          </div>

          {/* Blood Glucose */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-semibold flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-[#006194]" /> Fasting Glucose
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#e6f7ef] text-[#006947] text-[10px] font-bold">
                Normal
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0b1c30]">
                {telemetry?.bloodGlucose?.value || 98}
              </span>
              <span className="text-xs text-[#475569] font-medium">mg/dL</span>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[11px] text-[#006947]">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>-4 mg/dL post-breakfast</span>
            </div>
          </div>

          {/* Daily Caloric Target & Intake */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" /> Daily Calories
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006194] text-[10px] font-bold">
                84% Met
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0b1c30]">
                {telemetry?.calories?.consumed || 1850}
              </span>
              <span className="text-xs text-[#475569] font-medium">
                / {telemetry?.calories?.target || 2200} kcal
              </span>
            </div>
            {/* Macro breakdown */}
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#475569] pt-1 border-t border-slate-100">
              <span>P: {telemetry?.calories?.protein || '124g'}</span>
              <span>C: {telemetry?.calories?.carbs || '190g'}</span>
              <span>F: {telemetry?.calories?.fats || '58g'}</span>
            </div>
          </div>

          {/* Hydration */}
          <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-[#475569]">
              <span className="font-semibold flex items-center gap-1.5">
                <Droplet className="w-4 h-4 text-[#006a61]" /> Hydration
              </span>
              <button
                type="button"
                onClick={addHydration}
                className="text-[10px] text-[#006194] hover:bg-[#eff4ff] px-1.5 py-0.5 rounded-md flex items-center gap-0.5 font-bold"
              >
                <Plus className="w-3 h-3" /> 250ml
              </button>
            </div>
            <div className="mt-3 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-[#0b1c30]">
                {loggedWater.toFixed(1)}
              </span>
              <span className="text-xs text-[#475569] font-medium">/ 3.0 L</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-[#006a61] h-full transition-all"
                style={{ width: `${Math.min((loggedWater / 3.0) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Layout: Medication Timeline & Verified Health Records */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Medication Schedule Timeline */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#006194]" />
              Prescription & Nutritional Timeline
            </h3>
            <span className="text-[11px] text-[#475569]">Today's Schedule</span>
          </div>

          <div className="space-y-4 relative pl-2">
            {/* Vertical connector stroke */}
            <div className="absolute left-[17px] top-3 bottom-3 w-[2px] bg-[#e2e8f0]" />

            {medications.map((item) => (
              <div key={item.id} className="relative flex items-start gap-3.5 z-10">
                <button
                  type="button"
                  onClick={() => handleToggleMedication(item.id)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    item.status === 'Taken'
                      ? 'bg-[#006947] text-white shadow-xs'
                      : 'bg-white border-2 border-[#006194] text-[#006194]'
                  }`}
                >
                  {item.status === 'Taken' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#006194]" />
                  )}
                </button>

                <div className="flex-1 p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-[#0b1c30]">{item.name}</span>
                    <span className="text-[11px] text-[#475569]">
                      {item.dose} • {item.time}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#eff4ff] text-[#006194]">
                      {item.badge}
                    </span>
                    <span
                      className={`text-[10px] font-bold ${
                        item.status === 'Taken' ? 'text-[#006947]' : 'text-amber-600'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Medical Records Card */}
        <div className="p-5 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-[#0b1c30] flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#006a61]" />
                Encrypted Health Records
              </h3>
              <span className="text-[11px] text-[#006947] font-semibold bg-[#e6f7ef] px-2 py-0.5 rounded-full">
                HIPAA Level 2
              </span>
            </div>

            <div className="space-y-2.5">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-xl bg-[#f8f9ff] border border-[#e2e8f0] hover:border-[#93ccff] transition-all flex items-center justify-between group cursor-pointer"
                  onClick={() => alert(`Accessing encrypted records for ${doc.title}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#e5eeff] text-[#006194] flex items-center justify-center flex-shrink-0">
                      <FileCheck className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-[#0b1c30] group-hover:text-[#006194] transition-colors">
                        {doc.title}
                      </span>
                      <span className="text-[11px] text-[#475569]">
                        {doc.date} • {doc.doctor}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#e6f7ef] text-[#006947]">
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Upload Action */}
          <div className="mt-4 p-3 rounded-xl bg-[#eff4ff] border border-[#dce9ff] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#006194]" />
              <span className="text-xs text-[#006194] font-semibold">
                Upload new diagnostic lab scan
              </span>
            </div>
            <button
              type="button"
              onClick={onEditProfile}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#cce5ff] hover:bg-slate-50 text-[11px] font-bold text-[#006194] transition-colors"
            >
              Upload
            </button>
          </div>
        </div>
      </div>

      {/* AI Nutritionist Insights Bar */}
      <div className="p-4 rounded-2xl bg-white border border-[#e2e8f0] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006194] to-[#006a61] text-white flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-[#0b1c30]">
              NutriAi Metabolic Telemetry Observation
            </span>
            <span className="text-xs text-[#475569]">
              Your blood glucose stability is within 95% of target following protein-focused breakfast.
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onOpenSupport}
          className="px-4 py-2 rounded-xl bg-[#006194] hover:bg-[#004b73] text-white text-xs font-semibold whitespace-nowrap transition-colors"
        >
          Ask Dr. Vance
        </button>
      </div>
    </div>
  );
};
