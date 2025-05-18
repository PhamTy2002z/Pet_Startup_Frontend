import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiHeart, FiMail } from 'react-icons/fi';
import './FirstTimeScanPopup.css';

export default function FirstTimeScanPopup({ isOpen, onClose, onSubmit }) {
  const [form, setForm] = useState({ petName: '', ownerName: '', phone: '', email: '' });
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* ---------- Handle change ---------- */
  const handleChange = ({ target: { name, value } }) => {
    if (name === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length > 11) return setPhoneError('Tối đa 11 số');        // simple VN rule
      setPhoneError('');
      setForm((p) => ({ ...p, phone: digits }));
    } else if (name === 'email') {
      setForm((p) => ({ ...p, email: value }));
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value) && value.length > 0) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      /* Map sang payload backend */
      const payload = {
        info: { name: form.petName },
        owner: { 
          name: form.ownerName, 
          phone: form.phone,
          email: form.email 
        },
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
        {/* Removed close button */}
        
        <h2>New Pet Profile! 👋</h2>
        <p className="popup-subtitle">Please enter the basic information to set up your pet's profile.</p>

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
            <label><FiMail /> Email</label>
            <input
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email address"
              required
              type="email"
            />
            {emailError && <span className="error-message">⚠️ {emailError}</span>}
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
