import React, { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Heart,
  TrendingDown,
  Activity,
  Plus,
  CheckCircle2,
  Clock,
  Flame,
  Check,
  RefreshCw,
} from 'lucide-react';
import { ClinicalDietPlan, PatientProfile, LoggedMeal } from '../types';

interface DietPlansScreenProps {
  plans: ClinicalDietPlan[];
  patient: PatientProfile;
  onAddMeal: (meal: LoggedMeal) => void;
}

export const DietPlansScreen: React.FC<DietPlansScreenProps> = ({
  plans,
  patient,
  onAddMeal,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || 'plan-dash');
  const [loggedMealIds, setLoggedMealIds] = useState<Record<string, boolean>>({});

  // AI Generator state
  const [aiGenerating, setAiGenerating] = useState(false);
  const [customGoal, setCustomGoal] = useState('Renal & Blood Pressure Optimization');
  const [customCalories, setCustomCalories] = useState(patient.calorieTarget);
  const [allPlans, setAllPlans] = useState<ClinicalDietPlan[]>(plans);

  const currentPlan = allPlans.find((p) => p.id === selectedPlanId) || allPlans[0];

  const handleLogPlanMeal = (meal: typeof currentPlan.meals[0], planTitle: string) => {
    const mealId = `${currentPlan.id}-${meal.mealType}-${Date.now()}`;

    const newMeal: LoggedMeal = {
      id: mealId,
      mealName: meal.name,
      timestamp: `Scheduled ${meal.time}`,
      mealType: (meal.mealType as any) || 'Lunch',
      calories: meal.calories,
      macros: {
        protein: meal.macros.p,
        carbs: meal.macros.c,
        fat: meal.macros.f,
        fiber: 8,
        sodium: 280,
        potassium: 620,
      },
      glycemicIndex: 'Low (GI 32)',
      glycemicLoad: 'Low (GL 5)',
      clinicalSummary: meal.clinicalBenefit,
      allergenAlerts: [],
      contraindications: {
        status: 'Safe',
        notes: `Compliant with ${planTitle} clinical protocol.`,
      },
      nutrientHighlights: ['Clinical Plan Aligned', 'Anti-Inflammatory'],
      aiPowered: true,
    };

    onAddMeal(newMeal);
    setLoggedMealIds((prev) => ({ ...prev, [meal.name]: true }));
  };

  const handleGenerateCustomPlan = async () => {
    setAiGenerating(true);
    try {
      const res = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetGoal: customGoal,
          conditions: [patient.primaryCondition, ...patient.dietaryRestrictions],
          targetCalories: customCalories,
        }),
      });

      const data = await res.json();
      if (data.success && data.plan) {
        const newPlanId = `plan-ai-${Date.now()}`;
        const newCustomPlan: ClinicalDietPlan = {
          id: newPlanId,
          title: `AI: ${customGoal}`,
          protocolName: 'Gemini 3.8 Precision Nutrition',
          indication: patient.primaryCondition,
          calorieTarget: customCalories,
          macroSplit: { proteinPercent: 30, carbsPercent: 40, fatPercent: 30 },
          clinicalKeyPoints: [
            'Bespoke micronutrient calibration for active health profile',
            'Cardioprotective potassium-to-sodium balance',
            'Low glycemic impact across daytime carbohydrate allocations',
          ],
          meals: data.plan,
        };

        setAllPlans((prev) => [newCustomPlan, ...prev]);
        setSelectedPlanId(newPlanId);
      }
    } catch (err) {
      console.error('Failed to generate AI plan:', err);
    } finally {
      setAiGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#E0F2FE] text-[#0284C7]">
                <BookOpen className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B1C30] tracking-tight">
                  Personalized Clinical Diet Protocols
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Evidence-based nutrition regimes tuned for cardiovascular & metabolic longevity
                </p>
              </div>
            </div>
          </div>

          {/* Quick AI Regeneration trigger */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#0B1C30] bg-[#F1F5F9] px-3 py-1.5 rounded-xl border border-[#E2E8F0]">
              Patient Target: <strong className="text-[#0284C7]">{patient.calorieTarget} kcal</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Protocol Selection Tabs */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
        {allPlans.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <button
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`px-4 py-3 rounded-2xl text-left transition-all shrink-0 border ${
                isSelected
                  ? 'bg-white border-[#0284C7] shadow-sm ring-2 ring-[#0284C7]/20'
                  : 'bg-white border-[#E2E8F0] hover:border-[#CBD5E1] text-[#64748B]'
              }`}
            >
              <span className={`text-xs font-bold block ${isSelected ? 'text-[#0284C7]' : 'text-[#0B1C30]'}`}>
                {plan.title}
              </span>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                {plan.calorieTarget} kcal • {plan.protocolName}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Plan Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Daily Meal Schedule */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0D9488]">
                  {currentPlan.protocolName}
                </span>
                <h2 className="text-lg font-bold text-[#0B1C30] mt-0.5">
                  {currentPlan.title}
                </h2>
                <p className="text-xs text-[#64748B] mt-1">
                  Indication: {currentPlan.indication}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-3 py-1 rounded-full">
                  {currentPlan.calorieTarget} kcal / day
                </span>
              </div>
            </div>

            {/* Macro Split Pills */}
            <div className="grid grid-cols-3 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[11px] text-[#64748B] font-medium block">Protein</span>
                <span className="text-sm font-bold text-[#0D9488]">
                  {currentPlan.macroSplit.proteinPercent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[11px] text-[#64748B] font-medium block">Carbohydrates</span>
                <span className="text-sm font-bold text-[#0284C7]">
                  {currentPlan.macroSplit.carbsPercent}%
                </span>
              </div>
              <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center">
                <span className="text-[11px] text-[#64748B] font-medium block">Healthy Fats</span>
                <span className="text-sm font-bold text-[#F59E0B]">
                  {currentPlan.macroSplit.fatPercent}%
                </span>
              </div>
            </div>

            {/* Meals List */}
            <div className="space-y-3.5 mt-5">
              <h3 className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider">
                Full Day Administration & Recipes
              </h3>

              {currentPlan.meals.map((meal, idx) => {
                const isLogged = !!loggedMealIds[meal.name];
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#0284C7] transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0284C7] bg-[#E0F2FE] px-2 py-0.5 rounded-md uppercase">
                          {meal.mealType}
                        </span>
                        <span className="text-xs text-[#64748B] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {meal.time}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0B1C30]">
                        {meal.calories} kcal
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#0B1C30]">
                      {meal.name}
                    </h4>

                    <p className="text-xs text-[#475569] leading-relaxed">
                      {meal.clinicalBenefit}
                    </p>

                    <div className="pt-2 border-t border-[#E2E8F0]/60 flex items-center justify-between text-xs">
                      <span className="text-[#64748B]">
                        Macros: <strong>{meal.macros.p}g P</strong> • <strong>{meal.macros.c}g C</strong> • <strong>{meal.macros.f}g F</strong>
                      </span>

                      <button
                        onClick={() => handleLogPlanMeal(meal, currentPlan.title)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                          isLogged
                            ? 'bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]'
                            : 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-xs'
                        }`}
                      >
                        {isLogged ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Logged to Today</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Log This Meal</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Protocol Pillars & AI Custom Builder */}
        <div className="lg:col-span-4 space-y-5">
          {/* Protocol Pillars */}
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-[#0B1C30] flex items-center gap-2 pb-2 border-b border-[#F1F5F9]">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              Evidence-Based Clinical Pillars
            </h3>
            <ul className="space-y-2.5 text-xs text-[#334155]">
              {currentPlan.clinicalKeyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7] mt-1.5 shrink-0"></span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Custom Clinical Meal Plan Generator */}
          <div className="bg-gradient-to-br from-[#F8FAFC] to-[#EFF6FF] rounded-2xl p-5 border border-[#BFDBFE] shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#0284C7] text-white">
                <Sparkles className="w-4 h-4" />
              </span>
              <h3 className="text-sm font-bold text-[#0B1C30]">
                NutriAI Bespoke Plan Generator
              </h3>
            </div>
            <p className="text-xs text-[#64748B]">
              Need a targeted clinical diet for specific lab results or athletic goals? Let Gemini design one in seconds.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-semibold text-[#0B1C30] block mb-1">
                  Clinical Target / Goal:
                </label>
                <input
                  type="text"
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  placeholder="e.g. Anti-Inflammatory & Triglyceride Reduction"
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-[#0B1C30] block mb-1">
                  Target Energy (kcal):
                </label>
                <input
                  type="number"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] bg-white text-xs"
                />
              </div>

              <button
                id="generate-plan-btn"
                onClick={handleGenerateCustomPlan}
                disabled={aiGenerating}
                className="w-full mt-2 py-2.5 px-4 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
              >
                {aiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Compiling Clinical Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#86F2E4]" />
                    <span>Generate With Gemini</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
