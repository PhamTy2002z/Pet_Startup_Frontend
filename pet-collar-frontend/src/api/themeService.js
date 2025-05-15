// src/api/themeService.js
import { adminApi } from './base';

// Get all themes
export const getAllThemes = async () => {
  const { data } = await adminApi.get('/admin/themes');
  return data;
};

// Get a theme by ID
export const getThemeById = async (id) => {
  const { data } = await adminApi.get(`/admin/themes/${id}`);
  return data;
};

// Create a new theme
export const createTheme = async (formData) => {
  const { data } = await adminApi.post('/admin/themes', formData);
  return data;
};

// Update a theme
export const updateTheme = async (id, formData) => {
  const { data } = await adminApi.put(`/admin/themes/${id}`, formData);
  return data;
};

// Delete a theme
export const deleteTheme = async (id) => {
  const { data } = await adminApi.delete(`/admin/themes/${id}`);
  return data;
};

// Assign theme to pet
export const assignThemeToPet = async (petId, themeId) => {
  const { data } = await adminApi.post('/admin/pets/theme', { petId, themeId });
  return data;
};

// Update theme status in batch
export const batchUpdateThemeStatus = async (themes) => {
  const { data } = await adminApi.put('/admin/themes/batch-status', { themes });
  return data;
};

// Update theme order
export const updateThemeOrder = async (themes) => {
  const { data } = await adminApi.put('/admin/themes/order', { themes });
  return data;
};