import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPetById,
  updatePetById,
  uploadPetAvatar,
  getPetAvatarUrl,
  updatePetOwnerEmail
} from '../api/petService';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
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
    success: 'Thao tác thành công!',
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
    success: 'Action was successful!',
    error: 'Something went wrong, please try again!',
    reExaminationDate: 'Re-examination Date',
    allergicInfoTitle: 'Allergic Information',
    allergicSubstances: 'Allergic Substances',
    allergicNote: 'Allergy Note',
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

  const handleFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      // Create preview URL immediately
      const url = URL.createObjectURL(file);
      setPreview(url);
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

      toast.success(t.success);

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
      toast.error(t.error);
    }
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
        <input
          type="file"
          accept="image/*"
          className="file-input"
          onChange={handleFileChange}
          disabled={!isEditMode}
        />
      </div>

      <div className="fields-column">
        {/* Pet Info */}
        <div className="section">
          <h3 className="section-title">🐾 {t.petInfoTitle}</h3>
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

          {/* Allergic Information */}
          <div className="allergic-info">
            <div className="allergic-header">
              <h4 className="subsection-title">⚠️ {t.allergicInfoTitle}</h4>
              {isEditMode && (
                <button
                  type="button"
                  className="toggle-allergic-btn"
                  onClick={() => setShowAllergicFields(!showAllergicFields)}
                >
                  {showAllergicFields ? <FiTrash2 /> : <FiPlus />}
                </button>
              )}
            </div>
            
            {showAllergicFields && (
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
            )}
          </div>
        </div>

        {/* Owner Info */}
        <div className="section">
          <h3 className="section-title">👤 {t.ownerInfoTitle}</h3>
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

        {/* Vaccinations */}
        <div className="section">
          <h3 className="section-title">💉 {t.vaxTitle}</h3>
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

        {/* Re-examination Schedule */}
        <div className="section">
          <h3 className="section-title">📅 {t.reExamTitle}</h3>
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

        {/* Submit */}
        {isEditMode && (
          <button type="submit" className="submit-btn">
            {t.save}
          </button>
        )}
      </div>

      {/* Toast container */}
      <ToastContainer />
    </form>
  );
}