export interface VerificationConflict {
  field: string;
  ocrValue: number;
  verifiedValue: number;
}

export interface VerificationResult {
  verifiedNutrition: Record<string, number>;
  ingredients: string[];
  servingSize?: string;
  verifiedFields: string[];
  unresolvedFields: string[];
  conflicts: VerificationConflict[];
  verificationActions: string[];
  uncertaintyWarnings: string[];
  verificationStatus: 'verified' | 'partially_verified' | 'unverified' | 'no_verification_needed';
  sourceApi?: {
    name: string;
    url: string;
    barcode?: string;
    productName?: string;
    status: 'found' | 'not_found' | 'error' | 'no_barcode';
  };
}

export interface FoodInput {
  product_name?: string;
  barcode?: string;
  nutrition?: Record<string, number>;
  ingredients?: string[];
  serving_size?: string;
  confidence?: Record<string, number>;
}

export interface InvestigationInput {
  relevantChecks?: string[];
  uncertainties?: string[];
  actions?: string[];
}

/**
 * Open Food Facts API Tool Call
 * Fetches authoritative packaged food data from Open Food Facts API v0.
 */
async function fetchOpenFoodFactsData(barcode: string): Promise<any | null> {
  const cleanBarcode = barcode.trim().replace(/[^\d]/g, '');
  if (!cleanBarcode || cleanBarcode.length < 4) return null;

  const url = `https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4500);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NutriAgent - Web - Version 1.0',
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;
    const json: any = await response.json();
    if (json.status === 1 && json.product) {
      return json.product;
    }
    return null;
  } catch (err) {
    console.warn(`[Open Food Facts Tool] Error fetching barcode ${cleanBarcode}:`, err);
    return null;
  }
}

/**
 * Parses Open Food Facts product structure into standard nutrient numbers.
 */
function extractNutriments(product: any): Record<string, number> {
  const nutriments = product.nutriments || {};
  const extracted: Record<string, number> = {};

  // Calories
  const cals =
    nutriments['energy-kcal_serving'] ??
    nutriments['energy-kcal_100g'] ??
    nutriments['energy-kcal'];
  if (cals !== undefined && cals !== null && !isNaN(Number(cals))) {
    extracted.calories = Math.round(Number(cals));
  }

  // Sugars (grams)
  const sugar =
    nutriments['sugars_serving'] ??
    nutriments['sugars_100g'] ??
    nutriments['sugars'];
  if (sugar !== undefined && sugar !== null && !isNaN(Number(sugar))) {
    extracted.sugar = parseFloat(Number(sugar).toFixed(1));
  }

  // Sodium (convert from grams to mg)
  const sodiumServing = nutriments['sodium_serving'];
  const sodium100g = nutriments['sodium_100g'];
  const sodiumRaw = nutriments['sodium'];
  const saltServing = nutriments['salt_serving'];

  if (sodiumServing !== undefined && sodiumServing !== null) {
    extracted.sodium = Math.round(Number(sodiumServing) * 1000);
  } else if (sodium100g !== undefined && sodium100g !== null) {
    extracted.sodium = Math.round(Number(sodium100g) * 1000);
  } else if (sodiumRaw !== undefined && sodiumRaw !== null) {
    extracted.sodium = Math.round(Number(sodiumRaw) * 1000);
  } else if (saltServing !== undefined && saltServing !== null) {
    extracted.sodium = Math.round(Number(saltServing) * 400);
  }

  // Total Fat (grams)
  const fat = nutriments['fat_serving'] ?? nutriments['fat_100g'] ?? nutriments['fat'];
  if (fat !== undefined && fat !== null && !isNaN(Number(fat))) {
    extracted.fat = parseFloat(Number(fat).toFixed(1));
  }

  // Saturated Fat (grams)
  const satFat =
    nutriments['saturated-fat_serving'] ??
    nutriments['saturated-fat_100g'] ??
    nutriments['saturated-fat'];
  if (satFat !== undefined && satFat !== null && !isNaN(Number(satFat))) {
    extracted.saturated_fat = parseFloat(Number(satFat).toFixed(1));
  }

  // Carbohydrates (grams)
  const carbs =
    nutriments['carbohydrates_serving'] ??
    nutriments['carbohydrates_100g'] ??
    nutriments['carbohydrates'];
  if (carbs !== undefined && carbs !== null && !isNaN(Number(carbs))) {
    extracted.carbohydrates = parseFloat(Number(carbs).toFixed(1));
  }

  // Protein (grams)
  const protein =
    nutriments['proteins_serving'] ??
    nutriments['proteins_100g'] ??
    nutriments['proteins'];
  if (protein !== undefined && protein !== null && !isNaN(Number(protein))) {
    extracted.protein = parseFloat(Number(protein).toFixed(1));
  }

  return extracted;
}

/**
 * Autonomous Verification & Uncertainty Fallback Execution
 */
export async function verify(
  food: FoodInput,
  investigation: InvestigationInput,
): Promise<VerificationResult> {
  const verifiedNutrition: Record<string, number> = { ...(food.nutrition || {}) };
  const verificationActions: string[] = [];
  const uncertaintyWarnings: string[] = [];
  const conflicts: VerificationConflict[] = [];
  const verifiedFields: string[] = [];
  const unresolvedFields: string[] = [];

  const rawIngredients = [...(food.ingredients || [])];
  let servingSize = food.serving_size;

  const barcode = food.barcode ? food.barcode.trim().replace(/[^\d]/g, '') : undefined;
  const uncertainties = investigation.uncertainties || [];

  // Identify specific uncertain field names from investigation
  const uncertainFieldNames: string[] = [];
  for (const u of uncertainties) {
    const lower = u.toLowerCase();
    if (lower.includes('sodium')) uncertainFieldNames.push('sodium');
    if (lower.includes('sugar')) uncertainFieldNames.push('sugar');
    if (lower.includes('fat')) uncertainFieldNames.push('fat');
    if (lower.includes('saturated')) uncertainFieldNames.push('saturated_fat');
    if (lower.includes('carbohydrate') || lower.includes('carb')) uncertainFieldNames.push('carbohydrates');
    if (lower.includes('protein')) uncertainFieldNames.push('protein');
    if (lower.includes('calorie')) uncertainFieldNames.push('calories');
  }

  // Check confidence map directly
  if (food.confidence) {
    for (const [k, v] of Object.entries(food.confidence)) {
      if (v < 0.85 && !uncertainFieldNames.includes(k)) {
        uncertainFieldNames.push(k);
      }
    }
  }

  let offProduct: any = null;
  let sourceApi: VerificationResult['sourceApi'];

  // 1. TOOL CALL: Query Open Food Facts if barcode is available
  if (barcode) {
    verificationActions.push(
      `Agent triggered tool call: Open Food Facts registry lookup for UPC/EAN ${barcode}.`,
    );
    offProduct = await fetchOpenFoodFactsData(barcode);

    if (offProduct) {
      sourceApi = {
        name: 'Open Food Facts Global Product Registry',
        url: `https://world.openfoodfacts.org/product/${barcode}`,
        barcode,
        productName: offProduct.product_name || offProduct.product_name_en,
        status: 'found',
      };
      verificationActions.push(
        `Open Food Facts record located: "${sourceApi.productName || barcode}". Retrieved verified nutritional declarations.`,
      );
    } else {
      sourceApi = {
        name: 'Open Food Facts Global Product Registry',
        url: `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        barcode,
        status: 'not_found',
      };
      verificationActions.push(
        `Open Food Facts lookup completed: Barcode ${barcode} not found in registry. Proceeding to autonomous fallback.`,
      );
    }
  } else {
    sourceApi = {
      name: 'Open Food Facts Global Product Registry',
      url: 'https://world.openfoodfacts.org',
      status: 'no_barcode',
    };
    verificationActions.push(
      'No product barcode provided for registry lookup. Proceeding with OCR confidence assessment.',
    );
  }

  // 2. PARSE VERIFIED DATA IF LOCATED
  const offNutrients = offProduct ? extractNutriments(offProduct) : {};

  if (offProduct?.serving_size && !servingSize) {
    servingSize = offProduct.serving_size;
  }

  if (offProduct?.ingredients_text) {
    const apiIngredients = offProduct.ingredients_text
      .split(/[,;()\[\]\n\r]+\s*/)
      .map((s: string) => s.trim().toLowerCase())
      .filter((s: string) => s.length > 2);
    for (const ing of apiIngredients) {
      if (!rawIngredients.includes(ing)) {
        rawIngredients.push(ing);
      }
    }
  }

  // 3. CROSS-VERIFICATION & CONFLICT RESOLUTION
  const fieldsToCheck = Array.from(
    new Set([
      ...uncertainFieldNames,
      'sodium',
      'sugar',
      'saturated_fat',
      ...Object.keys(verifiedNutrition),
    ]),
  );

  for (const field of fieldsToCheck) {
    const ocrVal = verifiedNutrition[field];
    const offVal = offNutrients[field];
    const isFieldUncertain = uncertainFieldNames.includes(field);

    if (offVal !== undefined && offVal !== null) {
      // Open Food Facts has verified value
      const unit = field === 'sodium' ? 'mg' : field === 'calories' ? 'kcal' : 'g';

      if (ocrVal !== undefined && ocrVal !== null) {
        // Tolerance threshold for discrepancy (1 unit or 10% for values > 10)
        const diff = Math.abs(ocrVal - offVal);
        const threshold = Math.max(1, offVal * 0.1);

        if (diff > threshold) {
          // Conflict detected!
          conflicts.push({
            field,
            ocrValue: ocrVal,
            verifiedValue: offVal,
          });

          // Adapt: use verified value
          verifiedNutrition[field] = offVal;
          verifiedFields.push(field);

          verificationActions.push(
            `Resolved conflict in ${field}: OCR detected ${ocrVal} ${unit}, but Open Food Facts verified record states ${offVal} ${unit}. Agent adapted by using verified database value.`,
          );
        } else {
          // Values consistent
          verifiedNutrition[field] = offVal;
          verifiedFields.push(field);

          if (isFieldUncertain) {
            verificationActions.push(
              `Resolved uncertain ${field}: Open Food Facts verified database confirmed ${offVal} ${unit} (matching OCR ${ocrVal} ${unit}).`,
            );
          } else {
            verificationActions.push(
              `Cross-verified ${field} (${offVal} ${unit}) with Open Food Facts registry. Data is fully consistent.`,
            );
          }
        }
      } else {
        // Missing in OCR, filled from API
        verifiedNutrition[field] = offVal;
        verifiedFields.push(field);
        verificationActions.push(
          `Retrieved previously missing ${field} (${offVal} ${unit}) directly from Open Food Facts registry.`,
        );
      }
    } else {
      // Open Food Facts does NOT have verified value for this field
      if (isFieldUncertain) {
        // AUTONOMOUS FALLBACK FLOW
        if (ocrVal !== undefined && ocrVal !== null) {
          const unit = field === 'sodium' ? 'mg' : field === 'calories' ? 'kcal' : 'g';
          unresolvedFields.push(field);
          const warning = `Uncertainty unresolved for ${field}: External registry cross-verification unavailable. Proceeding with OCR scan value (${ocrVal} ${unit}) with clinical caution advisory.`;
          uncertaintyWarnings.push(warning);
          verificationActions.push(warning);
        } else {
          unresolvedFields.push(field);
          const warning = `Missing data for ${field}: Value not detected in OCR and unavailable in registry.`;
          uncertaintyWarnings.push(warning);
          verificationActions.push(warning);
        }
      } else if (ocrVal !== undefined) {
        verifiedFields.push(field);
      }
    }
  }

  // 4. DETERMINE OVERALL STATUS
  let verificationStatus: VerificationResult['verificationStatus'] = 'no_verification_needed';
  if (verifiedFields.length > 0 && unresolvedFields.length === 0) {
    verificationStatus = 'verified';
  } else if (verifiedFields.length > 0 && unresolvedFields.length > 0) {
    verificationStatus = 'partially_verified';
  } else if (unresolvedFields.length > 0) {
    verificationStatus = 'unverified';
  }

  return {
    verifiedNutrition,
    ingredients: rawIngredients,
    servingSize,
    verifiedFields,
    unresolvedFields,
    conflicts,
    verificationActions,
    uncertaintyWarnings,
    verificationStatus,
    sourceApi,
  };
}

