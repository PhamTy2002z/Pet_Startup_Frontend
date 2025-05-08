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
      {/* 1. Route công khai cho login */}
      <Route path="/login" element={<LoginPage />} />

      {/* 2. Bọc tất cả route cần auth vào PrivateRoute */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user/edit/:id" element={<UserEditPage />} />
      </Route>

      {/* 3. Mọi path khác chuyển về login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
