// src/api/petService.js
import axios from 'axios';

// -------------------------------------------------------------------
// Lấy endpoint backend
// -------------------------------------------------------------------
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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

// Cập nhật info / owner / vaccinations / reExaminations / allergicInfo
export const updatePet = async (id, payload) => {
  try {
    // First get the current pet data to ensure we're not losing any data
    const currentPet = await getPetById(id);
    
    // Merge the current data with the new payload
    const mergedPayload = {
      info: {
        ...currentPet.info,
        ...(payload.info || {})
      },
      owner: {
        ...currentPet.owner,
        ...(payload.owner || {})
      },
      vaccinations: payload.vaccinations || currentPet.vaccinations || [],
      reExaminations: payload.reExaminations || currentPet.reExaminations || [],
      allergicInfo: payload.allergicInfo || currentPet.allergicInfo || { substances: [], note: '' }
    };
    
    // Send the merged payload to the API
    return publicApi.put(`/user/pet/${id}`, mergedPayload).then((r) => r.data);
  } catch (error) {
    console.error('Error in updatePet:', error);
    throw error;
  }
};

// Cập nhật email chủ Pet
export const updatePetOwnerEmail = (id, email) =>
  publicApi
    .put(`/user/pet/${id}/owner-email`, { email })
    .then((r) => r.data);

// Cập nhật thông tin dị ứng của pet
export const updateAllergicInfo = async (id, allergicInfo) => {
  try {
    // Get current pet to ensure we have the complete allergicInfo
    const currentPet = await getPetById(id);
    
    // Merge current allergicInfo with new data
    const mergedAllergicInfo = {
      ...currentPet.allergicInfo,
      ...allergicInfo
    };
    
    return publicApi
      .put(`/user/pet/${id}/allergic-info`, mergedAllergicInfo)
      .then((r) => r.data);
  } catch (error) {
    console.error('Error in updateAllergicInfo:', error);
    throw error;
  }
};

// Cập nhật mô tả của pet
export const updatePetDescription = async (id, descriptionData) => {
  try {
    // First get the current pet data
    const currentPet = await getPetById(id);
    
    // Make sure we're preserving any fields that might exist in the API
    const mergedDescription = {
      ...currentPet.info.description,
      ...descriptionData
    };
    
    return publicApi
      .put(`/user/pet/${id}/description`, mergedDescription)
      .then((r) => r.data);
  } catch (error) {
    console.error('Error in updatePetDescription:', error);
    throw error;
  }
};

// Upload avatar (dùng route user để khỏi yêu cầu token)
export const uploadPetAvatar = (id, formData) => {
  return publicApi
    .post(`/user/pet/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

// Gửi email nhắc lịch tái khám
export const sendReminderEmail = (petId, { to, petName, appointmentDate, note }) =>
  publicApi
    .post(`/user/pet/${petId}/send-reminder`, { to, petName, appointmentDate, note })
    .then((r) => r.data);

/* ===================== TIỆN ÍCH KHÁC ============================= */

// URL trực tiếp tới file avatar (GridFS)
export const getPetAvatarUrl = (fileId) =>
  `${API_BASE}/api/avatar/${fileId}`;
