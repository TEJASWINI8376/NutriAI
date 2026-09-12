import { investigate, InvestigationResult } from './investigator';
import { verify, VerificationResult } from './food-verifier';
import { checkMedicineContext, MedicineResult } from './medicine-context';
import { assess, RuleResult } from './rule-engine';
import { generateExplanation, DecisionExplanation } from './explanation';

export interface AgentTimelineStep {
  step: string;
  status: string;
  details: string[];
}

export interface PipelineResult extends DecisionExplanation {
  agentTimeline: AgentTimelineStep[];
  medicineContext: MedicineResult;
}

interface PatientInput {
  conditions: string[];
  medicines: string[];
  dietary_restrictions: string[];
  test_values?: Record<string, number>;
}

interface FoodInput {
  product_name: string;
  nutrition: Record<string, number>;
  ingredients: string[];
  serving_size?: string;
  confidence: Record<string, number>;
}

export function runPipeline(patient: PatientInput, food: FoodInput): PipelineResult {
  // STEP 1 — Agent Investigation
  const investigation: InvestigationResult = investigate(patient, food);

  // STEP 2 — Verification
  const verification: VerificationResult = verify(food, investigation);

  // STEP 3 — Medicine Context
  const medicineResult: MedicineResult = checkMedicineContext(
    patient.medicines || [],
    verification.ingredients,
  );

  // STEP 4 — Rule-Based Assessment
  const ruleResult: RuleResult = assess(
    patient,
    { verifiedNutrition: verification.verifiedNutrition, ingredients: verification.ingredients },
    medicineResult,
  );

  // STEP 5 — Explainable Result
  const explanation: DecisionExplanation = generateExplanation(
    patient as unknown as Record<string, unknown>,
    food as unknown as Record<string, unknown>,
    verification,
    ruleResult,
    medicineResult,
  );

  // Agent Activity Timeline
  const agentTimeline: AgentTimelineStep[] = [
    {
      step: 'Agent Investigation',
      status: 'completed',
      details: investigation.actions,
    },
    {
      step: 'Information Verification',
      status: verification.verificationStatus,
      details: verification.verificationActions.length
        ? verification.verificationActions
        : ['All extracted values passed confidence threshold.'],
    },
    {
      step: 'Medicine Context Check',
      status: 'completed',
      details: medicineResult.medicinesChecked.length
        ? medicineResult.medicinesChecked
        : ['No known medicine-food interaction check was triggered.'],
    },
    {
      step: 'Rule-Based Assessment',
      status: 'completed',
      details: ruleResult.rulesApplied.length
        ? ruleResult.rulesApplied
        : ['No condition-specific rules were triggered.'],
    },
    {
      step: 'Final Decision',
      status: 'completed',
      details: [explanation.decisionText],
    },
  ];

  return {
    ...explanation,
    agentTimeline,
    medicineContext: medicineResult,
  };
}
