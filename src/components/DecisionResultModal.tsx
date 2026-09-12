import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Pill,
  Clock,
  BookOpen,
  Activity,
  CheckCircle,
} from 'lucide-react';
import { DecisionResult } from '../types';

interface DecisionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DecisionResult | null;
  patientConditions: string[];
  patientMedicines: string[];
}

export const DecisionResultModal: React.FC<DecisionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  patientConditions,
  patientMedicines,
}) => {
  const [showTimeline, setShowTimeline] = useState(true);
  const [showEvidence, setShowEvidence] = useState(true);

  if (!isOpen || !result) return null;

  const isSuitable = result.decision === 'GENERALLY_SUITABLE';
  const isCaution = result.decision === 'CONSUME_WITH_CAUTION';
  const isConcern = result.decision === 'HIGHER_CONCERN';

  const badgeTheme = isSuitable
    ? {
        bg: 'bg-[#88f8c4]/20 text-[#006948] border-[#006948]/30',
        icon: <CheckCircle2 className="w-6 h-6 text-[#006948]" />,
        containerBg: 'bg-[#e8f5e9]/40',
        titleColor: 'text-[#006948]',
      }
    : isCaution
    ? {
        bg: 'bg-[#ffdea3]/40 text-[#7c5800] border-[#7c5800]/30',
        icon: <AlertTriangle className="w-6 h-6 text-[#7c5800]" />,
        containerBg: 'bg-[#fff8e1]/50',
        titleColor: 'text-[#7c5800]',
      }
    : {
        bg: 'bg-[#ffdad6]/50 text-[#ba1a1a] border-[#ba1a1a]/30',
        icon: <AlertOctagon className="w-6 h-6 text-[#ba1a1a]" />,
        containerBg: 'bg-[#ffebee]/50',
        titleColor: 'text-[#ba1a1a]',
      };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-[#eaedff] flex flex-col max-h-[88vh] my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#eaedff] flex items-center justify-between bg-[#faf8ff] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-[#006948]/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[#006948]" />
            </div>
            <div>
              <h3 className="font-bold text-[17px] text-[#131b2e] leading-tight">
                Agent Dietary Assessment
              </h3>
              <p className="text-[12px] text-[#3d4a42]">
                Autonomous clinical rule engine & evidence verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f2f3ff] text-[#3d4a42] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 min-h-0 overflow-y-auto overscroll-contain flex flex-col gap-4 modal-scroll">
          {/* Decision Hero Banner */}
          <div
            className={`p-4 rounded-2xl border ${badgeTheme.containerBg} border-[#eaedff] flex items-start gap-3.5`}
          >
            <div className="shrink-0 mt-0.5">{badgeTheme.icon}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide border uppercase ${badgeTheme.bg}`}
                >
                  {result.decision.replace(/_/g, ' ')}
                </span>
                <span className="text-[12px] text-[#3d4a42] font-medium">
                  {result.food}
                </span>
              </div>
              <p className={`font-bold text-[16px] leading-snug ${badgeTheme.titleColor}`}>
                {result.decisionText}
              </p>

              {/* Patient context chips */}
              <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-[#3d4a42] font-semibold">Evaluated for:</span>
                {patientConditions.map((c) => (
                  <span
                    key={c}
                    className="px-2 py-0.5 rounded-md bg-white/80 border border-[#eaedff] text-[11px] font-medium text-[#131b2e]"
                  >
                    {c}
                  </span>
                ))}
                {patientMedicines.map((m) => (
                  <span
                    key={m}
                    className="px-2 py-0.5 rounded-md bg-[#006948]/10 text-[#006948] border border-[#006948]/20 text-[11px] font-medium flex items-center gap-1"
                  >
                    <Pill className="w-3 h-3" />
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Reasons / Concerns */}
          {result.reasons && result.reasons.length > 0 && (
            <div className="bg-[#faf8ff] rounded-xl p-4 border border-[#eaedff]">
              <h4 className="font-bold text-[13px] text-[#131b2e] mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#006948]" />
                Clinical Decision Factors
              </h4>
              <ul className="flex flex-col gap-2">
                {result.reasons.map((r, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#3d4a42] flex items-start gap-2 leading-relaxed"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a] shrink-0 mt-2" />
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Medicine Notes (if any) */}
          {result.medicineNotes && result.medicineNotes.length > 0 && (
            <div className="bg-[#fff8e1] rounded-xl p-4 border border-[#ffdea3]">
              <h4 className="font-bold text-[13px] text-[#7c5800] mb-2 flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#7c5800]" />
                Medicine & Food Interaction Warning
              </h4>
              <ul className="flex flex-col gap-2">
                {result.medicineNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="text-[12px] text-[#7c5800] flex items-start gap-2 leading-relaxed font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7c5800] shrink-0 mt-1.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Verification Notes */}
          {result.verificationNotes && result.verificationNotes.length > 0 && (
            <div className="bg-[#f2f3ff] rounded-xl p-4 border border-[#eaedff]">
              <h4 className="font-bold text-[13px] text-[#131b2e] mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#006948]" />
                Information Verification & Resolution
              </h4>
              <ul className="flex flex-col gap-1.5">
                {result.verificationNotes.map((note, idx) => (
                  <li
                    key={idx}
                    className="text-[12px] text-[#3d4a42] flex items-start gap-2 leading-relaxed"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-[#006948] shrink-0 mt-0.5" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Agent Activity Timeline (Collapsible) */}
          <div className="border border-[#eaedff] rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowTimeline(!showTimeline)}
              className="w-full px-4 py-3 bg-[#faf8ff] flex items-center justify-between hover:bg-[#f2f3ff] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#006948]" />
                <span className="font-bold text-[13px] text-[#131b2e]">
                  Agent Execution Timeline ({result.agentTimeline?.length || 5} steps)
                </span>
              </div>
              {showTimeline ? (
                <ChevronUp className="w-4 h-4 text-[#3d4a42]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[#3d4a42]" />
              )}
            </button>
            {showTimeline && (
              <div className="p-4 bg-white flex flex-col gap-3">
                {result.agentTimeline?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-[12px]">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full bg-[#006948] text-white flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </div>
                      {idx < result.agentTimeline.length - 1 && (
                        <div className="w-0.5 h-6 bg-[#eaedff] mt-1" />
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#131b2e]">{step.step}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#006948] font-semibold uppercase">
                          {step.status}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-col gap-1 text-[#3d4a42]">
                        {step.details.map((d, di) => (
                          <p key={di} className="leading-snug">
                            • {d}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Evidence Base & Guidelines (Collapsible) */}
          {result.evidence && result.evidence.length > 0 && (
            <div className="border border-[#eaedff] rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full px-4 py-3 bg-[#faf8ff] flex items-center justify-between hover:bg-[#f2f3ff] transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#006948]" />
                  <span className="font-bold text-[13px] text-[#131b2e]">
                    Clinical Evidence Citations ({result.evidence.length})
                  </span>
                </div>
                {showEvidence ? (
                  <ChevronUp className="w-4 h-4 text-[#3d4a42]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-[#3d4a42]" />
                )}
              </button>
              {showEvidence && (
                <div className="p-4 bg-white flex flex-col gap-2.5">
                  {result.evidence.map((ev, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-[#eaedff] bg-[#faf8ff] flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[12px] text-[#131b2e]">
                          {ev.title}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#e2e7ff] text-[#131b2e] font-semibold">
                          {ev.source}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#3d4a42] leading-relaxed">
                        {ev.description}
                      </p>
                      {ev.url && (
                        <a
                          href={ev.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-[#006948] font-semibold hover:underline flex items-center gap-1 mt-0.5 w-fit"
                        >
                          View Guideline <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Clinical Disclaimer */}
          <div className="p-3 bg-[#f2f3ff] rounded-xl text-[11px] text-[#3d4a42] leading-relaxed border border-[#eaedff]">
            <strong>Clinical Disclaimer:</strong> {result.disclaimer}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#eaedff] bg-[#faf8ff] flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#006948] text-white text-[13px] font-semibold hover:bg-[#005137] shadow-sm transition-all cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
