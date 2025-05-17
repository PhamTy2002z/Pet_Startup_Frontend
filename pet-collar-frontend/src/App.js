import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LoginPage       from './pages/LoginPage';
import AdminPage       from './pages/AdminPage';
import UserEditPage    from './pages/UserEditPage';
import ThemeStorePage  from './pages/ThemeStorePage';
import PrivateRoute    from './components/PrivateRoute';

/**
 * ‣ Các URL KHÔNG cần token
 *   /login
 *   /user/edit/:id   (người quét QR xem hồ sơ)
 *   /theme-store
 *
 * ‣ Các URL CẦN token (admin) đặt trong <PrivateRoute>
 *
 * ‣ Luôn để wildcard “*” cuối cùng để không chặn routes khác
 */
export default function App() {
  return (
    <Routes>
      {/* ---------- Public ---------- */}
      <Route path="/login"          element={<LoginPage />} />
      <Route path="/user/edit/:id"  element={<UserEditPage />} />
      <Route path="/theme-store"    element={<ThemeStorePage />} />

      {/* ---------- Admin (đòi hỏi JWT) ---------- */}
      <Route element={<PrivateRoute />}>
        <Route path="/admin/*" element={<AdminPage />} />
        {/* khai báo thêm các sub-route /admin/xxx ở đây nếu có */}
      </Route>

      {/* ---------- Fallback ---------- */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
