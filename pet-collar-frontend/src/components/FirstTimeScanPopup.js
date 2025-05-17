import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiHeart } from 'react-icons/fi';
import './FirstTimeScanPopup.css';

export default function FirstTimeScanPopup({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ petName: '', ownerName: '', phone: '' });
  const [phoneError, setPhoneError]   = useState('');
  const [submitting, setSubmitting]   = useState(false);

  /* ---------- Handle change ---------- */
  const handleChange = ({ target: { name, value } }) => {
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 11) return setPhoneError('Tối đa 11 số');        // simple VN rule
      setPhoneError('');
      setForm((p) => ({ ...p, phone: digits }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.phone.length < 9 || form.phone.length > 11) {
      setPhoneError('Số điện thoại 9-11 chữ số');
      return;
    }

    setSubmitting(true);
    try {
      /* Map sang payload backend */
      const payload = {
        info: { name: form.petName },
        owner: { name: form.ownerName, phone: form.phone },
      };
      await onSubmit(payload);        // cha sẽ gọi updatePet()
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}><FiX /></button>

        <h2>New Pet Profile! 👋</h2>
        <p className="popup-subtitle">This appears to be your first time scanning this tag. Please enter the basic information to set up your pet's profile.</p>

        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label><FiHeart /> Pet Name</label>
            <input
              name="petName"
              value={form.petName}
              onChange={handleChange}
              placeholder="Pet name"
              required
            />
          </div>

          <div className="form-group">
            <label><FiUser /> Owner Name</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              placeholder="Owner name"
              required
            />
          </div>

          <div className="form-group">
            <label><FiPhone /> Phone</label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9-11 digits"
              required
              inputMode="numeric"
            />
            {phoneError && <span className="error-message">⚠️ {phoneError}</span>}
          </div>

          <button className="submit-button" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
