// src/api/authService.js
import axios from 'axios';

// Nếu bạn set REACT_APP_API_BASE_URL = "http://localhost:5000",
// thì baseURL sẽ là "http://localhost:5000/api"
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';
export const authApi = axios.create({
  baseURL: `${API_BASE}/api`
});

// (Tuỳ nếu cần interceptor cho authApi, nhưng thường để AuthContext gắn chung axios)
authApi.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  err => Promise.reject(err)
);

/**
 * Gọi login, trả về đúng token string.
 * Backend phải expose route POST /api/auth/login { username, password } → { token }
 */
export const loginAdmin = async ({ username, password }) => {
  const { data } = await authApi.post('/auth/login', { username, password });
  return data.token;
};
