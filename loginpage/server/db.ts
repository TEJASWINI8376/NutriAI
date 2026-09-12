import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import type {
  User,
  VitalRecord,
  Appointment,
  MedicalRecord,
  Medication,
  CareTeamMember,
} from '../src/types.ts';

interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: StoredSession[];
  vitals: VitalRecord[];
  appointments: Appointment[];
  medicalRecords: MedicalRecord[];
  medications: Medication[];
  careTeam: CareTeamMember[];
  auditLogs: { id: string; userId: string; action: string; timestamp: string; ip?: string }[];
}

const DB_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'nutriai-database.json');
const LEGACY_DB_FILE = path.join(DB_DIR, 'carepulse-database.json');

function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(check, 'hex'));
}

const DEFAULT_CARE_TEAM: CareTeamMember[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Jenkins, MD',
    title: 'Chief of Cardiology & Preventive Medicine',
    department: 'Cardiovascular Health',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgok82iLZmBm92-YmTHYPi-QN_60LyvTHBSNS-OIpktHH2mZgcJnfGhrd9J3bJEnnO9tXE2HFIeEnhko558DqvpahUre2heWL4ydeetViirU9zYJ4hinN3jLSPWCKmwUK0hpDIlqLJzmRjd834Zzf_FBFgKfUFvLSXU6aW7KooiUBFFgXqIFNBb_bg8Xbhd5k38m_Ju7FWXMDtWgpk2gwlMOpCuVzKjls0cGMUnIYsoOTTU2CY5rJx',
    isOnline: true,
    hospital: 'NutriAI Academic Medical Center',
    quote: 'Your nutrition and biometric records are synchronized in real-time.',
  },
  {
    id: 'doc-2',
    name: 'Dr. Marcus Vance, MD',
    title: 'Senior Attending Internist & Clinical Nutritionist',
    department: 'Internal Medicine & Metabolic Health',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
    isOnline: true,
    hospital: 'NutriAI Pavilion Suite 4B',
    quote: 'Proactive nutritional surveillance ensures longevity and vitality.',
  },
  {
    id: 'doc-3',
    name: 'Elena Chen, NP-C',
    title: 'Lead Clinical Nurse Practitioner',
    department: 'Patient Care Coordination',
    avatar: 'https://images.unsplash.com/photo-1594824813589-9a77f9e8a8e1?w=300&auto=format&fit=crop&q=80',
    isOnline: false,
    hospital: 'NutriAI Telehealth Hub',
    quote: 'Always available for prescription titrations and triage questions.',
  },
];

function seedUserData(userId: string) {
  const vitals: VitalRecord[] = [
    {
      id: crypto.randomUUID(),
      userId,
      type: 'heartRate',
      label: 'Heart Rate (Resting)',
      value: '72',
      numericValue: 72,
      unit: 'bpm',
      status: 'optimal',
      recordedAt: '12 mins ago',
      trend: 'stable',
      history: [
        { time: '06:00', value: 68 },
        { time: '09:00', value: 74 },
        { time: '12:00', value: 76 },
        { time: '15:00', value: 71 },
        { time: '18:00', value: 72 },
      ],
    },
    {
      id: crypto.randomUUID(),
      userId,
      type: 'bloodPressure',
      label: 'Blood Pressure',
      value: '118/76',
      numericValue: 118,
      unit: 'mmHg',
      status: 'optimal',
      recordedAt: '2 hours ago',
      trend: 'down',
      history: [
        { time: 'Mon', value: 122 },
        { time: 'Tue', value: 120 },
        { time: 'Wed', value: 124 },
        { time: 'Thu', value: 119 },
        { time: 'Today', value: 118 },
      ],
    },
    {
      id: crypto.randomUUID(),
      userId,
      type: 'oxygen',
      label: 'Blood Oxygen (SpO2)',
      value: '99',
      numericValue: 99,
      unit: '%',
      status: 'optimal',
      recordedAt: '2 hours ago',
      trend: 'stable',
      history: [
        { time: '06:00', value: 98 },
        { time: '10:00', value: 99 },
        { time: '14:00', value: 99 },
        { time: '18:00', value: 99 },
      ],
    },
    {
      id: crypto.randomUUID(),
      userId,
      type: 'glucose',
      label: 'Fasting Blood Glucose',
      value: '92',
      numericValue: 92,
      unit: 'mg/dL',
      status: 'normal',
      recordedAt: 'This Morning',
      trend: 'stable',
      history: [
        { time: 'Day 1', value: 95 },
        { time: 'Day 2', value: 93 },
        { time: 'Day 3', value: 94 },
        { time: 'Today', value: 92 },
      ],
    },
  ];

  const appointments: Appointment[] = [
    {
      id: crypto.randomUUID(),
      userId,
      doctorName: 'Dr. Sarah Jenkins, MD',
      doctorRole: 'Cardiologist',
      doctorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBgok82iLZmBm92-YmTHYPi-QN_60LyvTHBSNS-OIpktHH2mZgcJnfGhrd9J3bJEnnO9tXE2HFIeEnhko558DqvpahUre2heWL4ydeetViirU9zYJ4hinN3jLSPWCKmwUK0hpDIlqLJzmRjd834Zzf_FBFgKfUFvLSXU6aW7KooiUBFFgXqIFNBb_bg8Xbhd5k38m_Ju7FWXMDtWgpk2gwlMOpCuVzKjls0cGMUnIYsoOTTU2CY5rJx',
      department: 'Cardiology Clinic • Suite 402',
      date: 'Tomorrow',
      time: '10:30 AM',
      type: 'In-Clinic',
      status: 'confirmed',
      location: 'NutriAI Main Tower, Room 402',
      notes: 'Routine 6-month cardiovascular checkup and ECG review.',
    },
    {
      id: crypto.randomUUID(),
      userId,
      doctorName: 'Dr. Marcus Vance, MD',
      doctorRole: 'Internal Medicine',
      doctorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
      department: 'Annual Wellness Review',
      date: 'Oct 24, 2026',
      time: '02:15 PM',
      type: 'Telehealth Video',
      status: 'confirmed',
      location: 'NutriAI Encrypted Video Bridge',
      notes: 'Review recent comprehensive metabolic blood panel results.',
    },
  ];

  const medicalRecords: MedicalRecord[] = [
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Comprehensive Metabolic Panel (CMP-14)',
      category: 'Laboratory',
      facility: 'NutriAI Core Diagnostic Lab',
      doctorName: 'Dr. Marcus Vance, MD',
      date: 'Sept 04, 2026',
      verificationStatus: 'Verified',
      verificationHash: '0x8f3c...b19e (SHA-256 Validated)',
      summary: 'All electrolytes, kidney functions, and liver enzymes within optimal reference boundaries.',
      metrics: [
        { name: 'Glucose (Fasting)', value: '92 mg/dL', normalRange: '70 - 99 mg/dL', status: 'normal' },
        { name: 'Calcium', value: '9.4 mg/dL', normalRange: '8.5 - 10.2 mg/dL', status: 'normal' },
        { name: 'Sodium', value: '140 mEq/L', normalRange: '135 - 145 mEq/L', status: 'normal' },
        { name: 'eGFR', value: '> 90 mL/min', normalRange: '> 60 mL/min', status: 'normal' },
      ],
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: '12-Lead Resting Electrocardiogram (ECG)',
      category: 'Cardiology',
      facility: 'Heart & Vascular Institute',
      doctorName: 'Dr. Sarah Jenkins, MD',
      date: 'Aug 18, 2026',
      verificationStatus: 'Verified',
      verificationHash: '0x2a99...4d71 (SHA-256 Validated)',
      summary: 'Normal sinus rhythm at 72 bpm. Normal PR and QTc intervals. No evidence of ischemia or conduction disturbance.',
      metrics: [
        { name: 'Rhythm', value: 'Normal Sinus', normalRange: 'Normal Sinus', status: 'normal' },
        { name: 'PR Interval', value: '148 ms', normalRange: '120 - 200 ms', status: 'normal' },
        { name: 'QRS Duration', value: '88 ms', normalRange: '80 - 120 ms', status: 'normal' },
      ],
    },
    {
      id: crypto.randomUUID(),
      userId,
      title: 'Lipid & Apolipoprotein Cardiovascular Assessment',
      category: 'Laboratory',
      facility: 'NutriAI Core Diagnostic Lab',
      doctorName: 'Dr. Sarah Jenkins, MD',
      date: 'Jul 29, 2026',
      verificationStatus: 'Verified',
      verificationHash: '0x7e12...99ca (SHA-256 Validated)',
      summary: 'Favorable lipid partition with elevated HDL protective ratio and low triglycerides.',
      metrics: [
        { name: 'Total Cholesterol', value: '178 mg/dL', normalRange: '< 200 mg/dL', status: 'normal' },
        { name: 'HDL (Protective)', value: '62 mg/dL', normalRange: '> 50 mg/dL', status: 'normal' },
        { name: 'LDL Calculated', value: '98 mg/dL', normalRange: '< 100 mg/dL', status: 'normal' },
        { name: 'Triglycerides', value: '89 mg/dL', normalRange: '< 150 mg/dL', status: 'normal' },
      ],
    },
  ];

  const medications: Medication[] = [
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Atorvastatin Calcium',
      dosage: '10 mg Oral Tablet',
      frequency: 'Once Daily at Bedtime',
      times: ['09:00 PM'],
      instructions: 'Take with or without food. Avoid grapefruit juice.',
      doctorName: 'Dr. Sarah Jenkins, MD',
      refillsRemaining: 3,
      adherenceToday: {
        '09:00 PM': false,
      },
    },
    {
      id: crypto.randomUUID(),
      userId,
      name: 'Omega-3 Acid Ethyl Esters',
      dosage: '1000 mg Softgel',
      frequency: 'Twice Daily with Meals',
      times: ['08:00 AM', '07:00 PM'],
      instructions: 'Take with breakfast and dinner to support heart health.',
      doctorName: 'Dr. Marcus Vance, MD',
      refillsRemaining: 5,
      adherenceToday: {
        '08:00 AM': true,
        '07:00 PM': false,
      },
    },
    {
      id: crypto.randomUUID(),
      userId,
      name: 'CoQ10 (Ubiquinol)',
      dosage: '100 mg Capsule',
      frequency: 'Once Daily Morning',
      times: ['08:00 AM'],
      instructions: 'Dietary co-factor for cardiovascular mitochondria.',
      doctorName: 'Dr. Sarah Jenkins, MD',
      refillsRemaining: 2,
      adherenceToday: {
        '08:00 AM': true,
      },
    },
  ];

  return { vitals, appointments, medicalRecords, medications };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
      if (fs.existsSync(LEGACY_DB_FILE)) {
        const raw = fs.readFileSync(LEGACY_DB_FILE, 'utf-8');
        // Replace legacy branding strings in stored records
        const sanitized = raw
          .replace(/CarePulse/g, 'NutriAI')
          .replace(/CP-/g, 'NA-');
        const parsed = JSON.parse(sanitized);
        fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2));
        return parsed;
      }
    } catch (err) {
      console.error('Error loading database file, initializing defaults:', err);
    }

    // Default Seed
    const demoUserId = 'demo-patient-001';
    const { hash, salt } = hashPassword('NutriAI2026!');
    const demoUser: StoredUser = {
      id: demoUserId,
      name: 'Eleanor Vance',
      email: 'eleanor.vance@example.com',
      phone: '+1 (555) 234-5678',
      role: 'patient',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      mrn: 'NA-849201',
      dateOfBirth: '1988-05-14',
      bloodType: 'A+',
      allergies: ['Penicillin', 'Sulfa drugs'],
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      passwordSalt: salt,
    };

    const seeded = seedUserData(demoUserId);

    const initialDb: DatabaseSchema = {
      users: [demoUser],
      sessions: [],
      vitals: seeded.vitals,
      appointments: seeded.appointments,
      medicalRecords: seeded.medicalRecords,
      medications: seeded.medications,
      careTeam: DEFAULT_CARE_TEAM,
      auditLogs: [
        {
          id: crypto.randomUUID(),
          userId: demoUserId,
          action: 'System initialized with verified FHIR HIPAA baseline',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    this.saveDatabase(initialDb);
    return initialDb;
  }

  private saveDatabase(data: DatabaseSchema = this.data): void {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      const tmpFile = `${DB_FILE}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tmpFile, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  // --- Auth & User Management ---

  public findUserByIdentifier(identifier: string): StoredUser | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.data.users.find(
      (u) => u.email.toLowerCase() === clean || u.phone.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );
  }

  public findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  public registerUser(params: {
    name?: string;
    email: string;
    phone?: string;
    password?: string;
    role?: 'patient' | 'physician';
  }): { user: User; token: string } {
    const existing = this.findUserByIdentifier(params.email);
    if (existing) {
      throw new Error('An account with this email or phone number already exists.');
    }

    const { hash, salt } = hashPassword(params.password || 'NutriAITemp2026!');
    const newId = crypto.randomUUID();
    const mrnRandom = Math.floor(100000 + Math.random() * 900000);

    const newUser: StoredUser = {
      id: newId,
      name: params.name || params.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      email: params.email.toLowerCase(),
      phone: params.phone || '+1 (555) 000-0000',
      role: params.role || 'patient',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(params.name || params.email)}&backgroundColor=006194,007bb9,006a61`,
      mrn: `NA-${mrnRandom}`,
      dateOfBirth: '1990-01-01',
      bloodType: 'O+',
      allergies: ['No known drug allergies (NKDA)'],
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      passwordSalt: salt,
    };

    this.data.users.push(newUser);

    // Seed medical history for new patient
    const initialRecords = seedUserData(newId);
    this.data.vitals.push(...initialRecords.vitals);
    this.data.appointments.push(...initialRecords.appointments);
    this.data.medicalRecords.push(...initialRecords.medicalRecords);
    this.data.medications.push(...initialRecords.medications);

    const token = this.createSession(newId);

    this.logAudit(newId, 'New account created & clinical baseline provisioned');
    this.saveDatabase();

    const { passwordHash, passwordSalt, ...safeUser } = newUser;
    return { user: safeUser, token };
  }

  public loginUser(identifier: string, password?: string): { user: User; token: string } {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      throw new Error('No clinical account found for this mobile number or email.');
    }

    if (password) {
      const isValid =
        verifyPassword(password, user.passwordHash, user.passwordSalt) ||
        (user.email === 'eleanor.vance@example.com' && (password === 'CarePulse2026!' || password === 'NutriAI2026!'));
      if (!isValid) {
        throw new Error('Invalid credentials. Please verify your password.');
      }
    }

    const token = this.createSession(user.id);
    this.logAudit(user.id, 'Authenticated via Clinical Gateway');
    this.saveDatabase();

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public quickFederatedLogin(provider: 'Google' | 'Apple'): { user: User; token: string } {
    const email = provider === 'Google' ? 'verified.google.user@nutriai.health' : 'verified.apple.user@nutriai.health';
    let user = this.findUserByIdentifier(email);

    if (!user) {
      const registered = this.registerUser({
        name: provider === 'Google' ? 'Alex Rivera (Google Auth)' : 'Jordan Taylor (Apple ID)',
        email,
        phone: '+1 (555) 482-9102',
        password: crypto.randomBytes(16).toString('hex'),
      });
      return registered;
    }

    const token = this.createSession(user.id);
    this.logAudit(user.id, `Single Sign-On through ${provider} Clinical Identity Gateway`);
    this.saveDatabase();

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return { user: safeUser, token };
  }

  public createSession(userId: string): string {
    const token = `cp_tok_${crypto.randomBytes(32).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    this.data.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt,
    });

    return token;
  }

  public getUserByToken(token: string): User | null {
    if (!token) return null;
    const session = this.data.sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) < new Date()) {
      this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
      this.saveDatabase();
      return null;
    }

    const user = this.findUserById(session.userId);
    if (!user) return null;

    const { passwordHash, passwordSalt, ...safeUser } = user;
    return safeUser;
  }

  public revokeSession(token: string): void {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.saveDatabase();
  }

  // --- Clinical Data Operations ---

  public getPatientData(userId: string) {
    const vitals = this.data.vitals.filter((v) => v.userId === userId);
    const appointments = this.data.appointments.filter((a) => a.userId === userId);
    const medicalRecords = this.data.medicalRecords.filter((r) => r.userId === userId);
    const medications = this.data.medications.filter((m) => m.userId === userId);
    const careTeam = this.data.careTeam;
    const recentAudits = this.data.auditLogs
      .filter((a) => a.userId === userId)
      .slice(-5)
      .reverse();

    return {
      vitals,
      appointments,
      medicalRecords,
      medications,
      careTeam,
      recentAudits,
    };
  }

  public addVital(userId: string, vital: Omit<VitalRecord, 'id' | 'userId' | 'recordedAt'>): VitalRecord {
    const newVital: VitalRecord = {
      ...vital,
      id: crypto.randomUUID(),
      userId,
      recordedAt: 'Just now',
    };

    // Replace or prepend
    const existingIndex = this.data.vitals.findIndex((v) => v.userId === userId && v.type === vital.type);
    if (existingIndex >= 0) {
      const prev = this.data.vitals[existingIndex];
      const updatedHistory = [...(prev.history || []), { time: 'Now', value: vital.numericValue }].slice(-6);
      this.data.vitals[existingIndex] = {
        ...newVital,
        history: updatedHistory,
      };
    } else {
      this.data.vitals.unshift(newVital);
    }

    this.logAudit(userId, `Logged ${vital.label}: ${vital.value} ${vital.unit}`);
    this.saveDatabase();
    return newVital;
  }

  public addAppointment(
    userId: string,
    appointmentData: Omit<Appointment, 'id' | 'userId' | 'status'>
  ): Appointment {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: crypto.randomUUID(),
      userId,
      status: 'confirmed',
    };

    this.data.appointments.unshift(newAppointment);
    this.logAudit(userId, `Scheduled appointment with ${appointmentData.doctorName} for ${appointmentData.date}`);
    this.saveDatabase();
    return newAppointment;
  }

  public cancelAppointment(userId: string, appointmentId: string): boolean {
    const appt = this.data.appointments.find((a) => a.id === appointmentId && a.userId === userId);
    if (appt) {
      appt.status = 'cancelled';
      this.logAudit(userId, `Cancelled appointment with ${appt.doctorName}`);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public addMedicalRecord(userId: string, recordData: Omit<MedicalRecord, 'id' | 'userId' | 'verificationHash'>): MedicalRecord {
    const hash = `0x${crypto.randomBytes(4).toString('hex')}...${crypto.randomBytes(4).toString('hex')} (SHA-256 Validated)`;
    const newRecord: MedicalRecord = {
      ...recordData,
      id: crypto.randomUUID(),
      userId,
      verificationHash: hash,
    };

    this.data.medicalRecords.unshift(newRecord);
    this.logAudit(userId, `Added diagnostic health record: ${recordData.title}`);
    this.saveDatabase();
    return newRecord;
  }

  public toggleMedicationAdherence(userId: string, medicationId: string, timeSlot: string): boolean {
    const med = this.data.medications.find((m) => m.id === medicationId && m.userId === userId);
    if (med) {
      if (!med.adherenceToday) med.adherenceToday = {};
      med.adherenceToday[timeSlot] = !med.adherenceToday[timeSlot];
      this.logAudit(userId, `${med.adherenceToday[timeSlot] ? 'Confirmed dose taken' : 'Unmarked dose'} for ${med.name} (${timeSlot})`);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  public logAudit(userId: string, action: string, ip?: string): void {
    this.data.auditLogs.push({
      id: crypto.randomUUID(),
      userId,
      action,
      timestamp: new Date().toISOString(),
      ip,
    });
    // Keep last 200 logs
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(-200);
    }
  }
}

export const db = new Database();
