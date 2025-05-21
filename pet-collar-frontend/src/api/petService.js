//src/api/petService.js
import { publicApi, adminApi } from './base';

/* ========= ADMIN – PET CRUD ========= */

/** Tạo 1 pet rỗng + QR */
export const createPet = () => adminApi.post('/admin/pets').then(r => r.data);

/** Tạo hàng loạt pets */
export const createBulkPets = (quantity) =>
  adminApi.post('/admin/pets/bulk', { quantity }).then(r => r.data);

/** Danh sách / tìm kiếm */
export const getAllPets = () => adminApi.get('/admin/pets').then(r => r.data);
export const searchPets = (params) =>
  adminApi.get('/admin/pets/search', { params }).then(r => r.data);

/** Upload avatar (admin) */
export const uploadPetAvatarAdmin = (id, formData) =>
  adminApi.post(`/admin/pets/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

/* ========= USER – PET PROFILE ========= */

export const getPetById = (id) =>
  publicApi.get(`/pets/${id}`).then(r => r.data);

export const updatePet = (id, payload) =>
  publicApi.put(`/pets/${id}`, payload).then(r => r.data);

export const updatePetOwnerEmail = (id, email) =>
  publicApi.post(`/pets/${id}/owner-email`, { email }).then(r => r.data);

export const updateAllergicInfo = (id, allergicInfo) =>
  publicApi.put(`/pets/${id}/allergic-info`, allergicInfo).then(r => r.data);

export const updatePetDescription = (id, description) =>
  publicApi.put(`/pets/${id}/description`, { description }).then(r => r.data);

export const uploadPetAvatar = (id, formData) =>
  publicApi.post(`/pets/${id}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);

/* ========= EMAIL REMINDER ========= */

export const sendReminderEmail = (petId, payload) =>
  publicApi.post(`/pets/${petId}/send-reminder`, payload).then(r => r.data);

/* ========= HELPER ========= */
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
export const getPetAvatarUrl = (fileId) =>
  `${API_BASE}/api/v1/avatar/${fileId}`;
