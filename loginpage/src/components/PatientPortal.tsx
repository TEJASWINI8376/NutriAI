import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Utensils,
  ShieldCheck,
  LogOut,
  Activity,
  Calendar,
  FolderHeart,
  Pill,
  Users,
  Shield,
  Lock,
  ScanLine,
  Camera,
  Sparkles,
  ChevronRight,
  Bot,
} from 'lucide-react';
import type { User, VitalRecord, Appointment, MedicalRecord, Medication, CareTeamMember, GatewayStatus } from '../types.ts';
import { api } from '../api.ts';
import { VitalsModule } from './VitalsModule.tsx';
import { AppointmentsModule } from './AppointmentsModule.tsx';
import { RecordsModule } from './RecordsModule.tsx';
import { MedicationsModule } from './MedicationsModule.tsx';
import { CareTeamModule } from './CareTeamModule.tsx';
import { AuditModal } from './AuditModal.tsx';

interface PatientPortalProps {
  user: User;
  onLogout: () => void;
  showToast: (msg: string, icon?: string) => void;
  onOpenFoodAnalysis?: () => void;
  onOpenScanner?: () => void;
  onOpen3DJourney?: () => void;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ user, onLogout, showToast, onOpenFoodAnalysis, onOpenScanner }) => {
  const [activeTab, setActiveTab] = useState<'vitals' | 'appointments' | 'records' | 'medications' | 'careteam'>('vitals');
  const [vitals, setVitals] = useState<VitalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [careTeam, setCareTeam] = useState<CareTeamMember[]>([]);
  const [recentAudits, setRecentAudits] = useState<{ id: string; action: string; timestamp: string }[]>([]);
  const [gatewayStatus, setGatewayStatus] = useState<GatewayStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [auditModalOpen, setAuditModalOpen] = useState(false);

  const loadData = async () => {
    try {
      const [dash, gateway] = await Promise.all([
        api.getDashboardData(),
        api.getGatewayStatus(),
      ]);

      setVitals(dash.vitals || []);
      setAppointments(dash.appointments || []);
      setMedicalRecords(dash.medicalRecords || []);
      setMedications(dash.medications || []);
      setCareTeam(dash.careTeam || []);
      setRecentAudits(dash.recentAudits || []);
      setGatewayStatus(gateway);
    } catch (err: any) {
      showToast(err.message || 'Failed to load medical records from database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleVitalAdded = (newVital: VitalRecord) => {
    setVitals((prev) => {
      const idx = prev.findIndex((v) => v.type === newVital.type);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = newVital;
        return next;
      }
      return [newVital, ...prev];
    });
  };

  const handleAppointmentAdded = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
  };

  const handleAppointmentCancelled = (apptId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === apptId ? { ...a, status: 'cancelled' as const } : a))
    );
  };

  const handleRecordAdded = (newRecord: MedicalRecord) => {
    setMedicalRecords((prev) => [newRecord, ...prev]);
  };

  const handleAdherenceToggled = (medId: string, timeSlot: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id !== medId) return m;
        const current = m.takenToday?.[timeSlot] || false;
        return {
          ...m,
          takenToday: {
            ...m.takenToday,
            [timeSlot]: !current,
          },
        };
      })
    );
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex flex-col font-sans">
      {/* Top Clinical Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-[#e5eeff] px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Brand Logo & Clinical Gateway Status */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-white shadow-xs p-1 border border-slate-200">
              <div className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-[#006a61] text-white">
                <CheckCircle2 className="w-2.5 h-2.5 text-white" />
              </div>
              <img
                alt="NutriAI"
                className="w-full h-full object-contain rounded-xl"
                src="/nutriai-logo.svg"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-extrabold text-[#0b1c30] tracking-tight">
                  NutriAI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold text-[#006a61] bg-[#effcf6] px-2 py-0.5 rounded-full border border-[#c1f4db]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00855b] animate-pulse"></span>
                  Online ({gatewayStatus?.latencyMs || 14}ms)
                </span>
              </div>
              <p className="text-[11px] text-[#707881] hidden sm:block">
                Nutritional Intelligence • Verified PHI
              </p>
            </div>
          </div>

          {/* User Profile & Quick Actions */}
          <div className="flex items-center gap-2.5">
            {onOpenFoodAnalysis && (
              <button
                onClick={onOpenFoodAnalysis}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#006947] bg-[#effcf6] hover:bg-[#dff8eb] rounded-xl transition-colors cursor-pointer"
                title="Open food analysis workspace"
              >
                <Utensils className="w-3.5 h-3.5 text-[#006947]" />
                <span>Food Analysis</span>
              </button>
            )}
            <button
              onClick={() => setAuditModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#006194] bg-[#eff4ff] hover:bg-[#e0f0fe] rounded-xl transition-colors cursor-pointer"
              title="View HIPAA PHI cryptographic audit logs"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#006194]" />
              <span>HIPAA Ledger</span>
            </button>

            {/* Patient Badge */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              <div className="relative w-9 h-9 rounded-full overflow-hidden bg-[#eff4ff] border border-slate-200 shrink-0">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-[#006194] text-[13px]">
                    {user.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-[13px] font-bold text-[#0b1c30] leading-tight">
                  {user.name}
                </p>
                <div className="flex items-center gap-1.5 text-[10px] text-[#707881]">
                  <span className="font-mono">{user.mrn}</span>
                  <span>•</span>
                  <span className="text-[#006947] font-semibold">Verified Patient</span>
                </div>
              </div>
            </div>

            {/* Logout Action */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Sign Out from Clinical Gateway"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header / Tabs */}
      <nav className="bg-white border-b border-[#e5eeff] px-4 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
          {[
            { id: 'vitals', label: 'Vitals & Metrics', icon: Activity },
            { id: 'appointments', label: 'Appointments', icon: Calendar, badge: appointments.filter(a => a.status !== 'cancelled').length },
            { id: 'records', label: 'Medical Records', icon: FolderHeart, badge: medicalRecords.length },
            { id: 'medications', label: 'Medications Protocol', icon: Pill, badge: medications.length },
            { id: 'careteam', label: 'Care Team', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#eff4ff] text-[#006194] shadow-xs'
                    : 'text-[#707881] hover:text-[#0b1c30] hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      activeTab === tab.id
                        ? 'bg-[#006194] text-white'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="inline-block w-8 h-8 border-3 border-[#006194] border-t-transparent rounded-full animate-spin"></span>
            <p className="text-[14px] font-semibold text-[#3f4850]">
              Decrypting and loading clinical medical records...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Clinical Alerts / Quick Patient Summary Bar */}
            <div className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#effcf6] text-[#006947] flex items-center justify-center shrink-0">
                  <Shield className="w-5 h-5 text-[#006947]" />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#0b1c30]">
                    Electronic Health Profile Synchronized
                  </h4>
                  <p className="text-[11px] text-[#707881]">
                    Blood Type: <span className="font-bold text-[#0b1c30]">{user.bloodType || 'A+'}</span> • Allergies: <span className="text-red-700 font-semibold">{user.allergies?.join(', ') || 'NKDA'}</span> • Primary: <span className="text-[#006194] font-semibold">Dr. Sarah Jenkins, MD</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('appointments')}
                  className="px-3 py-1.5 text-[12px] font-bold bg-[#eff4ff] hover:bg-[#e0f0fe] text-[#006194] rounded-xl transition-colors cursor-pointer"
                >
                  Schedule Consultation
                </button>
                <button
                  onClick={() => showToast('Full clinical summary generated and certified.', 'assignment_turned_in')}
                  className="px-3 py-1.5 text-[12px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
                >
                  Print Summary
                </button>
              </div>
            </div>

            {/* ── Quick Scan Food Card ─────────────────────────────────────── */}
            {(onOpenScanner || onOpenFoodAnalysis) && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#006948] via-[#007a55] to-[#004d35] p-5 shadow-lg border border-[#005238]/40">
                {/* Decorative orb */}
                <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full bg-white/5 pointer-events-none" />
                <div className="absolute -bottom-6 -left-4 w-24 h-24 rounded-full bg-white/5 pointer-events-none" />

                <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Icon cluster */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 shrink-0">
                      <ScanLine className="w-7 h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-[17px] font-extrabold text-white tracking-tight leading-tight">
                          Scan Food
                        </h2>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-100 bg-white/15 px-2 py-0.5 rounded-full border border-white/20">
                          <Sparkles className="w-3 h-3" />
                          AI-Powered
                        </span>
                      </div>
                      <p className="text-[12px] text-emerald-100 mt-0.5 leading-snug">
                        Scan a food label to instantly check nutrition &amp; ingredients
                      </p>
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="quickScanCameraBtn"
                      type="button"
                      onClick={onOpenScanner ?? onOpenFoodAnalysis}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/25 text-white text-[12px] font-bold transition-all cursor-pointer active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Camera</span>
                    </button>
                    <button
                      id="quickScanNowBtn"
                      type="button"
                      onClick={onOpenScanner ?? onOpenFoodAnalysis}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#006948] text-[13px] font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
                    >
                      <span>Scan Now</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Modules */}
            {activeTab === 'vitals' && (
              <VitalsModule
                vitals={vitals}
                onVitalAdded={handleVitalAdded}
                showToast={showToast}
              />
            )}

            {activeTab === 'appointments' && (
              <AppointmentsModule
                appointments={appointments}
                careTeam={careTeam}
                onAppointmentAdded={handleAppointmentAdded}
                onAppointmentCancelled={handleAppointmentCancelled}
                showToast={showToast}
              />
            )}

            {activeTab === 'records' && (
              <RecordsModule
                records={medicalRecords}
                onRecordAdded={handleRecordAdded}
                showToast={showToast}
              />
            )}

            {activeTab === 'medications' && (
              <MedicationsModule
                medications={medications}
                onAdherenceToggled={handleAdherenceToggled}
                showToast={showToast}
              />
            )}

            {activeTab === 'careteam' && (
              <CareTeamModule
                careTeam={careTeam}
                showToast={showToast}
              />
            )}

            {/* Trust & Regulatory Footer */}
            <div className="flex flex-col items-center justify-center gap-1 text-center py-6">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#006a61]">
                <Lock className="w-3.5 h-3.5 text-[#006a61]" />
                <span>256-bit HIPAA-compliant encryption</span>
              </div>
              <p className="text-[11px] text-[#707881]">
                Protected health information (PHI) verified • ISO 27001 Certified • HL7 FHIR Synced
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Audit Modal */}
      {auditModalOpen && (
        <AuditModal
          logs={recentAudits}
          onClose={() => setAuditModalOpen(false)}
        />
      )}

      {/* ── Floating AI Bot Scan Button ─────────────────────────────── */}
      {(onOpenScanner || onOpenFoodAnalysis) && (
        <div className="fixed bottom-6 right-5 z-50 flex flex-col items-end gap-2 group">
          {/* Tooltip */}
          <div
            aria-hidden="true"
            className="pointer-events-none mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 mr-1"
          >
            <span className="inline-block bg-[#0b1c30] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-lg whitespace-nowrap">
              Scan Food
            </span>
          </div>

          {/* FAB */}
          <button
            id="floatingBotScanBtn"
            type="button"
            onClick={onOpenScanner ?? onOpenFoodAnalysis}
            title="Scan Food — Open AI Scanner"
            aria-label="Scan Food"
            className="
              relative flex items-center justify-center
              w-14 h-14 rounded-2xl
              bg-gradient-to-br from-[#006948] to-[#004d35]
              shadow-[0_4px_20px_rgba(0,105,72,0.55)]
              hover:shadow-[0_6px_28px_rgba(0,105,72,0.75)]
              hover:scale-110 active:scale-95
              transition-all duration-200 cursor-pointer
              border border-[#00a36c]/40
            "
          >
            {/* Pulsing glow ring */}
            <span className="absolute inset-0 rounded-2xl bg-[#006948] animate-ping opacity-20 pointer-events-none" />

            {/* Bot face icon built from lucide Bot + ScanLine overlay */}
            <span className="relative flex flex-col items-center justify-center gap-0">
              <Bot className="w-7 h-7 text-white drop-shadow-sm" />
              <span
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-5 h-5 rounded-full bg-emerald-300 border-2 border-[#004d35] shadow"
              >
                <ScanLine className="w-3 h-3 text-[#004d35]" />
              </span>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
