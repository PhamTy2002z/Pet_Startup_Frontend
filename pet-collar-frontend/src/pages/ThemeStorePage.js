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
  FiGlobe,
  FiCheck,
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
    <div className="theme-card">
      <div className="theme-thumbnail">
        <img src={theme.imageUrl} alt={theme.name} loading="lazy" />
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
        </div>
        <div className="theme-actions">
          <span className="theme-price">
            {theme.isPremium ? `${theme.price.toLocaleString()} ₫` : t.free}
          </span>
          <div className="action-buttons">
            <button className="apply-button" onClick={() => onApply(theme._id)}>
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
      store: 'Cửa hàng',
      profile: 'Hồ sơ',
      home: 'Trang chủ',
      loading: 'Đang tải...',
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
      store: 'Store',
      profile: 'Profile',
      home: 'Home',
      loading: 'Loading...',
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

  /* ---------------- FILTERED LIST ---------------- */
  const filtered = themes.filter(
    (th) =>
      th.name.toLowerCase().includes(search.toLowerCase()) ||
      (th.description || '').toLowerCase().includes(search.toLowerCase()),
  );

  /* ---------------- RENDER ---------------- */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>{t.loading}</p>
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
        </div>
      </div>

      {/* Search */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
        {filtered.length === 0 && <p>No theme found.</p>}
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
        <button onClick={() => setDark((d) => !d)}>
          <FiMoon />
          <span className="nav-label">{t.night}</span>
        </button>
      </div>
    </div>
  );
}
