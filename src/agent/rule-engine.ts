import { MedicineResult } from './medicine-context';

export interface Concern {
  type: string;
  value?: number;
  medicine?: string;
  foodComponent?: string;
  message: string;
}

export interface RuleResult {
  decision: 'GENERALLY_SUITABLE' | 'CONSUME_WITH_CAUTION' | 'HIGHER_CONCERN';
  concerns: Concern[];
  rulesApplied: string[];
}

// Prototype thresholds — should be replaced with evidence-backed values later
const SUGAR_CAUTION = 15;
const SODIUM_CAUTION = 400;
const SATURATED_FAT_CAUTION = 5;

interface PatientInput {
  conditions?: string[];
  dietary_restrictions?: string[];
}

interface VerifiedFoodInput {
  verifiedNutrition?: Record<string, number>;
  ingredients?: string[];
}

export function assess(
  patient: PatientInput,
  verifiedFood: VerifiedFoodInput,
  medicineResult?: MedicineResult | null,
): RuleResult {
  const conditions = (patient.conditions || []).map((c) => c.toLowerCase());
  const restrictions = (patient.dietary_restrictions || []).map((r) => r.toLowerCase());
  const nutrition = verifiedFood.verifiedNutrition || {};

  const concerns: Concern[] = [];
  const rulesApplied: string[] = [];

  // Medicine-food interaction rules
  if (medicineResult?.possibleInteractions?.length) {
    rulesApplied.push('medicine_food_interaction_rule');
    for (const interaction of medicineResult.possibleInteractions) {
      concerns.push({
        type: 'medicine_food_interaction',
        medicine: interaction.medicine,
        foodComponent: interaction.foodComponent,
        message: interaction.message,
      });
    }
  }

  // Diabetes / Low Sugar
  const sugar = nutrition.sugar;
  if (
    (conditions.includes('diabetes') || restrictions.includes('low sugar')) &&
    sugar !== undefined
  ) {
    rulesApplied.push('diabetes_sugar_rule');
    if (sugar >= SUGAR_CAUTION) {
      concerns.push({
        type: 'sugar',
        value: sugar,
        message: `Sugar is ${sugar} g per serving, which exceeds the prototype caution threshold.`,
      });
    }
  }

  // Hypertension / Low Sodium
  const sodium = nutrition.sodium;
  if (
    (conditions.includes('hypertension') || restrictions.includes('low sodium')) &&
    sodium !== undefined
  ) {
    rulesApplied.push('hypertension_sodium_rule');
    if (sodium >= SODIUM_CAUTION) {
      concerns.push({
        type: 'sodium',
        value: sodium,
        message: `Sodium is ${sodium} mg per serving, which exceeds the prototype caution threshold.`,
      });
    }
  }

  // Cardiovascular / Saturated fat
  const saturatedFat = nutrition.saturated_fat;
  if (conditions.includes('cardiovascular')) {
    rulesApplied.push('cardiovascular_saturated_fat_rule');
    if (saturatedFat !== undefined && saturatedFat >= SATURATED_FAT_CAUTION) {
      concerns.push({
        type: 'saturated_fat',
        value: saturatedFat,
        message: `Saturated fat is ${saturatedFat} g per serving, which exceeds the prototype caution threshold.`,
      });
    }
  }

  // Final decision
  let decision: RuleResult['decision'];
  if (concerns.length >= 2) {
    decision = 'HIGHER_CONCERN';
  } else if (concerns.length === 1) {
    decision = 'CONSUME_WITH_CAUTION';
  } else {
    decision = 'GENERALLY_SUITABLE';
  }

  return { decision, concerns, rulesApplied };
}
