import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// 🟢 public – KHÔNG gắn token
export const publicApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

// 🔒 admin – CÓ gắn token
export const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

adminApi.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
