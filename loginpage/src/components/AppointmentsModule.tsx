import React, { useState } from 'react';
import type { Appointment, CareTeamMember } from '../types.ts';
import { api } from '../api.ts';

interface AppointmentsModuleProps {
  appointments: Appointment[];
  careTeam: CareTeamMember[];
  onAppointmentAdded: (appt: Appointment) => void;
  onAppointmentCancelled: (apptId: string) => void;
  showToast: (msg: string, icon?: string) => void;
}

export const AppointmentsModule: React.FC<AppointmentsModuleProps> = ({
  appointments,
  careTeam,
  onAppointmentAdded,
  onAppointmentCancelled,
  showToast,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(careTeam[0]?.name || 'Dr. Sarah Jenkins, MD');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [visitType, setVisitType] = useState<Appointment['type']>('In-Clinic');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCallModal, setActiveCallModal] = useState<Appointment | null>(null);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      showToast('Please select an appointment date.', 'warning');
      return;
    }

    const doctorObj = careTeam.find((d) => d.name === selectedDoctor) || careTeam[0];

    setIsSubmitting(true);
    try {
      const res = await api.scheduleAppointment({
        doctorName: doctorObj.name,
        doctorRole: doctorObj.title,
        doctorAvatar: doctorObj.avatar,
        department: doctorObj.department,
        date,
        time,
        type: visitType,
        location: visitType === 'Telehealth Video' ? 'NutriAI Encrypted Video Bridge' : 'NutriAI Health Pavilion Suite 402',
        notes: notes.trim() || 'Clinical follow-up consultation.',
      });

      onAppointmentAdded(res.appointment);
      showToast(`Appointment confirmed with ${doctorObj.name}.`, 'event_available');
      setModalOpen(false);
      setDate('');
      setNotes('');
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule appointment.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled consultation?')) return;
    try {
      await api.cancelAppointment(id);
      onAppointmentCancelled(id);
      showToast('Appointment successfully cancelled.', 'event_busy');
    } catch (err: any) {
      showToast(err.message || 'Could not cancel appointment.', 'error');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Scheduled Consultations & Care Visits
          </h2>
          <p className="text-[12px] text-[#707881]">
            Directly connected with verified attending physicians and specialized clinical clinics
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
          <span>Schedule Visit</span>
        </button>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {appointments.filter((a) => a.status !== 'cancelled').length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-8 text-center border border-[#e5eeff]">
            <span className="material-symbols-outlined text-[#006194] text-[36px] mb-2">event_available</span>
            <p className="text-[15px] font-bold text-[#0b1c30]">No Upcoming Appointments</p>
            <p className="text-[13px] text-[#707881] max-w-sm mx-auto mt-1 mb-4">
              You are all caught up on your preventive consultations. Click below to schedule a new visit.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#006194] text-white text-[13px] font-bold"
            >
              Book an Appointment
            </button>
          </div>
        ) : (
          appointments
            .filter((a) => a.status !== 'cancelled')
            .map((appt) => (
              <div
                key={appt.id}
                className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-[#d3e4fe] shrink-0 border border-slate-200">
                        <img
                          src={appt.doctorAvatar}
                          alt={appt.doctorName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-[14px] font-bold text-[#0b1c30]">
                            {appt.doctorName}
                          </h3>
                          <span className="material-symbols-outlined text-[#006a61] text-[16px]">
                            verified
                          </span>
                        </div>
                        <p className="text-[12px] text-[#707881] font-medium">
                          {appt.department}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                        appt.type === 'Telehealth Video'
                          ? 'bg-[#eff4ff] text-[#006194] border-[#d3e4fe]'
                          : 'bg-[#effcf6] text-[#006947] border-[#c1f4db]'
                      }`}
                    >
                      {appt.type}
                    </span>
                  </div>

                  <div className="bg-[#eff4ff]/60 rounded-xl p-3 flex items-center justify-between text-[13px] font-medium text-[#0b1c30] mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#006194] text-[18px]">
                        calendar_today
                      </span>
                      <span>{appt.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#006a61] font-bold">
                      <span className="material-symbols-outlined text-[18px]">schedule</span>
                      <span>{appt.time}</span>
                    </div>
                  </div>

                  {appt.notes && (
                    <p className="text-[12px] text-[#3f4850] bg-slate-50 p-2.5 rounded-lg mb-3 italic">
                      "{appt.notes}"
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#f1f5f9] mt-2">
                  <span className="text-[11px] text-[#707881] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                    {appt.location}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCancel(appt.id)}
                      className="px-2.5 py-1.5 text-[12px] font-semibold text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    {appt.type === 'Telehealth Video' ? (
                      <button
                        onClick={() => setActiveCallModal(appt)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#006194] hover:bg-[#007bb9] text-white text-[12px] font-bold shadow-xs transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">videocam</span>
                        <span>Join Room</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => showToast(`Check-in token generated for ${appt.doctorName}`, 'qr_code_2')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e0f0fe] text-[#006194] text-[12px] font-bold transition-all cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        <span>Pre-Checkin</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
        )}
      </div>

      {/* Booking Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">calendar_month</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">Schedule Consultation</h3>
                  <p className="text-[11px] text-[#707881]">Certified NutriAI Clinical Specialist Consultation</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleBookAppointment} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Select Attending Physician
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                >
                  {careTeam.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} — {doc.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                    Time Slot
                  </label>
                  <select
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] font-medium border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="01:15 PM">01:15 PM</option>
                    <option value="03:45 PM">03:45 PM</option>
                    <option value="05:00 PM">05:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Consultation Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisitType('In-Clinic')}
                    className={`h-10 rounded-xl text-[12px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      visitType === 'In-Clinic'
                        ? 'bg-[#eff4ff] text-[#006194] border-[#006194]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">domain</span>
                    <span>In-Clinic Facility</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitType('Telehealth Video')}
                    className={`h-10 rounded-xl text-[12px] font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      visitType === 'Telehealth Video'
                        ? 'bg-[#effcf6] text-[#006947] border-[#006947]'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">videocam</span>
                    <span>Telehealth Video</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Reason for Visit / Clinical Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Discuss recent lab results, routine heart health assessment..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11 bg-[#f1f5f9] text-[#3f4850] text-[13px] font-semibold rounded-xl hover:bg-[#e2e8f0] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold rounded-xl shadow-sm transition-all cursor-pointer"
                >
                  {isSubmitting ? 'Scheduling...' : 'Confirm Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Telehealth Call Preview Modal */}
      {activeCallModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-950 text-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Encrypted 256-bit WebRTC Session</span>
              </div>
              <button
                onClick={() => setActiveCallModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative mb-4 border border-slate-800 flex items-center justify-center">
              <img
                src={activeCallModal.doctorAvatar}
                alt={activeCallModal.doctorName}
                className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500 shadow-xl"
              />
              <div className="absolute bottom-3 left-3 bg-slate-900/80 px-2.5 py-1 rounded-lg text-[12px] font-semibold flex items-center gap-1.5">
                <span>{activeCallModal.doctorName}</span>
                <span className="material-symbols-outlined text-emerald-400 text-[14px]">verified</span>
              </div>
            </div>

            <div className="text-center mb-5">
              <h4 className="text-[16px] font-bold mb-1">Telehealth Bridge Ready</h4>
              <p className="text-[12px] text-slate-400">
                Dr. Jenkins has authenticated into the clinical video room for your scheduled consultation.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  showToast('Microphone toggled', 'mic');
                }}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[20px]">mic</span>
              </button>
              <button
                onClick={() => {
                  showToast('Camera video active', 'videocam');
                }}
                className="w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[20px]">videocam</span>
              </button>
              <button
                onClick={() => {
                  setActiveCallModal(null);
                  showToast('Disconnected from video room', 'call_end');
                }}
                className="w-14 h-14 rounded-full bg-rose-600 hover:bg-rose-700 flex items-center justify-center text-white shadow-lg"
              >
                <span className="material-symbols-outlined text-[24px]">call_end</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
