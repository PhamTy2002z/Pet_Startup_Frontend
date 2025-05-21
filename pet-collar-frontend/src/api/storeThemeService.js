// src/api/storeThemeService.js
import { publicApi, themeStoreApi } from './base';

/* ----------------------- PUBLIC THEME STORE ----------------------- */
// Danh sách theme hiển thị trên Theme-Store (không yêu cầu token)
export const getStoreThemes = () =>
  publicApi.get('/theme-store/themes').then((r) => r.data);

/* --------------------- LEGACY PET STORE (PUBLIC) ------------------ */
// Mua theme cho Pet bằng petId (route cũ)
export const purchaseTheme = (petId, themeId) =>
  publicApi.post('/store/purchase', { petId, themeId }).then((r) => r.data);

// Áp dụng theme (đã mua hoặc theme free) cho Pet
export const applyTheme = (petId, themeId) =>
  publicApi.post('/store/apply', { petId, themeId }).then((r) => r.data);

/* -------------------- AUTH THEME-STORE USER ----------------------- */
// Mua theme bằng tài khoản ThemeStoreUser → trả redemptionCode
export const purchaseThemeStore = (themeId) =>
  themeStoreApi
    .post('/theme-store/purchase', { themeId })
    .then((r) => r.data); // { success, redemptionCode, userTheme }
    
/* --------- LẤY LỊCH SỬ MUA CỦA THEME-STORE USER (COLLECTION) --------- */
export const getMyPurchaseHistory = (page = 1, limit = 100) =>
  themeStoreApi
    .get('/theme-store/my-purchase-history', {
      params: { page, limit },
    })
    .then((r) => r.data); // { results: [...], pagination: {...} }