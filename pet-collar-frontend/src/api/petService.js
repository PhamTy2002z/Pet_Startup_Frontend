// src/api/petService.js
import axios from 'axios';

// -------------------------------------------------------------------
// Lấy endpoint backend
// -------------------------------------------------------------------
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/* ****************************************************************** */
/* 1.  PUBLIC API  –  KHÔNG tự gắn token (người dùng quét QR)          */
/* ****************************************************************** */
const publicApi = axios.create({
  baseURL: `${API_BASE}/api`,
});

/* ****************************************************************** */
/* 2.  ADMIN API  –  TỰ gắn token từ localStorage (màn quản trị)      */
/* ****************************************************************** */
const adminApi = axios.create({
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

/* ========================= ADMIN APIs ============================ */

// Search pets with filters
export const searchPets = (params) =>
  adminApi.get('/admin/pets/search', { params }).then((r) => r.data);

// Update pet status
export const updatePetStatus = (id, status) =>
  adminApi.put(`/admin/pet/${id}/status`, { status }).then((r) => r.data);

// Tạo mới Pet (record rỗng + QR)
export const createPet = () =>
  adminApi.post('/admin/pet').then((r) => r.data);

// Tạo hàng loạt pets
export const createBulkPets = (quantity) =>
  adminApi.post('/admin/pets/bulk', { quantity }).then((r) => r.data);

// Lấy danh sách Pet
export const getAllPets = () =>
  adminApi.get('/admin/pets').then((r) => r.data);

/* ========================= USER APIs  ============================ */

// Lấy thông tin Pet
export const getPetById = (id) =>
  publicApi.get(`/user/pet/${id}`).then((r) => r.data);

// Cập nhật info / owner / vaccinations
export const updatePetById = (id, payload) =>
  publicApi.put(`/user/pet/${id}`, payload).then((r) => r.data);

// Cập nhật email chủ Pet
export const updatePetOwnerEmail = (id, email) =>
  publicApi
    .put(`/user/pet/${id}/owner-email`, { email })
    .then((r) => r.data);

// Upload avatar (dùng route user để khỏi yêu cầu token)
export const uploadPetAvatar = (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return publicApi
    .post(`/user/pet/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

/* ===================== TIỆN ÍCH KHÁC ============================= */

// URL trực tiếp tới file avatar (GridFS)
export const getPetAvatarUrl = (fileId) =>
  `${API_BASE}/api/avatar/${fileId}`;
