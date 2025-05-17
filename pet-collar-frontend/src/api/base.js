import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const VERSION  = '/api/v1';                     // <— mọi route backend đều có

/* ---------- PUBLIC: KHÔNG gắn token ---------- */
export const publicApi = axios.create({
  baseURL        : `${API_BASE}${VERSION}`,
  withCredentials: true,                       // để sau này nhận cookie pet_token
});

/* ---------- ADMIN: TỰ gắn Bearer token ---------- */
export const adminApi = axios.create({
  baseURL: `${API_BASE}${VERSION}`,
});

adminApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
