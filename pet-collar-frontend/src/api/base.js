//src/api/base.js
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const VERSION  = '/api/v1';

/* ---------- PUBLIC ---------- */
export const publicApi = axios.create({
  baseURL        : `${API_BASE}${VERSION}`,
  withCredentials: true,
});

/* ---------- ADMIN ---------- */
export const adminApi = axios.create({
  baseURL: `${API_BASE}${VERSION}`,
});
adminApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

/* ---------- THEME-STORE USER ---------- */
export const themeStoreApi = axios.create({
  baseURL: `${API_BASE}${VERSION}`,
});
themeStoreApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('theme_store_token');   // token được lưu khi login/register store
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
