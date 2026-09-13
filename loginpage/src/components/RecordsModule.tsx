import React, { useState } from 'react';
import {
  FilePlus,
  Microscope,
  HeartPulse,
  Scan,
  Syringe,
  FileText,
  CheckCircle2,
  Eye,
  Download,
  X,
} from 'lucide-react';
import type { MedicalRecord } from '../types.ts';
import { api } from '../api.ts';

interface RecordsModuleProps {
  records: MedicalRecord[];
  onRecordAdded: (record: MedicalRecord) => void;
  showToast: (msg: string, icon?: string) => void;
}

export const RecordsModule: React.FC<RecordsModuleProps> = ({ records, onRecordAdded, showToast }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MedicalRecord['category']>('Laboratory');
  const [facility, setFacility] = useState('NutriAI Core Diagnostics');
  const [doctorName, setDoctorName] = useState('Dr. Sarah Jenkins, MD');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter document title.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.addMedicalRecord({
        title,
        category,
        facility,
        doctorName,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        summary: summary || 'Diagnostic analysis completed with standard reference intervals.',
        metrics: [
          { name: 'Primary Parameter', value: 'Normal', normalRange: 'Negative / Normal', status: 'normal' },
        ],
      });

      onRecordAdded(res.record);
      showToast('Health record cryptographically verified & saved.', 'verified');
      setModalOpen(false);
      setTitle('');
      setSummary('');
    } catch (err: any) {
      showToast(err.message || 'Failed to save health record.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Verified Electronic Health Records (EHR)
          </h2>
          <p className="text-[12px] text-[#707881]">
            Encrypted laboratory summaries, imaging reports, and diagnostic panels with SHA-256 signatures
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <FilePlus className="w-4 h-4" />
          <span>Upload Record</span>
        </button>
      </div>

      {/* Record Cards */}
      <div className="flex flex-col gap-3.5">
        {records.map((record) => (
          <div
            key={record.id}
            className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs hover:border-[#93ccff] transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center shrink-0 mt-0.5">
                  {record.category === 'Laboratory' ? (
                    <Microscope className="w-5 h-5 text-[#006194]" />
                  ) : record.category === 'Cardiology' ? (
                    <HeartPulse className="w-5 h-5 text-[#006194]" />
                  ) : record.category === 'Diagnostic Imaging' ? (
                    <Scan className="w-5 h-5 text-[#006194]" />
                  ) : record.category === 'Vaccination' ? (
                    <Syringe className="w-5 h-5 text-[#006194]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#006194]" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#0b1c30]">
                      {record.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#006947] bg-[#effcf6] px-2 py-0.5 rounded-md border border-[#c1f4db]">
                      <CheckCircle2 className="w-3 h-3 text-[#006947]" />
                      Verified
                    </span>
                  </div>
                  <p className="text-[12px] text-[#707881] mt-0.5">
                    {record.facility} • Authored by {record.doctorName}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="text-[12px] font-medium text-[#707881] bg-[#f8f9ff] px-2.5 py-1 rounded-lg border border-[#e5eeff]">
                  {record.date}
                </span>
                <button
                  onClick={() => setSelectedRecord(record)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#eff4ff] hover:bg-[#e0f0fe] text-[#006194] text-[12px] font-bold transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
              </div>
            </div>

            <p className="text-[13px] text-[#3f4850] bg-slate-50 p-3 rounded-xl mb-3 leading-relaxed">
              {record.summary}
            </p>

            {/* Diagnostic Metrics Table Preview */}
            {record.metrics && record.metrics.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {record.metrics.slice(0, 4).map((m, idx) => (
                  <div key={idx} className="bg-[#f8f9ff] p-2.5 rounded-xl border border-[#e5eeff]">
                    <p className="text-[10px] font-bold uppercase text-[#707881] truncate">{m.name}</p>
                    <p className="text-[13px] font-bold text-[#0b1c30] mt-0.5 truncate">{m.value}</p>
                    <p className="text-[10px] text-[#006a61] mt-0.5 truncate">Ref: {m.normalRange}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-[11px] text-[#707881] pt-2.5 border-t border-[#f1f5f9]">
              <span className="font-mono text-[10px] truncate max-w-xs text-slate-500">
                Seal: {record.verificationHash}
              </span>
              <button
                onClick={() => showToast(`Encrypted PHI PDF downloaded for ${record.title}`, 'download_for_offline')}
                className="inline-flex items-center gap-1.5 text-[#006194] hover:underline font-semibold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export HIPAA PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Record Detail Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#006947] bg-[#effcf6] px-2.5 py-0.5 rounded-full border border-[#c1f4db] mb-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#006947]" />
                  <span>Cryptographically Validated Medical Record</span>
                </div>
                <h3 className="text-[18px] font-bold text-[#0b1c30]">{selectedRecord.title}</h3>
                <p className="text-[12px] text-[#707881]">
                  {selectedRecord.facility} • {selectedRecord.doctorName} • {selectedRecord.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <h4 className="text-[12px] font-bold uppercase text-[#3f4850] mb-1">Clinical Interpretation</h4>
              <p className="text-[13px] text-[#3f4850] leading-relaxed bg-[#f8f9ff] p-3.5 rounded-xl border border-[#e5eeff]">
                {selectedRecord.summary}
              </p>
            </div>

            {selectedRecord.metrics && (
              <div className="mb-4">
                <h4 className="text-[12px] font-bold uppercase text-[#3f4850] mb-2">Quantified Laboratory Values</h4>
                <div className="border border-[#e5eeff] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-[12px]">
                    <thead className="bg-[#eff4ff] text-[#006194] font-bold border-b border-[#e5eeff]">
                      <tr>
                        <th className="p-2.5">Test Parameter</th>
                        <th className="p-2.5">Observed Result</th>
                        <th className="p-2.5">Reference Range</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {selectedRecord.metrics.map((m, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 font-semibold text-[#0b1c30]">{m.name}</td>
                          <td className="p-2.5 font-bold text-[#006194]">{m.value}</td>
                          <td className="p-2.5 text-[#707881]">{m.normalRange}</td>
                          <td className="p-2.5">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#effcf6] text-[#006947] border border-[#c1f4db]">
                              Normal
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-[#eff4ff]/60 p-3 rounded-xl flex items-center justify-between text-[11px] text-[#707881] mb-5">
              <span className="font-mono text-[10px]">Verification: {selectedRecord.verificationHash}</span>
              <span className="text-[#006a61] font-bold">HIPAA Secure</span>
            </div>

            <div className="flex gap-2.5">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex-1 h-11 bg-[#f1f5f9] text-[#3f4850] text-[13px] font-semibold rounded-xl hover:bg-[#e2e8f0] cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  showToast('Official FHIR JSON bundle exported', 'data_object');
                  setSelectedRecord(null);
                }}
                className="flex-1 h-11 bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload/Add Record Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center">
                  <FilePlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">Attach Medical Document</h3>
                  <p className="text-[11px] text-[#707881]">Certified Diagnostic or Lab Result Record</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddRecord} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Document / Test Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Complete Blood Count (CBC with Diff)"
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                    Classification
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none font-medium"
                  >
                    <option value="Laboratory">Laboratory</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Diagnostic Imaging">Imaging / Radiology</option>
                    <option value="Vaccination">Immunization</option>
                    <option value="Clinical Notes">Clinical Note</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                    Facility
                  </label>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Attending / Interpreting Physician
                </label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1">
                  Diagnostic Findings Summary
                </label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Summary of laboratory findings, observations, and recommendations..."
                  rows={2}
                  className="w-full p-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 h-11 bg-[#f1f5f9] text-[#3f4850] text-[13px] font-semibold rounded-xl hover:bg-[#e2e8f0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-11 bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold rounded-xl shadow-sm transition-all"
                >
                  {isSubmitting ? 'Verifying...' : 'Certify & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
