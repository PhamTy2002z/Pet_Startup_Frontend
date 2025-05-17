// src/api/storeThemeService.js
import { publicApi } from './base';   // <-- publicApi KHÔNG đính kèm token

/* Front-store = các route /api/v1/store/... do backend cung cấp   */
/* ---------------------------------------------------------------- */
export const getStoreThemes = () =>
  publicApi.get('/store/themes').then(r => r.data);

export const purchaseTheme = (petId, themeId) =>
  publicApi.post('/purchase-theme', { petId, themeId }).then(r => r.data);

export const applyTheme = (petId, themeId) =>
  publicApi.post('/apply-theme', { petId, themeId }).then(r => r.data);

/* Lấy tất cả theme (free + đã mua) mà pet có thể dùng */
export const getActiveThemes = (petId) =>
  publicApi.get('/themes', { params: { petId } }).then(r => r.data);

/* Lấy danh sách đã mua riêng */
export const getPurchasedThemes = (petId) =>
  publicApi.get(`/purchased-themes/${petId}`).then(r => r.data);
