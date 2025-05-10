import React, { useState } from 'react';
import { FiX, FiUser, FiPhone, FiHeart } from 'react-icons/fi';
import './FirstTimeScanPopup.css';

const FirstTimeScanPopup = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    petName: '',
    ownerName: '',
    phoneNumber: ''
  });

  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Phone number validation
    if (name === 'phoneNumber') {
      // Remove any non-digit characters
      const phoneNumber = value.replace(/\D/g, '');
      
      // Check if the input contains any letters
      if (value !== phoneNumber) {
        setPhoneError('Please enter numbers only');
        return;
      }
      
      // Limit to 10 digits
      if (phoneNumber.length > 10) {
        setPhoneError('Phone number must be 10 digits');
        return;
      }

      setPhoneError('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate phone number before submission
    if (formData.phoneNumber.length !== 10) {
      setPhoneError('Phone number must be 10 digits');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
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
            <label htmlFor="petName">
              <FiHeart /> Pet Name
            </label>
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
            <label htmlFor="ownerName">
              <FiUser /> Owner Name
            </label>
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
            <label htmlFor="phoneNumber">
              <FiPhone /> Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              required
              pattern="[0-9]{10}"
              maxLength="10"
            />
            {phoneError && (
              <span className="error-message">
                <span role="img" aria-label="error">⚠️</span> {phoneError}
              </span>
            )}
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Getting Started...' : 'Get Started'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FirstTimeScanPopup; 