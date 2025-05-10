// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin as apiLoginAdmin } from '../api/authService';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  // Khởi tạo token từ localStorage, lưu qua reload/tab khác
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Kiểm tra token khi load lại app và set token nếu hết hạn
  const checkTokenExpiration = (token) => {
    if (token) {
      const decoded = JSON.parse(atob(token.split('.')[1]));  // Decode JWT token
      const expirationTime = decoded.exp * 1000;
      if (Date.now() > expirationTime) {
        // Token hết hạn
        logout();
      }
    }
  };

  // Hàm login: gọi API, lưu token, set state, điều hướng
  const login = async (username, password) => {
    try {
      const token = await apiLoginAdmin({ username, password });
      localStorage.setItem('token', token); // Lưu token vào localStorage
      setToken(token); // Cập nhật token vào state
      checkTokenExpiration(token); // Kiểm tra token có hết hạn không
      navigate('/admin', { replace: true }); // Điều hướng tới trang Admin
    } catch (err) {
      console.error('Login error:', err);
      // Xử lý lỗi nếu login thất bại
    }
  };

  // Hàm logout: xóa token và điều hướng về login
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null); // Đặt lại token trong state
    navigate('/login', { replace: true });
  };

  // Gắn interceptor cho axios để tự động đính kèm Authorization header
  useEffect(() => {
    const id = axios.interceptors.request.use(
      (config) => {
        const sessionToken = localStorage.getItem('token');
        if (sessionToken) {
          config.headers.Authorization = `Bearer ${sessionToken}`;
        }
        return config;
      },
      (err) => Promise.reject(err)
    );
    return () => axios.interceptors.request.eject(id);
  }, []);

  // Trả về giá trị context gồm token, login, logout
  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook để sử dụng AuthContext
export const useAuth = () => useContext(AuthContext);
