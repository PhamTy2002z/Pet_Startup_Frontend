// src/api/storeThemeService.js
import { publicApi } from './base';

/* ------------------------ STORE APIs (PUBLIC) ------------------------ */
// Lấy danh sách theme đang mở bán
export const getStoreThemes = () =>
  publicApi.get('/store/themes').then(r => r.data);

// Mua theme premium
export const purchaseTheme = (petId, themeId) =>
  publicApi.post('/store/purchase', { petId, themeId }).then(r => r.data);

// Áp dụng theme (đã mua hoặc theme free)
export const applyTheme = (petId, themeId) =>
  publicApi.post('/store/apply', { petId, themeId }).then(r => r.data);
