//scr/pages/AdminPage.js
import React from 'react';
import AdminDashboard from '../components/AdminDashboard';
import './AdminPage.css';

export default function AdminPage() {
  return (
    <div className="admin-page">
      <div className="dashboard-wrapper">
        <AdminDashboard />
      </div>
    </div>
  );
}
