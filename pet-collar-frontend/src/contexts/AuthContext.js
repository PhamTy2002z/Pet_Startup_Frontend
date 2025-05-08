// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, authApi } from '../api/authService';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // Khởi tạo token từ sessionStorage (nếu đã có) để giữ phiên trong tab
  const [token, setToken] = useState(() => sessionStorage.getItem('token'));

  // Hàm login gọi API, lưu token vào sessionStorage và state
  const login = async (username, password) => {
    const t = await loginAdmin({ username, password });
    sessionStorage.setItem('token', t);
    setToken(t);
  };

  // Hàm logout xóa token
  const logout = () => {
    sessionStorage.removeItem('token');
    setToken(null);
  };

  // Gắn interceptor để attach Authorization header cho tất cả request
  useEffect(() => {
    const id = authApi.interceptors.request.use(config => {
      const sessionToken = sessionStorage.getItem('token');
      if (sessionToken) config.headers.Authorization = `Bearer ${sessionToken}`;
      return config;
    });
    return () => authApi.interceptors.request.eject(id);
  }, []);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
