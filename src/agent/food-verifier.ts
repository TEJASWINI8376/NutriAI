export interface VerificationResult {
  verifiedNutrition: Record<string, number>;
  ingredients: string[];
  servingSize?: string;
  verifiedFields: string[];
  conflicts: Array<{ field: string; ocrValue: number; verifiedValue: number }>;
  verificationActions: string[];
  verificationStatus: 'verified' | 'no_verification_needed';
}

interface FoodInput {
  nutrition?: Record<string, number>;
  ingredients?: string[];
  serving_size?: string;
}

interface InvestigationInput {
  uncertainties?: string[];
}

export function verify(food: FoodInput, investigation: InvestigationInput): VerificationResult {
  const verifiedNutrition = { ...(food.nutrition || {}) };
  const verificationActions: string[] = [];
  const conflicts: Array<{ field: string; ocrValue: number; verifiedValue: number }> = [];
  const verifiedFields: string[] = [];
  const uncertainties = investigation.uncertainties || [];

  for (const uncertainty of uncertainties) {
    if (uncertainty.toLowerCase().includes('sodium')) {
      // Simulated trusted verification source
      const verifiedSodium = 450;
      const originalSodium = food.nutrition?.sodium;

      if (originalSodium !== undefined && originalSodium !== verifiedSodium) {
        conflicts.push({
          field: 'sodium',
          ocrValue: originalSodium,
          verifiedValue: verifiedSodium,
        });

        verificationActions.push(
          `Sodium conflict detected: OCR=${originalSodium} mg, verified source=${verifiedSodium} mg.`,
        );

        // Adapt: use verified value
        verifiedNutrition.sodium = verifiedSodium;

        verificationActions.push(
          'Agent adapted by replacing the uncertain sodium value with the verified value.',
        );
      }

      verifiedFields.push('sodium');
    }
  }

  return {
    verifiedNutrition,
    ingredients: food.ingredients || [],
    servingSize: food.serving_size,
    verifiedFields,
    conflicts,
    verificationActions,
    verificationStatus: verifiedFields.length > 0 ? 'verified' : 'no_verification_needed',
  };
}
