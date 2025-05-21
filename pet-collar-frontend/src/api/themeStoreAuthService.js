/* src/api/themeStoreAuthService.js */
import { themeStoreApi } from './base';

/* ---------- REGISTER ---------- */
export const registerThemeStoreUser = async ({ name, email, password }) => {
  const { data } = await themeStoreApi.post(
    '/theme-store/auth/register',            // ← chuẩn route
    { name, email, password },
  );
  localStorage.setItem('theme_store_token', data.token);
  return data; // { token, user }
};

/* ---------- LOGIN ---------- */
export const loginThemeStoreUser = async ({ email, password }) => {
  const { data } = await themeStoreApi.post(
    '/theme-store/auth/login',               // ← chuẩn route
    { email, password },
  );
  localStorage.setItem('theme_store_token', data.token);
  return data; // { token, user }
};

/* ---------- CURRENT USER ---------- */
export const getCurrentThemeStoreUser = async () => {
  const { data } = await themeStoreApi.get('/theme-store/auth/me');
  return data; // { id, name, email }
};

/* ---------- LOGOUT ---------- */
export const logoutThemeStoreUser = () => {
  localStorage.removeItem('theme_store_token');
};
