// src/api/authService.js
import axios from 'axios';

// Lấy endpoint backend từ biến môi trường, fallback localhost
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/* 1.  PUBLIC API – KHÔNG tự gắn Authorization (dùng cho người quét QR) */
/* ------------------------------------------------------------------ */
export const publicApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

/* ------------------------------------------------------------------ */
/* 2.  ADMIN API – TỰ gắn Authorization từ localStorage               */
/* ------------------------------------------------------------------ */
export const adminApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (err) => Promise.reject(err),
);

/* ----------------------- HÀM LOGIN ADMIN -------------------------- */
/* gọi POST /api/auth/login và trả về token string                   */
export const loginAdmin = async ({ username, password }) => {
  const { data } = await adminApi.post('/auth/login', {
    username,
    password,
  });
  return data.token;
};

/* ------------------------------------------------------------------ */
/* Bạn có thể import publicApi / adminApi ở các service khác:         */
/*   - adminApi  → các route /api/admin/* yêu cầu token               */
/*   - publicApi → /api/user/*  cho user quét QR (không cần token)    */
/* ------------------------------------------------------------------ */
