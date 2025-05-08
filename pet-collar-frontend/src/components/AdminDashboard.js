import React, { useState, useEffect } from 'react';
import { FiPlus, FiCircle } from 'react-icons/fi';
import { getAllPets, createPet } from '../api/petService';
import PetCard from './PetCard';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <header className="dashboard-header">
        <div className="header-left">
          <FiCircle className="header-logo" />  
          <h1 className="header-title">PetCollar Admin</h1>
        </div>
        <button
          onClick={handleCreate}
          disabled={loading}
          className="create-button"
        >
          <FiPlus size={20} />
          {loading ? 'Đang tạo...' : 'Tạo QR mới'}
        </button>
      </header>

      {/* CONTENT */}
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
