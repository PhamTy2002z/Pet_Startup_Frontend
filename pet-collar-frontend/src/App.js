import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminPage from './pages/AdminPage';
import UserEditPage from './pages/UserEditPage';

function App() {
  return (
    <Routes>
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/user/edit/:id" element={<UserEditPage />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default App;
