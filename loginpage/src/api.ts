import type {
  User,
  VitalRecord,
  Appointment,
  MedicalRecord,
  Medication,
  CareTeamMember,
  GatewayStatus,
} from './types.ts';

const TOKEN_KEY = 'nutriai_auth_token';
const LEGACY_TOKEN_KEY = 'carepulse_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY),
  setToken: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  },
  clearToken: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  },
};

async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}

export const api = {
  async getGatewayStatus(): Promise<GatewayStatus> {
    const res = await fetch('/api/gateway/status');
    return res.json();
  },

  async login(identifier: string, password?: string) {
    const data = await fetchWithAuth<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }
    );
    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async register(params: { name?: string; email: string; phone?: string; password?: string; role?: string }) {
    const data = await fetchWithAuth<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(params),
      }
    );
    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async quickLogin(provider: 'Google' | 'Apple') {
    const data = await fetchWithAuth<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/quick-login',
      {
        method: 'POST',
        body: JSON.stringify({ provider }),
      }
    );
    if (data.token) {
      authStorage.setToken(data.token);
    }
    return data;
  },

  async getCurrentUser(): Promise<User | null> {
    const token = authStorage.getToken();
    if (!token) return null;
    try {
      const data = await fetchWithAuth<{ success: boolean; user: User }>('/api/auth/me');
      return data.user;
    } catch {
      authStorage.clearToken();
      return null;
    }
  },

  async logout() {
    try {
      await fetchWithAuth('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  async requestPasswordReset(identifier: string) {
    return fetchWithAuth<{ success: boolean; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  },

  async getDashboardData(): Promise<{
    patient: User;
    vitals: VitalRecord[];
    appointments: Appointment[];
    medicalRecords: MedicalRecord[];
    medications: Medication[];
    careTeam: CareTeamMember[];
    recentAudits: { id: string; action: string; timestamp: string }[];
  }> {
    return fetchWithAuth('/api/patient/dashboard');
  },

  async logVital(vital: {
    type: VitalRecord['type'];
    label: string;
    value: string;
    numericValue: number;
    unit: string;
    status: VitalRecord['status'];
    trend: VitalRecord['trend'];
  }) {
    return fetchWithAuth<{ success: boolean; vital: VitalRecord }>('/api/patient/vitals', {
      method: 'POST',
      body: JSON.stringify(vital),
    });
  },

  async scheduleAppointment(appt: {
    doctorName: string;
    doctorRole?: string;
    doctorAvatar?: string;
    department?: string;
    date: string;
    time: string;
    type?: string;
    location?: string;
    notes?: string;
  }) {
    return fetchWithAuth<{ success: boolean; appointment: Appointment }>('/api/patient/appointments', {
      method: 'POST',
      body: JSON.stringify(appt),
    });
  },

  async cancelAppointment(appointmentId: string) {
    return fetchWithAuth<{ success: boolean; message: string }>(`/api/patient/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  async addMedicalRecord(record: {
    title: string;
    category: string;
    facility?: string;
    doctorName?: string;
    date?: string;
    summary?: string;
    metrics?: { name: string; value: string; normalRange: string; status: 'normal' | 'abnormal' }[];
  }) {
    return fetchWithAuth<{ success: boolean; record: MedicalRecord }>('/api/patient/records', {
      method: 'POST',
      body: JSON.stringify(record),
    });
  },

  async toggleMedication(medicationId: string, timeSlot: string) {
    return fetchWithAuth<{ success: boolean; message: string }>(
      `/api/patient/medications/${medicationId}/adherence`,
      {
        method: 'POST',
        body: JSON.stringify({ timeSlot }),
      }
    );
  },
};
