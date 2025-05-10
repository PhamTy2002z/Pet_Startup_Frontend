import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { token } = useAuth();

  // Kiểm tra token nếu không có, chuyển hướng tới trang login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Outlet />; // Tiếp tục với các route bảo vệ
}