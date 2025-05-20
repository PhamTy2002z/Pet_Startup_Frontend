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

function AdminDashboard() {
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
  const [searchLoading, setSearchLoading] = useState(false);

  // Ref for auto-focus on search field
  const searchIdRef = React.useRef(null);

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
    setSearchLoading(true);
    setLoading(true);
    try {
      const params = { ...searchParams };
      if (!showOnlyRecent) { params.updatedAtStart = ''; params.updatedAtEnd = ''; }
      const res = await searchPets(params);
      setPets(res.pets);
      setPage(1);
      toast.success(`Tìm thấy ${res.pets.length} kết quả`);
    } catch (e) { 
      console.error(e); 
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    }
    finally { 
      setLoading(false); 
      setSearchLoading(false);
    }
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
  
  // Handle keyboard event for search fields
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSearch(false);
    }
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

  // Toggle search panel and focus on the first input
  const toggleSearch = () => {
    const newValue = !showSearch;
    setShowSearch(newValue);
    // Focus on search field when opening
    if (newValue) {
      setTimeout(() => {
        if (searchIdRef.current) {
          searchIdRef.current.focus();
        }
      }, 100);
    }
  };

  // Check if any search filters are active
  const hasActiveFilters = () => {
    return Object.values(searchParams).some(val => 
      typeof val === 'string' && val.trim() !== ''
    ) || showOnlyRecent;
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

      {/* --- MAIN --- */
      <main className="main-content">
        <header className="content-header">
          <h1>{activeTab === 'pets' ? 'QR & Pets Management' : 'Theme Management'}</h1>

          {activeTab === 'pets' && (
            <div className="header-actions">
              <button onClick={() => toggleSearch()} className={`search-toggle-button ${hasActiveFilters() ? 'has-filters' : ''}`}>
                <FiSearch /> Tìm kiếm {hasActiveFilters() && <span className="filter-indicator"></span>}
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
                  <div className="search-grid">
                    <div className="search-field">
                      <label htmlFor="search-id">ID</label>
                      <input
                        id="search-id"
                        ref={searchIdRef}
                        type="text"
                        value={searchParams.id}
                        onChange={(e) => setSearchParams({...searchParams, id: e.target.value})}
                        placeholder="Nhập ID pet"
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-pet-name">Tên Pet</label>
                      <input
                        id="search-pet-name"
                        type="text"
                        value={searchParams.petName}
                        onChange={(e) => setSearchParams({...searchParams, petName: e.target.value})}
                        placeholder="Nhập tên pet"
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-owner-name">Tên chủ</label>
                      <input
                        id="search-owner-name"
                        type="text"
                        value={searchParams.ownerName}
                        onChange={(e) => setSearchParams({...searchParams, ownerName: e.target.value})}
                        placeholder="Nhập tên chủ"
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-phone">Số điện thoại</label>
                      <input
                        id="search-phone"
                        type="text"
                        value={searchParams.phone}
                        onChange={(e) => setSearchParams({...searchParams, phone: e.target.value})}
                        placeholder="Nhập SĐT"
                        onKeyDown={handleSearchKeyDown}
                      />
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-status">Trạng thái</label>
                      <select
                        id="search-status"
                        value={searchParams.status}
                        onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
                      >
                        <option value="">Tất cả</option>
                        <option value="active">Đang sử dụng</option>
                        <option value="inactive">Chưa sử dụng</option>
                        <option value="info">Đã nhập thông tin</option>
                      </select>
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-sort-by">Sắp xếp theo</label>
                      <select
                        id="search-sort-by"
                        value={searchParams.sortBy}
                        onChange={(e) => setSearchParams({...searchParams, sortBy: e.target.value})}
                      >
                        <option value="createdAt">Ngày tạo</option>
                        <option value="updatedAt">Ngày cập nhật</option>
                        <option value="petName">Tên pet</option>
                        <option value="ownerName">Tên chủ</option>
                      </select>
                    </div>
                    
                    <div className="search-field">
                      <label htmlFor="search-sort-order">Thứ tự</label>
                      <select
                        id="search-sort-order"
                        value={searchParams.sortOrder}
                        onChange={(e) => setSearchParams({...searchParams, sortOrder: e.target.value})}
                      >
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="date-range-container">
                    <div className="date-range-group">
                      <h4 className="date-range-title">
                        <FiClock className="date-icon" /> Ngày tạo
                      </h4>
                      <div className="date-inputs">
                        <div className="search-field">
                          <label htmlFor="created-start">Từ ngày</label>
                          <input
                            id="created-start"
                            type="date"
                            value={searchParams.createdAtStart}
                            onChange={(e) => setSearchParams({...searchParams, createdAtStart: e.target.value})}
                          />
                        </div>
                        <div className="search-field">
                          <label htmlFor="created-end">Đến ngày</label>
                          <input
                            id="created-end"
                            type="date"
                            value={searchParams.createdAtEnd}
                            onChange={(e) => setSearchParams({...searchParams, createdAtEnd: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="date-range-group">
                      <h4 className="date-range-title">
                        <FiClock className="date-icon" /> Cập nhật gần đây
                      </h4>
                      <div className="date-inputs">
                        <div className="recent-checkbox">
                          <input
                            id="show-recent"
                            type="checkbox"
                            checked={showOnlyRecent}
                            onChange={(e) => {
                              setShowOnlyRecent(e.target.checked);
                              if (e.target.checked) {
                                setSearchParams({
                                  ...searchParams,
                                  updatedAtStart: new Date(Date.now() - 24 * 60 * 60 * 1000)
                                    .toISOString()
                                    .split('T')[0]
                                });
                              }
                            }}
                          />
                          <label htmlFor="show-recent">
                            Hiển thị pet cập nhật 24h qua {recentCount > 0 && <span className="recent-badge">{recentCount}</span>}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* BUTTONS */}
                  <div className="search-actions">
                    <button onClick={handleSearch} disabled={searchLoading}>
                      {searchLoading ? (
                        <>
                          <span className="loading-spinner-sm"></span> Đang tìm...
                        </>
                      ) : (
                        <>
                          <FiSearch /> Tìm kiếm
                        </>
                      )}
                    </button>
                    <button onClick={handleReset} disabled={searchLoading}><FiX /> Đặt lại</button>
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
}</div>
    
  );
}

export default AdminDashboard; 
