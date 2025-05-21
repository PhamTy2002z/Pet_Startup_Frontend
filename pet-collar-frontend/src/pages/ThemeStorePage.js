/* eslint-disable */
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
} from 'react';
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
  FiLogOut,
  FiLayers,
} from 'react-icons/fi';

import {
  getStoreThemes,
  purchaseTheme,
} from '../api/storeThemeService';
import { getPurchasedThemes } from '../api/themeService';
import { useThemeStoreAuth } from '../contexts/ThemeStoreAuthContext';
import { toast } from 'react-toastify';
import './ThemeStorePage.css';

/* ------------------------------------------------------------------ */
const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

/* ------------------------------------------------------------------ */
/* THEME CARD                                                          */
/* ------------------------------------------------------------------ */
const ThemeCard = memo(
  ({ theme, owned, onToggleFav, onBuy, isFav, t, inStore }) => (
    <div className="theme-card">
      <div className="theme-thumbnail">
        <img
          src={theme.imageUrl}
          alt={theme.name}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://via.placeholder.com/300x180?text=Theme+Preview';
          }}
        />
        <button
          className={`favorite-button ${isFav ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(theme._id);
          }}
        >
          <FiHeart />
        </button>

        {!theme.isPremium && <span className="free-badge">{t.free}</span>}
        {owned && inStore && (
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

        {inStore && (
          <div className="theme-actions">
            <span className="theme-price">
              {theme.isPremium ? `${theme.price.toLocaleString()} ₫` : t.free}
            </span>

            {owned ? (
              <span className="in-collection-text">{t.inCollection}</span>
            ) : (
              <button
                className="apply-button"
                onClick={() => onBuy(theme._id)}
              >
                <FiShoppingCart style={{ marginRight: 6 }} />
                {t.buy}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  ),
);

/* ------------------------------------------------------------------ */
/* PAGE COMPONENT                                                      */
/* ------------------------------------------------------------------ */
export default function ThemeStorePage() {
  const navigate = useNavigate();
  const { id: petId } = useParams();
  const { user, logout } = useThemeStoreAuth();

  const [themes, setThemes] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [fav, setFav] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('vi');
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [profileOpen, setProfileOpen] = useState(false);
  const [collectionMode, setCollectionMode] = useState(false);

  const profileRef = useRef(null);
  const toggleDarkMode = () => setDark((d) => !d);

  /* ---------------- i18n ---------------- */
  const t = {
    vi: {
      title: 'Cửa hàng Theme',
      free: 'Miễn phí',
      buy: 'Mua',
      owned: 'Đã mua',
      inCollection: 'Trong bộ sưu tập',
      buyOK: 'Đã mua ✓',
      search: 'Tìm kiếm...',
      store: 'Cửa hàng',
      collection: 'Bộ sưu tập',
      logout: 'Đăng xuất',
      loading: 'Đang tải...',
      filters: 'Bộ lọc',
      allThemes: 'Tất cả',
      freeThemes: 'Miễn phí',
      premiumThemes: 'Premium',
      favoriteThemes: 'Yêu thích',
      ownedThemes: 'Đã mua',
      noResults: 'Không có theme phù hợp.',
      tryAdjust: 'Thay đổi bộ lọc hoặc từ khóa.',
    },
    en: {
      title: 'Theme Store',
      free: 'Free',
      buy: 'Buy',
      owned: 'Owned',
      inCollection: 'In Collection',
      buyOK: 'Purchased ✓',
      search: 'Search...',
      store: 'Store',
      collection: 'Themes Collection',
      logout: 'Logout',
      loading: 'Loading...',
      filters: 'Filters',
      allThemes: 'All',
      freeThemes: 'Free',
      premiumThemes: 'Premium',
      favoriteThemes: 'Favorites',
      ownedThemes: 'Owned',
      noResults: 'No matching themes.',
      tryAdjust: 'Adjust filters or search term.',
    },
  }[lang];

  /* ---------------- store list ---------------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const list = await getStoreThemes();
        setThemes(
          list.map((th) => ({
            ...th,
            imageUrl: th.imageUrl.startsWith('http')
              ? th.imageUrl
              : `${API_BASE}${th.imageUrl.startsWith('/') ? '' : '/'}${th.imageUrl}`,
          })),
        );
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------------- purchased list ---------------- */
  const loadPurchased = async () => {
    if (purchased.length) return;
    try {
      const list = await getPurchasedThemes(petId); // [{ theme }]
      setPurchased(list);
      setOwned(list.map((p) => p.theme._id));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  /* ---------------- outside-click menu ---------------- */
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  /* ---------------- handlers ---------------- */
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

  /* ---------------- filtering ---------------- */
  const baseList = collectionMode ? purchased.map((p) => p.theme) : themes;

  let filtered = baseList.filter(
    (th) =>
      th.name.toLowerCase().includes(search.toLowerCase()) ||
      (th.description || '').toLowerCase().includes(search.toLowerCase()),
  );
  if (!collectionMode) {
    if (filter === 'free') filtered = filtered.filter((th) => !th.isPremium);
    else if (filter === 'premium') filtered = filtered.filter((th) => th.isPremium);
    else if (filter === 'favorite') filtered = filtered.filter((th) => fav.includes(th._id));
    else if (filter === 'owned') filtered = filtered.filter((th) => owned.includes(th._id) || !th.isPremium);
  }

  /* ---------------- render ---------------- */
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

  const initials = user
    ? user.name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : '';

  return (
    <div className={`theme-store-page${dark ? ' dark' : ''}`}>
      {/* Header */}
      <header className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>

        <h1 className="store-title">
          {collectionMode ? t.collection : t.title}
        </h1>

        <div className="header-actions">
          {user && (
            <div className="profile-wrapper" ref={profileRef}>
              <button
                className="profile-button"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="profile-avatar">{initials}</span>
                <span className="profile-name">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div className="profile-dropdown">
                  <button
                    onClick={async () => {
                      await loadPurchased();
                      setCollectionMode(true);
                      setProfileOpen(false);
                      setSearch('');
                    }}
                  >
                    <FiLayers size={16} style={{ marginRight: 8 }} />
                    {t.collection}
                  </button>

                  <button onClick={logout}>
                    <FiLogOut size={16} style={{ marginRight: 8 }} />
                    {t.logout}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="language-toggle-btn"
            onClick={() => setLang((l) => (l === 'vi' ? 'en' : 'vi'))}
          >
            <FiGlobe size={14} />
            <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
          </button>

          <button className="dark-mode-btn" onClick={toggleDarkMode}>
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </header>

      {/* Search & filter hidden in collection */}
      {!collectionMode && (
        <>
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
              >
                <FiFilter size={18} />
              </button>
            </div>

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
                {['all', 'free', 'premium', 'favorite', 'owned'].map((k) => (
                  <button
                    key={k}
                    className={`filter-option ${filter === k ? 'active' : ''}`}
                    onClick={() => {
                      setFilter(k);
                      setFilterOpen(false);
                    }}
                  >
                    {t[
                      k === 'all'
                        ? 'allThemes'
                        : k === 'free'
                        ? 'freeThemes'
                        : k === 'premium'
                        ? 'premiumThemes'
                        : k === 'favorite'
                        ? 'favoriteThemes'
                        : 'ownedThemes'
                    ]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="filter-chips">
            {['all', 'free', 'premium', 'favorite', 'owned'].map((k) => (
              <button
                key={k}
                className={`filter-chip ${filter === k ? 'active' : ''}`}
                onClick={() => setFilter(k)}
              >
                {t[
                  k === 'all'
                    ? 'allThemes'
                    : k === 'free'
                    ? 'freeThemes'
                    : k === 'premium'
                    ? 'premiumThemes'
                    : k === 'favorite'
                    ? 'favoriteThemes'
                    : 'ownedThemes'
                ]}
              </button>
            ))}
          </div>
        </>
      )}

      {/* grid */}
      <div className="themes-grid">
        {filtered.map((th) => (
          <ThemeCard
            key={th._id}
            theme={th}
            owned={owned.includes(th._id)}
            isFav={fav.includes(th._id)}
            onToggleFav={toggleFav}
            onBuy={buy}
            t={t}
            inStore={!collectionMode}
          />
        ))}

        {filtered.length === 0 && (
          <div className="no-results">
            <p>{t.noResults}</p>
            <p>{t.tryAdjust}</p>
          </div>
        )}
      </div>

      {/* bottom nav */}
      <div className="bottom-nav">
        <button onClick={() => navigate('/')}>
          <FiHome />
          <span className="nav-label">Home</span>
        </button>
        <button
          onClick={() => {
            setCollectionMode(false);
            setSearch('');
          }}
          className={!collectionMode ? 'active' : undefined}
        >
          <FiShoppingBag />
          <span className="nav-label">{t.store}</span>
        </button>
        <button
          onClick={async () => {
            await loadPurchased();
            setCollectionMode(true);
            setSearch('');
          }}
          className={collectionMode ? 'active' : undefined}
        >
          <FiLayers />
          <span className="nav-label">{t.collection}</span>
        </button>
        <button onClick={toggleDarkMode}>
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      {filterOpen && (
        <div
          className="filter-overlay"
          onClick={() => setFilterOpen(false)}
        />
      )}
    </div>
  );
}
