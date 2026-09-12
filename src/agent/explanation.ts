import { EVIDENCE } from './evidence-data';
import { RuleResult } from './rule-engine';
import { MedicineResult } from './medicine-context';
import { VerificationResult } from './food-verifier';

export interface DecisionExplanation {
  food: string;
  decision: string;
  decisionText: string;
  reasons: string[];
  rulesApplied: string[];
  verificationNotes: string[];
  medicineNotes: string[];
  evidence: Array<{
    rule: string;
    title: string;
    source: string;
    url: string;
    description: string;
  }>;
  healthierAlternatives?: string[];
  uncertaintyWarnings?: string[];
  disclaimer: string;
}

const DECISION_TEXT: Record<string, string> = {
  GENERALLY_SUITABLE: 'Generally suitable',
  CONSUME_WITH_CAUTION: 'Consume with caution',
  HIGHER_CONCERN: 'Higher concern / clinical confirmation',
};

export function generateExplanation(
  patient: Record<string, unknown>,
  food: Record<string, unknown>,
  verification: VerificationResult,
  ruleResult: RuleResult,
  medicineResult?: MedicineResult | null,
): DecisionExplanation {
  const { decision, concerns, rulesApplied: baseRules } = ruleResult;
  const rulesApplied = [...baseRules];

  // If verified against Open Food Facts, include evidence rule
  if (verification.sourceApi?.status === 'found' && !rulesApplied.includes('open_food_facts_verification')) {
    rulesApplied.push('open_food_facts_verification');
  }

  // Build reasons
  const reasons: string[] = [];
  for (const concern of concerns) {
    reasons.push(concern.message);
  }
  if (reasons.length === 0) {
    reasons.push(
      'No major concern was identified from the available information and applied rules.',
    );
  }

  // Evidence
  const evidence: DecisionExplanation['evidence'] = [];
  for (const rule of rulesApplied) {
    if (rule in EVIDENCE) {
      const e = EVIDENCE[rule];
      evidence.push({ rule, title: e.title, source: e.source, url: e.url, description: e.description });
    }
  }

  // Verification notes
  const verificationNotes: string[] = [];

  if (verification.sourceApi?.status === 'found') {
    verificationNotes.push(
      `Cross-verified with Open Food Facts global registry (${verification.sourceApi.barcode || 'Barcode record'}).`,
    );
  }

  for (const conflict of verification.conflicts) {
    verificationNotes.push(
      `${conflict.field} OCR value (${conflict.ocrValue}) conflicted with registry data. Agent adapted by substituting verified value (${conflict.verifiedValue}).`,
    );
  }

  for (const warning of verification.uncertaintyWarnings) {
    verificationNotes.push(warning);
  }

  if (verificationNotes.length === 0) {
    verificationNotes.push('All nutrient values passed OCR confidence thresholds and verification checks.');
  }

  // Medicine notes
  const medicineNotes: string[] = [];
  if (medicineResult) {
    for (const interaction of medicineResult.possibleInteractions) {
      medicineNotes.push(interaction.message);
    }
  }
  if (medicineNotes.length === 0) {
    medicineNotes.push(
      'No known food-medicine interaction was identified from the available interaction data.',
    );
  }

  // Healthier alternatives recommendations (Optional Person 3 requirement)
  const healthierAlternatives: string[] = [];
  for (const concern of concerns) {
    if (concern.type === 'sugar') {
      healthierAlternatives.push(
        'Lower-Sugar Alternative: Consider minimally processed whole-grain options (e.g. plain steel-cut oats, unsweetened yogurt with fresh fruit) with <5g added sugar per serving.',
      );
    }
    if (concern.type === 'sodium') {
      healthierAlternatives.push(
        'Lower-Sodium Alternative: Choose FDA-defined low-sodium foods (<140mg per serving), unsalted nut butter, or fresh produce to assist with blood pressure control.',
      );
    }
    if (concern.type === 'saturated_fat') {
      healthierAlternatives.push(
        'Heart-Healthy Alternative: Replace high-saturated-fat items with foods containing monounsaturated or polyunsaturated fats (e.g., chia seeds, walnuts, olive oil).',
      );
    }
    if (concern.type === 'medicine_food_interaction') {
      healthierAlternatives.push(
        'Medication Spacing: Speak with your pharmacist about timing intervals between food consumption and prescription doses.',
      );
    }
  }

  return {
    food: (food.product_name as string) || 'Unknown food',
    decision,
    decisionText: DECISION_TEXT[decision] || decision,
    reasons,
    rulesApplied,
    verificationNotes,
    medicineNotes,
    evidence,
    healthierAlternatives: healthierAlternatives.length > 0 ? healthierAlternatives : undefined,
    uncertaintyWarnings: verification.uncertaintyWarnings.length > 0 ? verification.uncertaintyWarnings : undefined,
    disclaimer:
      'This is dietary decision support and does not diagnose disease or replace advice from a healthcare professional.',
  };
}
