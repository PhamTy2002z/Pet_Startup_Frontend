import React from 'react';
import UserEditForm from '../components/UserEditForm';
import './UserEditPage.css';

export default function UserEditPage() {
  return (
    <div className="user-edit-page">
      <div className="edit-wrapper">
        <UserEditForm />
      </div>
    </div>
  );
}
