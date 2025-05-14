import React, { useState, useEffect } from 'react';
import { FiX, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './EditPopup.css';

const EditPopup = ({ isOpen, section, petData, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (isOpen && petData) {
      // Initialize form data based on section
      switch (section) {
        case 'profile':
          setFormData({
            name: petData.info.name || '',
            species: petData.info.species || '',
            birthDate: petData.info.birthDate ? new Date(petData.info.birthDate) : null
          });
          break;
        case 'petInfo':
          setFormData({
            name: petData.info.name || '',
            species: petData.info.species || '',
            birthDate: petData.info.birthDate ? new Date(petData.info.birthDate) : null,
            description: petData.info.description || ''
          });
          break;
        case 'ownerInfo':
          setFormData({
            ownerName: petData.owner.name || '',
            phone: petData.owner.phone || '',
            email: petData.owner.email || ''
          });
          break;
        case 'vaccinations':
          setFormData({
            vaccinations: petData.vaccinations?.length 
              ? [...petData.vaccinations.map(v => ({
                  name: v.name,
                  date: v.date ? new Date(v.date) : null
                }))]
              : [{ name: '', date: null }]
          });
          break;
        case 'reExaminations':
          setFormData({
            reExaminations: petData.reExaminations?.length 
              ? [...petData.reExaminations.map(r => ({
                  note: r.note || '',
                  date: r.date ? new Date(r.date) : null
                }))]
              : [{ note: '', date: null }]
          });
          break;
        case 'allergicInfo':
          setFormData({
            substances: petData.allergicInfo?.substances || [],
            note: petData.allergicInfo?.note || '',
            newAllergen: ''
          });
          break;
        default:
          setFormData({});
      }
    }
  }, [isOpen, section, petData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date, field) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleVaccinationChange = (index, field, value) => {
    const updatedVaccinations = [...formData.vaccinations];
    updatedVaccinations[index] = {
      ...updatedVaccinations[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, vaccinations: updatedVaccinations }));
  };

  const addVaccination = () => {
    setFormData(prev => ({
      ...prev,
      vaccinations: [...prev.vaccinations, { name: '', date: null }]
    }));
  };

  const removeVaccination = (index) => {
    const updatedVaccinations = [...formData.vaccinations];
    updatedVaccinations.splice(index, 1);
    setFormData(prev => ({ ...prev, vaccinations: updatedVaccinations }));
  };

  const addAllergen = () => {
    if (!formData.newAllergen.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      substances: [...prev.substances, prev.newAllergen.trim()],
      newAllergen: ''
    }));
  };

  const removeAllergen = (index) => {
    const updatedSubstances = [...formData.substances];
    updatedSubstances.splice(index, 1);
    setFormData(prev => ({ ...prev, substances: updatedSubstances }));
  };

  const handleReExaminationChange = (index, field, value) => {
    const updatedReExaminations = [...formData.reExaminations];
    updatedReExaminations[index] = {
      ...updatedReExaminations[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, reExaminations: updatedReExaminations }));
  };

  const addReExamination = () => {
    setFormData(prev => ({
      ...prev,
      reExaminations: [...prev.reExaminations, { note: '', date: null }]
    }));
  };

  const removeReExamination = (index) => {
    const updatedReExaminations = [...formData.reExaminations];
    updatedReExaminations.splice(index, 1);
    setFormData(prev => ({ ...prev, reExaminations: updatedReExaminations }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  const renderForm = () => {
    switch (section) {
      case 'profile':
        return (
          <>
            <h2>Edit Pet Profile</h2>
            <div className="form-group">
              <label>Pet Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Pet Name"
              />
            </div>
            <div className="form-group">
              <label>Species/Breed</label>
              <input
                type="text"
                name="species"
                value={formData.species || ''}
                onChange={handleChange}
                placeholder="Species or Breed"
              />
            </div>
            <div className="form-group">
              <label>Birth Date</label>
              <div className="date-picker-container">
                <DatePicker
                  selected={formData.birthDate}
                  onChange={(date) => handleDateChange(date, 'birthDate')}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date"
                  className="date-picker"
                  maxDate={new Date()}
                />
                <FiCalendar className="calendar-icon" />
              </div>
            </div>
          </>
        );
      
      case 'petInfo':
        return (
          <>
            <h2>Edit Pet Information</h2>
            <div className="form-group">
              <label>Pet Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleChange}
                placeholder="Pet Name"
              />
            </div>
            <div className="form-group">
              <label>Species/Breed</label>
              <input
                type="text"
                name="species"
                value={formData.species || ''}
                onChange={handleChange}
                placeholder="Species or Breed"
              />
            </div>
            <div className="form-group">
              <label>Birth Date</label>
              <div className="date-picker-container">
                <DatePicker
                  selected={formData.birthDate}
                  onChange={(date) => handleDateChange(date, 'birthDate')}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date"
                  className="date-picker"
                  maxDate={new Date()}
                />
                <FiCalendar className="calendar-icon" />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                placeholder="Add pet description"
                rows={3}
              />
            </div>
          </>
        );
      
      case 'ownerInfo':
        return (
          <>
            <h2>Edit Owner Information</h2>
            <div className="form-group">
              <label>Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName || ''}
                onChange={handleChange}
                placeholder="Owner Name"
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ''}
                onChange={handleChange}
                placeholder="Phone Number"
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email || ''}
                onChange={handleChange}
                placeholder="Email Address"
              />
            </div>
          </>
        );
      
      case 'vaccinations':
        return (
          <>
            <h2>Edit Vaccinations</h2>
            {formData.vaccinations?.map((vacc, index) => (
              <div key={index} className="vaccination-item">
                <div className="form-group">
                  <label>Vaccination Name</label>
                  <input
                    type="text"
                    value={vacc.name || ''}
                    onChange={(e) => handleVaccinationChange(index, 'name', e.target.value)}
                    placeholder="Vaccination Name"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={vacc.date}
                      onChange={(date) => handleVaccinationChange(index, 'date', date)}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date"
                      className="date-picker"
                    />
                    <FiCalendar className="calendar-icon" />
                  </div>
                </div>
                {formData.vaccinations.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => removeVaccination(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-button" onClick={addVaccination}>
              <FiPlus /> Add Vaccination
            </button>
          </>
        );
      
      case 'reExaminations':
        return (
          <>
            <h2>Edit Re-examination Schedule</h2>
            {formData.reExaminations?.map((reExam, index) => (
              <div key={index} className="vaccination-item">
                <div className="form-group">
                  <label>Note</label>
                  <input
                    type="text"
                    value={reExam.note || ''}
                    onChange={(e) => handleReExaminationChange(index, 'note', e.target.value)}
                    placeholder="Examination Description"
                  />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <div className="date-picker-container">
                    <DatePicker
                      selected={reExam.date}
                      onChange={(date) => handleReExaminationChange(index, 'date', date)}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date"
                      className="date-picker"
                    />
                    <FiCalendar className="calendar-icon" />
                  </div>
                </div>
                {formData.reExaminations.length > 1 && (
                  <button 
                    type="button" 
                    className="remove-button"
                    onClick={() => removeReExamination(index)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            <button type="button" className="add-button" onClick={addReExamination}>
              <FiPlus /> Add Re-examination
            </button>
          </>
        );
      
      case 'allergicInfo':
        return (
          <>
            <h2>Edit Allergic Information</h2>
            <div className="form-group">
              <label>Allergens</label>
              <div className="allergens-list">
                {formData.substances?.map((substance, index) => (
                  <div key={index} className="allergen-tag">
                    {substance}
                    <button 
                      type="button" 
                      className="remove-allergen"
                      onClick={() => removeAllergen(index)}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="add-allergen-container">
                <input
                  type="text"
                  name="newAllergen"
                  value={formData.newAllergen || ''}
                  onChange={handleChange}
                  placeholder="Add allergen"
                />
                <button 
                  type="button" 
                  className="add-allergen-button"
                  onClick={addAllergen}
                >
                  <FiPlus />
                </button>
              </div>
            </div>
            <div className="form-group">
              <label>Notes</label>
              <textarea
                name="note"
                value={formData.note || ''}
                onChange={handleChange}
                placeholder="Add notes about allergic reactions"
                rows={3}
              />
            </div>
          </>
        );
      
      default:
        return <p>Unknown section</p>;
    }
  };

  return (
    <div className={`edit-popup ${isOpen ? 'open' : ''}`}>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="popup-content">
        <button className="close-button" onClick={onClose}>
          <FiX size={24} />
        </button>
        <form onSubmit={handleSubmit}>
          {renderForm()}
          <div className="button-group">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPopup; 