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
    petPhoto: 'Ảnh Pet',
    petInfoTitle: 'Thông tin Của Bé',
    petName: 'Tên Pet',
    species: 'Loài',
    birthDate: 'Ngày Sinh',
    revisitDate: 'Ngày tái khám',  // New label for revisitDate
    ownerInfoTitle: 'Thông tin Của Sen',
    ownerName: 'Tên Chủ',
    ownerPhone: 'Số điện thoại',
    ownerEmail: 'Email Chủ',
    vaxTitle: 'Lịch tiêm ngừa',
    noVax: 'Chưa có mũi tiêm nào.',
    addVax: 'Thêm mũi tiêm',
    save: 'Lưu thông tin',
    toggleLang: 'EN',
    success: 'Thao tác thành công!',
    error: 'Có lỗi xảy ra, vui lòng thử lại!'
  },
  en: {
    edit: 'Edit',
    closeEdit: 'Close Edit',
    petPhoto: 'Pet Photo',
    petInfoTitle: "Pet's Information",
    petName: 'Name',
    species: 'Species',
    birthDate: 'Birth Date',
    revisitDate: 'Revisit Date', // New label for revisitDate
    ownerInfoTitle: "Owner's Information",
    ownerName: 'Owner Name',
    ownerPhone: 'Owner Phone',
    ownerEmail: 'Owner Email',
    vaxTitle: 'Vaccination History',
    noVax: 'No vaccinations yet.',
    addVax: 'Add Vaccination',
    save: 'Save',
    toggleLang: 'VI',
    success: 'Action was successful!',
    error: 'Something went wrong, please try again!'
  }
};

export default function UserEditForm() {
  const { id } = useParams();
  const [lang, setLang] = useState('vi');
  const t = labels[lang];

  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    info: { name: '', species: '', birthDate: '', revisitDate: '' },  // Added revisitDate to info
    owner: { name: '', phone: '', email: '' },
    vaccinations: []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState('');

  // Load pet data
  useEffect(() => {
    getPetById(id).then(pet => {
      setForm({
        info: {
          name: pet.info.name || '',
          species: pet.info.species || '',
          birthDate: pet.info.birthDate
            ? new Date(pet.info.birthDate).toISOString().split('T')[0]
            : '',
          revisitDate: pet.revisitDate
            ? new Date(pet.revisitDate).toISOString().split('T')[0]
            : ''  // Handle revisitDate
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
        }))
      });
      if (pet.avatarFileId) {
        setAvatarUrl(getPetAvatarUrl(pet.avatarFileId));
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
    setAvatarFile(e.target.files[0] || null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        info: { ...form.info, birthDate: form.info.birthDate || null, revisitDate: form.info.revisitDate || null },  // Include revisitDate in payload
        owner: { ...form.owner },
        vaccinations: form.vaccinations.filter(v => v.name && v.date).map(v => ({ name: v.name, date: v.date }))
      };

      // Check if email has changed and update it if necessary
      const pet = await getPetById(id);
      if (pet && pet.owner.email !== form.owner.email) {
        await updatePetOwnerEmail(id, form.owner.email); // Update email if it changed
      }

      // Update the pet information
      await updatePetById(id, payload);

      // Upload avatar if it exists
      if (avatarFile) {
        const updated = await uploadPetAvatar(id, avatarFile);
        setAvatarUrl(getPetAvatarUrl(updated.avatarFileId));
        setAvatarFile(null);
      }

      toast.success(t.success);

      // Re-fetch the pet data after saving
      getPetById(id).then(pet => {
        setForm({
          info: {
            name: pet.info.name || '',
            species: pet.info.species || '',
            birthDate: pet.info.birthDate
              ? new Date(pet.info.birthDate).toISOString().split('T')[0]
              : '',
            revisitDate: pet.revisitDate
              ? new Date(pet.revisitDate).toISOString().split('T')[0]
              : ''  // Handle revisitDate again
          },
          owner: {
            name: pet.owner.name || '',
            phone: pet.owner.phone || '',
            email: pet.owner.email || ''
          },
          vaccinations: (pet.vaccinations || []).map(v => ({
            name: v.name,
            date: v.date ? new Date(v.date).toISOString().split('T')[0] : ''
          }))
        });
        if (pet.avatarFileId) {
          setAvatarUrl(getPetAvatarUrl(pet.avatarFileId));
        }
      });

      setIsEditMode(false);
      setPreview('');
    } catch (err) {
      console.error(err);
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
        {avatarUrl ? (
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
          {/* Revisit Date */}
          <div className="field-group">
            <label htmlFor="revisitDate">{t.revisitDate}</label>
            <input
              id="revisitDate"
              type="date"
              name="revisitDate"
              value={form.info.revisitDate}
              onChange={e => handleChange(e, 'info')}
              disabled={!isEditMode}
            />
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
            <input
              id="owner-email"
              name="email"
              value={form.owner.email}
              onChange={e => handleChange(e, 'owner')}
              disabled={!isEditMode}
              type="email"
              placeholder="Enter owner's email"
            />
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
