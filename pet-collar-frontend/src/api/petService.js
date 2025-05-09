// src/api/petService.js
import axios from 'axios';

// Sử dụng biến môi trường REACT_APP_API_BASE_URL hoặc fallback
// Lưu ý: không thêm `/api` thừa để tránh thành `/api/api`
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

// Tạo axios instance
const api = axios.create({
  baseURL: `${API_BASE}/api`
});

// Gắn token nếu có (giống chỗ login lưu vào localStorage)
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');    // <— đổi từ sessionStorage sang localStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  err => Promise.reject(err)
);

// ——— Admin APIs ———

// Tạo mới Pet (chỉ tạo QR, record rỗng)
export const createPet = () =>
  api.post('/admin/pet').then(res => res.data);

// Lấy danh sách tất cả Pet
export const getAllPets = () =>
  api.get('/admin/pets').then(res => res.data);

// Upload avatar qua user route
export const uploadPetAvatar = (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api
    .post(`/user/pet/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data);
};

// Lấy ảnh avatar trực tiếp (GridFS stream)
export const getPetAvatarUrl = fileId =>
  `${API_BASE}/api/avatar/${fileId}`;

// Bulk create: gửi { quantity: n }
export const createBulkPets = quantity =>
  api.post('/admin/pets/bulk', { quantity }).then(res => res.data);

// ——— User APIs ———

// Lấy thông tin Pet theo ID
export const getPetById = id =>
  api.get(`/user/pet/${id}`).then(res => res.data);

// Cập nhật thông tin Pet (info, owner, vaccinations)
export const updatePetById = (id, payload) =>
  api.put(`/user/pet/${id}`, payload).then(res => res.data);


