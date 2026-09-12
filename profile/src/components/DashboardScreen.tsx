import React from 'react';
import {
  Activity,
  Flame,
  Heart,
  Droplets,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  Utensils,
  Pill,
} from 'lucide-react';
import { PatientProfile, VitalMetric, LoggedMeal, MedicationItem } from '../types';

interface DashboardScreenProps {
  patient: PatientProfile;
  vitals: VitalMetric[];
  loggedMeals: LoggedMeal[];
  medications: MedicationItem[];
  onNavigate: (screen: any) => void;
  onOpenQuickScan: () => void;
  onToggleMedication: (id: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  patient,
  vitals,
  loggedMeals,
  medications,
  onNavigate,
  onOpenQuickScan,
  onToggleMedication,
}) => {
  // Aggregate nutrition today
  const totalCalories = loggedMeals.reduce((sum, m) => sum + m.calories, 0);
  const totalProtein = loggedMeals.reduce((sum, m) => sum + m.macros.protein, 0);
  const totalCarbs = loggedMeals.reduce((sum, m) => sum + m.macros.carbs, 0);
  const totalFat = loggedMeals.reduce((sum, m) => sum + m.macros.fat, 0);
  const totalFiber = loggedMeals.reduce((sum, m) => sum + m.macros.fiber, 0);
  const totalSodium = loggedMeals.reduce((sum, m) => sum + m.macros.sodium, 0);
  const totalPotassium = loggedMeals.reduce((sum, m) => sum + m.macros.potassium, 0);

  const caloriePercent = Math.min(100, Math.round((totalCalories / patient.calorieTarget) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / patient.macroTargets.proteinG) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / patient.macroTargets.carbsG) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / patient.macroTargets.fatG) * 100));

  const nextMedication = medications.find((m) => !m.taken) || medications[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Clinical Status Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0B1C30] flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0 border border-[#1E324D]">
            TM
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0B1C30] tracking-tight">
                Welcome, {patient.name}
              </h1>
              <span className="inline-flex items-center gap-1 bg-[#ECFDF5] text-[#047857] text-xs font-semibold px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                Clinical Profile Verified
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#64748B] mt-1">
              Primary Focus: <span className="text-[#0B1C30] font-medium">{patient.primaryCondition}</span> • Target: <span className="text-[#0284C7] font-semibold">{patient.calorieTarget} kcal/day</span>
            </p>
          </div>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            id="dash-scan-meal-btn"
            onClick={onOpenQuickScan}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white text-sm font-semibold shadow-xs transition-all hover:shadow-md"
          >
            <Sparkles className="w-4 h-4 text-[#86F2E4]" />
            <span>AI Food Scan</span>
          </button>
          <button
            id="dash-dietitian-btn"
            onClick={() => onNavigate('advisor')}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0B1C30] text-sm font-semibold border border-[#E2E8F0] transition-all"
          >
            <span>Ask Dietitian</span>
          </button>
        </div>
      </div>

      {/* Healthcare-Specific Extension 1: Vitals Metric Tiles (Two-Column / Multi-Column Grid) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#0B1C30] flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#0284C7]" />
            Metabolic & Clinical Vitals
          </h2>
          <span className="text-xs text-[#64748B] font-medium">Auto-synced from CGM & Labs</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {vitals.map((vital) => {
            const isUp = vital.trend === 'up';
            const isDown = vital.trend === 'down';
            return (
              <div
                key={vital.id}
                id={`card-${vital.id}`}
                className="bg-white rounded-xl p-4 sm:p-5 border border-[#E2E8F0] shadow-xs hover:border-[#CBD5E1] transition-all relative overflow-hidden group"
              >
                {/* Subtle top indicator bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0284C7] to-[#0D9488] opacity-60"></div>

                <div className="flex items-start justify-between">
                  <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                    {vital.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full">
                    {vital.status === 'optimal' ? 'Optimal' : 'Normal'}
                  </span>
                </div>

                <div className="mt-2.5 flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-[#0B1C30] tracking-tight">
                    {vital.id === 'vital-cal' ? `${totalCalories} / ${patient.calorieTarget}` : vital.value}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#64748B]">{vital.unit}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
                  <span className="text-[#64748B]">
                    Baseline: <span className="text-[#0B1C30] font-medium">{vital.baseline}</span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 font-semibold ${
                      vital.id === 'vital-bp' && isDown
                        ? 'text-[#047857]'
                        : isUp
                        ? 'text-[#047857]'
                        : 'text-[#0284C7]'
                    }`}
                  >
                    {isUp && <ArrowUpRight className="w-3.5 h-3.5" />}
                    {isDown && <ArrowDownRight className="w-3.5 h-3.5" />}
                    {vital.trendLabel}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Column Layout: Daily Clinical Nutrition Breakdown & Medication Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Macronutrients & Metabolic Energy */}
        <div className="lg:col-span-7 space-y-6">
          {/* Macronutrient Distribution Card */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#F59E0B]" />
                  Today's Macronutrient & Caloric Target
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  DASH Protocol targets for stable insulin & cardioprotection
                </p>
              </div>
              <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-full">
                {caloriePercent}% Consumed
              </span>
            </div>

            {/* Calorie Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs font-semibold text-[#0B1C30] mb-1.5">
                <span>Total Energy: {totalCalories} kcal</span>
                <span className="text-[#64748B]">Goal: {patient.calorieTarget} kcal ({patient.calorieTarget - totalCalories > 0 ? `${patient.calorieTarget - totalCalories} kcal remaining` : 'Target reached'})</span>
              </div>
              <div className="w-full h-3 bg-[#F1F5F9] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-gradient-to-r from-[#0284C7] to-[#0D9488] transition-all duration-500 rounded-full"
                  style={{ width: `${caloriePercent}%` }}
                ></div>
              </div>
            </div>

            {/* Individual Macro Meters */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {/* Protein */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#0B1C30]">Protein</span>
                  <span className="text-[#0D9488] font-bold">{totalProtein}g / {patient.macroTargets.proteinG}g</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0D9488] rounded-full transition-all"
                    style={{ width: `${proteinPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#64748B] mt-1.5 block">
                  {proteinPercent}% (Target: 125g for muscle)
                </span>
              </div>

              {/* Carbohydrates */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#0B1C30]">Complex Carbs</span>
                  <span className="text-[#0284C7] font-bold">{totalCarbs}g / {patient.macroTargets.carbsG}g</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0284C7] rounded-full transition-all"
                    style={{ width: `${carbsPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#64748B] mt-1.5 block">
                  Low-GI ({totalFiber}g fiber logged)
                </span>
              </div>

              {/* Healthy Fats */}
              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#0B1C30]">Lipids / Fats</span>
                  <span className="text-[#F59E0B] font-bold">{totalFat}g / {patient.macroTargets.fatG}g</span>
                </div>
                <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F59E0B] rounded-full transition-all"
                    style={{ width: `${fatPercent}%` }}
                  ></div>
                </div>
                <span className="text-[10px] text-[#64748B] mt-1.5 block">
                  EVOO & Marine Omega-3
                </span>
              </div>
            </div>

            {/* Micronutrient Balance (Sodium vs Potassium Clinical Check) */}
            <div className="mt-4 p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#047857]">
                    Cardioprotective Mineral Ratio: Optimal (1.92 K+/Na+)
                  </span>
                  <p className="text-[11px] text-[#065F46]">
                    Logged Sodium: {totalSodium}mg (Target &lt;1,800mg) • Potassium: {totalPotassium}mg (Target &gt;3,400mg)
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-[#047857] bg-white px-2 py-0.5 rounded-full border border-[#A7F3D0] self-start sm:self-center">
                DASH Compliant
              </span>
            </div>
          </div>

          {/* Today's Logged Meals */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-[#0284C7]" />
                  Today's Nutritional Log ({loggedMeals.length} Meals)
                </h3>
                <p className="text-xs text-[#64748B]">Real-time AI biometric analysis</p>
              </div>
              <button
                id="dash-add-meal-link"
                onClick={onOpenQuickScan}
                className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Meal
              </button>
            </div>

            <div className="space-y-3">
              {loggedMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#CBD5E1] bg-[#F8FAFC] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    {meal.imageUrl ? (
                      <img
                        src={meal.imageUrl}
                        alt={meal.mealName}
                        referrerPolicy="no-referrer"
                        className="w-12 h-12 rounded-lg object-cover border border-[#E2E8F0] shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center font-bold text-xs shrink-0">
                        {meal.mealType[0]}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0284C7] uppercase tracking-wider bg-white px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                          {meal.mealType}
                        </span>
                        <span className="text-xs text-[#64748B]">{meal.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0B1C30] mt-0.5 line-clamp-1">
                        {meal.mealName}
                      </h4>
                      <p className="text-[11px] text-[#64748B]">
                        {meal.calories} kcal • {meal.macros.protein}g Protein • {meal.macros.carbs}g Carbs • {meal.macros.fat}g Fat
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <span className="text-[11px] font-semibold text-[#047857] bg-[#ECFDF5] px-2 py-0.5 rounded-full border border-[#A7F3D0]">
                      {meal.glycemicIndex}
                    </span>
                    <button
                      onClick={() => onNavigate('scanner')}
                      className="p-1.5 rounded-lg hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#0B1C30]"
                      title="View Clinical Details"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Medication Schedule & AI Clinical Guidance */}
        <div className="lg:col-span-5 space-y-6">
          {/* Medication Adherence & Next Dose */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-[#F1F5F9]">
              <div>
                <h3 className="text-base font-bold text-[#0B1C30] flex items-center gap-2">
                  <Pill className="w-4 h-4 text-[#0284C7]" />
                  Prescription & Supplement Tracker
                </h3>
                <p className="text-xs text-[#64748B]">Synchronized with daily meal times</p>
              </div>
              <button
                id="dash-view-meds-btn"
                onClick={() => onNavigate('medications')}
                className="text-xs font-semibold text-[#0284C7] hover:underline"
              >
                View Timeline
              </button>
            </div>

            {/* Next Scheduled Pill Alert */}
            <div className="mt-4 p-4 rounded-xl bg-[#EFF4FF] border border-[#BFC7D2] relative overflow-hidden">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#006194] bg-white px-2 py-0.5 rounded-full">
                    {nextMedication.period} • {nextMedication.scheduledTime}
                  </span>
                  <h4 className="text-sm font-bold text-[#0B1C30] mt-1.5">
                    {nextMedication.name} ({nextMedication.dosage})
                  </h4>
                  <p className="text-xs text-[#3F4850] mt-1">
                    {nextMedication.instructions}
                  </p>
                </div>
                <button
                  id={`med-toggle-${nextMedication.id}`}
                  onClick={() => onToggleMedication(nextMedication.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    nextMedication.taken
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#0284C7] text-white hover:bg-[#0369A1]'
                  }`}
                >
                  {nextMedication.taken ? 'Taken' : 'Mark Taken'}
                </button>
              </div>

              {nextMedication.foodInteractionWarning && (
                <div className="mt-3 pt-2.5 border-t border-[#CBD5E1] flex items-start gap-1.5 text-xs text-[#B45309]">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-tight">
                    {nextMedication.foodInteractionWarning.message}
                  </span>
                </div>
              )}
            </div>

            {/* Remaining Meds List */}
            <div className="mt-4 space-y-2.5">
              {medications.map((med) => (
                <div
                  key={med.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F8FAFC] border border-transparent hover:border-[#E2E8F0] transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => onToggleMedication(med.id)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        med.taken
                          ? 'bg-[#10B981] border-[#10B981] text-white'
                          : 'border-[#CBD5E1] hover:border-[#0284C7]'
                      }`}
                    >
                      {med.taken && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </button>
                    <div>
                      <span className={`text-xs font-semibold ${med.taken ? 'line-through text-[#94A3B8]' : 'text-[#0B1C30]'}`}>
                        {med.name}
                      </span>
                      <span className="text-[11px] text-[#64748B] block">
                        {med.dosage} • {med.scheduledTime}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-full font-medium">
                    {med.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Clinical Advisor Callout Banner */}
          <div className="bg-gradient-to-br from-[#0B1C30] to-[#1E324D] rounded-2xl p-5 sm:p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0284C7] opacity-20 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="flex items-center gap-2 text-xs font-semibold text-[#86F2E4] mb-2">
              <Sparkles className="w-4 h-4 text-[#10B981]" />
              NutriAI Daily Clinical Summary
            </div>

            <h4 className="text-base font-bold tracking-tight text-white mb-2">
              Glycemic Curve is Stable Post-Lunch
            </h4>
            
            <p className="text-xs text-[#EAF1FF]/80 leading-relaxed mb-4">
              Your lunch of Wild Salmon and Quinoa generated a steady glycemic response (GI 32). Remember that Lisinopril has a mild potassium-sparing effect; continue spacing supplementary electrolytes and stay hydrated.
            </p>

            <button
              id="dash-consult-ai-btn"
              onClick={() => onNavigate('advisor')}
              className="inline-flex items-center gap-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all"
            >
              <span>Consult Clinical Advisor</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
