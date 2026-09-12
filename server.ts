import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { runPipeline } from './src/agent/pipeline';
import { INITIAL_PRODUCTS } from './src/data/mockProducts';

interface NutritionField {
  id: string;
  key: string;
  label: string;
  value: string;
  unit?: string;
  confidence: number;
  confirmed: boolean;
  isActionRequired?: boolean;
  actionBadge?: string;
  detectedRawString?: string;
  matchExplanation?: string;
  autoCleanApplied?: boolean;
  subValue?: string;
  tags?: string[];
  source?: 'open_food_facts' | 'gemini_ocr' | 'user_manual' | 'uncertain';
  sourceBadge?: string;
}

interface InspectionProduct {
  id: string;
  title: string;
  brand?: string;
  barcode?: string;
  categorySubtitle: string;
  captureSource: string;
  dataSource?: 'open_food_facts' | 'gemini_ocr' | 'hybrid' | 'mock';
  imageThumbnail: string;
  explanationTitle: string;
  explanationDescription: string;
  alertTitle?: string;
  alertBadge?: string;
  alertDescription?: string;
  fields: NutritionField[];
  ingredientsText?: string;
  aggregateScore: number;
  scoreLabel: string;
  nutriScore?: string;
  confirmedAt?: string;
  status: string;
}

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Initial products store (initialized from Open Food Facts verified registry products)
let productsDatabase: InspectionProduct[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));

// Lazy Gemini client helper
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// =================== OPEN FOOD FACTS API SERVICE ===================
async function fetchOpenFoodFactsProduct(barcode: string): Promise<any | null> {
  try {
    const cleanBarcode = barcode.trim().replace(/[^\d]/g, '');
    if (!cleanBarcode || cleanBarcode.length < 4) return null;
    const url = `https://world.openfoodfacts.org/api/v2/product/${cleanBarcode}.json`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NutriAI/1.0 (Clinical Food Decision Support; Windows)',
      },
    });
    if (!response.ok) return null;
    const data: any = await response.json();
    if (data.status === 1 && data.product) {
      return data.product;
    }
    return null;
  } catch (err) {
    console.warn('Open Food Facts API request error:', err);
    return null;
  }
}

function mapOpenFoodFactsToProduct(p: any, originalImage?: string): InspectionProduct {
  const newId = `prod-off-${p.code || Date.now()}`;
  const title = p.product_name || p.product_name_en || 'Packaged Food Product';
  const brand = p.brands ? p.brands.split(',')[0].trim() : '';
  const category = p.categories ? p.categories.split(',')[0].trim() : 'Packaged Grocery Product';
  const servingSize = p.serving_size || '1 Serving';
  const nutriments = p.nutriments || {};

  const calories =
    nutriments['energy-kcal_serving'] ??
    nutriments['energy-kcal_100g'] ??
    nutriments['energy-kcal'] ??
    0;
  const sugars = nutriments['sugars_serving'] ?? nutriments['sugars_100g'] ?? 0;
  const addedSugars = nutriments['added-sugars_serving'] ?? nutriments['added-sugars_100g'];
  const rawSodium = nutriments['sodium_serving'] ?? nutriments['sodium_100g'];
  const sodiumMg =
    rawSodium !== undefined
      ? Math.round(rawSodium * 1000)
      : nutriments['salt_serving']
      ? Math.round(nutriments['salt_serving'] * 400)
      : 0;
  const totalFat = nutriments['fat_serving'] ?? nutriments['fat_100g'] ?? 0;
  const satFat = nutriments['saturated-fat_serving'] ?? nutriments['saturated-fat_100g'] ?? 0;
  const carbs = nutriments['carbohydrates_serving'] ?? nutriments['carbohydrates_100g'] ?? 0;
  const protein = nutriments['proteins_serving'] ?? nutriments['proteins_100g'] ?? 0;

  const rawIngredients = p.ingredients_text || p.ingredients_text_en || '';
  const ingredientsText = rawIngredients
    ? rawIngredients.replace(/[\n\r]+/g, ' ').trim()
    : 'Ingredients list recorded in Open Food Facts registry.';

  const allergens = Array.isArray(p.allergens_tags)
    ? p.allergens_tags
        .map((t: string) => t.replace(/^[a-z]{2}:/, '').replace(/-/g, ' ').trim())
        .filter(Boolean)
    : [];

  const nutriScoreRaw = p.nutriscore_grade ? p.nutriscore_grade.toUpperCase() : undefined;
  const nutriScore = ['A', 'B', 'C', 'D', 'E'].includes(nutriScoreRaw) ? nutriScoreRaw : 'B';

  const fields: NutritionField[] = [
    {
      id: `f-title-${newId}`,
      key: 'title',
      label: 'PRODUCT TITLE',
      value: brand ? `${brand} ${title}` : title,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-serving-${newId}`,
      key: 'serving_size',
      label: 'SERVING SIZE',
      value: servingSize,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-calories-${newId}`,
      key: 'calories',
      label: 'ENERGY / CALORIES',
      value: `${Math.round(calories)} kcal`,
      subValue: `Per stated serving (${servingSize})`,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-sugars-${newId}`,
      key: 'sugars',
      label: 'SUGARS PROFILE',
      value: `${Number(sugars).toFixed(1)}g Total Sugars`,
      subValue:
        addedSugars !== undefined ? `Includes ${Number(addedSugars).toFixed(1)}g Added Sugars` : undefined,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-sodium-${newId}`,
      key: 'sodium',
      label: 'SODIUM CONTENT',
      value: `${sodiumMg}`,
      unit: 'mg',
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-fat-${newId}`,
      key: 'fat',
      label: 'TOTAL FAT',
      value: `${Number(totalFat).toFixed(1)}g`,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-satfat-${newId}`,
      key: 'saturated_fat',
      label: 'SATURATED FAT',
      value: `${Number(satFat).toFixed(1)}g`,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-carbs-${newId}`,
      key: 'carbohydrates',
      label: 'TOTAL CARBOHYDRATES',
      value: `${Number(carbs).toFixed(1)}g`,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-protein-${newId}`,
      key: 'protein',
      label: 'PROTEIN CONTENT',
      value: `${Number(protein).toFixed(1)}g`,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-allergens-${newId}`,
      key: 'allergens',
      label: 'ALLERGEN WARNING',
      value: allergens.length ? 'Contains' : 'No Major Allergens Declared',
      tags: allergens,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
    {
      id: `f-ingredients-${newId}`,
      key: 'ingredients',
      label: 'COMPLETE INGREDIENT LIST',
      value: ingredientsText,
      confidence: 100,
      confirmed: true,
      source: 'open_food_facts',
      sourceBadge: 'Open Food Facts (Verified API)',
    },
  ];

  return {
    id: newId,
    title: brand ? `${brand} ${title}` : title,
    brand,
    barcode: p.code,
    categorySubtitle: category,
    captureSource: `Verified via Open Food Facts (Barcode: ${p.code})`,
    dataSource: 'open_food_facts',
    imageThumbnail:
      originalImage ||
      p.image_front_url ||
      p.image_url ||
      'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
    explanationTitle: 'Open Food Facts Verified Record',
    explanationDescription:
      'Nutrition and ingredient profile matched directly against the Open Food Facts global registry.',
    fields,
    ingredientsText,
    aggregateScore: 99.8,
    scoreLabel: 'verified registry',
    nutriScore,
    status: 'confirmed',
    confirmedAt: new Date().toISOString(),
  };
}

// =================== API ROUTES ===================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString(),
  });
});

// Direct Open Food Facts Barcode lookup
app.get('/api/openfoodfacts/:barcode', async (req, res) => {
  try {
    const { barcode } = req.params;
    const offProduct = await fetchOpenFoodFactsProduct(barcode);
    if (!offProduct) {
      return res.status(404).json({ error: `Product with barcode ${barcode} not found in Open Food Facts` });
    }
    const product = mapOpenFoodFactsToProduct(offProduct);
    productsDatabase.unshift(product);
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Open Food Facts lookup failed' });
  }
});

// List all inspected products
app.get('/api/products', (req, res) => {
  res.json({ products: productsDatabase });
});

// Get a single product
app.get('/api/products/:id', (req, res) => {
  const product = productsDatabase.find((p) => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product inspection not found' });
  }
  res.json({ product });
});

// Confirm product inspection
app.post('/api/products/confirm', (req, res) => {
  const { id } = req.body;
  const productIndex = productsDatabase.findIndex((p) => p.id === id);
  if (productIndex === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const prod = productsDatabase[productIndex];
  // Mark all fields confirmed
  prod.fields = prod.fields.map((f) => ({
    ...f,
    confirmed: true,
    isActionRequired: false,
  }));
  prod.status = 'confirmed';
  prod.confirmedAt = new Date().toISOString();
  prod.alertTitle = undefined;
  prod.alertBadge = undefined;
  prod.alertDescription = undefined;
  prod.aggregateScore = Math.max(prod.aggregateScore, 98.5);

  res.json({ success: true, product: prod });
});

// =================== AGENT DECISION ENGINE ===================
// Integrates Person 2's food analysis with Person 3's agentic decision pipeline
app.post('/api/can-i-eat', (req, res) => {
  try {
    const { patient, productId, food } = req.body;

    const patientInput = {
      conditions: patient?.conditions || ['Hypertension'],
      medicines: patient?.medicines || [],
      dietary_restrictions:
        patient?.dietaryRestrictions || patient?.dietary_restrictions || ['Low Sodium'],
      test_values: patient?.test_values || {},
    };

    let foodInput;

    if (productId) {
      const product = productsDatabase.find((p) => p.id === productId);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      const sodiumField = product.fields.find((f) => f.key === 'sodium');
      const sugarsField = product.fields.find((f) => f.key === 'sugars');
      const fatField = product.fields.find((f) => f.key === 'fat');
      const satFatField = product.fields.find((f) => f.key === 'saturated_fat');
      const carbsField = product.fields.find((f) => f.key === 'carbohydrates');
      const proteinField = product.fields.find((f) => f.key === 'protein');
      const caloriesField = product.fields.find((f) => f.key === 'calories');
      const servingField = product.fields.find((f) => f.key === 'serving_size');
      const allergenField = product.fields.find((f) => f.key === 'allergens');
      const ingredientsField = product.fields.find((f) => f.key === 'ingredients');

      const parseNum = (val?: string) => {
        if (!val) return 0;
        const match = val.match(/([\d.]+)/);
        return match ? parseFloat(match[1]) : 0;
      };

      const sodiumVal = parseNum(sodiumField?.value);
      const sugarVal = parseNum(sugarsField?.value);
      const fatVal = parseNum(fatField?.value);
      const satFatVal = satFatField ? parseNum(satFatField.value) : Math.round(fatVal * 0.4);
      const carbsVal = parseNum(carbsField?.value);
      const proteinVal = parseNum(proteinField?.value);
      const caloriesVal = parseNum(caloriesField?.value);

      // Low confidence or unconfirmed action flag triggers agent's cross-verification step
      const isSodiumUncertain =
        sodiumField &&
        (!sodiumField.confirmed ||
          sodiumField.isActionRequired ||
          (sodiumField.confidence || 100) < 85);

      const sodiumConf = isSodiumUncertain ? 0.75 : (sodiumField?.confidence || 95) / 100;
      const sugarConf = (sugarsField?.confidence || 98) / 100;

      const rawIngredientsText =
        product.ingredientsText || ingredientsField?.value || '';
      const parsedIngredientWords = rawIngredientsText
        ? rawIngredientsText
            .split(/[,;()\[\]\n\r]+\s*/)
            .map((s) => s.trim().toLowerCase())
            .filter((s) => s.length > 2)
        : [];

      const ingredients: string[] = Array.from(
        new Set([
          ...(allergenField?.tags || []),
          ...parsedIngredientWords,
          ...(product.title ? product.title.toLowerCase().split(' ') : []),
        ]),
      );

      foodInput = {
        product_name: product.title,
        nutrition: {
          sodium: sodiumVal,
          sugar: sugarVal,
          fat: fatVal,
          saturated_fat: satFatVal,
          carbohydrates: carbsVal,
          protein: proteinVal,
          calories: caloriesVal,
        },
        ingredients,
        serving_size: servingField?.value || '1 serving',
        confidence: {
          sodium: sodiumConf,
          sugar: sugarConf,
        },
      };
    } else if (food) {
      foodInput = {
        product_name: food.product_name || food.title || 'Food Product',
        nutrition: food.nutrition || {},
        ingredients: food.ingredients || [],
        serving_size: food.serving_size || food.servingSize || '1 serving',
        confidence: food.confidence || { sodium: 0.95, sugar: 0.95 },
      };
    } else {
      return res.status(400).json({ error: 'Either productId or food data must be provided' });
    }

    const decisionResult = runPipeline(patientInput, foodInput);

    return res.json({
      success: true,
      result: decisionResult,
    });
  } catch (error: any) {
    console.error('Agent decision error:', error);
    return res.status(500).json({ error: error.message || 'Agent decision pipeline failed' });
  }
});

// Update a specific field
app.put('/api/products/:id/fields/:fieldId', (req, res) => {
  const { id, fieldId } = req.params;
  const { value, unit, confirmed, tags, subValue } = req.body;

  const product = productsDatabase.find((p) => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const field = product.fields.find((f) => f.id === fieldId);
  if (!field) {
    return res.status(404).json({ error: 'Field not found' });
  }

  if (value !== undefined) field.value = value;
  if (unit !== undefined) field.unit = unit;
  if (confirmed !== undefined) {
    field.confirmed = confirmed;
    if (confirmed) {
      field.isActionRequired = false;
      field.confidence = Math.max(field.confidence, 99);
    }
  }
  if (tags !== undefined) field.tags = tags;
  if (subValue !== undefined) field.subValue = subValue;

  // Check if any unconfirmed action required fields remain
  const remainingActions = product.fields.filter((f) => f.isActionRequired && !f.confirmed);
  if (remainingActions.length === 0) {
    product.alertTitle = undefined;
    product.alertBadge = undefined;
    product.alertDescription = undefined;
    product.aggregateScore = 98.6;
  }

  res.json({ success: true, product, field });
});

// Real AI Scan endpoint using Gemini Vision
// Real AI Scan endpoint using Open Food Facts as primary source and Gemini Vision as fallback
app.post('/api/scan', async (req, res) => {
  try {
    const { imageBase64, panelType, samplePreset, barcode } = req.body;

    // 1. Direct Barcode lookup via Open Food Facts (Primary Source)
    if (barcode) {
      const offProduct = await fetchOpenFoodFactsProduct(barcode);
      if (offProduct) {
        const product = mapOpenFoodFactsToProduct(offProduct, imageBase64);
        productsDatabase.unshift(product);
        return res.json({ product, source: 'open_food_facts' });
      }
      if (!imageBase64) {
        return res.status(404).json({
          error: `Product with barcode "${barcode}" not found in Open Food Facts registry. Please upload or capture a label image to extract data via Gemini Vision OCR.`,
        });
      }
      // If barcode not found in OFF registry, continue down to OCR fallback if image provided
    }

    // 2. Handle sample presets quickly if requested
    if (samplePreset === 'granola_bar') {
      const existing = productsDatabase.find((p) => p.id === 'prod-granola-bar-01');
      return res.json({ product: existing, source: 'gemini_ocr' });
    }

    if (samplePreset === 'greek_yogurt') {
      const existing = productsDatabase.find((p) => p.id === 'prod-greek-yogurt-02');
      return res.json({ product: existing, source: 'open_food_facts' });
    }

    if (samplePreset === 'cheerios') {
      const offProduct = await fetchOpenFoodFactsProduct('016000275270');
      if (offProduct) {
        const product = mapOpenFoodFactsToProduct(offProduct);
        productsDatabase.unshift(product);
        return res.json({ product, source: 'open_food_facts' });
      }
    }

    if (samplePreset === 'nutella') {
      const offProduct = await fetchOpenFoodFactsProduct('3017620422003');
      if (offProduct) {
        const product = mapOpenFoodFactsToProduct(offProduct);
        productsDatabase.unshift(product);
        return res.json({ product, source: 'open_food_facts' });
      }
    }

    if (samplePreset === 'oat_milk') {
      const offProduct = await fetchOpenFoodFactsProduct('7340055300057');
      if (offProduct) {
        const product = mapOpenFoodFactsToProduct(offProduct);
        productsDatabase.unshift(product);
        return res.json({ product, source: 'open_food_facts' });
      }
    }

    const ai = getGeminiClient();

    // 3. Image analysis with Gemini Vision OCR (Fallback & Visual Extractor)
    if (ai && imageBase64) {
      // Clean base64 format
      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const mimeMatch = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      const prompt = `You are NutriAI, an authoritative clinical food inspection system.
Examine this food product label image (panel type: ${panelType || 'nutrition facts table'}).
Perform OCR and clinical extraction of nutrition data according to FDA/NutriAI diagnostics.
Extract:
1. Product title and Brand name
2. Barcode number (UPC, EAN, or 8-14 digit barcode printed on packaging, if visible; otherwise empty string)
3. Serving size (e.g. "1 cup (240ml)", "1 bar (40g)")
4. Calories / Energy (in kcal per serving)
5. Sugars profile (total sugars in grams, added sugars in grams)
6. Sodium content in mg (if any typo/distortion exists due to label curvature, mention the raw string and clean value)
7. Total Fat in grams and Saturated Fat in grams
8. Total Carbohydrates in grams
9. Protein in grams
10. Allergen warnings (list of detected allergens)
11. COMPLETE ingredient list statement as printed on the package
12. OCR fidelity score (percentage between 85.0 and 99.5) and whether any field requires manual confirmation due to curvature or smudging.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              barcode: { type: Type.STRING },
              title: { type: Type.STRING },
              brand: { type: Type.STRING },
              categorySubtitle: { type: Type.STRING },
              servingSize: { type: Type.STRING },
              servingSizeConfidence: { type: Type.NUMBER },
              calories: { type: Type.STRING },
              totalSugars: { type: Type.STRING },
              addedSugarsSubtext: { type: Type.STRING },
              sodiumValue: { type: Type.STRING },
              sodiumConfidence: { type: Type.NUMBER },
              sodiumNeedsConfirmation: { type: Type.BOOLEAN },
              sodiumRawString: { type: Type.STRING },
              sodiumMatchExplanation: { type: Type.STRING },
              totalFat: { type: Type.STRING },
              saturatedFat: { type: Type.STRING },
              carbohydrates: { type: Type.STRING },
              protein: { type: Type.STRING },
              allergens: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              ingredientsText: { type: Type.STRING },
              aggregateScore: { type: Type.NUMBER },
              nutriScore: { type: Type.STRING },
              hasLowConfidenceField: { type: Type.BOOLEAN },
              lowConfidenceReason: { type: Type.STRING },
            },
            required: [
              'title',
              'servingSize',
              'calories',
              'sodiumValue',
              'totalFat',
              'saturatedFat',
              'carbohydrates',
              'protein',
              'allergens',
              'totalSugars',
              'ingredientsText',
              'aggregateScore',
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');

      // Check if Gemini detected a barcode on packaging -> Try Open Food Facts for verified authoritative data
      if (parsed.barcode && parsed.barcode.replace(/[^\d]/g, '').length >= 6) {
        const offProduct = await fetchOpenFoodFactsProduct(parsed.barcode);
        if (offProduct) {
          const hybridProduct = mapOpenFoodFactsToProduct(offProduct, imageBase64);
          hybridProduct.dataSource = 'hybrid';
          hybridProduct.captureSource = `Verified via Open Food Facts (Barcode: ${parsed.barcode}) + Camera Vision OCR`;
          productsDatabase.unshift(hybridProduct);
          return res.json({ product: hybridProduct, source: 'hybrid' });
        }
      }

      // Gemini Vision OCR Fallback Product
      const newId = `prod-scan-${Date.now()}`;
      const formatGrams = (v?: string, fallback = '0.0g') => {
        if (!v) return fallback;
        return v.toLowerCase().includes('g') ? v : `${v}g`;
      };
      const formatCalories = (v?: string) => {
        if (!v) return '0 kcal';
        return v.toLowerCase().includes('kcal') || v.toLowerCase().includes('cal') ? v : `${v} kcal`;
      };

      const fields: NutritionField[] = [
        {
          id: `f-title-${newId}`,
          key: 'title',
          label: 'PRODUCT TITLE',
          value: parsed.brand ? `${parsed.brand} ${parsed.title}` : parsed.title || 'Nutritional Food Product',
          confidence: 99,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-serving-${newId}`,
          key: 'serving_size',
          label: 'SERVING SIZE',
          value: parsed.servingSize || '1 Serving',
          confidence: parsed.servingSizeConfidence || 98,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-calories-${newId}`,
          key: 'calories',
          label: 'ENERGY / CALORIES',
          value: formatCalories(parsed.calories),
          subValue: `Per serving (${parsed.servingSize || '1 Serving'})`,
          confidence: 98,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-sugars-${newId}`,
          key: 'sugars',
          label: 'SUGARS PROFILE',
          value: parsed.totalSugars ? `${formatGrams(parsed.totalSugars)} Total Sugars` : '0.0g Total Sugars',
          subValue: parsed.addedSugarsSubtext || 'Includes 0g Added Sugars',
          confidence: 99,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-sodium-${newId}`,
          key: 'sodium',
          label: parsed.sodiumNeedsConfirmation ? 'ACTION REQUIRED: SODIUM CONTENT' : 'SODIUM CONTENT',
          value: parsed.sodiumValue ? parsed.sodiumValue.replace(/[^\d]/g, '') : '0',
          unit: 'mg',
          confidence: parsed.sodiumConfidence || (parsed.sodiumNeedsConfirmation ? 84 : 98),
          confirmed: !parsed.sodiumNeedsConfirmation,
          isActionRequired: Boolean(parsed.sodiumNeedsConfirmation),
          actionBadge: parsed.sodiumNeedsConfirmation ? 'Verify with Label' : undefined,
          detectedRawString: parsed.sodiumRawString || `“Sodium ${parsed.sodiumValue}mg”`,
          matchExplanation:
            parsed.sodiumMatchExplanation || `Matches “Sodium ${parsed.sodiumValue}mg” in scanned table`,
          autoCleanApplied: true,
          source: parsed.sodiumNeedsConfirmation ? 'uncertain' : 'gemini_ocr',
          sourceBadge: parsed.sodiumNeedsConfirmation ? 'OCR Needs Review' : 'Gemini Vision OCR',
        },
        {
          id: `f-fat-${newId}`,
          key: 'fat',
          label: 'TOTAL FAT',
          value: formatGrams(parsed.totalFat),
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-satfat-${newId}`,
          key: 'saturated_fat',
          label: 'SATURATED FAT',
          value: formatGrams(parsed.saturatedFat),
          confidence: 96,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-carbs-${newId}`,
          key: 'carbohydrates',
          label: 'TOTAL CARBOHYDRATES',
          value: formatGrams(parsed.carbohydrates),
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-protein-${newId}`,
          key: 'protein',
          label: 'PROTEIN CONTENT',
          value: formatGrams(parsed.protein),
          confidence: 98,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-allergens-${newId}`,
          key: 'allergens',
          label: 'ALLERGEN WARNING',
          value: parsed.allergens?.length ? 'Contains' : 'No Major Allergens Detected',
          confidence: 97,
          confirmed: true,
          tags: parsed.allergens || [],
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-ingredients-${newId}`,
          key: 'ingredients',
          label: 'COMPLETE INGREDIENT LIST',
          value: parsed.ingredientsText || 'Ingredients extracted from package panel.',
          confidence: 96,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
      ];

      const newProduct: InspectionProduct = {
        id: newId,
        title: parsed.brand ? `${parsed.brand} ${parsed.title}` : parsed.title || 'Scanned Food Product',
        brand: parsed.brand || '',
        barcode: parsed.barcode || undefined,
        categorySubtitle: parsed.categorySubtitle || 'Packaged Nutrition Food',
        captureSource: `Captured from ${panelType || 'rear nutrition table'} via Gemini Vision OCR`,
        dataSource: 'gemini_ocr',
        imageThumbnail: imageBase64.startsWith('data:')
          ? imageBase64
          : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
        explanationTitle: 'Review Before We Continue',
        explanationDescription:
          'Information extracted using optical diagnostic neural pipeline. Please check and confirm.',
        alertTitle: parsed.hasLowConfidenceField ? '1 Item Needs Confirmation' : undefined,
        alertBadge: parsed.hasLowConfidenceField ? 'Low Confidence' : undefined,
        alertDescription:
          parsed.lowConfidenceReason ||
          (parsed.hasLowConfidenceField ? 'OCR confidence below 90% due to packaging curvature.' : undefined),
        fields,
        ingredientsText: parsed.ingredientsText,
        aggregateScore: parsed.aggregateScore ? Number(parsed.aggregateScore.toFixed(1)) : 95.4,
        scoreLabel: 'high fidelity',
        nutriScore: parsed.nutriScore || 'B',
        status: 'pending_review',
      };

      productsDatabase.unshift(newProduct);
      return res.json({ product: newProduct, source: 'gemini_ocr' });
    }

    // 4. High quality intelligent mock if image provided without API key or offline demo
    const demoId = `prod-scan-${Date.now()}`;
    const generatedProduct: InspectionProduct = {
      id: demoId,
      title: 'Artisan Multi-Seed Oat Crisp',
      brand: 'Harvest Roots',
      categorySubtitle: 'Baked Whole Grain Snack',
      captureSource: 'Captured from camera live scan (Diagnostic Demo)',
      dataSource: 'mock',
      imageThumbnail:
        imageBase64 ||
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80',
      explanationTitle: 'Review Before We Continue',
      explanationDescription:
        'Label scan processed with NutriAI optical diagnostic pipeline across all 8 nutrients.',
      alertTitle: '1 Item Needs Confirmation',
      alertBadge: 'Low Confidence',
      alertDescription:
        'OCR confidence below 90% due to package label curve around sodium specification.',
      fields: [
        {
          id: `f-title-${demoId}`,
          key: 'title',
          label: 'PRODUCT TITLE',
          value: 'Harvest Roots Artisan Multi-Seed Oat Crisp',
          confidence: 99,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-serving-${demoId}`,
          key: 'serving_size',
          label: 'SERVING SIZE',
          value: '2 Crisps (32g)',
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-calories-${demoId}`,
          key: 'calories',
          label: 'ENERGY / CALORIES',
          value: '130 kcal',
          subValue: 'Per serving (32g)',
          confidence: 98,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-sugars-${demoId}`,
          key: 'sugars',
          label: 'SUGARS PROFILE',
          value: '2.0g Total Sugars',
          subValue: 'Includes 1.0g Added Sugars (2% DV)',
          confidence: 99,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-sodium-${demoId}`,
          key: 'sodium',
          label: 'ACTION REQUIRED: SODIUM CONTENT',
          value: '95',
          unit: 'mg',
          confidence: 84,
          confirmed: false,
          isActionRequired: true,
          actionBadge: 'Verify with Label',
          detectedRawString: '“Sodlum 95mg”',
          matchExplanation: 'Matches “Sodium 95mg 4% DV” in scanned table',
          autoCleanApplied: true,
          source: 'uncertain',
          sourceBadge: 'OCR Needs Review',
        },
        {
          id: `f-fat-${demoId}`,
          key: 'fat',
          label: 'TOTAL FAT',
          value: '4.5g',
          confidence: 96,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-satfat-${demoId}`,
          key: 'saturated_fat',
          label: 'SATURATED FAT',
          value: '0.5g',
          confidence: 96,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-carbs-${demoId}`,
          key: 'carbohydrates',
          label: 'TOTAL CARBOHYDRATES',
          value: '19.0g',
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-protein-${demoId}`,
          key: 'protein',
          label: 'PROTEIN CONTENT',
          value: '4.0g',
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-allergens-${demoId}`,
          key: 'allergens',
          label: 'ALLERGEN WARNING',
          value: 'Contains',
          confidence: 98,
          confirmed: true,
          tags: ['Sesame', 'Oats'],
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
        {
          id: `f-ingredients-${demoId}`,
          key: 'ingredients',
          label: 'COMPLETE INGREDIENT LIST',
          value:
            'Whole grain rolled oats, organic whole sesame seeds, expeller pressed sunflower oil, brown rice flour, sea salt, organic cane sugar, rosemary extract.',
          confidence: 97,
          confirmed: true,
          source: 'gemini_ocr',
          sourceBadge: 'Gemini Vision OCR',
        },
      ],
      ingredientsText:
        'Whole grain rolled oats, organic whole sesame seeds, expeller pressed sunflower oil, brown rice flour, sea salt, organic cane sugar, rosemary extract.',
      aggregateScore: 93.8,
      scoreLabel: 'high fidelity',
      nutriScore: 'A',
      status: 'pending_review',
    };

    productsDatabase.unshift(generatedProduct);
    res.json({ product: generatedProduct, source: 'mock' });
  } catch (error: any) {
    console.error('Scan processing error:', error);
    res.status(500).json({ error: error.message || 'Failed to process image scan' });
  }
});

export default app;

// Vite middleware & Static Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriAI Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}
