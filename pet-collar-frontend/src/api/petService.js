import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api'  // điều chỉnh nếu cần
});

// Admin
export const createPet = () => api.post('/admin/pet').then(res => res.data);
export const getAllPets = () => api.get('/admin/pets').then(res => res.data);

// User
export const getPetById = id => api.get(`/user/pet/${id}`).then(res => res.data);
export const updatePetById = (id, payload) =>
  api.put(`/user/pet/${id}`, payload).then(res => res.data);
