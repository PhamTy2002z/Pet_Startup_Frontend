// src/components/UserEditForm.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  getPetById,
  updatePetById,
  uploadPetAvatar,
  getPetAvatarUrl
} from '../api/petService';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import './UserEditForm.css';

export default function UserEditForm() {
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [form, setForm] = useState({
    info: { name: '', species: '', birthDate: '' },
    owner: { name: '', phone: '' },
    vaccinations: []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState('');

  // 1) Load pet data khi component mount
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
          phone: pet.owner.phone || ''
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

  // 2) Tạo preview khi chọn file mới
  useEffect(() => {
    if (!avatarFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  // 3) Handlers cho form fields
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

  // 4) Submit form
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Chuẩn hóa payload
      const payload = {
        info: {
          ...form.info,
          birthDate: form.info.birthDate || null
        },
        owner: { ...form.owner },
        vaccinations: form.vaccinations
          .filter(v => v.name && v.date)
          .map(v => ({ name: v.name, date: v.date }))
      };

      // 4.1) Cập nhật text fields
      await updatePetById(id, payload);

      // 4.2) Upload avatar nếu có chọn file
      if (avatarFile) {
        const updated = await uploadPetAvatar(id, avatarFile);
        setAvatarUrl(getPetAvatarUrl(updated.avatarFileId));
        setAvatarFile(null);
      }

      alert('Lưu thông tin thành công!');
      setIsEditMode(false);
      setPreview('');
    } catch (err) {
      console.error(err);
      alert('Có lỗi, vui lòng thử lại.');
    }
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      {/* nút bật/tắt edit */}
      <div className="edit-controls">
        <button
          type="button"
          className={`edit-btn ${isEditMode ? 'active' : ''}`}
          onClick={() => setIsEditMode(m => !m)}
        >
          <FiEdit2 /> {isEditMode ? 'Đóng chỉnh sửa' : 'Chỉnh sửa'}
        </button>
      </div>

      {/* Avatar Section */}
      <div className="section avatar-section">
        <h3 className="section-title">📷 Ảnh Pet</h3>
        {(preview || avatarUrl) && (
          <img
            src={preview || avatarUrl}
            alt="Pet"
            className="pet-image-preview"
          />
        )}
        {isEditMode && (
          <input
            type="file"
            accept="image/*"
            className="file-input"
            onChange={handleFileChange}
          />
        )}
      </div>

      {/* Left Column: Fields */}
      <div className="fields-column">
        {/* Pet Info */}
        <div className="section">
          <h3 className="section-title">🐾 Thông tin Của Bé</h3>
          <div className="field-group">
            <label htmlFor="name">Tên Pet</label>
            <input
              id="name"
              name="name"
              value={form.info.name}
              onChange={e => handleChange(e, 'info')}
              disabled={!isEditMode}
            />
          </div>
          <div className="field-group">
            <label htmlFor="species">Loài</label>
            <input
              id="species"
              name="species"
              value={form.info.species}
              onChange={e => handleChange(e, 'info')}
              disabled={!isEditMode}
            />
          </div>
          <div className="field-group">
            <label htmlFor="birthDate">Ngày Sinh</label>
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

        {/* Owner Info */}
        <div className="section">
          <h3 className="section-title">👤 Thông tin Của Sen</h3>
          <div className="field-group">
            <label htmlFor="owner-name">Tên Chủ</label>
            <input
              id="owner-name"
              name="name"
              value={form.owner.name}
              onChange={e => handleChange(e, 'owner')}
              disabled={!isEditMode}
            />
          </div>
          <div className="field-group">
            <label htmlFor="owner-phone">Số điện thoại</label>
            <input
              id="owner-phone"
              name="phone"
              value={form.owner.phone}
              onChange={e => handleChange(e, 'owner')}
              disabled={!isEditMode}
            />
          </div>
        </div>

        {/* Vaccinations */}
        <div className="section">
          <h3 className="section-title">💉 Lịch tiêm ngừa</h3>
          {form.vaccinations.length === 0 && <p>Chưa có mũi tiêm nào.</p>}
          {form.vaccinations.map((v, i) => (
            <div key={i} className="vax-item">
              <input
                type="text"
                placeholder="Tên vaccine"
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
              <FiPlus /> Thêm mũi tiêm
            </button>
          )}
        </div>

        {/* Submit Button */}
        {isEditMode && (
          <button type="submit" className="submit-btn">
            Lưu thông tin
          </button>
        )}
      </div>
    </form>
  );
}
