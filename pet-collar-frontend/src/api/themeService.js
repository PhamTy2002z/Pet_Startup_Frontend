// src/api/themeService.js
import { adminApi, publicApi } from './base';

/* ===========================================================
 *  ADMIN – THEME MANAGEMENT
 * ===========================================================
 */
export const createTheme = (formData) =>
  adminApi.post('/admin/themes', formData).then((r) => r.data);

export const getAllThemes  = () =>
  adminApi.get('/admin/themes').then((r) => r.data);

export const getThemeById  = (id) =>
  adminApi.get(`/admin/themes/${id}`).then((r) => r.data);

export const updateTheme   = (id, formData) =>
  adminApi.put(`/admin/themes/${id}`, formData).then((r) => r.data);

export const deleteTheme   = (id) =>
  adminApi.delete(`/admin/themes/${id}`).then((r) => r.data);

export const batchUpdateThemeStatus = (themes) =>
  adminApi.put('/admin/themes/batch-status', { themes }).then((r) => r.data);

export const updateThemeOrder = (themes) =>
  adminApi.put('/admin/themes/order', { themes }).then((r) => r.data);

/* ===========================================================
 *  STORE – PUBLIC  (LIST & ACTIVE)
 * ===========================================================
 */
export const getStoreThemes = () =>
  publicApi.get('/store/themes').then((r) => r.data);

export const getActiveThemes = (petId) =>
  publicApi.get('/themes', { params: { petId } }).then((r) => r.data);

/* ===========================================================
 *  STORE – FOR PET  (BUY / APPLY / OWNED)
 * ===========================================================
 */
export const getPurchasedThemes = (petId) =>
  publicApi.get(`/purchased-themes/${petId}`).then((r) => r.data);

export const purchaseTheme = (petId, themeId) =>
  publicApi.post('/purchase-theme', { petId, themeId }).then((r) => r.data);

export const applyTheme = (petId, themeId) =>
  publicApi.post('/apply-theme', { petId, themeId }).then((r) => r.data);

/* ===========================================================
 *  REDEEM CODE
 * ===========================================================
 */
export const redeemThemeCode = (code, petId) =>
  publicApi
    .post('/redeem-theme-code', { code, petId })
    .then((r) => r.data);        // { success, theme, pet }

export const validateThemeCode = (code) =>
  publicApi.get(`/validate-theme-code/${encodeURIComponent(code)}`)
           .then((r) => r.data); // { valid, theme, expiresAt }
