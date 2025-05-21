import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage              from './pages/LoginPage';
import AdminPage              from './pages/AdminPage';
import UserEditPage           from './pages/UserEditPage';
import ThemeStorePage         from './pages/ThemeStorePage';
import ThemeStoreLoginPage    from './pages/ThemeStoreLoginPage';
import ThemeStoreRegisterPage from './pages/ThemeStoreRegisterPage';

import PrivateRoute               from './components/PrivateRoute';
import ThemeStorePrivateRoute     from './components/ThemeStorePrivateRoute';

export default function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/user/edit/:id"  element={<UserEditPage />} />

      {/* Theme-Store Auth */}
      <Route path="/theme-store/login"    element={<ThemeStoreLoginPage />} />
      <Route path="/theme-store/register" element={<ThemeStoreRegisterPage />} />

      {/* Theme-Store (yêu cầu login) */}
      <Route element={<ThemeStorePrivateRoute />}>
        <Route path="/theme-store" element={<ThemeStorePage />} />
      </Route>

      {/* ---------- Admin ---------- */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin/*" element={<AdminPage />} />
      </Route>

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
