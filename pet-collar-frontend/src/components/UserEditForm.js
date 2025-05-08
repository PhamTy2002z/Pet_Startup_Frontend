import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getPetById, updatePetById } from '../api/petService';
import './UserEditForm.css';

export default function UserEditForm() {
  const { id } = useParams();
  const [form, setForm] = useState({
    info: { name: '', species: '', age: '' },
    owner: { name: '', phone: '' },
    vaccinations: []
  });

  useEffect(() => {
    getPetById(id).then(pet => {
      setForm({
        info: pet.info || {},
        owner: pet.owner || {},
        vaccinations: pet.vaccinations || []
      });
    });
  }, [id]);

  const handleChange = (e, section) => {
    const { name, value } = e.target;
    setForm(f => ({
      ...f,
      [section]: { ...f[section], [name]: value }
    }));
  };

  const handleVaxChange = (idx, field, value) => {
    setForm(f => {
      const vs = [...f.vaccinations];
      vs[idx] = { ...vs[idx], [field]: value };
      return { ...f, vaccinations: vs };
    });
  };

  const addVax = () => {
    setForm(f => ({
      ...f,
      vaccinations: [...f.vaccinations, { name: '', date: '' }]
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    await updatePetById(id, form);
    alert('Lưu thông tin thành công!');
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        {/* Pet Info */}
        <div className="section">
          <h3 className="section-title">🐾 Thông tin Của Bé</h3>
          <div className="field-group">
            <label htmlFor="name">Tên Pet</label>
            <input
              id="name"
              name="name"
              value={form.info.name || ''}
              onChange={e => handleChange(e, 'info')}
              placeholder="Nhập tên pet"
            />
          </div>
          <div className="field-group">
            <label htmlFor="species">Loài</label>
            <input
              id="species"
              name="species"
              value={form.info.species || ''}
              onChange={e => handleChange(e, 'info')}
              placeholder="Nhập loài pet"
            />
          </div>
          <div className="field-group">
            <label htmlFor="age">Tuổi</label>
            <input
              id="age"
              type="number"
              name="age"
              value={form.info.age || ''}
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
              value={form.owner.name || ''}
              onChange={e => handleChange(e, 'owner')}
              placeholder="Nhập tên chủ"
            />
          </div>
          <div className="field-group">
            <label htmlFor="owner-phone">Số điện thoại</label>
            <input
              id="owner-phone"
              name="phone"
              value={form.owner.phone || ''}
              onChange={e => handleChange(e, 'owner')}
              placeholder="Nhập số điện thoại"
            />
          </div>
        </div>

        {/* Vaccinations */}
        <div className="section">
          <h3 className="section-title">💉 Lịch tiêm ngừa</h3>
          <div className="vax-list">
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
                  value={v.date ? v.date.slice(0,10) : ''}
                  onChange={e => handleVaxChange(i, 'date', e.target.value)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="add-vax-btn"
            onClick={addVax}
          >
            + Thêm mũi tiêm
          </button>
        </div>

        {/* Submit */}
        <button type="submit" className="submit-btn">
          Lưu thông tin
        </button>
      </form>
    </div>
  );
}
