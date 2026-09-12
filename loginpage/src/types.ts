export type UserRole = 'patient' | 'physician' | 'administrator';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  mrn: string; // Medical Record Number (e.g., CP-849201)
  dateOfBirth?: string;
  bloodType?: string;
  allergies?: string[];
  createdAt: string;
}

export type VitalStatus = 'optimal' | 'normal' | 'elevated' | 'critical';

export interface VitalRecord {
  id: string;
  userId: string;
  type: 'heartRate' | 'bloodPressure' | 'oxygen' | 'glucose' | 'temperature';
  label: string;
  value: string;
  numericValue: number;
  unit: string;
  status: VitalStatus;
  recordedAt: string;
  trend: 'up' | 'down' | 'stable';
  history: { time: string; value: number }[];
}

export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'cancelled';
export type AppointmentType = 'In-Clinic' | 'Telehealth Video' | 'Diagnostic Follow-up';

export interface Appointment {
  id: string;
  userId: string;
  doctorName: string;
  doctorRole: string;
  doctorAvatar: string;
  department: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. "10:30 AM"
  type: AppointmentType;
  status: AppointmentStatus;
  location: string;
  notes?: string;
}

export type RecordCategory = 'Laboratory' | 'Diagnostic Imaging' | 'Cardiology' | 'Vaccination' | 'Clinical Notes';

export interface MedicalRecordMetric {
  name: string;
  value: string;
  normalRange: string;
  status: 'normal' | 'abnormal';
}

export interface MedicalRecord {
  id: string;
  userId: string;
  title: string;
  category: RecordCategory;
  facility: string;
  doctorName: string;
  date: string;
  verificationStatus: 'Verified' | 'Pending Review';
  verificationHash: string;
  summary: string;
  metrics?: MedicalRecordMetric[];
}

export interface Medication {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  instructions: string;
  doctorName: string;
  refillsRemaining: number;
  adherenceToday: Record<string, boolean>;
}

export interface CareTeamMember {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  isOnline: boolean;
  hospital: string;
  quote?: string;
}

export interface GatewayStatus {
  online: boolean;
  latencyMs: number;
  encryption: string;
  phiCertified: boolean;
  lastSync: string;
  activeNode: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  message?: string;
}
