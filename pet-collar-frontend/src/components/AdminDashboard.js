// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { FiPlus, FiCircle, FiSearch, FiX, FiClock, FiCheck, FiXCircle } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import {
  getAllPets,
  createPet,
  createBulkPets,
  searchPets,
  updatePetStatus
} from '../api/petService';
import { toast, ToastContainer } from 'react-toastify';
import { useAuth } from '../contexts/AuthContext';
import 'react-toastify/dist/ReactToastify.css';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkQty, setBulkQty] = useState('');
  const [page, setPage] = useState(1);
  const [showSearch, setShowSearch] = useState(false);
  const [searchParams, setSearchParams] = useState({
    id: '',
    petName: '',
    ownerName: '',
    phone: '',
    createdAtStart: '',
    createdAtEnd: '',
    updatedAtStart: '',
    updatedAtEnd: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    status: ''
  });
  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [recentCount, setRecentCount] = useState(0);
  const PAGE_SIZE = 20;  // Giới hạn 20 dòng mỗi trang

  const fetchPets = async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const data = await getAllPets();
      setPets(data);
      
      // Count recently updated pets
      const recentPets = data.filter(pet => pet.recentlyUpdated);
      setRecentCount(recentPets.length);
      
      // Show toast if there are recent updates
      if (recentPets.length > 0) {
        toast.info(
          <div>
            Có {recentPets.length} pet vừa được cập nhật
            <button 
              onClick={() => {
                setShowOnlyRecent(true);
                setSearchParams(prev => ({
                  ...prev,
                  updatedAtStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                }));
                handleSearch();
              }}
              className="toast-link"
            >
              Xem ngay
            </button>
          </div>,
          {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          }
        );
      }
    } catch (err) {
      console.error('Error fetching pets:', err);
      if (err.response?.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        logout();
        navigate('/login');
      } else {
        toast.error('Lỗi khi tải danh sách pet');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      // Only include updatedAtStart in search params if showOnlyRecent is true
      const searchParamsToUse = {
        ...searchParams,
        updatedAtStart: showOnlyRecent ? searchParams.updatedAtStart : '',
        updatedAtEnd: showOnlyRecent ? searchParams.updatedAtEnd : ''
      };
      const result = await searchPets(searchParamsToUse);
      setPets(result.pets);
      setPage(1);
    } catch (err) {
      console.error('Error searching pets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchParams({
      id: '',
      petName: '',
      ownerName: '',
      phone: '',
      createdAtStart: '',
      createdAtEnd: '',
      updatedAtStart: '',
      updatedAtEnd: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: ''
    });
    fetchPets();
  };

  useEffect(() => {
    fetchPets();
  }, [token]);

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

  const handleStatusChange = async (petId, newStatus) => {
    try {
      await updatePetStatus(petId, newStatus);
      toast.success('Cập nhật trạng thái thành công');
      await fetchPets(); // Refresh the list
    } catch (err) {
      console.error('Error updating status:', err);
      toast.error(err.response?.data?.error || 'Lỗi khi cập nhật trạng thái');
    }
  };

  // pagination
  const pageCount = Math.ceil(pets.length / PAGE_SIZE);
  const pagedPets = pets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const getStatusText = (status, hasInfo) => {
    if (status === 'scanned' || (status === 'unused' && hasInfo)) {
      return (
        <div className="status-checkbox">
          <input 
            type="checkbox" 
            className="status-input checked" 
            checked 
            readOnly 
          />
          <span className="status-label">Đã quét</span>
        </div>
      );
    }
    if (status === 'active') {
      return (
        <div className="status-checkbox">
          <input 
            type="checkbox" 
            className="status-input" 
            checked 
            readOnly 
          />
          <span className="status-label">Đang sử dụng</span>
        </div>
      );
    }
    return (
      <div className="status-checkbox">
        <input 
          type="checkbox" 
          className="status-input" 
          readOnly 
        />
        <span className="status-label">Chưa sử dụng</span>
      </div>
    );
  };

  const getStatusColor = (status, hasInfo) => {
    if (status === 'scanned' || (status === 'unused' && hasInfo)) {
      return 'warning';
    }
    if (status === 'active') {
      return 'success';
    }
    return 'secondary';
  };

  const hasPetInfo = (pet) => {
    return pet.info.name || pet.owner.name || pet.owner.phone || pet.owner.email;
  };

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
            onClick={() => setShowSearch(!showSearch)}
            className="search-toggle-button"
          >
            <FiSearch size={20} /> Tìm kiếm
          </button>
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

      {showSearch && (
        <div className="search-form">
          <div className="search-grid">
            <div className="search-field">
              <label>ID:</label>
              <input
                type="text"
                value={searchParams.id}
                onChange={(e) => setSearchParams({...searchParams, id: e.target.value})}
                placeholder="Nhập ID"
              />
            </div>
            <div className="search-field">
              <label>Tên Pet:</label>
              <input
                type="text"
                value={searchParams.petName}
                onChange={(e) => setSearchParams({...searchParams, petName: e.target.value})}
                placeholder="Nhập tên pet"
              />
            </div>
            <div className="search-field">
              <label>Tên Chủ:</label>
              <input
                type="text"
                value={searchParams.ownerName}
                onChange={(e) => setSearchParams({...searchParams, ownerName: e.target.value})}
                placeholder="Nhập tên chủ"
              />
            </div>
            <div className="search-field">
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={searchParams.phone}
                onChange={(e) => setSearchParams({...searchParams, phone: e.target.value})}
                placeholder="Nhập số điện thoại"
              />
            </div>
            <div className="search-field">
              <label>Ngày tạo từ:</label>
              <input
                type="date"
                value={searchParams.createdAtStart}
                onChange={(e) => setSearchParams({...searchParams, createdAtStart: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>đến:</label>
              <input
                type="date"
                value={searchParams.createdAtEnd}
                onChange={(e) => setSearchParams({...searchParams, createdAtEnd: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>Cập nhật từ:</label>
              <input
                type="date"
                value={searchParams.updatedAtStart}
                onChange={(e) => setSearchParams({...searchParams, updatedAtStart: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>đến:</label>
              <input
                type="date"
                value={searchParams.updatedAtEnd}
                onChange={(e) => setSearchParams({...searchParams, updatedAtEnd: e.target.value})}
              />
            </div>
            <div className="search-field">
              <label>Trạng thái:</label>
              <select
                value={searchParams.status}
                onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
              >
                <option value="">Tất cả</option>
                <option value="active">Đang sử dụng</option>
                <option value="unused">Chưa sử dụng</option>
              </select>
            </div>
            <div className="search-field">
              <label>Sắp xếp theo:</label>
              <select
                value={searchParams.sortBy}
                onChange={(e) => setSearchParams({...searchParams, sortBy: e.target.value})}
              >
                <option value="createdAt">Ngày tạo</option>
                <option value="petName">Tên Pet</option>
                <option value="ownerName">Tên Chủ</option>
                <option value="lastUpdated">Cập nhật gần nhất</option>
              </select>
            </div>
            <div className="search-field">
              <label>Thứ tự:</label>
              <select
                value={searchParams.sortOrder}
                onChange={(e) => setSearchParams({...searchParams, sortOrder: e.target.value})}
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
            <div className="search-field recent-toggle">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={showOnlyRecent}
                  onChange={(e) => {
                    setShowOnlyRecent(e.target.checked);
                    if (e.target.checked) {
                      setSearchParams(prev => ({
                        ...prev,
                        updatedAtStart: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      }));
                      handleSearch();
                    } else {
                      // Clear the date filter and reset search
                      setSearchParams(prev => ({
                        ...prev,
                        updatedAtStart: '',
                        updatedAtEnd: ''
                      }));
                      fetchPets(); // Reset to show all pets
                    }
                  }}
                />
                <span className="toggle-text">
                  <FiClock size={16} /> Chỉ xem cập nhật trong 24h
                </span>
              </label>
            </div>
          </div>
          <div className="search-actions">
            <button onClick={handleSearch} className="search-button">
              <FiSearch size={20} /> Tìm kiếm
            </button>
            <button onClick={handleReset} className="reset-button">
              <FiX size={20} /> Đặt lại
            </button>
          </div>
        </div>
      )}

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
        <p className="empty">Chưa có pet nào. Nhấn "Tạo QR mới" để khởi tạo.</p>
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
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {pagedPets.map((p, idx) => {
                const hasInfo = hasPetInfo(p);
                return (
                  <tr 
                    key={p._id} 
                    className={`${idx % 2 === 0 ? 'even' : 'odd'} ${p.recentlyUpdated ? 'recently-updated' : ''}`}
                  >
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
                    <td>
                      {p.info.name || '-'}
                      {p.recentlyUpdated && (
                        <span className="new-badge">NEW</span>
                      )}
                    </td>
                    <td>{p.owner.name || '-'}</td>
                    <td>{p.owner.phone || '-'}</td>
                    <td>{new Date(p.createdAt).toLocaleString()}</td>
                    <td>
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}
                      {p.recentlyUpdated && (
                        <span className="update-badge">
                          <FiClock size={14} /> 24h
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="status-cell">
                        <span className={`status-badge ${getStatusColor(p.status, hasInfo)}`}>
                          {getStatusText(p.status, hasInfo)}
                        </span>
                        <div className="status-actions">
                          {p.status === 'active' && (
                            <button
                              onClick={() => handleStatusChange(p._id, 'unused')}
                              className="status-button deactivate"
                              title="Hủy kích hoạt"
                            >
                              <FiXCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })}
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