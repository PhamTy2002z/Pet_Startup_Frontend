/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiHeart,
  FiShoppingCart,
  FiHome,
  FiUser,
  FiShoppingBag,
  FiMoon,
  FiSun,
  FiGlobe,
  FiCheck,
  FiFilter,
  FiX,
} from 'react-icons/fi';
import {
  getStoreThemes,
  purchaseTheme,
  applyTheme,
} from '../api/storeThemeService';
import { toast } from 'react-toastify';
import './ThemeStorePage.css';

/* ------------------------------------------------------------------ */
/* 1.  CONSTANTS                                                       */
/* ------------------------------------------------------------------ */
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/* 2.  THEME CARD (memoised)                                           */
/* ------------------------------------------------------------------ */
const ThemeCard = memo(
  ({ theme, owned, onToggleFav, onApply, onBuy, isFav, t }) => (
    <div className="theme-card" data-testid={`theme-card-${theme._id}`}>
      <div className="theme-thumbnail">
        <img 
          src={theme.imageUrl} 
          alt={theme.name} 
          loading="lazy" 
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://via.placeholder.com/300x180?text=Theme+Preview";
          }}
        />
        <button
          className={`favorite-button ${isFav ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(theme._id);
          }}
          aria-label={isFav ? 'Unfavourite' : 'Favourite'}
        >
          <FiHeart />
        </button>
        {!theme.isPremium && <span className="free-badge">{t.free}</span>}
        {owned && (
          <span className="own-badge">
            <FiCheck /> {t.owned}
          </span>
        )}
      </div>

      <div className="theme-info">
        <div>
          <h3 className="theme-name">{theme.name}</h3>
          {theme.description && (
            <p className="theme-description">{theme.description}</p>
          )}
        </div>
        <div className="theme-actions">
          <span className="theme-price">
            {theme.isPremium ? `${theme.price.toLocaleString()} ₫` : t.free}
          </span>
          <div className="action-buttons">
            <button 
              className={`apply-button ${owned || !theme.isPremium ? '' : 'disabled-btn'}`}
              onClick={() => onApply(theme._id)}
              disabled={!owned && theme.isPremium}
            >
              {t.apply}
            </button>
            {theme.isPremium && !owned && (
              <button
                className="cart-add-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy(theme._id);
                }}
                aria-label="Buy theme"
              >
                <FiShoppingCart />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  ),
);

/* ------------------------------------------------------------------ */
/* 3.  PAGE COMPONENT                                                  */
/* ------------------------------------------------------------------ */
export default function ThemeStorePage() {
  const navigate = useNavigate();
  const { id: petId } = useParams(); // route /user/edit/:id/store
  const [themes, setThemes] = useState([]);
  const [fav, setFav] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('vi');
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'free', 'premium', 'owned', 'favorite'

  const t = {
    vi: {
      title: 'Cửa hàng Theme',
      free: 'Miễn phí',
      apply: 'Áp dụng',
      owned: 'Đã mua',
      buyOK: 'Đã mua ✓',
      applyOK: 'Áp dụng thành công',
      search: 'Tìm kiếm...',
      night: 'Đêm',
      day: 'Ngày',
      store: 'Cửa hàng',
      profile: 'Hồ sơ',
      home: 'Trang chủ',
      loading: 'Đang tải...',
      filters: 'Bộ lọc',
      allThemes: 'Tất cả',
      freeThemes: 'Miễn phí',
      premiumThemes: 'Premium',
      favoriteThemes: 'Yêu thích',
      ownedThemes: 'Đã mua',
      noResults: 'Không tìm thấy theme nào phù hợp.',
      tryAdjust: 'Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.',
    },
    en: {
      title: 'Theme Store',
      free: 'Free',
      apply: 'Apply',
      owned: 'Owned',
      buyOK: 'Purchased ✓',
      applyOK: 'Applied',
      search: 'Search...',
      night: 'Night',
      day: 'Day',
      store: 'Store',
      profile: 'Profile',
      home: 'Home',
      loading: 'Loading...',
      filters: 'Filters',
      allThemes: 'All',
      freeThemes: 'Free',
      premiumThemes: 'Premium',
      favoriteThemes: 'Favorites',
      ownedThemes: 'Owned',
      noResults: 'No themes found.',
      tryAdjust: 'Try adjusting your filters or search term.',
    },
  }[lang];

  /* ---------------- FETCH THEMES ---------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getStoreThemes(); // [{ imageUrl, ... }]
        const mapped = list.map((th) => ({
          ...th,
          imageUrl: th.imageUrl.startsWith('http')
            ? th.imageUrl
            : `${API_BASE}${
                th.imageUrl.startsWith('/') ? '' : '/'
              }${th.imageUrl}`,
        }));
        setThemes(mapped);
      } catch (err) {
        console.error('Fetch store themes error:', err);
        toast.error(err.response?.data?.error || 'Error loading themes');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- HANDLERS ---------------- */
  const toggleFav = useCallback((id) => {
    setFav((f) => (f.includes(id) ? f.filter((i) => i !== id) : [...f, id]));
  }, []);

  const buy = async (themeId) => {
    try {
      await purchaseTheme(petId, themeId);
      toast.success(t.buyOK);
      setOwned((o) => [...o, themeId]);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error');
    }
  };

  const doApply = async (themeId) => {
    try {
      await applyTheme(petId, themeId);
      toast.success(t.applyOK);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error');
    }
  };

  const toggleDarkMode = () => {
    setDark((prev) => !prev);
  };

  /* ---------------- FILTERED LIST ---------------- */
  let filtered = themes.filter(
    (th) =>
      th.name.toLowerCase().includes(search.toLowerCase()) ||
      (th.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  // Apply additional filtering
  if (filter === 'free') {
    filtered = filtered.filter(th => !th.isPremium);
  } else if (filter === 'premium') {
    filtered = filtered.filter(th => th.isPremium);
  } else if (filter === 'favorite') {
    filtered = filtered.filter(th => fav.includes(th._id));
  } else if (filter === 'owned') {
    filtered = filtered.filter(th => owned.includes(th._id) || !th.isPremium);
  }

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className={`theme-store-page${dark ? ' dark' : ''}`}>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-store-page${dark ? ' dark' : ''}`}>
      {/* Header */}
      <div className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1 className="store-title">{t.title}</h1>
        <div className="header-actions">
          <button
            className="language-toggle-btn"
            onClick={() => setLang((l) => (l === 'vi' ? 'en' : 'vi'))}
          >
            <FiGlobe size={14} />
            <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
          </button>
          <button 
            className="dark-mode-btn"
            onClick={toggleDarkMode}
            aria-label={dark ? t.day : t.night}
          >
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="search-and-filters">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t.search}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button 
            className="filter-button" 
            onClick={() => setFilterOpen(true)}
            aria-label="Filter themes"
          >
            <FiFilter size={18} />
          </button>
        </div>

        {/* Filter options */}
        <div className={`filter-drawer ${filterOpen ? 'open' : ''}`}>
          <div className="filter-header">
            <h3>{t.filters}</h3>
            <button 
              className="close-filter"
              onClick={() => setFilterOpen(false)}
            >
              <FiX size={20} />
            </button>
          </div>
          <div className="filter-options">
            <button 
              className={`filter-option ${filter === 'all' ? 'active' : ''}`}
              onClick={() => { setFilter('all'); setFilterOpen(false); }}
            >
              {t.allThemes}
            </button>
            <button 
              className={`filter-option ${filter === 'free' ? 'active' : ''}`}
              onClick={() => { setFilter('free'); setFilterOpen(false); }}
            >
              {t.freeThemes}
            </button>
            <button 
              className={`filter-option ${filter === 'premium' ? 'active' : ''}`}
              onClick={() => { setFilter('premium'); setFilterOpen(false); }}
            >
              {t.premiumThemes}
            </button>
            <button 
              className={`filter-option ${filter === 'favorite' ? 'active' : ''}`}
              onClick={() => { setFilter('favorite'); setFilterOpen(false); }}
            >
              {t.favoriteThemes}
            </button>
            <button 
              className={`filter-option ${filter === 'owned' ? 'active' : ''}`}
              onClick={() => { setFilter('owned'); setFilterOpen(false); }}
            >
              {t.ownedThemes}
            </button>
          </div>
        </div>
      </div>

      {/* Filter chips */}
      <div className="filter-chips">
        <button 
          className={`filter-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          {t.allThemes}
        </button>
        <button 
          className={`filter-chip ${filter === 'free' ? 'active' : ''}`}
          onClick={() => setFilter('free')}
        >
          {t.freeThemes}
        </button>
        <button 
          className={`filter-chip ${filter === 'premium' ? 'active' : ''}`}
          onClick={() => setFilter('premium')}
        >
          {t.premiumThemes}
        </button>
        <button 
          className={`filter-chip ${filter === 'favorite' ? 'active' : ''}`}
          onClick={() => setFilter('favorite')}
        >
          {t.favoriteThemes}
        </button>
        <button 
          className={`filter-chip ${filter === 'owned' ? 'active' : ''}`}
          onClick={() => setFilter('owned')}
        >
          {t.ownedThemes}
        </button>
      </div>

      {/* Themes grid */}
      <div className="themes-grid">
        {filtered.map((th) => (
          <ThemeCard
            key={th._id}
            theme={th}
            isFav={fav.includes(th._id)}
            owned={owned.includes(th._id) || !th.isPremium}
            onToggleFav={toggleFav}
            onApply={doApply}
            onBuy={buy}
            t={t}
          />
        ))}
        {filtered.length === 0 && (
          <div className="no-results">
            <p>{t.noResults}</p>
            <p>{t.tryAdjust}</p>
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div className="bottom-nav">
        <button onClick={() => navigate('/')}>
          <FiHome />
          <span className="nav-label">{t.home}</span>
        </button>
        <button onClick={() => navigate(-1)}>
          <FiUser />
          <span className="nav-label">{t.profile}</span>
        </button>
        <button className="active">
          <FiShoppingBag />
          <span className="nav-label">{t.store}</span>
        </button>
        <button onClick={toggleDarkMode}>
          {dark ? <FiSun /> : <FiMoon />}
          <span className="nav-label">{dark ? t.day : t.night}</span>
        </button>
      </div>

      {/* Overlay for filter drawer */}
      {filterOpen && (
        <div 
          className="filter-overlay" 
          onClick={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
