// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UserEditPage from './pages/UserEditPage';
import PrivateRoute from './components/PrivateRoute';

export default function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user/edit/:id" element={<UserEditPage />} /> {/* Không cần PrivateRoute ở đây */}

      {/* Protected Admin Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        {/* Add other admin routes here */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
