// src/components/UserEditForm.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPetById, updatePetById, uploadPetAvatar } from '../api/petService';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import './UserEditForm.css';

export default function UserEditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    info: { name: '', species: '', age: '' },
    owner: { name: '', phone: '' },
    vaccinations: []
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [preview, setPreview] = useState('');
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    getPetById(id).then(pet => {
      setForm({
        info: pet.info || { name: '', species: '', age: '' },
        owner: pet.owner || { name: '', phone: '' },
        vaccinations: pet.vaccinations || []
      });
      if (pet.avatarFileId) {
        setAvatarUrl(`${API_BASE}/api/admin/avatar/${pet.avatarFileId}`);
      }
    });
  }, [id]);

  useEffect(() => {
    if (!avatarFile) {
      setPreview('');
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [avatarFile]);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [section]: { ...f[section], [name]: value } }));
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
      // 1) Cập nhật text fields
      await updatePetById(id, form);

      // 2) Nếu có file, upload avatar
      if (avatarFile) {
        const res = await uploadPetAvatar(id, avatarFile);
        setAvatarUrl(`${API_BASE}/api/admin/avatar/${res.avatarFileId}`);
        setAvatarFile(null);
      }

      alert('Lưu thông tin thành công!');
    } catch (err) {
      console.error(err);
      alert('Có lỗi, vui lòng thử lại.');
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* LEFT COLUMN: Fields */}
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
                placeholder="Nhập tên pet"
              />
            </div>
            <div className="field-group">
              <label htmlFor="species">Loài</label>
              <input
                id="species"
                name="species"
                value={form.info.species}
                onChange={e => handleChange(e, 'info')}
                placeholder="Nhập loài pet"
              />
            </div>
            <div className="field-group">
              <label htmlFor="age">Ngày Sinh</label>
              <input
                id="age"
                type="number"
                name="age"
                value={form.info.age}
                onChange={e => handleChange(e, 'info')}
                placeholder="Nhập tuổi pet"
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
                placeholder="Nhập tên chủ"
              />
            </div>
            <div className="field-group">
              <label htmlFor="owner-phone">Số điện thoại</label>
              <input
                id="owner-phone"
                name="phone"
                value={form.owner.phone}
                onChange={e => handleChange(e, 'owner')}
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>

          {/* Vaccinations */}
          <div className="section">
            <h3 className="section-title">💉 Lịch tiêm ngừa</h3>
            <div className="vax-list">
              {form.vaccinations.length === 0 && (
                <p className="no-vax">Chưa có mũi tiêm nào.</p>
              )}
              {form.vaccinations.map((v, i) => (
                <div key={i} className="vax-item">
                  <input
                    type="text"
                    placeholder="Tên vaccine"
                    value={v.name}
                    onChange={e => handleVaxChange(i, 'name', e.target.value)}
                  />
                  <input
                    type="date"
                    value={v.date || ''}
                    onChange={e => handleVaxChange(i, 'date', e.target.value)}
                  />
                  <button
                    type="button"
                    className="remove-vax-btn"
                    onClick={() => removeVax(i)}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              className="add-vax-btn"
              onClick={addVax}
            >
              <FiPlus /> Thêm mũi tiêm
            </button>
          </div>

          {/* Submit */}
          <button type="submit" className="submit-btn">
            Lưu thông tin
          </button>
        </div>

        {/* RIGHT COLUMN: Avatar */}
        <div className="section avatar-section">
          <h3 className="section-title">📷 Ảnh Pet</h3>
          {(preview || avatarUrl) && (
            <img
              src={preview || avatarUrl}
              alt="Pet"
              className="pet-image-preview"
            />
          )}
          <input
            type="file"
            accept="image/*"
            className="file-input"
            onChange={handleFileChange}
          />
        </div>
      </form>
    </div>
  );
}
