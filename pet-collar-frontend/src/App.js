// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import AdminPage from './pages/AdminPage';
import UserEditPage from './pages/UserEditPage';

function App() {
  return (
    <Routes>
      {/* Route công khai */}
      <Route path="/login" element={<LoginPage />} />

      {/* Các route bảo vệ */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user/edit/:id" element={<UserEditPage />} />
      </Route>

      {/* Chuyển hướng mặc định */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
