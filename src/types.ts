export interface NutritionField {
  id: string;
  key: 'title' | 'serving_size' | 'sodium' | 'allergens' | 'sugars' | 'calories' | 'protein' | 'fat' | 'custom';
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
}

export interface InspectionProduct {
  id: string;
  title: string;
  categorySubtitle: string;
  captureSource: string;
  imageThumbnail: string;
  explanationTitle: string;
  explanationDescription: string;
  alertTitle?: string;
  alertBadge?: string;
  alertDescription?: string;
  fields: NutritionField[];
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
