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
  const { decision, concerns, rulesApplied } = ruleResult;

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
  for (const conflict of verification.conflicts) {
    verificationNotes.push(
      `${conflict.field} was uncertain in OCR. Original value: ${conflict.ocrValue}; verified value: ${conflict.verifiedValue}.`,
    );
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

  return {
    food: (food.product_name as string) || 'Unknown food',
    decision,
    decisionText: DECISION_TEXT[decision] || decision,
    reasons,
    rulesApplied,
    verificationNotes,
    medicineNotes,
    evidence,
    disclaimer:
      'This is dietary decision support and does not diagnose disease or replace advice from a healthcare professional.',
  };
}
