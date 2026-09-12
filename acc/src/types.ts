export type AppScreen = 'signup_step1' | 'signup_step2' | 'login' | 'dashboard';

export interface UserProfile {
  id: string;
  fullName: string;
  contact: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  createdAt: string;
  step2Completed: boolean;
  medicalProfile?: {
    primaryPhysician: string;
    dietaryPreferences: string[];
    allergies: string[];
    dailyCalorieTarget: number;
    targetWeight: string;
    bloodType: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    notes?: string;
  };
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  text: string;
  timestamp: string;
}

export interface VitalMetric {
  value: number | string;
  unit: string;
  status: string;
  change?: string;
}

export interface TelemetryData {
  heartRate: VitalMetric;
  bloodGlucose: VitalMetric;
  bloodPressure: {
    systolic: number;
    diastolic: number;
    unit: string;
    status: string;
  };
  hydration: {
    currentLiters: number;
    targetLiters: number;
    unit: string;
    status: string;
  };
  calories: {
    consumed: number;
    target: number;
    protein: string;
    carbs: string;
    fats: string;
  };
}

export interface MedicationItem {
  id: string;
  name: string;
  dose: string;
  time: string;
  status: 'Taken' | 'Pending' | 'Scheduled';
  badge: string;
}

export interface VerifiedDocument {
  id: string;
  title: string;
  date: string;
  doctor: string;
  status: 'Verified' | 'Encrypted' | 'Reviewing';
}
