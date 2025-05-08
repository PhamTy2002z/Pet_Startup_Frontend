import axios from 'axios';
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
export const authApi = axios.create({ baseURL: API_BASE });
export const loginAdmin = ({ username, password }) =>
  authApi.post('/auth/login', { username, password }).then(res => res.data.token);
