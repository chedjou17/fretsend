import axios, { AxiosInstance, AxiosError } from 'axios';
import Cookies from 'js-cookie';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'https://fretsend.onrender.com';

const api: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('fs_access') || (typeof localStorage !== 'undefined' && localStorage.getItem('fs_access'));
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res.data?.data ?? res.data,
  async (error: AxiosError) => {
    const orig = error.config as any;
    if (error.response?.status === 401 && !orig?._retry) {
      orig._retry = true;
      const rt = Cookies.get('fs_refresh') || localStorage.getItem('fs_refresh');
      if (rt) {
        try {
          const { data } = await axios.post(`${BASE}/auth/refresh`, { refresh_token: rt });
          const { access_token, refresh_token } = data?.data || data;
          Cookies.set('fs_access',  access_token,  { expires: 1/96 });
          Cookies.set('fs_refresh', refresh_token, { expires: 7 });
          localStorage.setItem('fs_access',  access_token);
          localStorage.setItem('fs_refresh', refresh_token);
          orig.headers.Authorization = `Bearer ${access_token}`;
          return api(orig);
        } catch {
          Cookies.remove('fs_access'); Cookies.remove('fs_refresh');
          localStorage.clear();
          if (typeof window !== 'undefined') window.location.href = '/auth/login';
        }
      }
    }
    const msg = (error.response?.data as any)?.message?.[0] || (error.response?.data as any)?.message || error.message;
    return Promise.reject(new Error(msg));
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────
export const authApi = {
  login:    (d: any) => api.post('/auth/login', d),
  register: (d: any) => api.post('/auth/register', d),
  refresh:  (token: string) => api.post('/auth/refresh', { refresh_token: token }),
  logout:   () => api.post('/auth/logout'),
  me:       () => api.get('/auth/me'),
};

// ── Packages ──────────────────────────────────────────────
export const pkgApi = {
  list:         (p?: any) => api.get('/packages', { params: p }),
  byId:         (id: string) => api.get(`/packages/${id}`),
  track:        (n: string) => api.get(`/packages/track/${n}`),
  create:       (d: any) => api.post('/packages', d),
  updateStatus: (id: string, d: any) => api.patch(`/packages/${id}/status`, d),
  stats:        () => api.get('/packages/stats'),
  invoices:     () => api.get('/packages/invoices'),
};

// ── Agencies ──────────────────────────────────────────────
export const agencyApi = {
  list:   (country?: string) => api.get('/agencies', { params: country ? { country } : {} }),
  byId:   (id: string) => api.get(`/agencies/${id}`),
  stats:  (id: string) => api.get(`/agencies/${id}/stats`),
  create: (d: any) => api.post('/agencies', d),
  update: (id: string, d: any) => api.patch(`/agencies/${id}`, d),
  toggle: (id: string) => api.patch(`/agencies/${id}/toggle`),
};

// ── Users ─────────────────────────────────────────────────
export const usersApi = {
  list:       (search?: string) => api.get('/users', { params: search ? { search } : {} }),
  byId:       (id: string) => api.get(`/users/${id}`),
  create:     (d: any) => api.post('/users', d),
  update:     (id: string, d: any) => api.patch(`/users/${id}`, d),
  updateSelf: (d: any) => api.patch('/users/me', d),
  agentHistory: (id: string) => api.get(`/users/${id}/history`),
};

// ── Shipments ─────────────────────────────────────────────
export const shipApi = {
  list:         () => api.get('/shipments'),
  byId:         (id: string) => api.get(`/shipments/${id}`),
  create:       (d: any) => api.post('/shipments', d),
  updateStatus: (id: string, status: string) => api.patch(`/shipments/${id}/status`, { status }),
  addPackage:   (sid: string, pid: string) => api.post(`/shipments/${sid}/packages/${pid}`),
};

// ── Pricing ───────────────────────────────────────────────
export const pricingApi = {
  rules:      () => api.get('/pricing/rules'),
  calculate:  (d: any) => api.post('/pricing/calculate', d),
  createRule: (d: any) => api.post('/pricing/rules', d),
  updateRule: (id: string, d: any) => api.patch(`/pricing/rules/${id}`, d),
};

// ── Tracking stats ────────────────────────────────────────
export const trackApi = {
  globalStats:  () => api.get('/tracking/stats/global'),
  monthlyStats: () => api.get('/tracking/stats/monthly'),
  agencyStats:  () => api.get('/tracking/stats/agencies'),
  events:       (pkgId: string) => api.get(`/tracking/${pkgId}/events`),
};

// ── Payment (mock) ────────────────────────────────────────
export const paymentApi = {
  verify: (token: string) => api.get(`/payment/${token}`),
  action: (token: string, action: 'paid' | 'unpaid' | 'problem') =>
    api.post(`/payment/${token}`, { action }),
};
