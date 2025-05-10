import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPetById,
  updatePetById,
  uploadPetAvatar,
  getPetAvatarUrl,
  updatePetOwnerEmail
} from '../api/petService';
import { FiPlus, FiTrash2, FiEdit2, FiCamera } from 'react-icons/fi';
import './UserEditForm.css';

// Import react-toastify
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Labels for both languages
const labels = {
  vi: {
    edit: 'Chỉnh sửa',
    closeEdit: 'Đóng chỉnh sửa',
    petPhoto: 'Ảnh Của Bé',
    petInfoTitle: 'Thông tin Của Bé',
    petName: 'Tên Pet',
    species: 'Loài',
    birthDate: 'Ngày Sinh',
    revisitDate: 'Ngày tái khám',
    ownerInfoTitle: 'Thông tin Của Sen',
    ownerName: 'Tên Chủ',
    ownerPhone: 'Số điện thoại',
    ownerEmail: 'Email Chủ',
    vaxTitle: 'Lịch tiêm ngừa',
    noVax: 'Chưa có mũi tiêm nào.',
    addVax: 'Thêm mũi tiêm',
    reExamTitle: 'Lịch tái khám',
    noReExam: 'Chưa có lịch tái khám nào.',
    addReExam: 'Thêm lịch tái khám',
    reExamDate: 'Ngày tái khám',
    reExamNote: 'Thêm Lịch Khám',
    save: 'Lưu thông tin',
    toggleLang: 'EN',
    success: 'Đã lưu ✓',
    error: 'Có lỗi xảy ra, vui lòng thử lại!',
    reExaminationDate: 'Ngày tái khám',
    allergicInfoTitle: 'Thông tin Dị ứng',
    allergicSubstances: 'Chất gây dị ứng',
    allergicNote: 'Ghi chú về dị ứng',
  },
  en: {
    edit: 'Edit',
    closeEdit: 'Close Edit',
    petPhoto: 'Pet Photo',
    petInfoTitle: "Pet's Information",
    petName: 'Name',
    species: 'Species',
    birthDate: 'Birth Date',
    revisitDate: 'Revisit Date',
    ownerInfoTitle: "Owner's Information",
    ownerName: 'Owner Name',
    ownerPhone: 'Owner Phone',
    ownerEmail: 'Owner Email',
    vaxTitle: 'Vaccination History',
    noVax: 'No vaccinations yet.',
    addVax: 'Vaccination',
    reExamTitle: 'Re-examination Schedule',
    noReExam: 'No re-examination schedule yet.',
    addReExam: 'Add Re-examination',
    reExamDate: 'Re-examination Date',
    reExamNote: '+ Re-examination',
    save: 'Save',
    toggleLang: 'VI',
    success: 'Saved ✓',
    error: 'Something went wrong, please try again!',
    reExaminationDate: 'Re-examination Date',
    allergicInfoTitle: 'Allergic Information',
    allergicSubstances: 'Allergic Substances',
    allergicNote: 'Allergy Note',
  }
};

// Add custom toast styles
const customStyles = `
  .custom-toast-container {
    padding: 16px;
  }

  .custom-toast-container .Toastify__toast {
    margin-bottom: 12px;
    border-radius: 20px;
    background: #F8FAFC;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border: 0.5px solid rgba(226, 232, 240, 0.8);
    padding: 14px 18px;
    min-width: 260px;
    max-width: 300px;
    transform: translateY(0);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    opacity: 1;
  }

  .custom-toast-container .Toastify__toast--enter {
    transform: translateY(-20px);
    opacity: 0;
  }

  .custom-toast-container .Toastify__toast--enter-active {
    transform: translateY(0);
    opacity: 1;
  }

  .custom-toast-container .Toastify__toast--exit {
    transform: translateY(0);
    opacity: 1;
  }

  .custom-toast-container .Toastify__toast--exit-active {
    transform: translateY(-20px);
    opacity: 0;
  }

  .custom-toast-container .Toastify__toast-body {
    padding: 0;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 14px;
    font-size: 15px;
    font-weight: 600;
    color: #1E293B;
  }

  @media (max-width: 768px) {
    .custom-toast-container {
      padding: 8px;
      width: 100%;
      max-width: 100%;
      bottom: 0;
    }

    .custom-toast-container .Toastify__toast {
      margin: 0 auto 8px;
      width: calc(100% - 16px);
      max-width: 320px;
      border-radius: 16px;
      padding: 10px 14px;
      min-width: auto;
    }

    .custom-toast-container .Toastify__toast-body {
      font-size: 14px;
      gap: 10px;
    }

    .custom-toast-container .Toastify__toast-body > div:first-child {
      width: 24px;
      height: 24px;
      min-width: 24px;
    }

    .custom-toast-container .Toastify__toast-body > div:first-child > div {
      width: 24px;
      height: 24px;
      font-size: 14px;
    }
  }
`;

// Add this right after the customStyles definition
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = customStyles;
document.head.appendChild(styleSheet);

// Update toastStyles for mobile optimization
const toastStyles = {
  success: {
    position: isMobile => isMobile ? "bottom-center" : "top-right",
    autoClose: isMobile => isMobile ? 1500 : 2000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    style: {
      background: '#F8FAFC',
      color: '#1E293B',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      padding: '14px 18px',
      fontSize: '15px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      border: '0.5px solid rgba(226, 232, 240, 0.8)',
      minWidth: '260px',
      maxWidth: '300px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      transform: 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      opacity: 1
    },
    icon: () => (
      <div style={{
        background: 'linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)',
        transition: 'transform 0.2s ease'
      }}>
        ✓
      </div>
    )
  },
  error: {
    position: isMobile => isMobile ? "bottom-center" : "top-right",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: false,
    style: {
      background: '#F8FAFC',
      color: '#1E293B',
      borderRadius: '20px',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
      padding: '14px 18px',
      fontSize: '15px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      border: '0.5px solid rgba(226, 232, 240, 0.8)',
      minWidth: '260px',
      maxWidth: '300px',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)'
    },
    icon: () => (
      <div style={{
        background: 'linear-gradient(135deg, #FF6B6B 0%, #FF5252 100%)',
        borderRadius: '50%',
        width: '28px',
        height: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '16px',
        boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
      }}>
        ×
      </div>
    )
  }
};

export default function UserEditForm() {
  const { id } = useParams();
  const [lang, setLang] = useState('vi');
  const t = labels[lang];

  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    info: { name: '', species: '', birthDate: '' },
    owner: { name: '', phone: '', email: '' },
    vaccinations: [],
    reExaminations: [],
    allergicInfo: { substances: [], note: '' }
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState('');
  const [existingEmail, setExistingEmail] = useState('');
  const [showAllergicFields, setShowAllergicFields] = useState(false);

  // Add new state for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Modify initial state for section visibility - all collapsed by default
  const [expandedSections, setExpandedSections] = useState({
    petInfo: false,
    ownerInfo: false,
    vaccinations: false,
    reExaminations: false,
    allergicInfo: false
  });

  // Add effect to collapse all sections when edit mode is disabled
  useEffect(() => {
    if (!isEditMode) {
      setExpandedSections({
        petInfo: false,
        ownerInfo: false,
        vaccinations: false,
        reExaminations: false,
        allergicInfo: false
      });
    }
  }, [isEditMode]);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load pet data
  useEffect(() => {
    getPetById(id).then(pet => {
      setForm({
        info: {
          name: pet.info.name || '',
          species: pet.info.species || '',
          birthDate: pet.info.birthDate
            ? new Date(pet.info.birthDate).toISOString().split('T')[0]
            : ''
        },
        owner: {
          name: pet.owner.name || '',
          phone: pet.owner.phone || '',
          email: pet.owner.email || ''
        },
        vaccinations: (pet.vaccinations || []).map(v => ({
          name: v.name,
          date: v.date
            ? new Date(v.date).toISOString().split('T')[0]
            : ''
        })),
        reExaminations: (pet.reExaminations || []).map(r => ({
          date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
          note: r.note || ''
        })),
        allergicInfo: pet.allergicInfo || { substances: [], note: '' }
      });
      if (pet.avatarFileId) {
        setAvatarUrl(getPetAvatarUrl(pet.avatarFileId));
      }
      // Set existing email
      if (pet.owner.email) {
        setExistingEmail(pet.owner.email);
      }
    });
  }, [id]);

  // Preview file uploads
  useEffect(() => {
    if (!avatarFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // Handlers for form fields
  const handleChange = (e, section) => {
    const { name, value } = e.target;
    
    // Phone number validation
    if (name === 'phone') {
      // Only allow numbers and limit to 10 digits
      const phoneNumber = value.replace(/\D/g, '').slice(0, 10);
      setForm(f => ({
        ...f,
        [section]: { ...f[section], [name]: phoneNumber }
      }));
      return;
    }

    setForm(f => ({
      ...f,
      [section]: { ...f[section], [name]: value }
    }));
  };

  const handleVaxChange = (idx, field, value) => {
    setForm(f => {
      const vax = [...f.vaccinations];
      vax[idx] = { ...vax[idx], [field]: value };
      return { ...f, vaccinations: vax };
    });
  };

  const addVax = () => {
    setForm(f => ({
      ...f,
      vaccinations: [...f.vaccinations, { name: '', date: '' }]
    }));
  };

  const removeVax = idx => {
    setForm(f => ({
      ...f,
      vaccinations: f.vaccinations.filter((_, i) => i !== idx)
    }));
  };

  // Modify handleFileChange to use camera on mobile
  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const url = URL.createObjectURL(file);
      setPreview(url);
    }
  };

  // Add camera capture function for mobile
  const handleCameraCapture = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.play();

          video.onloadedmetadata = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0);
            
            canvas.toBlob(blob => {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              setAvatarFile(file);
              setPreview(URL.createObjectURL(blob));
            }, 'image/jpeg');

            stream.getTracks().forEach(track => track.stop());
          };
        })
        .catch(err => {
          console.error('Error accessing camera:', err);
          toast.error('Could not access camera');
        });
    }
  };

  const handleReExamChange = (idx, field, value) => {
    setForm(f => {
      const reExams = [...f.reExaminations];
      reExams[idx] = { ...reExams[idx], [field]: value };
      return { ...f, reExaminations: reExams };
    });
  };

  const addReExam = () => {
    setForm(f => ({
      ...f,
      reExaminations: [...f.reExaminations, { date: '', note: '' }]
    }));
  };

  const removeReExam = idx => {
    setForm(f => ({
      ...f,
      reExaminations: f.reExaminations.filter((_, i) => i !== idx)
    }));
  };

  const handleAllergicInfoChange = (field, value) => {
    setForm(f => ({
      ...f,
      allergicInfo: { ...f.allergicInfo, [field]: value }
    }));
  };

  // Add new handler for allergic substances
  const handleAllergicSubstancesChange = (e) => {
    const substances = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    handleAllergicInfoChange('substances', substances);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Format the data for submission
      const payload = {
        info: {
          name: form.info.name,
          species: form.info.species,
          birthDate: form.info.birthDate ? new Date(form.info.birthDate).toISOString() : null
        },
        owner: {
          name: form.owner.name,
          phone: form.owner.phone,
          email: form.owner.email
        },
        vaccinations: form.vaccinations
          .filter(v => v.name && v.date)
          .map(v => ({
            name: v.name,
            date: new Date(v.date).toISOString()
          })),
        reExaminations: form.reExaminations
          .filter(r => r.date)
          .map(r => ({
            date: new Date(r.date).toISOString(),
            note: r.note || ''
          })),
        allergicInfo: form.allergicInfo
      };

      console.log('Submitting payload:', payload);

      // Update the pet information
      const updatedPet = await updatePetById(id, payload);
      console.log('Update response:', updatedPet);

      // Upload avatar if it exists
      if (avatarFile) {
        const updated = await uploadPetAvatar(id, avatarFile);
        setAvatarUrl(getPetAvatarUrl(updated.avatarFileId));
        setAvatarFile(null);
      }

      toast.success(t.success, {
        position: isMobile ? "bottom-center" : "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#4ECDC4',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          fontSize: '15px',
          fontWeight: '500',
        },
        icon: '✅'
      });

      // Re-fetch the pet data after saving
      const refreshedPet = await getPetById(id);
      console.log('Refreshed pet data:', refreshedPet);

      setForm({
        info: {
          name: refreshedPet.info.name || '',
          species: refreshedPet.info.species || '',
          birthDate: refreshedPet.info.birthDate
            ? new Date(refreshedPet.info.birthDate).toISOString().split('T')[0]
            : ''
        },
        owner: {
          name: refreshedPet.owner.name || '',
          phone: refreshedPet.owner.phone || '',
          email: refreshedPet.owner.email || ''
        },
        vaccinations: (refreshedPet.vaccinations || []).map(v => ({
          name: v.name,
          date: v.date ? new Date(v.date).toISOString().split('T')[0] : ''
        })),
        reExaminations: (refreshedPet.reExaminations || []).map(r => ({
          date: r.date ? new Date(r.date).toISOString().split('T')[0] : '',
          note: r.note || ''
        })),
        allergicInfo: refreshedPet.allergicInfo || { substances: [], note: '' }
      });

      if (refreshedPet.avatarFileId) {
        setAvatarUrl(getPetAvatarUrl(refreshedPet.avatarFileId));
      }

      setIsEditMode(false);
      setPreview('');
    } catch (err) {
      console.error('Error updating pet:', err);
      toast.error(t.error, {
        position: isMobile ? "bottom-center" : "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          background: '#FF6B6B',
          color: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          padding: '16px',
          fontSize: '15px',
          fontWeight: '500',
        },
        icon: '❌'
      });
    }
  };

  // Add toggle function for sections
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <div className="edit-controls">
        <button
          type="button"
          className={`edit-btn ${isEditMode ? 'active' : ''}`}
          onClick={() => setIsEditMode(m => !m)}
        >
          <FiEdit2 /> {isEditMode ? t.closeEdit : t.edit}
        </button>
        <button
          type="button"
          className="lang-btn"
          onClick={() => setLang(l => (l === 'vi' ? 'en' : 'vi'))}
        >
          {t.toggleLang}
        </button>
      </div>

      {/* Avatar Section */}
      <div className="section avatar-section">
        <h3 className="section-title">📷 {t.petPhoto}</h3>
        {preview ? (
          <img src={preview} alt="Pet Avatar" className="pet-image-preview" />
        ) : avatarUrl ? (
          <img src={avatarUrl} alt="Pet Avatar" className="pet-image-preview" />
        ) : (
          <div className="pet-image-preview empty-avatar" />
        )}
        {isEditMode && (
          <div className="avatar-controls">
            <input
              type="file"
              accept="image/*"
              capture={isMobile ? "environment" : undefined}
              className="file-input"
              onChange={handleFileChange}
              id="avatar-upload"
              style={{ display: 'none' }}
            />
            <label htmlFor="avatar-upload" className="file-input">
              {isMobile ? <FiCamera /> : null} {isMobile ? 'Take Photo' : 'Upload Photo'}
            </label>
          </div>
        )}
      </div>

      <div className="fields-column">
        {/* Pet Info */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">🐾 {t.petInfoTitle}</h3>
            <button
              type="button"
              className={`toggle-section-btn ${expandedSections.petInfo ? 'rotated' : ''}`}
              onClick={() => toggleSection('petInfo')}
            >
              <FiPlus />
            </button>
          </div>
          <div className={`section-content ${expandedSections.petInfo && isEditMode ? 'expanded' : ''}`}>
            <div className="field-group">
              <label htmlFor="name">{t.petName}</label>
              <input
                id="name"
                name="name"
                value={form.info.name}
                onChange={e => handleChange(e, 'info')}
                disabled={!isEditMode}
              />
            </div>
            <div className="field-group">
              <label htmlFor="species">{t.species}</label>
              <input
                id="species"
                name="species"
                value={form.info.species}
                onChange={e => handleChange(e, 'info')}
                disabled={!isEditMode}
              />
            </div>
            <div className="field-group">
              <label htmlFor="birthDate">{t.birthDate}</label>
              <input
                id="birthDate"
                type="date"
                name="birthDate"
                value={form.info.birthDate}
                onChange={e => handleChange(e, 'info')}
                disabled={!isEditMode}
              />
            </div>
          </div>
        </div>

        {/* Owner Info */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">👤 {t.ownerInfoTitle}</h3>
            <button
              type="button"
              className={`toggle-section-btn ${expandedSections.ownerInfo ? 'rotated' : ''}`}
              onClick={() => toggleSection('ownerInfo')}
            >
              <FiPlus />
            </button>
          </div>
          <div className={`section-content ${expandedSections.ownerInfo && isEditMode ? 'expanded' : ''}`}>
            <div className="field-group">
              <label htmlFor="owner-name">{t.ownerName}</label>
              <input
                id="owner-name"
                name="name"
                value={form.owner.name}
                onChange={e => handleChange(e, 'owner')}
                disabled={!isEditMode}
              />
            </div>
            <div className="field-group">
              <label htmlFor="owner-phone">{t.ownerPhone}</label>
              <input
                id="owner-phone"
                name="phone"
                value={form.owner.phone}
                onChange={e => handleChange(e, 'owner')}
                disabled={!isEditMode}
              />
            </div>
            <div className="field-group">
              <label htmlFor="owner-email">{t.ownerEmail}</label>
              {existingEmail && !isEditMode ? (
                <div className="existing-email">{existingEmail}</div>
              ) : (
                <input
                  id="owner-email"
                  name="email"
                  value={form.owner.email}
                  onChange={e => handleChange(e, 'owner')}
                  disabled={!isEditMode}
                  type="email"
                  placeholder="Enter owner's email"
                />
              )}
            </div>
          </div>
        </div>

        {/* Vaccinations */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">💉 {t.vaxTitle}</h3>
            <button
              type="button"
              className={`toggle-section-btn ${expandedSections.vaccinations ? 'rotated' : ''}`}
              onClick={() => toggleSection('vaccinations')}
            >
              <FiPlus />
            </button>
          </div>
          <div className={`section-content ${expandedSections.vaccinations && isEditMode ? 'expanded' : ''}`}>
            {form.vaccinations.length === 0 && <p>{t.noVax}</p>}
            {form.vaccinations.map((v, i) => (
              <div key={i} className="vax-item">
                <input
                  type="text"
                  placeholder={t.addVax}
                  value={v.name}
                  onChange={e => handleVaxChange(i, 'name', e.target.value)}
                  disabled={!isEditMode}
                />
                <input
                  type="date"
                  value={v.date}
                  onChange={e => handleVaxChange(i, 'date', e.target.value)}
                  disabled={!isEditMode}
                />
                {isEditMode && (
                  <button
                    type="button"
                    className="remove-vax-btn"
                    onClick={() => removeVax(i)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button type="button" className="add-vax-btn" onClick={addVax}>
                <FiPlus /> {t.addVax}
              </button>
            )}
          </div>
        </div>

        {/* Re-examination Schedule */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">📅 {t.reExamTitle}</h3>
            <button
              type="button"
              className={`toggle-section-btn ${expandedSections.reExaminations ? 'rotated' : ''}`}
              onClick={() => toggleSection('reExaminations')}
            >
              <FiPlus />
            </button>
          </div>
          <div className={`section-content ${expandedSections.reExaminations && isEditMode ? 'expanded' : ''}`}>
            {form.reExaminations.length === 0 && <p>{t.noReExam}</p>}
            {form.reExaminations.map((r, i) => (
              <div key={i} className="vax-item">
                <input
                  type="text"
                  value={r.note}
                  onChange={e => handleReExamChange(i, 'note', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={t.reExamNote}
                />
                <input
                  type="date"
                  value={r.date}
                  onChange={e => handleReExamChange(i, 'date', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={t.reExamDate}
                />
                {isEditMode && (
                  <button
                    type="button"
                    className="remove-vax-btn"
                    onClick={() => removeReExam(i)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            ))}
            {isEditMode && (
              <button type="button" className="add-vax-btn" onClick={addReExam}>
                <FiPlus /> {t.addReExam}
              </button>
            )}
          </div>
        </div>

        {/* Allergic Information */}
        <div className="section">
          <div className="section-header">
            <h3 className="section-title">⚠️ {t.allergicInfoTitle}</h3>
            <button
              type="button"
              className={`toggle-section-btn ${expandedSections.allergicInfo ? 'rotated' : ''}`}
              onClick={() => toggleSection('allergicInfo')}
            >
              <FiPlus />
            </button>
          </div>
          <div className={`section-content ${expandedSections.allergicInfo && isEditMode ? 'expanded' : ''}`}>
            <div className="allergic-fields">
              <div className="field-group">
                <label htmlFor="substances">{t.allergicSubstances}</label>
                <input
                  id="substances"
                  name="substances"
                  value={form.allergicInfo.substances.join(', ')}
                  onChange={handleAllergicSubstancesChange}
                  disabled={!isEditMode}
                  placeholder={t.allergicSubstances}
                />
              </div>
              <div className="field-group">
                <label htmlFor="note">{t.allergicNote}</label>
                <textarea
                  id="note"
                  name="note"
                  value={form.allergicInfo.note}
                  onChange={e => handleAllergicInfoChange('note', e.target.value)}
                  disabled={!isEditMode}
                  placeholder={t.allergicNote}
                  rows="3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        {isEditMode && (
          <button type="submit" className="submit-btn">
            {t.save}
          </button>
        )}
      </div>

      {/* Toast container with improved styling */}
      <ToastContainer
        position={isMobile ? "bottom-center" : "top-right"}
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="light"
        style={{
          zIndex: 9999
        }}
        toastStyle={{
          margin: '12px',
          borderRadius: '16px',
          background: '#F8FAFC',
          color: '#1E293B',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          transform: 'translateY(0)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          opacity: 1
        }}
        closeButton={false}
        className="custom-toast-container"
      />
    </form>
  );
}