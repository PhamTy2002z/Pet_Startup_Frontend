// src/components/PrivateRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { token } = useAuth();

  // Chỉ chặn admin route nếu chưa có token
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;  // Tiếp tục với các route bảo vệ
}
