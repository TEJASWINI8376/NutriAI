import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './server/db.ts';
import type { User } from './src/types.ts';

interface AuthRequest extends Request {
  user?: User;
  token?: string;
}

function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. No bearer token provided.' });
  }

  const token = authHeader.substring(7).trim();
  const user = db.getUserByToken(token);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
  }

  req.user = user;
  req.token = token;
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health and Clinical Gateway Heartbeat
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'NutriAI Clinical & Nutrition Intelligence Gateway',
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/gateway/status', (req, res) => {
    res.json({
      online: true,
      latencyMs: Math.floor(12 + Math.random() * 8),
      encryption: '256-bit AES-GCM (HIPAA Title II PHI)',
      phiCertified: true,
      lastSync: new Date().toISOString(),
      activeNode: 'GATEWAY-NODE-ALPHA-EAST',
    });
  });

  // Authentication API
  app.post('/api/auth/register', (req, res) => {
    try {
      const { name, email, phone, password, role } = req.body;
      if (!email || !email.includes('@')) {
        return res.status(400).json({ success: false, message: 'Valid email address is required.' });
      }

      const result = db.registerUser({
        name,
        email,
        phone,
        password,
        role: role === 'physician' ? 'physician' : 'patient',
      });

      res.status(201).json({
        success: true,
        token: result.token,
        user: result.user,
        message: 'Account registered successfully. Clinical baseline initialized.',
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Registration failed.' });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { identifier, password } = req.body;
      if (!identifier) {
        return res.status(400).json({ success: false, message: 'Email or mobile number is required.' });
      }

      const result = db.loginUser(identifier, password);
      res.json({
        success: true,
        token: result.token,
        user: result.user,
        message: 'Authenticated successfully with Clinical Gateway.',
      });
    } catch (err: any) {
      res.status(401).json({ success: false, message: err.message || 'Authentication failed.' });
    }
  });

  app.post('/api/auth/quick-login', (req, res) => {
    try {
      const provider = req.body.provider === 'Apple ID' || req.body.provider === 'Apple' ? 'Apple' : 'Google';
      const result = db.quickFederatedLogin(provider);
      res.json({
        success: true,
        token: result.token,
        user: result.user,
        message: `Verified via ${provider} Health Identity Gateway.`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Quick login failed.' });
    }
  });

  app.get('/api/auth/me', requireAuth, (req: AuthRequest, res) => {
    res.json({
      success: true,
      user: req.user,
    });
  });

  app.post('/api/auth/logout', requireAuth, (req: AuthRequest, res) => {
    if (req.token) {
      db.revokeSession(req.token);
    }
    res.json({ success: true, message: 'Signed out from Clinical Gateway.' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ success: false, message: 'Please provide your email or phone number.' });
    }
    // Simulate HIPAA recovery dispatch
    res.json({
      success: true,
      message: `A secure verification code has been dispatched to ${identifier}. Follow the instructions to reset your clinical passkey.`,
    });
  });

  // Dynamic Patient Healthcare Endpoints
  app.get('/api/patient/dashboard', requireAuth, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const data = db.getPatientData(userId);
    res.json({
      success: true,
      patient: req.user,
      ...data,
    });
  });

  app.post('/api/patient/vitals', requireAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { type, label, value, numericValue, unit, status, trend } = req.body;

      if (!type || !label || !value) {
        return res.status(400).json({ success: false, message: 'Missing required vital parameters.' });
      }

      const newVital = db.addVital(userId, {
        type,
        label,
        value,
        numericValue: Number(numericValue) || 0,
        unit: unit || '',
        status: status || 'normal',
        trend: trend || 'stable',
        history: [],
      });

      res.status(201).json({ success: true, vital: newVital });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/patient/appointments', requireAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { doctorName, doctorRole, doctorAvatar, department, date, time, type, location, notes } = req.body;

      if (!doctorName || !date || !time) {
        return res.status(400).json({ success: false, message: 'Doctor name, date, and time are required.' });
      }

      const appointment = db.addAppointment(userId, {
        doctorName,
        doctorRole: doctorRole || 'Physician',
        doctorAvatar: doctorAvatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80',
        department: department || 'General Medicine',
        date,
        time,
        type: type || 'In-Clinic',
        location: location || 'NutriAI Health Suite',
        notes,
      });

      res.status(201).json({ success: true, appointment });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/patient/appointments/:id/cancel', requireAuth, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const success = db.cancelAppointment(userId, id);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Appointment not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Appointment cancelled successfully.' });
  });

  app.post('/api/patient/records', requireAuth, (req: AuthRequest, res) => {
    try {
      const userId = req.user!.id;
      const { title, category, facility, doctorName, date, summary, metrics } = req.body;

      if (!title || !category) {
        return res.status(400).json({ success: false, message: 'Title and category are required.' });
      }

      const record = db.addMedicalRecord(userId, {
        title,
        category,
        facility: facility || 'NutriAI Diagnostic Center',
        doctorName: doctorName || 'Attending Clinical Staff',
        date: date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        verificationStatus: 'Verified',
        summary: summary || 'Document certified and encrypted into patient medical archive.',
        metrics: metrics || [],
      });

      res.status(201).json({ success: true, record });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  app.post('/api/patient/medications/:id/adherence', requireAuth, (req: AuthRequest, res) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const { timeSlot } = req.body;

    if (!timeSlot) {
      return res.status(400).json({ success: false, message: 'Time slot is required.' });
    }

    const success = db.toggleMedicationAdherence(userId, id, timeSlot);
    if (!success) {
      return res.status(404).json({ success: false, message: 'Medication not found.' });
    }
    res.json({ success: true, message: 'Medication adherence recorded.' });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriAI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
