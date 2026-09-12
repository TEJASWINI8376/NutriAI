import React from "react";
import { Prescription } from "../types";
import { Pill, Clock, AlertCircle, RefreshCw, UserCheck } from "lucide-react";

interface PrescriptionsScreenProps {
  prescriptions: Prescription[];
  onAddPrescription?: () => void;
}

export const PrescriptionsScreen: React.FC<PrescriptionsScreenProps> = ({
  prescriptions,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Title section */}
      <div>
        <h1 className="text-2xl font-bold text-[#0b1c30] font-['Plus_Jakarta_Sans'] tracking-tight">
          Medication Regimen
        </h1>
        <p className="text-sm text-[#64748b] mt-0.5">
          Active pharmaceutical protocols and refill management
        </p>
      </div>

      {/* Medication Timeline (as per style guide specifications) */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e5eeff] shadow-[0_2px_8px_-2px_rgba(15,23,42,0.04)]">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
            Daily Administration Timeline
          </h2>
          <span className="text-xs font-semibold text-[#006194] bg-[#eff4ff] px-2.5 py-1 rounded-lg">
            {prescriptions.length} Active Prescriptions
          </span>
        </div>

        {/* Vertical Timeline container */}
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e2e8f0]">
          {prescriptions.map((rx) => (
            <div key={rx.id} className="relative group">
              {/* Primary Cerulean Bullet */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-white border-2 border-[#006194] flex items-center justify-center shadow-xs">
                <div className="w-2 h-2 rounded-full bg-[#006194]" />
              </div>

              {/* Card content */}
              <div className="bg-[#f8faff] rounded-2xl p-4 border border-[#e2e8f0] hover:border-[#006194]/30 transition-all">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#0b1c30]">
                      {rx.medication}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#006194] bg-[#eff4ff] px-2.5 py-0.5 rounded-md mt-1">
                      <Pill className="w-3 h-3" />
                      <span>{rx.dosage}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-[#047857] bg-[#ecfdf5] px-2 py-0.5 rounded-full">
                      {rx.refillsRemaining} Refills Available
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-[#475569]">
                  <Clock className="w-3.5 h-3.5 text-[#64748b]" />
                  <span>{rx.frequency}</span>
                </div>

                <p className="mt-2 text-xs text-[#64748b] bg-white p-2.5 rounded-xl border border-[#e2e8f0]/80">
                  {rx.instructions}
                </p>

                <div className="mt-3 pt-2 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#64748b]">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-[#006194]" />
                    {rx.prescribedBy}
                  </span>
                  <span>Until {rx.endDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
