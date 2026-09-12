export interface PatientProfile {
  id: string;
  name: string;
  email: string;
  age: number;
  gender: string;
  bloodType: string;
  weightKg: number;
  heightCm: number;
  bmi: number;
  primaryCondition: string;
  allergies: string[];
  dietaryRestrictions: string[];
  calorieTarget: number;
  waterTargetMl: number;
  macroTargets: {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    sodiumMg: number;
    potassiumMg: number;
  };
}

export interface VitalMetric {
  id: string;
  name: string;
  value: string | number;
  unit: string;
  baseline: string;
  status: 'optimal' | 'normal' | 'review' | 'critical';
  trend: 'up' | 'down' | 'stable';
  trendLabel: string;
  category: 'metabolic' | 'cardiovascular' | 'nutrition' | 'hydration';
  icon: string;
}

export interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  potassium: number;
}

export interface LoggedMeal {
  id: string;
  mealName: string;
  timestamp: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  macros: MacroNutrients;
  glycemicIndex: string;
  glycemicLoad: string;
  clinicalSummary: string;
  allergenAlerts: string[];
  contraindications: {
    status: 'Safe' | 'Caution' | 'Review Required';
    notes: string;
  };
  nutrientHighlights: string[];
  imageUrl?: string;
  aiPowered?: boolean;
}

export interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  scheduledTime: string;
  period: 'Morning' | 'Lunch' | 'Evening' | 'Bedtime';
  category: 'Prescription' | 'Clinical Supplement' | 'Cardio' | 'Metabolic';
  instructions: string;
  taken: boolean;
  foodInteractionWarning?: {
    type: 'critical' | 'warning' | 'info';
    message: string;
  };
}

export interface ClinicalDietPlan {
  id: string;
  title: string;
  protocolName: string;
  indication: string;
  calorieTarget: number;
  macroSplit: {
    proteinPercent: number;
    carbsPercent: number;
    fatPercent: number;
  };
  clinicalKeyPoints: string[];
  meals: {
    mealType: string;
    time: string;
    name: string;
    calories: number;
    macros: { p: number; c: number; f: number };
    clinicalBenefit: string;
  }[];
}

export interface LabBiomarker {
  id: string;
  name: string;
  value: number;
  unit: string;
  referenceRange: string;
  dateTested: string;
  status: 'optimal' | 'borderline' | 'abnormal';
  clinicalInterpretation: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isAi?: boolean;
  clinicalReferences?: string[];
  tags?: string[];
}
