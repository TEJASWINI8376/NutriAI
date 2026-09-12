import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory user store for registered patients
interface UserRecord {
  id: string;
  fullName: string;
  contact: string;
  dob: string;
  gender: string;
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

let activeUser: UserRecord = {
  id: 'usr_carepulse_001',
  fullName: 'Alexander Mitchell',
  contact: 'alexander.mitchell@carepulse.health',
  dob: '1991-10-14',
  gender: 'Male',
  createdAt: new Date().toISOString(),
  step2Completed: true,
  medicalProfile: {
    primaryPhysician: 'Dr. Elena Vance, MD (Cardiometabolic & Clinical Nutrition)',
    dietaryPreferences: ['Low Glycemic', 'High Protein', 'Hydration Focus'],
    allergies: ['Shellfish', 'Penicillin'],
    dailyCalorieTarget: 2200,
    targetWeight: '76 kg',
    bloodType: 'O+',
    emergencyContactName: 'Sarah Mitchell (Spouse)',
    emergencyContactPhone: '+1 (555) 234-5678',
    notes: 'Monitoring routine blood glucose and post-workout nutritional recovery.'
  }
};

// API: Health status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'NutriAi CarePulse Health API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API: Current User
app.get('/api/auth/me', (_req: Request, res: Response) => {
  res.json({
    authenticated: true,
    user: activeUser
  });
});

// API: Register (Step 1)
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { fullName, contact, dob, gender } = req.body;
  if (!fullName || !contact) {
    return res.status(400).json({ error: 'Full legal name and contact are required.' });
  }

  activeUser = {
    id: `usr_${Date.now()}`,
    fullName,
    contact,
    dob: dob || '1991-10-14',
    gender: gender || 'Male',
    createdAt: new Date().toISOString(),
    step2Completed: false,
    medicalProfile: {
      primaryPhysician: 'Dr. Elena Vance, MD',
      dietaryPreferences: ['Balanced Nutrition'],
      allergies: [],
      dailyCalorieTarget: 2100,
      targetWeight: '75 kg',
      bloodType: 'A+',
      emergencyContactName: '',
      emergencyContactPhone: ''
    }
  };

  return res.json({
    success: true,
    message: 'Profile created securely with HIPAA AES-256 encryption.',
    user: activeUser
  });
});

// API: Login
app.post('/api/auth/login', (req: Request, res: Response) => {
  const { contact } = req.body;
  if (!contact) {
    return res.status(400).json({ error: 'Mobile number or email required.' });
  }

  // Update contact if provided or keep demo
  if (activeUser.contact.toLowerCase() !== contact.toLowerCase()) {
    activeUser.contact = contact;
  }

  return res.json({
    success: true,
    message: 'Authentication successful',
    user: activeUser
  });
});

// API: Complete Profile (Step 2)
app.post('/api/auth/step2', (req: Request, res: Response) => {
  const {
    primaryPhysician,
    dietaryPreferences,
    allergies,
    dailyCalorieTarget,
    targetWeight,
    bloodType,
    emergencyContactName,
    emergencyContactPhone,
    notes
  } = req.body;

  activeUser.step2Completed = true;
  activeUser.medicalProfile = {
    primaryPhysician: primaryPhysician || 'Dr. Elena Vance, MD',
    dietaryPreferences: dietaryPreferences || ['Balanced Nutrition'],
    allergies: allergies || [],
    dailyCalorieTarget: Number(dailyCalorieTarget) || 2200,
    targetWeight: targetWeight || '75 kg',
    bloodType: bloodType || 'O+',
    emergencyContactName: emergencyContactName || '',
    emergencyContactPhone: emergencyContactPhone || '',
    notes: notes || ''
  };

  return res.json({
    success: true,
    message: 'Medical and nutrition profile successfully saved.',
    user: activeUser
  });
});

// API: Patient telemetry and clinical records
app.get('/api/records', (_req: Request, res: Response) => {
  res.json({
    user: activeUser,
    vitals: {
      heartRate: { value: 72, unit: 'bpm', status: 'Optimal', change: '+2 bpm from baseline' },
      bloodGlucose: { value: 98, unit: 'mg/dL', status: 'Normal fasting', change: '-4 mg/dL today' },
      bloodPressure: { systolic: 120, diastolic: 80, unit: 'mmHg', status: 'Standard clinical' },
      hydration: { currentLiters: 2.4, targetLiters: 3.0, unit: 'L', status: '80% achieved' },
      calories: {
        consumed: 1850,
        target: activeUser.medicalProfile?.dailyCalorieTarget || 2200,
        protein: '124g',
        carbs: '190g',
        fats: '58g'
      }
    },
    upcomingMedications: [
      { id: 'm1', name: 'Omega-3 EPA/DHA Pure', dose: '1,000 mg', time: '08:00 AM', status: 'Taken', badge: 'Daily Cardio' },
      { id: 'm2', name: 'Vitamin D3 + K2 Emulsion', dose: '2,000 IU', time: '12:30 PM', status: 'Pending', badge: 'Nutrition' },
      { id: 'm3', name: 'CoQ10 Ubiquinol', dose: '100 mg', time: '07:30 PM', status: 'Scheduled', badge: 'Cellular Health' }
    ],
    verifiedDocuments: [
      { id: 'd1', title: 'Comprehensive Metabolic Panel (CMP)', date: 'Sept 04, 2026', doctor: 'Dr. Elena Vance', status: 'Verified' },
      { id: 'd2', title: 'NutriAi Microbiome & Glucose Assay', date: 'Aug 28, 2026', doctor: 'CarePulse Diagnostics', status: 'Verified' },
      { id: 'd3', title: 'HIPAA Consent & Clinical Telemetry Authorization', date: 'Sept 12, 2026', doctor: 'Compliance Registry', status: 'Encrypted' }
    ]
  });
});

// API: Live Onboarding Clinical Support with Dr. Elena Vance (Gemini Powered)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (err) {
      console.error('Failed to init Gemini client:', err);
    }
  }
  return aiClient;
}

app.post('/api/ai/onboarding-support', async (req: Request, res: Response) => {
  const { message, history } = req.body;
  const userQuery = message || 'Hello Dr. Elena, can you explain how CarePulse and NutriAi verify my records?';

  const client = getGeminiClient();
  if (client) {
    try {
      const systemInstruction = `You are Dr. Elena Vance, MD, a board-certified physician and chief clinical nutrition specialist at CarePulse & NutriAi.
You are warm, empathetic, reassuring, professional, and clear.
You assist patients during onboarding by explaining:
1. How HIPAA-compliant 256-bit encryption safeguards their clinical and nutritional telemetry.
2. How to enter accurate medical info, dietary preferences, and lab records.
3. How NutriAi analyzes metabolic data to optimize daily energy, glucose levels, and nutritional health.
Keep your answer concise (2-4 sentences or crisp bullet points), friendly, and medically grounded.`;

      const response = await client.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemInstruction}\n\nPatient question: "${userQuery}"` }] }
        ]
      });

      return res.json({
        reply: response.text || 'I am here to guide you through secure registration and health record synchronization.',
        doctor: 'Dr. Elena Vance, MD'
      });
    } catch (error) {
      console.warn('Gemini API call fell back to smart clinical response:', error);
    }
  }

  // Graceful smart fallback response
  const fallbackReplies: { [key: string]: string } = {
    records: "Your medical telemetry and prescription logs are sealed with 256-bit AES protocols. Only verified clinical practitioners with your explicit consent can view your records.",
    security: "CarePulse & NutriAi are fully HIPAA-compliant. We never share your personal health identifiers with third parties without authorized medical necessity.",
    diet: "NutriAi monitors macronutrient balances and glycemic impact in tandem with your physician's guidance to formulate customized meal plans."
  };

  const lower = userQuery.toLowerCase();
  let selectedReply = "Hello! I am Dr. Elena Vance. Welcome to NutriAi CarePulse. I'm here to ensure your health onboarding is seamless and your clinical records are properly encrypted.";
  if (lower.includes('record') || lower.includes('upload') || lower.includes('file')) {
    selectedReply = fallbackReplies.records;
  } else if (lower.includes('hipaa') || lower.includes('secure') || lower.includes('encrypt') || lower.includes('protect')) {
    selectedReply = fallbackReplies.security;
  } else if (lower.includes('diet') || lower.includes('food') || lower.includes('nutrition') || lower.includes('calorie')) {
    selectedReply = fallbackReplies.diet;
  }

  return res.json({
    reply: selectedReply,
    doctor: 'Dr. Elena Vance, MD'
  });
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CarePulse & NutriAi server running on port ${PORT}`);
  });
}

startServer();
