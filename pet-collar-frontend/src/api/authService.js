//src/api/authService.js
import { adminApi } from './base';

/* ------------------- ADMIN LOGIN ------------------- */
export const loginAdmin = async ({ username, password }) => {
  const { data } = await adminApi.post('/auth/login', { username, password });

  // Lưu token vào localStorage để interceptor dùng
  localStorage.setItem('admin_token', data.token);

  return data.token;
};

/* Đăng xuất */
export const logoutAdmin = () => {
  localStorage.removeItem('admin_token');
};
