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
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/user/edit/:id" element={<UserEditPage />} />

      {/* Protected Admin */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        {/* ... bạn có thể thêm các route admin khác ở đây */}
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
