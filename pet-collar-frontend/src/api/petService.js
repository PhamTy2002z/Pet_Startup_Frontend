// src/api/petService.js
import axios from 'axios';

// Sử dụng biến môi trường REACT_APP_API_BASE_URL hoặc fallback
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE
});

// ——— Admin APIs ———

// Tạo mới Pet (chỉ tạo QR, record rỗng)
export const createPet = () =>
  api.post('/admin/pet').then(res => res.data);

// Lấy danh sách tất cả Pet
export const getAllPets = () =>
  api.get('/admin/pets').then(res => res.data);

// Upload avatar lên GridFS và lưu fileId vào Pet
export const uploadPetAvatar = (id, file) => {
  const formData = new FormData();
  formData.append('avatar', file);
  return api
    .post(`/admin/pet/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    .then(res => res.data);
};

// ——— User APIs ———

// Lấy thông tin Pet theo ID
export const getPetById = id =>
  api.get(`/user/pet/${id}`).then(res => res.data);

// Cập nhật thông tin Pet (info, owner, vaccinations)
export const updatePetById = (id, payload) =>
  api.put(`/user/pet/${id}`, payload).then(res => res.data);
