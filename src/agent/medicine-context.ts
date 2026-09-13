export interface MedicineResult {
  medicineChecksRelevant: boolean;
  medicinesChecked: string[];
  possibleInteractions: Array<{
    medicine: string;
    foodComponent: string;
    message: string;
  }>;
}

// Prototype interaction data — only established examples
const KNOWN_INTERACTIONS: Record<string, string[]> = {
  warfarin: ['vitamin k', 'spinach', 'kale', 'broccoli', 'collard'],
  levothyroxine: ['calcium', 'iron'],
};

export function checkMedicineContext(medicines: string[], ingredients: string[]): MedicineResult {
  const medicinesLower = medicines.map((m) => m.toLowerCase().replace(/\s+/g, ' ').trim());
  const ingredientsText = ingredients.join(' ').toLowerCase().replace(/\s+/g, ' ');

  const relevantChecks: string[] = [];
  const possibleInteractions: MedicineResult['possibleInteractions'] = [];

  for (const medicine of medicinesLower) {
    if (medicine in KNOWN_INTERACTIONS) {
      relevantChecks.push(medicine);

      for (const foodItem of KNOWN_INTERACTIONS[medicine]) {
        if (ingredientsText.includes(foodItem)) {
          possibleInteractions.push({
            medicine,
            foodComponent: foodItem,
            message: `A known food-medicine interaction may be relevant for ${medicine} and ${foodItem}.`,
          });
        }
      }
    }
  }

  return {
    medicineChecksRelevant: relevantChecks.length > 0,
    medicinesChecked: relevantChecks,
    possibleInteractions,
  };
}
