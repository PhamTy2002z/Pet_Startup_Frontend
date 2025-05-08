// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import UserEditPage from './pages/UserEditPage';

export default function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login" element={<LoginPage />} />

      {/* chỉ /admin phải auth */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>

      {/* public: user scan QR vẫn vào edit được */}
      <Route path="/user/edit/:id" element={<UserEditPage />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
