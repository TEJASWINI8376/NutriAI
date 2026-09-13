import React, { useState } from 'react';
import {
  Plus,
  HeartPulse,
  Activity,
  Wind,
  Droplet,
  Thermometer,
  Clock,
  TrendingDown,
  TrendingUp,
  Minus,
  X,
} from 'lucide-react';
import type { VitalRecord } from '../types.ts';
import { api } from '../api.ts';

interface VitalsModuleProps {
  vitals: VitalRecord[];
  onVitalAdded: (vital: VitalRecord) => void;
  showToast: (msg: string, icon?: string) => void;
}

export const VitalsModule: React.FC<VitalsModuleProps> = ({ vitals, onVitalAdded, showToast }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [vitalType, setVitalType] = useState<VitalRecord['type']>('heartRate');
  const [vitalValue, setVitalValue] = useState('');
  const [vitalStatus, setVitalStatus] = useState<VitalRecord['status']>('optimal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddVital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vitalValue.trim()) {
      showToast('Please enter a measurement value.', 'warning');
      return;
    }

    const typeConfig = {
      heartRate: { label: 'Heart Rate (Resting)', unit: 'bpm', defaultVal: 72 },
      bloodPressure: { label: 'Blood Pressure', unit: 'mmHg', defaultVal: 120 },
      oxygen: { label: 'Blood Oxygen (SpO2)', unit: '%', defaultVal: 98 },
      glucose: { label: 'Blood Glucose', unit: 'mg/dL', defaultVal: 95 },
      temperature: { label: 'Body Temperature', unit: '°F', defaultVal: 98.6 },
    }[vitalType];

    setIsSubmitting(true);
    try {
      const res = await api.logVital({
        type: vitalType,
        label: typeConfig.label,
        value: vitalValue,
        numericValue: parseFloat(vitalValue) || typeConfig.defaultVal,
        unit: typeConfig.unit,
        status: vitalStatus,
        trend: 'stable',
      });
      onVitalAdded(res.vital);
      showToast(`${typeConfig.label} recorded & verified in clinical database.`, 'favorite');
      setModalOpen(false);
      setVitalValue('');
    } catch (err: any) {
      showToast(err.message || 'Failed to log vital reading.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: VitalRecord['status']) => {
    switch (status) {
      case 'optimal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006947] bg-[#effcf6] px-2.5 py-0.5 rounded-full border border-[#c1f4db]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00855b]"></span>
            Optimal
          </span>
        );
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#006194] bg-[#eff4ff] px-2.5 py-0.5 rounded-full border border-[#d3e4fe]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#006194]"></span>
            Normal
          </span>
        );
      case 'elevated':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#b45309] bg-[#fef3c7] px-2.5 py-0.5 rounded-full border border-[#fde68a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></span>
            Review Required
          </span>
        );
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#991b1b] bg-[#fee2e2] px-2.5 py-0.5 rounded-full border border-[#fca5a5]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping"></span>
            Critical Attention
          </span>
        );
    }
  };

  const renderVitalIcon = (type: VitalRecord['type']) => {
    switch (type) {
      case 'heartRate':
        return <HeartPulse className="w-5 h-5 text-[#006194]" />;
      case 'bloodPressure':
        return <Activity className="w-5 h-5 text-[#006194]" />;
      case 'oxygen':
        return <Wind className="w-5 h-5 text-[#006194]" />;
      case 'glucose':
        return <Droplet className="w-5 h-5 text-[#006194]" />;
      case 'temperature':
        return <Thermometer className="w-5 h-5 text-[#006194]" />;
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header with Log Vital Action */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Vitals & Diagnostic Metrics
          </h2>
          <p className="text-[12px] text-[#707881]">
            Real-time biometric readings synchronized from certified telemetry devices
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log Reading</span>
        </button>
      </div>

      {/* Grid of Vitals Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {vitals.map((vital) => (
          <div
            key={vital.id}
            className="bg-white rounded-2xl p-4 border border-[#e5eeff] shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center">
                {renderVitalIcon(vital.type)}
              </div>
              {getStatusBadge(vital.status)}
            </div>

            <p className="text-[12px] font-medium text-[#707881] truncate mb-1">
              {vital.label}
            </p>

            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[26px] font-extrabold text-[#0b1c30] tracking-tight">
                {vital.value}
              </span>
              <span className="text-[12px] font-semibold text-[#707881]">
                {vital.unit}
              </span>
            </div>

            {/* Micro Sparkline or Trend Preview */}
            <div className="flex items-center justify-between text-[11px] text-[#707881] pt-2 border-t border-[#f1f5f9]">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#006a61]" />
                {vital.recordedAt}
              </span>
              <span className="inline-flex items-center gap-0.5 font-semibold text-[#006947]">
                {vital.trend === 'down' ? (
                  <TrendingDown className="w-3.5 h-3.5" />
                ) : vital.trend === 'up' ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <Minus className="w-3.5 h-3.5" />
                )}
                Synced
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Log Vital Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-[#eff4ff] text-[#006194] flex items-center justify-center">
                  <Activity className="w-5 h-5 text-[#006194]" />
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#0b1c30]">Record Clinical Metric</h3>
                  <p className="text-[11px] text-[#707881]">Sync reading to HIPAA electronic medical chart</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVital} className="flex flex-col gap-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1.5">
                  Metric Category
                </label>
                <select
                  value={vitalType}
                  onChange={(e) => setVitalType(e.target.value as any)}
                  className="w-full h-11 px-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] font-medium border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                >
                  <option value="heartRate">Heart Rate (bpm)</option>
                  <option value="bloodPressure">Blood Pressure (mmHg, e.g. 118/76)</option>
                  <option value="oxygen">Oxygen Saturation SpO2 (%)</option>
                  <option value="glucose">Blood Glucose (mg/dL)</option>
                  <option value="temperature">Body Temperature (°F)</option>
                </select>
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1.5">
                  Measurement Value
                </label>
                <input
                  type="text"
                  value={vitalValue}
                  onChange={(e) => setVitalValue(e.target.value)}
                  placeholder={
                    vitalType === 'bloodPressure'
                      ? 'e.g. 120/80'
                      : vitalType === 'heartRate'
                      ? 'e.g. 72'
                      : vitalType === 'oxygen'
                      ? 'e.g. 99'
                      : 'e.g. 94'
                  }
                  required
                  className="w-full h-11 px-3.5 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[14px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-semibold text-[#3f4850] mb-1.5">
                  Diagnostic Classification
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['optimal', 'normal', 'elevated'] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setVitalStatus(s)}
                      className={`h-10 rounded-xl text-[12px] font-semibold capitalize border transition-all cursor-pointer ${
                        vitalStatus === s
                          ? s === 'optimal'
                            ? 'bg-[#effcf6] text-[#006947] border-[#006947] shadow-xs'
                            : s === 'normal'
                            ? 'bg-[#eff4ff] text-[#006194] border-[#006194] shadow-xs'
                            : 'bg-[#fef3c7] text-[#b45309] border-[#b45309] shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
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
                  className="flex-1 h-11 bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmitting ? 'Saving...' : 'Save & Certify'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
