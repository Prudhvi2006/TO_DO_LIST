import {
  User,
  UserSettings,
  Todo,
  TodayDashboardData,
  ProductivityGraphData,
  AnalyticsData,
  NotificationLog,
} from '../types.ts';

// Empty VITE_API_URL means same-origin API (recommended when frontend and backend
// are deployed together). Set it to your backend URL when hosting the frontend
// separately, e.g. https://orbitflow-api.onrender.com.
const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');
export const API_BASE_URL = configuredApiUrl;

export function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setAuthToken(token: string | null) {
  if (token) localStorage.setItem('auth_token', token);
  else localStorage.removeItem('auth_token');
}

function setStoredUser(user: User | null) {
  if (user) localStorage.setItem('local_user_data', JSON.stringify(user));
  else localStorage.removeItem('local_user_data');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) (headers as Record<string, string>).Authorization = `Bearer ${token}`;

  const url = `${API_BASE_URL}${endpoint}`;
  let response: Response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch {
    throw new Error(
      API_BASE_URL
        ? `Cannot reach the backend at ${API_BASE_URL}. Check that the backend is running, the URL is correct, and HTTPS/CORS are configured.`
        : 'Cannot reach the API. Start OrbitFlow with npm run dev or configure VITE_API_URL for a separately deployed backend.'
    );
  }

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const err: any = new Error(data?.error || `Request failed with status ${response.status}`);
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data as T;
}

export const api = {
  async sendOtp(email: string) {
    return request<{
      success: boolean;
      message: string;
      emailDelivery: string;
      emailDeliveryError?: string | null;
      resendCooldown: number;
    }>('/api/auth/send-otp', {
      method: 'POST', body: JSON.stringify({ email }),
    });
  },

  async verifyOtp(email: string, code: string) {
    return request<{
      success: boolean;
      verified: boolean;
      email: string;
      isExistingUser: boolean;
      message: string;
      token?: string | null;
      user?: User | null;
    }>('/api/auth/verify-otp', {
      method: 'POST', body: JSON.stringify({ email, code }),
    });
  },

  async register(payload: {
    email: string; name: string; password: string; confirmPassword: string; timezone?: string;
  }) {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/register', {
      method: 'POST', body: JSON.stringify(payload),
    });
    if (res.token) setAuthToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  async login(payload: { email: string; password: string }) {
    const res = await request<{ success: boolean; token: string; user: User }>('/api/auth/login', {
      method: 'POST', body: JSON.stringify(payload),
    });
    if (res.token) setAuthToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  async forgotPassword(email: string) {
    return request<{
      success: boolean; message: string; emailDelivery: string; resendCooldown: number;
    }>('/api/auth/forgot-password', {
      method: 'POST', body: JSON.stringify({ email }),
    });
  },

  async resetPassword(payload: {
    email: string; code: string; newPassword: string; confirmPassword: string;
  }) {
    const res = await request<{ success: boolean; token: string; user: User; message: string }>(
      '/api/auth/reset-password', { method: 'POST', body: JSON.stringify(payload) }
    );
    if (res.token) setAuthToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  async firebaseLogin(payload: {
    email: string; name?: string; timezone?: string; uid?: string; idToken?: string;
  }) {
    const res = await request<{ success: boolean; token: string; user: User; isNewUser: boolean }>(
      '/api/auth/firebase-login', { method: 'POST', body: JSON.stringify(payload) }
    );
    if (res.token) setAuthToken(res.token);
    if (res.user) setStoredUser(res.user);
    return res;
  },

  async getMe() {
    return request<{ user: User; settings: UserSettings | null }>('/api/auth/me');
  },

  async confirmWelcomeEmail() {
    return request<{ success: boolean; message: string; user: User }>(
      '/api/auth/confirm-welcome-email', { method: 'POST' }
    );
  },

  async resendWelcomeEmail() {
    return request<{ success: boolean; message: string; notificationCount: number }>(
      '/api/auth/resend-welcome-email', { method: 'POST' }
    );
  },

  async logout() {
    try { await request('/api/auth/logout', { method: 'POST' }); } finally {
      setAuthToken(null);
      setStoredUser(null);
    }
  },

  async getTodos(filter: 'all' | 'today' | 'upcoming' | 'completed' = 'all') {
    return request<Todo[]>(`/api/todos?filter=${filter}`);
  },

  async createTodo(payload: {
    title: string; description?: string; dueDate: string; dueTime?: string | null;
    reminderMinutesBefore?: number | null; priority?: 'low' | 'medium' | 'high'; category?: string;
  }) {
    return request<Todo>('/api/todos', { method: 'POST', body: JSON.stringify(payload) });
  },

  async updateTodo(id: number, payload: Partial<Todo>) {
    return request<Todo>(`/api/todos/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  async toggleTodo(id: number) {
    return request<Todo>(`/api/todos/${id}/toggle`, { method: 'PATCH' });
  },

  async deleteTodo(id: number) {
    return request<{ success: boolean; id: number }>(`/api/todos/${id}`, { method: 'DELETE' });
  },

  async getTodayDashboard() {
    return request<TodayDashboardData>('/api/dashboard/today');
  },

  async getProductivityGraph() {
    return request<ProductivityGraphData>('/api/dashboard/productivity-graph');
  },

  async getAnalytics() {
    return request<AnalyticsData>('/api/analytics');
  },

  async getSettings() {
    return request<{
      settings: UserSettings;
      smtpStatus: { isConfigured: boolean; activeSource: string; senderEmail: string };
    }>('/api/settings');
  },

  async updateSettings(payload: Partial<UserSettings>) {
    return request<{ success: boolean; settings: UserSettings }>('/api/settings', {
      method: 'PUT', body: JSON.stringify(payload),
    });
  },

  async testSmtp() {
    return request<{ success: boolean; message: string; log?: NotificationLog }>(
      '/api/settings/test-smtp', { method: 'POST' }
    );
  },

  async triggerMorningEmail() {
    return request<{ success: boolean; message: string; log?: NotificationLog }>(
      '/api/settings/trigger-morning-email', { method: 'POST' }
    );
  },

  async getNotifications() {
    return request<NotificationLog[]>('/api/notifications');
  },
};
