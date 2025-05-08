// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiCircle } from 'react-icons/fi';
import {
  getAllPets,
  createPet,
  createBulkPets
} from '../api/petService';
import PetCard from './PetCard';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQty, setBulkQty] = useState('');  // allow free typing

  const fetchPets = async () => {
    setLoading(true);
    try {
      const data = await getAllPets();
      setPets(data);
    } catch (err) {
      console.error('Error fetching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPets(); }, []);

  const handleCreate = async () => {
    setLoading(true);
    try {
      await createPet();
      await fetchPets();
    } catch (err) {
      console.error('Error creating pet:', err);
    } finally {
      setLoading(false);
    }
  };

  const startBulk = () => {
    setBulkMode(true);
    setBulkQty(''); // clear default
  };
  const cancelBulk = () => setBulkMode(false);

  const confirmBulk = async () => {
    const qty = parseInt(bulkQty, 10);
    if (!qty || qty < 1) {
      alert('Vui lòng nhập số nguyên lớn hơn 0');
      return;
    }
    setLoading(true);
    try {
      await createBulkPets(qty);
      setBulkMode(false);
      await fetchPets();
    } catch (err) {
      console.error('Error bulk creating:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <FiCircle className="header-logo" />
          <h1 className="header-title">PetCollar Admin</h1>
        </div>
        <div className="header-actions">
          <button
            onClick={handleCreate}
            disabled={loading || bulkMode}
            className="create-button"
          >
            <FiPlus size={20} />
            {loading ? 'Đang tạo...' : 'Tạo QR mới'}
          </button>
          <button
            onClick={startBulk}
            disabled={loading || bulkMode}
            className="bulk-button"
          >
            <FiPlus size={20} />
            Tạo QR hàng loạt
          </button>
        </div>
      </header>

      {bulkMode && (
        <div className="bulk-form">
          <label className="bulk-label">
            Số lượng:
            <input
              type="number"
              min="1"
              placeholder="Nhập số lượng"
              value={bulkQty}
              onChange={e => setBulkQty(e.target.value)}
            />
          </label>
          <div className="bulk-actions">
            <button onClick={confirmBulk} disabled={loading} className="confirm-button">
              Xác nhận
            </button>
            <button onClick={cancelBulk} disabled={loading} className="cancel-button">
              Hủy
            </button>
          </div>
        </div>
      )}

      {pets.length === 0 && !loading ? (
        <p className="empty">
          Chưa có pet nào. Nhấn “Tạo QR mới” để khởi tạo.
        </p>
      ) : (
        <div className="grid">
          {pets.map(pet => (
            <PetCard key={pet._id} pet={pet} />
          ))}
        </div>
      )}
    </div>
  );
}