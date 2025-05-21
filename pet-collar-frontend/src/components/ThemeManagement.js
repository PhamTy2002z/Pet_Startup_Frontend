import React, { useState, useEffect } from 'react';
import { 
  FiPlus, FiTrash, FiEdit, FiCheck, FiX, FiArrowUp, 
  FiArrowDown, FiImage, FiGrid, FiList, FiLoader,
  FiChevronLeft, FiChevronRight, FiChevronDown, FiChevronUp,
  FiDollarSign, FiShoppingBag
} from 'react-icons/fi';
import { 
  getAllThemes, 
  createTheme, 
  updateTheme, 
  deleteTheme, 
  batchUpdateThemeStatus,
  updateThemeOrder
} from '../api/themeService';
import { toast } from 'react-toastify';
import './ThemeManagement.css';

// Get API base URL from environment or use default
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const THEMES_PER_PAGE = 10;

export default function ThemeManagement() {
  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('create'); // 'create' or 'edit'
  const [currentTheme, setCurrentTheme] = useState({
    name: '',
    description: '',
    isActive: true,
    isPremium: false,
    price: 0,
    inStore: true,
    order: 0
  });
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [brokenImages, setBrokenImages] = useState({});   // {themeId:true}

  useEffect(() => {
    loadThemes();
  }, []);

  const loadThemes = async () => {
    setLoading(true);
    try {
      const data = await getAllThemes();
      console.log('Loaded themes:', data);
      setThemes(data);
    } catch (err) {
      console.error('Error loading themes:', err);
      toast.error('Không thể tải danh sách theme');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'isPremium' && !checked) {
      // If isPremium is unchecked, reset price to 0
      setCurrentTheme({
        ...currentTheme,
        [name]: checked,
        price: 0
      });
    } else {
      setCurrentTheme({
        ...currentTheme,
        [name]: type === 'checkbox' ? checked : (name === 'price' ? parseFloat(value) : value)
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setCurrentTheme({
      name: '',
      description: '',
      isActive: true,
      isPremium: false,
      price: 0,
      inStore: true,
      order: themes.length
    });
    setImage(null);
    setPreviewUrl('');
    setFormMode('create');
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (theme) => {
    setCurrentTheme({
      id: theme._id,
      name: theme.name,
      description: theme.description || '',
      isActive: theme.isActive,
      isPremium: theme.isPremium || false,
      price: theme.price || 0,
      inStore: theme.inStore !== undefined ? theme.inStore : true,
      order: theme.order
    });
    // Set preview URL with API base URL if needed
    setPreviewUrl(getFullImageUrl(theme.imageUrl));
    setFormMode('edit');
    setShowForm(true);
  };

  // Helper function to ensure image URLs are complete
  const getFullImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    
    // If the URL already starts with http(s), it's a full URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it starts with a slash, append it to the API base
    if (imageUrl.startsWith('/')) {
      return `${API_BASE}${imageUrl}`;
    }
    
    // Otherwise, add a slash and append to API base
    return `${API_BASE}/${imageUrl}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', currentTheme.name);
      formData.append('description', currentTheme.description);
      formData.append('isActive', currentTheme.isActive);
      formData.append('isPremium', currentTheme.isPremium);
      formData.append('price', currentTheme.isPremium ? currentTheme.price : 0);
      formData.append('inStore', currentTheme.inStore);
      formData.append('order', currentTheme.order);
      
      if (image) {
        formData.append('image', image);
      }

      let response;
      if (formMode === 'create') {
        response = await createTheme(formData);
        toast.success('Theme được tạo thành công!');
      } else {
        response = await updateTheme(currentTheme.id, formData);
        toast.success('Theme được cập nhật thành công!');
      }

      console.log('Theme saved response:', response);
      
      // Refresh the theme list
      await loadThemes();
      
      // Close the form
      setShowForm(false);
      resetForm();
    } catch (err) {
      console.error('Error saving theme:', err);
      toast.error('Lỗi khi lưu theme');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setShowDeleteConfirm(id);
  };

  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await deleteTheme(id);
      toast.success('Theme đã được xóa!');
      await loadThemes();
    } catch (err) {
      console.error('Error deleting theme:', err);
      
      if (err.response?.data?.petsCount) {
        toast.error(`Không thể xóa theme đang được sử dụng bởi ${err.response.data.petsCount} pet`);
      } else {
        toast.error('Lỗi khi xóa theme');
      }
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  const handleToggleActive = async (theme) => {
    const updatedThemes = [
      {
        id: theme._id,
        isActive: !theme.isActive
      }
    ];

    try {
      await batchUpdateThemeStatus({ themes: updatedThemes });
      toast.success(`Theme ${theme.name} đã được ${!theme.isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
      await loadThemes();
    } catch (err) {
      console.error('Error toggling theme status:', err);
      toast.error('Lỗi khi cập nhật trạng thái theme');
    }
  };

  const moveTheme = async (themeId, direction) => {
    const currentIndex = themes.findIndex(t => t._id === themeId);
    if (currentIndex === -1) return;

    // Cannot move up if already at the top
    if (direction === 'up' && currentIndex === 0) return;
    // Cannot move down if already at the bottom
    if (direction === 'down' && currentIndex === themes.length - 1) return;

    const newThemes = [...themes];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap order values
    const temp = newThemes[currentIndex].order;
    newThemes[currentIndex].order = newThemes[targetIndex].order;
    newThemes[targetIndex].order = temp;

    // Prepare data for API
    const themesToUpdate = [
      { id: newThemes[currentIndex]._id, order: newThemes[currentIndex].order },
      { id: newThemes[targetIndex]._id, order: newThemes[targetIndex].order }
    ];

    try {
      await updateThemeOrder({ themes: themesToUpdate });
      await loadThemes(); // Reload to get the sorted list
    } catch (err) {
      console.error('Error reordering themes:', err);
      toast.error('Lỗi khi sắp xếp thứ tự theme');
    }
  };

  // Filter themes based on search term
  const filteredThemes = themes.filter(theme => 
    theme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (theme.description && theme.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredThemes.length / THEMES_PER_PAGE);
  const paginatedThemes = filteredThemes.slice(
    (currentPage - 1) * THEMES_PER_PAGE, 
    currentPage * THEMES_PER_PAGE
  );

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Generate pagination buttons
  const renderPaginationButtons = () => {
    const buttons = [];
    
    // Previous button
    buttons.push(
      <button 
        key="prev" 
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Previous page"
      >
        <FiChevronLeft />
      </button>
    );
    
    // Page buttons
    const displayRange = 3; // How many page numbers to show before and after current page
    let startPage = Math.max(1, currentPage - displayRange);
    let endPage = Math.min(totalPages, currentPage + displayRange);
    
    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => handlePageChange(1)}>1</button>
      );
      if (startPage > 2) {
        buttons.push(<span key="start-ellipsis">...</span>);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button 
          key={i} 
          onClick={() => handlePageChange(i)}
          className={currentPage === i ? 'active' : ''}
        >
          {i}
        </button>
      );
    }
    
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(<span key="end-ellipsis">...</span>);
      }
      buttons.push(
        <button 
          key={totalPages} 
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </button>
      );
    }
    
    // Next button
    buttons.push(
      <button 
        key="next" 
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Next page"
      >
        <FiChevronRight />
      </button>
    );
    
    return buttons;
  };

  const handleImgError = (e, themeId) => {
    e.target.onerror = null;          // ngăn loop
    setBrokenImages(prev => ({ ...prev, [themeId]: true }));
  };

  return (
    <div className="theme-management">
      <div className="dashboard-header">
        <div className="header-left">
          <h2>Quản lý Theme</h2>
          <p className="subtitle">Quản lý các theme pet collar của bạn</p>
        </div>
        <button 
          className="create-theme-btn"
          onClick={openCreateForm}
          disabled={loading}
        >
          <FiPlus size={18} /> Thêm Theme Mới
        </button>
      </div>

      <div className="control-panel">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm theme..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="search-input"
          />
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid size={18} />
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList size={18} />
          </button>
        </div>
      </div>

      <button 
        className="collapse-themes-btn" 
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? 
          <><FiChevronDown className="chevron-icon" size={16} /> Hiển thị danh sách theme</> : 
          <><FiChevronUp className="chevron-icon" size={16} /> Ẩn danh sách theme</>
        }
      </button>

      {showForm && (
        <div className="modal-overlay">
          <div className="theme-form-container">
            <form onSubmit={handleSubmit} className="theme-form">
              <div className="form-header">
                <h3>{formMode === 'create' ? 'Thêm Theme Mới' : 'Chỉnh Sửa Theme'}</h3>
                <button 
                  type="button" 
                  className="close-btn"
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div className="form-content">
                <div className="form-group">
                  <label htmlFor="name">Tên Theme <span className="required">*</span></label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={currentTheme.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Nhập tên theme"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Mô tả</label>
                  <textarea
                    id="description"
                    name="description"
                    value={currentTheme.description}
                    onChange={handleInputChange}
                    placeholder="Nhập mô tả về theme"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="order">Thứ tự hiển thị</label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={currentTheme.order}
                      onChange={handleInputChange}
                      min="0"
                    />
                  </div>

                  <div className="form-group checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={currentTheme.isActive}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Kích hoạt
                    </label>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group checkbox-group">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        name="isPremium"
                        checked={currentTheme.isPremium}
                        onChange={handleInputChange}
                      />
                      <span className="checkmark"></span>
                      Theme Premium
                    </label>
                  </div>

                  <div className="form-group">
                    <label htmlFor="price">Giá (nếu là Premium)</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={currentTheme.price}
                      onChange={handleInputChange}
                      min="0"
                      step="1000" 
                      disabled={!currentTheme.isPremium}
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      name="inStore"
                      checked={currentTheme.inStore}
                      onChange={handleInputChange}
                    />
                    <span className="checkmark"></span>
                    Hiển thị trong cửa hàng
                  </label>
                </div>

                <div className="form-group">
                  <label htmlFor="image">Ảnh Theme {formMode === 'create' && <span className="required">*</span>}</label>
                  <div className="file-input-container">
                    <input
                      type="file"
                      id="image"
                      name="image"
                      onChange={handleImageChange}
                      accept="image/*"
                      className="file-input"
                      required={formMode === 'create'}
                    />
                    <div className="file-input-label">
                      <FiImage size={20} />
                      <span>{image ? image.name : 'Chọn ảnh theme'}</span>
                    </div>
                  </div>
                </div>

                {previewUrl && (
                  <div className="image-preview">
                    <img src={previewUrl} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? <><FiLoader className="spinner" size={16} /> Đang lưu...</> : 'Lưu'}
                </button>
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  disabled={loading}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      ) : filteredThemes.length === 0 ? (
        <div className="empty-state">
          <FiImage size={48} />
          <h3>Chưa có theme nào</h3>
          <p>Nhấn "Thêm Theme Mới" để bắt đầu tạo theme.</p>
        </div>
      ) : (
        <div className={`themes-container ${viewMode}`}>
          {viewMode === 'grid' ? (
            <div className={`theme-grid ${isCollapsed ? 'collapsed' : ''}`}>
              {paginatedThemes.map((theme, index) => {
                const fullImageUrl = getFullImageUrl(theme.imageUrl);
                // Truncate name and description
                const truncatedName = theme.name.length > 18 ? theme.name.slice(0, 18) + '…' : theme.name;
                const truncatedDescription = theme.description && theme.description.length > 40 ? theme.description.slice(0, 40) + '…' : theme.description;
                
                return (
                  <div 
                    key={theme._id} 
                    className={`admin-theme-card ${theme.isActive ? 'active' : 'inactive'} ${theme.isPremium ? 'premium' : ''} ${theme.inStore ? '' : 'hidden'}`}
                  >
                    {theme.isActive && <div className="active-badge"><FiCheck size={14} /></div>}
                    {theme.isPremium && <div className="premium-badge"><FiDollarSign size={14} /></div>}
                    {!theme.inStore && <div className="hidden-badge"><FiX size={14} /></div>}
                    <div className="theme-image">
                      {brokenImages[theme._id] ? (
                        <div className="no-image">
                          <FiImage size={48} />
                        </div>
                      ) : (
                        <img
                          src={fullImageUrl}
                          alt={theme.name}
                          onError={(e) => handleImgError(e, theme._id)}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="theme-info">
                      <h3 title={theme.name}>{truncatedName}</h3>
                      <p>{truncatedDescription}</p>
                      <div className="theme-status-row">
                        <span className={`status-badge ${theme.isActive ? 'active' : 'inactive'}`}>
                          {theme.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                        </span>
                        {theme.isPremium && (
                          <span className="price-badge">
                            <FiDollarSign size={12} /> {theme.price.toLocaleString()}đ
                          </span>
                        )}
                      </div>
                      {!theme.inStore && (
                        <span className="store-badge hidden">
                          <FiShoppingBag size={12} /> Ẩn khỏi cửa hàng
                        </span>
                      )}
                    </div>
                    <div className="theme-actions">
                      <div className="main-actions">
                        <button 
                          onClick={() => openEditForm(theme)}
                          className="action-btn edit-btn"
                          title="Chỉnh sửa"
                        >
                          <FiEdit size={14} /> Sửa
                        </button>
                        <button 
                          onClick={() => confirmDelete(theme._id)}
                          className="action-btn delete-btn"
                          title="Xóa"
                        >
                          <FiTrash size={14} /> Xóa
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${isCollapsed ? 'collapsed' : ''}`}>
              {paginatedThemes.map((theme, index) => {
                const fullImageUrl = getFullImageUrl(theme.imageUrl);
                // Truncate name and description
                const truncatedName = theme.name.length > 18 ? theme.name.slice(0, 18) + '…' : theme.name;
                const truncatedDescription = theme.description && theme.description.length > 40 ? theme.description.slice(0, 40) + '…' : theme.description;
                
                return (
                  <div 
                    key={theme._id} 
                    className={`theme-item ${theme.isActive ? 'active' : 'inactive'} ${theme.isPremium ? 'premium' : ''} ${theme.inStore ? '' : 'hidden'}`}
                  >
                    <div className="theme-image">
                      {brokenImages[theme._id] ? (
                        <div className="no-image">
                          <FiImage size={48} />
                        </div>
                      ) : (
                        <img
                          src={fullImageUrl}
                          alt={theme.name}
                          onError={(e) => handleImgError(e, theme._id)}
                          loading="lazy"
                        />
                      )}
                    </div>
                    <div className="theme-info">
                      <h3>{truncatedName}</h3>
                      <p>{truncatedDescription}</p>
                      <div className="theme-attributes">
                        <span className={`status-badge ${theme.isActive ? 'active' : 'inactive'}`}>
                          {theme.isActive ? 'Đang hoạt động' : 'Đã vô hiệu hóa'}
                        </span>
                        {theme.isPremium && (
                          <span className="price-badge">
                            <FiDollarSign size={12} /> {theme.price.toLocaleString()}đ
                          </span>
                        )}
                        <span className={`store-badge ${theme.inStore ? 'visible' : 'hidden'}`}>
                          <FiShoppingBag size={12} /> {theme.inStore ? 'Hiển thị trong cửa hàng' : 'Ẩn khỏi cửa hàng'}
                        </span>
                      </div>
                    </div>
                    <div className="theme-actions-list">
                      <button 
                        onClick={() => moveTheme(theme._id, 'up')}
                        disabled={index === 0}
                        className="move-btn"
                        title="Di chuyển lên"
                      >
                        <FiArrowUp size={18} />
                      </button>
                      <button 
                        onClick={() => moveTheme(theme._id, 'down')}
                        disabled={index === paginatedThemes.length - 1}
                        className="move-btn"
                        title="Di chuyển xuống"
                      >
                        <FiArrowDown size={18} />
                      </button>
                      <button 
                        onClick={() => handleToggleActive(theme)}
                        className={`toggle-btn ${theme.isActive ? 'deactivate' : 'activate'}`}
                      >
                        {theme.isActive ? <FiX size={18} /> : <FiCheck size={18} />}
                        {theme.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                      <button 
                        onClick={() => openEditForm(theme)}
                        className="edit-btn"
                      >
                        <FiEdit size={18} /> Sửa
                      </button>
                      <button 
                        onClick={() => confirmDelete(theme._id)}
                        className="delete-btn"
                      >
                        <FiTrash size={18} /> Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {!isCollapsed && totalPages > 1 && (
            <div className="theme-pagination">
              {renderPaginationButtons()}
            </div>
          )}
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="delete-confirm-modal">
            <div className="delete-confirm-icon">
              <FiTrash size={48} />
            </div>
            <h3 className="delete-confirm-title">Xác nhận xóa</h3>
            <p className="delete-confirm-message">
              Bạn có chắc chắn muốn xóa theme này? Thao tác này không thể hoàn tác.
            </p>
            <div className="delete-confirm-buttons">
              <button 
                onClick={() => handleDelete(showDeleteConfirm)}
                className="delete-confirm-btn"
                disabled={loading}
              >
                {loading ? <><FiLoader className="spinner" size={16} /> Đang xóa...</> : 'Xóa'}
              </button>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                className="delete-cancel-btn"
                disabled={loading}
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}