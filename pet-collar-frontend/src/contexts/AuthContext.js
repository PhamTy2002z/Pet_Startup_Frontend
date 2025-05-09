import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLoginAdmin } from '../api/authService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Khởi tạo token từ localStorage (giữ qua reload/tab khác)
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Hàm login: gọi API, lưu token, set state, điều hướng
  const login = async (username, password) => {
    const t = await apiLoginAdmin({ username, password });
    localStorage.setItem('token', t);
    setToken(t);
    navigate('/admin', { replace: true });
  };

  // Hàm logout: xóa token và điều hướng về login
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    navigate('/login', { replace: true });
  };

  // Gắn interceptor cho axios để tự động đính kèm Authorization header
  useEffect(() => {
    const id = axios.interceptors.request.use(config => {
      const sessionToken = localStorage.getItem('token');
      if (sessionToken) {
        config.headers.Authorization = `Bearer ${sessionToken}`;
      }
      return config;
    });
    return () => axios.interceptors.request.eject(id);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
