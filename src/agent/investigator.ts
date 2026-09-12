export interface InvestigationResult {
  patientConditions: string[];
  food: string;
  relevantChecks: string[];
  uncertainties: string[];
  medicinesPresent: boolean;
  actions: string[];
}

interface PatientInput {
  conditions?: string[];
  dietary_restrictions?: string[];
  medicines?: string[];
}

interface FoodInput {
  product_name?: string;
  nutrition?: Record<string, number>;
  confidence?: Record<string, number>;
}

export function investigate(patient: PatientInput, food: FoodInput): InvestigationResult {
  const conditions = (patient.conditions || []).map((c) => c.toLowerCase());
  const restrictions = (patient.dietary_restrictions || []).map((r) => r.toLowerCase());
  const medicines = patient.medicines || [];
  const confidence = food.confidence || {};

  const relevantChecks: string[] = [];
  const uncertainties: string[] = [];
  const actions: string[] = [];

  // 1. Diabetes investigation
  if (conditions.includes('diabetes') || restrictions.includes('low sugar')) {
    relevantChecks.push('sugar');
    actions.push('Check sugar content because it is relevant to the patient\'s diabetes/dietary restriction.');
  }

  // 2. Hypertension investigation
  if (conditions.includes('hypertension') || restrictions.includes('low sodium')) {
    relevantChecks.push('sodium');
    actions.push('Check sodium content because it is relevant to the patient\'s hypertension/dietary restriction.');
  }

  // 3. Fat investigation
  if (conditions.includes('cardiovascular')) {
    relevantChecks.push('fat');
    relevantChecks.push('saturated_fat');
    actions.push('Check fat and saturated fat because cardiovascular considerations are relevant.');
  }

  // 4. Ingredient investigation
  relevantChecks.push('ingredients');
  actions.push('Inspect ingredients for potentially relevant dietary concerns.');

  // 5. Serving size
  relevantChecks.push('serving_size');
  actions.push('Check serving size because nutrient values depend on the stated serving.');

  // 6. Check uncertain information
  for (const [nutrient, value] of Object.entries(confidence)) {
    if (value < 0.80) {
      uncertainties.push(`${nutrient} information has low OCR confidence (${value.toFixed(2)}).`);
      actions.push(`Verify ${nutrient} because the extracted value is uncertain.`);
    }
  }

  // 7. Medicine context
  if (medicines.length > 0) {
    actions.push('Check whether a known food-medicine interaction is relevant.');
  }

  return {
    patientConditions: patient.conditions || [],
    food: food.product_name || 'Unknown food',
    relevantChecks,
    uncertainties,
    medicinesPresent: medicines.length > 0,
    actions,
  };
}
