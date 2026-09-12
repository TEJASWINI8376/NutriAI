export interface MedicalValue {
  name: string;
  value: string | number;
  unit?: string;
  referenceRange?: string;
  status: 'normal' | 'abnormal' | 'borderline' | 'pending';
}

export interface ReviewItem {
  id: string;
  field: string;
  ocrCandidate: string;
  alternativeCandidate: string;
  confidence: string;
  context: string;
  confirmedValue: string | null;
}

export type ReportCategory = 'Laboratory' | 'Diagnostics' | 'Clinical Summary' | 'Radiology Scan' | 'Prescription';
export type ReportStatus = 'Verified' | 'Needs Review' | 'Processing';

export interface MedicalReport {
  id: string;
  title: string;
  facility: string;
  date: string;
  category: ReportCategory;
  fileSize?: string;
  pages?: string;
  status: ReportStatus;
  verifiedDate?: string;
  verifiedBy?: string;
  summary: string;
  warning?: string;
  reviewItems?: ReviewItem[];
  processingTask?: string;
  progress?: number;
  values?: MedicalValue[];
  doctorName?: string;
  dicomMetadata?: {
    modality: string;
    seriesNumber: string;
    kvp: string;
    exposure: string;
    resolution: string;
  };
  fileUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'physician';
  avatarUrl: string;
  nutriAiId: string;
  verifiedVault: boolean;
  vaultEncryption: string;
  bloodType: string;
  allergies: string[];
  lastSync: string;
}

export interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  prescribedBy: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'paused';
  instructions: string;
  refillsRemaining: number;
}

export interface HealthVital {
  id: string;
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'elevated' | 'optimal';
  trend: 'up' | 'down' | 'stable';
  lastRecorded: string;
}
