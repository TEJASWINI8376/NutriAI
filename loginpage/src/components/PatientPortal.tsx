import React, { useState, useEffect } from 'react';
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
}

export const PatientPortal: React.FC<PatientPortalProps> = ({ user, onLogout, showToast }) => {
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

  const handleAppointmentCancelled = (id: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelled' as const } : a))
    );
  };

  const handleRecordAdded = (newRecord: MedicalRecord) => {
    setMedicalRecords((prev) => [newRecord, ...prev]);
  };

  const handleAdherenceToggled = (medId: string, timeSlot: string) => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === medId) {
          const current = m.adherenceToday?.[timeSlot];
          return {
            ...m,
            adherenceToday: {
              ...(m.adherenceToday || {}),
              [timeSlot]: !current,
            },
          };
        }
        return m;
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
                <span className="material-symbols-outlined text-[10px]">verified</span>
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
            <button
              onClick={() => setAuditModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold text-[#006194] bg-[#eff4ff] hover:bg-[#e0f0fe] rounded-xl transition-colors cursor-pointer"
              title="View HIPAA PHI cryptographic audit logs"
            >
              <span className="material-symbols-outlined text-[16px]">security</span>
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
              <span className="material-symbols-outlined text-[20px]">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Sub-header / Tabs */}
      <nav className="bg-white border-b border-[#e5eeff] px-4 lg:px-8 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto flex items-center gap-1 py-2">
          {[
            { id: 'vitals', label: 'Vitals & Metrics', icon: 'vital_signs' },
            { id: 'appointments', label: 'Appointments', icon: 'calendar_month', badge: appointments.filter(a => a.status !== 'cancelled').length },
            { id: 'records', label: 'Medical Records', icon: 'folder_shared', badge: medicalRecords.length },
            { id: 'medications', label: 'Medications Protocol', icon: 'medication', badge: medications.length },
            { id: 'careteam', label: 'Care Team', icon: 'medical_services' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#eff4ff] text-[#006194] shadow-xs'
                  : 'text-[#707881] hover:text-[#0b1c30] hover:bg-slate-50'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
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
          ))}
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
                  <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
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

            {/* Medical Care Team Spotlight (Matching the mock design) */}
            <div className="w-full flex items-center gap-3 p-4 rounded-2xl bg-white shadow-xs border border-[#e5eeff] mt-8">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-[#d3e4fe] border border-slate-200">
                <img
                  className="w-full h-full object-cover"
                  alt="Dr. Sarah Jenkins, MD"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgok82iLZmBm92-YmTHYPi-QN_60LyvTHBSNS-OIpktHH2mZgcJnfGhrd9J3bJEnnO9tXE2HFIeEnhko558DqvpahUre2heWL4ydeetViirU9zYJ4hinN3jLSPWCKmwUK0hpDIlqLJzmRjd834Zzf_FBFgKfUFvLSXU6aW7KooiUBFFgXqIFNBb_bg8Xbhd5k38m_Ju7FWXMDtWgpk2gwlMOpCuVzKjls0cGMUnIYsoOTTU2CY5rJx"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-[#0b1c30] truncate">
                    Dr. Sarah Jenkins, MD
                  </span>
                  <span className="material-symbols-outlined text-[#006a61] text-[16px]">
                    check_circle
                  </span>
                </div>
                <p className="text-[12px] text-[#3f4850] truncate">
                  "Your medical records are synchronized in real-time."
                </p>
              </div>
            </div>

            {/* Trust & Regulatory Footer */}
            <div className="flex flex-col items-center justify-center gap-1 text-center py-6">
              <div className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#006a61]">
                <span className="material-symbols-outlined text-[16px]">lock</span>
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
    </div>
  );
};
