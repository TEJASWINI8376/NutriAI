import React, { useState } from 'react';
import type { CareTeamMember } from '../types.ts';

interface CareTeamModuleProps {
  careTeam: CareTeamMember[];
  showToast: (msg: string, icon?: string) => void;
}

export const CareTeamModule: React.FC<CareTeamModuleProps> = ({ careTeam, showToast }) => {
  const [activeMessageDoc, setActiveMessageDoc] = useState<CareTeamMember | null>(null);
  const [messageText, setMessageText] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    showToast(`Encrypted message delivered to ${activeMessageDoc?.name}'s triage portal.`, 'mark_chat_read');
    setActiveMessageDoc(null);
    setMessageText('');
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[18px] font-bold text-[#0b1c30] tracking-tight">
            Assigned Clinical Care Team
          </h2>
          <p className="text-[12px] text-[#707881]">
            Board-certified clinicians coordinating your personalized cardiovascular and internal medical treatment plan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {careTeam.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl p-5 border border-[#e5eeff] shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start gap-3.5 mb-3">
                <div className="relative w-14 h-14 rounded-full overflow-hidden bg-[#d3e4fe] shrink-0 border-2 border-slate-100">
                  <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                  {member.isOnline && (
                    <span
                      title="Clinician On Duty"
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#00855b] border-2 border-white"
                    ></span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[14px] font-bold text-[#0b1c30] truncate">
                      {member.name}
                    </h3>
                    <span className="material-symbols-outlined text-[#006a61] text-[16px]">
                      check_circle
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-[#006194] truncate">
                    {member.department}
                  </p>
                  <p className="text-[11px] text-[#707881] truncate">
                    {member.title}
                  </p>
                </div>
              </div>

              {member.quote && (
                <div className="bg-[#f8f9ff] p-3 rounded-xl border border-[#e5eeff] text-[12px] text-[#3f4850] italic mb-3">
                  "{member.quote}"
                </div>
              )}

              <p className="text-[11px] text-[#707881] flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">local_hospital</span>
                <span>{member.hospital}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-[#f1f5f9] mt-3">
              <button
                onClick={() => setActiveMessageDoc(member)}
                className="flex-1 h-10 bg-[#eff4ff] hover:bg-[#e0f0fe] text-[#006194] text-[12px] font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">chat</span>
                <span>Direct Message</span>
              </button>
              <button
                onClick={() => showToast(`Consultation requested with ${member.name}`, 'event_repeat')}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center justify-center cursor-pointer"
                title="Request Urgent Call"
              >
                <span className="material-symbols-outlined text-[18px]">phone</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Direct Messaging Modal */}
      {activeMessageDoc && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img
                  src={activeMessageDoc.avatar}
                  alt={activeMessageDoc.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200"
                />
                <div>
                  <h4 className="text-[14px] font-bold text-[#0b1c30]">{activeMessageDoc.name}</h4>
                  <p className="text-[11px] text-[#006a61] font-semibold">HIPAA Encrypted Patient Messaging</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMessageDoc(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex flex-col gap-3">
              <p className="text-[12px] text-[#707881]">
                Messages are reviewed by the clinical nursing staff during standard office hours. For acute emergencies, call 911 immediately.
              </p>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your clinical question, medication query, or symptoms here..."
                rows={4}
                required
                className="w-full p-3 rounded-xl bg-[#eff4ff] text-[#0b1c30] text-[13px] border border-transparent focus:border-[#006194] focus:bg-white focus:outline-none resize-none"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMessageDoc(null)}
                  className="flex-1 h-11 bg-[#f1f5f9] text-[#3f4850] text-[13px] font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-11 bg-[#006194] hover:bg-[#007bb9] text-white text-[13px] font-bold rounded-xl shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  <span>Send Secure Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
