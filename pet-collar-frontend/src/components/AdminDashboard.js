// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  getAllPets,
  createPet,
  createBulkPets
} from '../api/petService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 20;  // Giới hạn 20 dòng mỗi trang

  const fetchPets = async () => {
    setLoading(true);
    try {
      const data = await getAllPets();
      setPets(data);
    } catch (err) {
      toast.error('Lỗi khi tải danh sách pet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  const downloadQR = pet => {
    const link = document.createElement('a');
    link.href = pet.qrCodeUrl;
    link.download = `qr-${pet._id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const newPet = await createPet();
      downloadQR(newPet);
      toast.success('Tạo QR thành công!');
      await fetchPets();
    } catch (err) {
      console.error(err);
      toast.error('Tạo QR thất bại');
    } finally {
      setLoading(false);
    }
  };

  const startBulk = () => {
    setBulkMode(true);
    setBulkQty('');
  };
  const cancelBulk = () => setBulkMode(false);

  const confirmBulk = async () => {
    const qty = parseInt(bulkQty, 10);
    if (!qty || qty < 1) {
      toast.warn('Vui lòng nhập số nguyên > 0');
      return;
    }
    setLoading(true);
    try {
      const newPets = await createBulkPets(qty);
      newPets.forEach(downloadQR);
      toast.success(`Tạo ${newPets.length} QR thành công!`);
      setBulkMode(false);
      setPage(1);
      await fetchPets();
    } catch (err) {
      console.error(err);
      toast.error('Tạo hàng loạt thất bại');
    } finally {
      setLoading(false);
    }
  };

  // pagination
  const pageCount = Math.ceil(pets.length / PAGE_SIZE);
  const pagedPets = pets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="dashboard-container">
      <ToastContainer position="top-right" autoClose={3000} />

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
            <FiPlus size={20} /> {loading ? 'Đang...' : 'Tạo QR'}
          </button>
          <button
            onClick={startBulk}
            disabled={loading || bulkMode}
            className="bulk-button"
          >
            <FiPlus size={20} /> QR hàng loạt
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
              placeholder="Nhập số"
              value={bulkQty}
              onChange={e => setBulkQty(e.target.value)}
            />
          </label>
          <div className="bulk-actions">
            <button
              onClick={confirmBulk}
              disabled={loading}
              className="confirm-button"
            >Xác nhận</button>
            <button
              onClick={cancelBulk}
              disabled={loading}
              className="cancel-button"
            >Hủy</button>
          </div>
        </div>
      )}

      {!loading && pets.length === 0 ? (
        <p className="empty">Chưa có pet nào. Nhấn “Tạo QR mới” để khởi tạo.</p>
      ) : (
        <>
          <table className="list-table">
            <thead>
              <tr>
                <th>#</th>
                <th>ID</th>
                <th>QR</th>
                <th>Tên Pet</th>
                <th>Tên Chủ</th>
                <th>Điện thoại</th>
                <th>Ngày tạo</th>
                <th>Cập nhật gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {pagedPets.map((p, idx) => (
                <tr key={p._id} className={idx % 2 === 0 ? 'even' : 'odd'}>
                  <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>
                    <Link
                      to={`/user/edit/${p._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="id-link"
                    >
                      {p._id}
                    </Link>
                  </td>
                  <td><img src={p.qrCodeUrl} alt="QR" className="qr-image" /></td>
                  <td>{p.info.name || '-'}</td>
                  <td>{p.owner.name || '-'}</td>
                  <td>{p.owner.phone || '-'}</td>
                  <td>{new Date(p.createdAt).toLocaleString()}</td>
                  <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {pageCount > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >‹</button>
              {[...Array(pageCount)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={page === i + 1 ? 'active' : ''}
                >{i + 1}</button>
              ))}
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === pageCount}
              >›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}