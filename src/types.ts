export type NutritionFieldKey =
  | 'title'
  | 'serving_size'
  | 'calories'
  | 'sugars'
  | 'sodium'
  | 'fat'
  | 'saturated_fat'
  | 'carbohydrates'
  | 'protein'
  | 'allergens'
  | 'ingredients'
  | 'custom';

export interface NutritionField {
  id: string;
  key: NutritionFieldKey;
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

export interface InspectionProduct {
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
  nutriScore?: 'A' | 'B' | 'C' | 'D' | 'E';
  confirmedAt?: string;
  status: 'pending_review' | 'confirmed';
}

export interface ScanRequest {
  image?: string; // base64
  panelType?: 'rear_nutrition' | 'front_packaging' | 'allergen_statement';
  sampleId?: string;
}

// =================== Patient Profile ===================

export interface PatientProfile {
  conditions: string[];
  medicines: string[];
  dietaryRestrictions: string[];
}

// =================== Decision Result ===================

export interface AgentTimelineStep {
  step: string;
  status: string;
  details: string[];
}

export interface EvidenceItem {
  rule: string;
  title: string;
  source: string;
  url: string;
  description: string;
}

export interface DecisionResult {
  food: string;
  decision: 'GENERALLY_SUITABLE' | 'CONSUME_WITH_CAUTION' | 'HIGHER_CONCERN';
  decisionText: string;
  reasons: string[];
  rulesApplied: string[];
  verificationNotes: string[];
  medicineNotes: string[];
  evidence: EvidenceItem[];
  agentTimeline: AgentTimelineStep[];
  disclaimer: string;
}
