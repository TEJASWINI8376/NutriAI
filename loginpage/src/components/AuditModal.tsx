import React from 'react';

interface AuditLog {
  id: string;
  action: string;
  timestamp: string;
}

interface AuditModalProps {
  logs: AuditLog[];
  onClose: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({ logs, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#effcf6] text-[#006947] flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">shield</span>
            </div>
            <div>
              <h3 className="text-[16px] font-bold text-[#0b1c30]">HIPAA Compliance Audit Trail</h3>
              <p className="text-[11px] text-[#707881]">Immutable cryptographic activity ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="my-4 p-3 rounded-xl bg-[#eff4ff] text-[#006194] text-[12px] flex items-center justify-between">
          <span className="font-semibold">Encryption Tier: 256-bit AES-GCM</span>
          <span className="font-mono text-[11px]">ISO 27001 Certified</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start justify-between text-[12px]"
            >
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#006a61] text-[16px] mt-0.5">
                  verified
                </span>
                <div>
                  <p className="font-semibold text-[#0b1c30]">{log.action}</p>
                  <p className="text-[10px] text-[#707881] font-mono mt-0.5">Record ID: {log.id.slice(0, 16)}...</p>
                </div>
              </div>
              <span className="text-[11px] text-[#707881] shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={onClose}
            className="w-full h-11 bg-[#006194] text-white text-[13px] font-bold rounded-xl hover:bg-[#007bb9]"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};
