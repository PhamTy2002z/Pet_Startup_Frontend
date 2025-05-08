import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PrivateRoute() {
  const { token } = useAuth();

  // Nếu chưa có token → trả về login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Nếu đã login → render các route con
  return <Outlet />;
}
