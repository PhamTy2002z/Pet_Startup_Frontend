// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import {
  FiPlus, FiCircle, FiSearch, FiX, FiClock, FiSettings, FiTag,
  FiMenu, FiLogOut, FiChevronRight,
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  getAllPets,
  createPet,
  createBulkPets,
  searchPets,
} from '../api/petService';
import { useAuth } from '../contexts/AuthContext';
import ThemeManagement from './ThemeManagement';

import './AdminDashboard.css';

/* ---------- HẰNG SỐ ---------- */
const PAGE_SIZE = 20;

export default function AdminDashboard() {
  /* ---------- Context & Router ---------- */
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  /* ---------- State ---------- */
  const [pets, setPets]               = useState([]);
  const [loading, setLoading]         = useState(false);
  const [bulkMode, setBulkMode]       = useState(false);
  const [bulkQty, setBulkQty]         = useState('');
  const [page, setPage]               = useState(1);
  const [showSearch, setShowSearch]   = useState(false);
  const [activeTab, setActiveTab]     = useState('pets'); // 'pets' | 'themes'
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [searchParams, setSearchParams] = useState({
    id             : '',
    petName        : '',
    ownerName      : '',
    phone          : '',
    createdAtStart : '',
    createdAtEnd   : '',
    updatedAtStart : '',
    updatedAtEnd   : '',
    sortBy         : 'createdAt',
    sortOrder      : 'desc',
    status         : '',
  });

  const [showOnlyRecent, setShowOnlyRecent] = useState(false);
  const [recentCount, setRecentCount]       = useState(0);

  /* ---------- Helpers ---------- */
  const hasPetInfo = (p) =>
    p.info.name || p.owner.name || p.owner.phone || p.owner.email;

  const getStatusBadge = (p) => {
    const hasInfo = hasPetInfo(p);
    if (p.status === 'active')
      return <span className="status-badge success">Đang sử dụng</span>;
    if (hasInfo)
      return <span className="status-badge warning">Đã nhập thông tin</span>;
    return <span className="status-badge secondary">Chưa sử dụng</span>;
  };

  const pagedPets = pets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(pets.length / PAGE_SIZE);

  /* ---------- Fetch Pets ---------- */
  const fetchPets = async () => {
    if (!token) { navigate('/login'); return; }
    setLoading(true);
    try {
      const data = await getAllPets();
      setPets(data);

      const recent = data.filter((p) => p.recentlyUpdated);
      setRecentCount(recent.length);

      if (recent.length) {
        toast.info(
          <div>
            Có {recent.length} pet vừa cập nhật&nbsp;
            <button
              onClick={() => {
                setShowOnlyRecent(true);
                setSearchParams((prev) => ({
                  ...prev,
                  updatedAtStart: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    .toISOString()
                    .split('T')[0],
                }));
                handleSearch();
              }}
              className="toast-link"
            >
              Xem ngay
            </button>
          </div>,
          { autoClose: 5000 },
        );
      }
    } catch (err) {
      console.error(err);
      toast.error('Không tải được danh sách pet');
      if (err.response?.status === 401) {
        logout(); navigate('/login');
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { if (activeTab === 'pets') fetchPets(); }, [token, activeTab]);

  /* ---------- Search ---------- */
  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = { ...searchParams };
      if (!showOnlyRecent) { params.updatedAtStart = ''; params.updatedAtEnd = ''; }
      const res = await searchPets(params);
      setPets(res.pets);
      setPage(1);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleReset = () => {
    setSearchParams({
      id:'', petName:'', ownerName:'', phone:'',
      createdAtStart:'', createdAtEnd:'',
      updatedAtStart:'', updatedAtEnd:'',
      sortBy:'createdAt', sortOrder:'desc', status:'',
    });
    setShowOnlyRecent(false);
    fetchPets();
  };

  /* ---------- QR Create ---------- */
  const downloadQR = (pet) => {
    const link = document.createElement('a');
    link.href  = pet.qrCodeUrl;
    link.download = `qr-${pet._id}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const pet = await createPet();
      downloadQR(pet);
      toast.success('Tạo QR thành công');
      fetchPets();
    } catch { toast.error('Tạo QR thất bại'); }
    finally { setLoading(false); }
  };

  /* ---------- Bulk ---------- */
  const confirmBulk = async () => {
    const qty = parseInt(bulkQty, 10);
    if (!qty || qty < 1) { toast.warn('Nhập số nguyên > 0'); return; }
    setLoading(true);
    try {
      const list = await createBulkPets(qty);
      list.forEach(downloadQR);
      toast.success(`Đã tạo ${list.length} QR`);
      setBulkMode(false);
      fetchPets();
    } catch { toast.error('Tạo hàng loạt thất bại'); }
    finally { setLoading(false); }
  };

  /* ---------- UI ---------- */
  return (
    <div className={`app-container ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-container">
            <FiCircle className="logo-icon" />
            {!sidebarCollapsed && <h2 className="company-name">VNIPET</h2>}
          </div>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <FiChevronRight /> : <FiMenu />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <ul>
            <li className={activeTab === 'pets' ? 'active' : ''}>
              <button onClick={() => setActiveTab('pets')}>
                <FiTag className="nav-icon" />
                {!sidebarCollapsed && <span>QR & Pets</span>}
              </button>
            </li>
            <li className={activeTab === 'themes' ? 'active' : ''}>
              <button onClick={() => setActiveTab('themes')}>
                <FiSettings className="nav-icon" />
                {!sidebarCollapsed && <span>Themes</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
            <FiLogOut className="nav-icon" />
            {!sidebarCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* --- MAIN --- */}
      <main className="main-content">
        <header className="content-header">
          <h1>{activeTab === 'pets' ? 'QR & Pets Management' : 'Theme Management'}</h1>

          {activeTab === 'pets' && (
            <div className="header-actions">
              <button onClick={() => setShowSearch(!showSearch)} className="search-toggle-button">
                <FiSearch /> Tìm kiếm
              </button>
              <button onClick={handleCreate} disabled={loading || bulkMode} className="create-button">
                <FiPlus /> {loading ? 'Đang...' : 'Tạo QR'}
              </button>
              <button onClick={() => setBulkMode(true)} disabled={loading || bulkMode} className="bulk-button">
                <FiPlus /> QR hàng loạt
              </button>
            </div>
          )}
        </header>

        <div className="content-body">
          {activeTab === 'themes' ? (
            <ThemeManagement />
          ) : (
            <>
              {/* ---- SEARCH FORM ---- */}
              {showSearch && (
                <div className="search-form">
                  {/* (trích ngắn gọn: code form giữ nguyên, chỉ bỏ phần updatedAt checkbox vì showOnlyRecent xử lý ở state) */}
                  {/* ...Giữ nguyên giao diện form ở trên... */}
                  {/* BUTTONS */}
                  <div className="search-actions">
                    <button onClick={handleSearch}><FiSearch /> Tìm kiếm</button>
                    <button onClick={handleReset}><FiX /> Đặt lại</button>
                  </div>
                </div>
              )}

              {/* ---- BULK FORM ---- */}
              {bulkMode && (
                <div className="bulk-form">
                  <label>
                    Số lượng:
                    <input type="number" min="1" value={bulkQty} onChange={(e) => setBulkQty(e.target.value)} />
                  </label>
                  <div className="bulk-actions">
                    <button onClick={confirmBulk} disabled={loading}>Xác nhận</button>
                    <button onClick={() => setBulkMode(false)} disabled={loading}>Hủy</button>
                  </div>
                </div>
              )}

              {/* ---- TABLE ---- */}
              {!loading && pets.length === 0 ? (
                <p className="empty">Chưa có pet nào.</p>
              ) : (
                <>
                  <div className="table-container">
                    <table className="list-table">
                      <thead>
                        <tr>
                          <th>#</th><th>ID</th><th>QR</th><th>Tên Pet</th>
                          <th>Tên Chủ</th><th>SĐT</th><th>Ngày tạo</th>
                          <th>Cập nhật</th><th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pagedPets.map((p, idx) => (
                          <tr key={p._id} className={p.recentlyUpdated ? 'recent' : ''}>
                            <td>{(page - 1) * PAGE_SIZE + idx + 1}</td>
                            <td>
                              <Link to={`/edit/${p._id}`} target="_blank" rel="noopener noreferrer">
                                {p._id}
                              </Link>
                            </td>
                            <td><img src={p.qrCodeUrl} alt="qr" className="qr-img" /></td>
                            <td>{p.info.name || '-'}</td>
                            <td>{p.owner.name || '-'}</td>
                            <td>{p.owner.phone || '-'}</td>
                            <td>{new Date(p.createdAt).toLocaleString()}</td>
                            <td>{p.updatedAt ? new Date(p.updatedAt).toLocaleString() : '-'}</td>
                            <td>{getStatusBadge(p)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ---- PAGINATION ---- */}
                  {pageCount > 1 && (
                    <div className="pagination">
                      <button onClick={() => setPage(page - 1)} disabled={page === 1}>‹</button>
                      {Array.from({ length: pageCount }, (_, i) => (
                        <button key={i} onClick={() => setPage(i + 1)} className={page === i + 1 ? 'active' : ''}>
                          {i + 1}
                        </button>
                      ))}
                      <button onClick={() => setPage(page + 1)} disabled={page === pageCount}>›</button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
