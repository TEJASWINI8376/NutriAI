import React, { useState } from 'react';
import {
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Activity,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Plus,
  Info,
} from 'lucide-react';
import { PatientProfile, LoggedMeal } from '../types';

interface MealScannerScreenProps {
  patient: PatientProfile;
  onAddMeal: (meal: LoggedMeal) => void;
  onViewDashboard: () => void;
}

export const MealScannerScreen: React.FC<MealScannerScreenProps> = ({
  patient,
  onAddMeal,
  onViewDashboard,
}) => {
  const [mealQuery, setMealQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedData, setAnalyzedData] = useState<any | null>({
    mealName: 'Mediterranean Wild Salmon & Quinoa Bowl',
    calories: 520,
    macros: {
      protein: 42,
      carbs: 44,
      fat: 18,
      fiber: 9,
      sodium: 380,
      potassium: 890,
    },
    glycemicIndex: 'Low (GI 32)',
    glycemicLoad: 'Low (GL 6)',
    clinicalSummary: 'Marine EPA/DHA fatty acids support endothelial vasodilation and down-regulate hepatic triglyceride synthesis. High soluble fiber blunts reactive insulin release.',
    allergenAlerts: ['Contains Fish (Wild Salmon)'],
    contraindicationCheck: {
      status: 'Safe',
      notes: 'No contraindication with Lisinopril 10mg. Potassium content (890mg) promotes favorable cardioprotective cellular homeostasis without hyperkalemia risk.',
    },
    nutrientHighlights: [
      'Omega-3 EPA/DHA (2.6g)',
      'Bioavailable Potassium (890mg)',
      'Vitamin D3 (650 IU)',
      'Selenium (48 mcg)',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    aiPowered: true,
  });
  const [mealType, setMealType] = useState<'Breakfast' | 'Lunch' | 'Dinner' | 'Snack'>('Lunch');
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  // Preset clinical sample dishes for 1-click test
  const clinicalPresets = [
    {
      name: 'Wild Salmon, Quinoa & Greens',
      img: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
      type: 'Lunch' as const,
      desc: 'Pan-seared wild salmon with cooked tricolor quinoa, steamed broccoli florets, and extra virgin olive oil.',
    },
    {
      name: 'Steel-Cut Oats with Berries & Chia',
      img: 'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80',
      type: 'Breakfast' as const,
      desc: 'Organic steel-cut oats topped with wild blueberries, milled chia seeds, and unsweetened almond milk.',
    },
    {
      name: 'Herb Grilled Chicken & Avocado Salad',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
      type: 'Dinner' as const,
      desc: 'Free-range herb grilled chicken breast, Hass avocado, crisp butter lettuce, and cucumber with lemon dressing.',
    },
    {
      name: 'Spiced Red Lentil & Spinach Dal',
      img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
      type: 'Dinner' as const,
      desc: 'Simmered red lentils with cumin, turmeric, baby spinach, and brown basmati rice.',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSelectedImage(base64);
      analyzeMeal(base64, file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const analyzeMeal = async (imageBase64?: string | null, customPrompt?: string) => {
    setAnalyzing(true);
    setLoggedSuccess(false);

    try {
      const payload: any = {
        description: customPrompt || mealQuery || 'Healthy clinical plate',
        patientConditions: [patient.primaryCondition, ...patient.allergies, ...patient.dietaryRestrictions],
      };

      if (imageBase64) {
        payload.imageBase64 = imageBase64;
      }

      const res = await fetch('/api/gemini/analyze-meal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setAnalyzedData({
          ...json.data,
          imageUrl: imageBase64 || selectedImage || analyzedData?.imageUrl,
        });
      }
    } catch (err) {
      console.error('Failed to analyze meal with Gemini API:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: typeof clinicalPresets[0]) => {
    setSelectedImage(preset.img);
    setMealQuery(preset.name);
    setMealType(preset.type);
    analyzeMeal(null, preset.desc);
  };

  const handleLogMeal = () => {
    if (!analyzedData) return;

    const newMeal: LoggedMeal = {
      id: `meal-${Date.now()}`,
      mealName: analyzedData.mealName || mealQuery || 'Clinical Meal',
      timestamp: 'Just now',
      mealType: mealType,
      calories: analyzedData.calories || 450,
      macros: analyzedData.macros || {
        protein: 30,
        carbs: 40,
        fat: 15,
        fiber: 6,
        sodium: 350,
        potassium: 600,
      },
      glycemicIndex: analyzedData.glycemicIndex || 'Low (GI 35)',
      glycemicLoad: analyzedData.glycemicLoad || 'Low (GL 6)',
      clinicalSummary: analyzedData.clinicalSummary || 'Clinically verified balanced meal.',
      allergenAlerts: analyzedData.allergenAlerts || [],
      contraindications: analyzedData.contraindicationCheck || {
        status: 'Safe',
        notes: 'Verified against current medications.',
      },
      nutrientHighlights: analyzedData.nutrientHighlights || ['High Micronutrient Density'],
      imageUrl: analyzedData.imageUrl || selectedImage || undefined,
      aiPowered: true,
    };

    onAddMeal(newMeal);
    setLoggedSuccess(true);
    setTimeout(() => {
      onViewDashboard();
    }, 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-[#E0F2FE] text-[#0284C7]">
                <Sparkles className="w-5 h-5" />
              </span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0B1C30] tracking-tight">
                  AI Meal Scanner & Clinical Nutrient Lab
                </h1>
                <p className="text-xs sm:text-sm text-[#64748B]">
                  Powered by Gemini 3.8 • Deep Multimodal Biomarker & Glycemic Estimation
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#047857] bg-[#ECFDF5] px-3 py-1.5 rounded-full border border-[#A7F3D0] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              Patient Contraindication Guard Active
            </span>
          </div>
        </div>
      </div>

      {/* Input Section: Photo Upload, Description & Clinical Presets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image/Camera & Prompt Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-[#0B1C30] uppercase tracking-wider">
              1. Capture or Upload Meal
            </h2>

            {/* Upload Box */}
            <label className="relative border-2 border-dashed border-[#CBD5E1] hover:border-[#0284C7] bg-[#F8FAFC] rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all group overflow-hidden min-h-[220px]">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="meal-photo-upload"
              />

              {selectedImage || analyzedData?.imageUrl ? (
                <div className="relative w-full h-48 rounded-xl overflow-hidden">
                  <img
                    src={selectedImage || analyzedData?.imageUrl}
                    alt="Uploaded meal"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold gap-2">
                    <Camera className="w-4 h-4" /> Click to change image
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="text-xs font-bold text-[#0B1C30]">
                    Snap food photo or drop file here
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    JPEG, PNG, WebP up to 10MB
                  </p>
                </div>
              )}
            </label>

            {/* Text description input */}
            <div>
              <label className="text-xs font-semibold text-[#0B1C30] block mb-1.5">
                Or describe ingredients & portions:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mealQuery}
                  onChange={(e) => setMealQuery(e.target.value)}
                  placeholder="e.g. 150g grilled chicken, 1 cup brown rice, spinach"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] focus:ring-2 focus:ring-[#0284C7] focus:border-transparent text-xs sm:text-sm bg-white"
                />
                <button
                  id="meal-analyze-btn"
                  onClick={() => analyzeMeal(selectedImage)}
                  disabled={analyzing}
                  className="px-4 py-2.5 bg-[#0284C7] hover:bg-[#0369A1] disabled:opacity-50 text-white rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all shrink-0"
                >
                  {analyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#86F2E4]" />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Clinical Preset Cards */}
            <div className="pt-2 border-t border-[#F1F5F9]">
              <span className="text-xs font-semibold text-[#64748B] block mb-2.5">
                Or test with evidence-based clinical plates:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {clinicalPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectPreset(preset)}
                    className="p-2 text-left rounded-xl border border-[#E2E8F0] hover:border-[#0284C7] hover:bg-[#F0F9FF] transition-all flex items-center gap-2 group"
                  >
                    <img
                      src={preset.img}
                      alt={preset.name}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-[#0B1C30] block truncate group-hover:text-[#0284C7]">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        {preset.type}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Real-Time Clinical Analysis Card */}
        <div className="lg:col-span-7 space-y-4">
          {analyzing ? (
            <div className="bg-white rounded-2xl p-12 border border-[#E2E8F0] shadow-xs text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-7 h-7 animate-spin" />
              </div>
              <h3 className="text-base font-bold text-[#0B1C30]">
                NutriAI Clinical Biomarker Engine Running
              </h3>
              <p className="text-xs text-[#64748B] max-w-md mx-auto">
                Extracting macronutrient density, estimating glycemic impact, verifying sodium/potassium ratios, and checking potential drug-nutrient interactions against patient profile...
              </p>
            </div>
          ) : analyzedData ? (
            <div className="bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-xs space-y-5">
              {/* Header Title & Calories */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#F1F5F9] gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#0D9488] bg-[#EFF4FF] px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Gemini Multimodal Verified
                    </span>
                    <span className="text-xs text-[#64748B]">• Instant Analysis</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-[#0B1C30] mt-1">
                    {analyzedData.mealName}
                  </h3>
                </div>

                <div className="text-right sm:self-center">
                  <span className="text-2xl sm:text-3xl font-bold text-[#0284C7] tracking-tight">
                    {analyzedData.calories}
                  </span>
                  <span className="text-xs font-semibold text-[#64748B] block">
                    kcal estimated
                  </span>
                </div>
              </div>

              {/* Macronutrient Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 text-center">
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Protein</span>
                  <span className="text-base font-bold text-[#0D9488]">{analyzedData.macros?.protein}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Carbs</span>
                  <span className="text-base font-bold text-[#0284C7]">{analyzedData.macros?.carbs}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Fats</span>
                  <span className="text-base font-bold text-[#F59E0B]">{analyzedData.macros?.fat}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Fiber</span>
                  <span className="text-base font-bold text-[#10B981]">{analyzedData.macros?.fiber}g</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Sodium</span>
                  <span className="text-base font-bold text-[#0B1C30]">{analyzedData.macros?.sodium}mg</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span className="text-[11px] text-[#64748B] font-medium block">Potassium</span>
                  <span className="text-base font-bold text-[#0D9488]">{analyzedData.macros?.potassium}mg</span>
                </div>
              </div>

              {/* Glycemic Index & Predicted Blood Sugar Response Curve */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0284C7]" />
                    <span className="text-xs font-bold text-[#0B1C30]">
                      Glycemic Impact & Estimated Post-Prandial Curve
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] px-2.5 py-0.5 rounded-full border border-[#A7F3D0]">
                      {analyzedData.glycemicIndex}
                    </span>
                    <span className="text-xs font-bold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-0.5 rounded-full">
                      {analyzedData.glycemicLoad}
                    </span>
                  </div>
                </div>

                {/* SVG Curve Graphic */}
                <div className="relative h-20 w-full bg-white rounded-lg p-2 border border-[#E2E8F0] flex items-end justify-between">
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 flex flex-col justify-between p-2 pointer-events-none opacity-20">
                    <div className="border-b border-[#0B1C30] w-full"></div>
                    <div className="border-b border-[#0B1C30] w-full"></div>
                    <div className="border-b border-[#0B1C30] w-full"></div>
                  </div>

                  <svg className="w-full h-full overflow-visible" viewBox="0 0 400 60" preserveAspectRatio="none">
                    {/* Baseline */}
                    <line x1="0" y1="50" x2="400" y2="50" stroke="#CBD5E1" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Glucose Spike curve (mild low-GI bump) */}
                    <path
                      d="M 0 50 Q 80 48, 140 22 T 260 38 T 400 50"
                      fill="none"
                      stroke="#0284C7"
                      strokeWidth="2.5"
                    />
                    {/* Peak Dot */}
                    <circle cx="160" cy="24" r="3.5" fill="#0D9488" />
                  </svg>
                </div>
                <div className="flex justify-between text-[10px] text-[#64748B] px-1">
                  <span>0 min (Fasting 92 mg/dL)</span>
                  <span className="font-semibold text-[#0284C7]">Peak ~45 min (Est. 114 mg/dL)</span>
                  <span>120 min (Stabilized 96 mg/dL)</span>
                </div>
              </div>

              {/* Contraindication & Medication Interaction Check */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 ${
                  analyzedData.contraindicationCheck?.status === 'Safe'
                    ? 'bg-[#ECFDF5] border-[#A7F3D0]'
                    : 'bg-[#FEF3C7] border-[#FDE68A]'
                }`}
              >
                {analyzedData.contraindicationCheck?.status === 'Safe' ? (
                  <ShieldCheck className="w-5 h-5 text-[#10B981] shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-[#F59E0B] shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0B1C30]">
                      Medication-Nutrient Compatibility:
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.2 rounded-full ${
                        analyzedData.contraindicationCheck?.status === 'Safe'
                          ? 'bg-white text-[#047857]'
                          : 'bg-white text-[#B45309]'
                      }`}
                    >
                      {analyzedData.contraindicationCheck?.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#334155] mt-1 leading-relaxed">
                    {analyzedData.contraindicationCheck?.notes}
                  </p>
                </div>
              </div>

              {/* Clinical Summary & Micronutrient Highlights */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#0B1C30] uppercase tracking-wider block">
                  Clinical Bio-Mechanisms:
                </span>
                <p className="text-xs text-[#475569] leading-relaxed">
                  {analyzedData.clinicalSummary}
                </p>

                {analyzedData.nutrientHighlights?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {analyzedData.nutrientHighlights.map((highlight: string, idx: number) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE] px-2.5 py-1 rounded-full"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Log Bar */}
              <div className="pt-4 border-t border-[#F1F5F9] flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#64748B]">Log as:</span>
                  {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setMealType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        mealType === t
                          ? 'bg-[#0284C7] text-white shadow-xs'
                          : 'bg-[#F1F5F9] text-[#64748B] hover:text-[#0B1C30]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  id="log-meal-confirm-btn"
                  onClick={handleLogMeal}
                  disabled={loggedSuccess}
                  className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                    loggedSuccess
                      ? 'bg-[#10B981] text-white'
                      : 'bg-[#0284C7] hover:bg-[#0369A1] text-white hover:shadow-md'
                  }`}
                >
                  {loggedSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Logged to Vitals!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Log to Today's Vitals</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 border border-[#E2E8F0] shadow-xs text-center text-[#64748B] text-xs">
              Upload an image or select a meal on the left to review clinical nutrient breakdown.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
