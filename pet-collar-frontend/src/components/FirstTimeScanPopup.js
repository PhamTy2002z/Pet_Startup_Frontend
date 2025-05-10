import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';
import './FirstTimeScanPopup.css';

const FirstTimeScanPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    phoneNumber: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation
    if (name === 'phoneNumber') {
      // Only allow numbers and limit to 10 digits
      const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({
        ...prev,
        [name]: phoneNumber
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
        
        <h2>Welcome! 👋</h2>
        <p className="popup-subtitle">Let's get started with your pet's information</p>

        <form onSubmit={handleSubmit} className="popup-form">
          <div className="form-group">
            <label htmlFor="petName">Pet Name</label>
            <input
              type="text"
              id="petName"
              name="petName"
              value={formData.petName}
              onChange={handleChange}
              placeholder="Enter your pet's name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="ownerName">Owner Name</label>
            <input
              type="text"
              id="ownerName"
              name="ownerName"
              value={formData.ownerName}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <button type="submit" className="submit-button">
            Get Started
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstTimeScanPopup; 