/* eslint-disable */
import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft, FiHeart, FiShoppingCart, FiHome, FiUser,
  FiShoppingBag, FiMoon, FiGlobe, FiCheck
} from 'react-icons/fi';
import {
  getStoreThemes,
  purchaseTheme,
  applyTheme,
} from '../api/storeThemeService';
import { toast } from 'react-toastify';
import './ThemeStorePage.css';

/* ---------- ThemeCard (memo) ---------- */
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
        {owned && <span className="own-badge"><FiCheck /> {t.owned}</span>}
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
            <button
              className="apply-button"
              onClick={() => onApply(theme._id)}
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
  )
);

/* ---------- PAGE ---------- */
export default function ThemeStorePage() {
  const navigate             = useNavigate();
  const { id: petId }        = useParams();          // URL /user/:id/store
  const [themes, setThemes]  = useState([]);
  const [fav, setFav]        = useState([]);
  const [owned, setOwned]    = useState([]);
  const [loading, setLoading]= useState(true);
  const [lang, setLang]      = useState('vi');
  const [search, setSearch]  = useState('');
  const [dark, setDark]      = useState(false);

  const t = {
    vi: { title:'Cửa hàng Theme', free:'Miễn phí', apply:'Áp dụng',
          owned:'Đã mua', buyOK:'Đã mua ✓', applyOK:'Áp dụng thành công',
          search:'Tìm kiếm...', night:'Đêm', store:'Cửa hàng', profile:'Hồ sơ', home:'Trang chủ' },
    en: { title:'Theme Store', free:'Free', apply:'Apply',
          owned:'Owned', buyOK:'Purchased ✓', applyOK:'Applied',
          search:'Search themes...', night:'Night', store:'Store', profile:'Profile', home:'Home' }
  }[lang];

  /* -------- fetch store themes -------- */
  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const list = await getStoreThemes();        // public route /store/themes
        setThemes(list);
      } catch (e) {
        console.error(e);
      } finally { setLoading(false); }
    };
    fetch();
  }, []);

  /* -------- helper: toggle fav -------- */
  const toggleFav = useCallback((id) => {
    setFav((f) => (f.includes(id) ? f.filter(i => i !== id) : [...f, id]));
  }, []);

  /* -------- buy theme -------- */
  const buy = async (themeId) => {
    try {
      await purchaseTheme(petId, themeId);
      toast.success(t.buyOK);
      setOwned((o) => [...o, themeId]);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error');
    }
  };

  /* -------- apply theme -------- */
  const doApply = async (themeId) => {
    try {
      await applyTheme(petId, themeId);
      toast.success(t.applyOK);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error');
    }
  };

  /* -------- filter -------- */
  const list = themes.filter(
    (th) =>
      th.name.toLowerCase().includes(search.toLowerCase()) ||
      (th.description || '').toLowerCase().includes(search.toLowerCase())
  );

  /* -------- render -------- */
  if (loading) return <div className="loading">{t.loading || 'Loading...'}</div>;

  return (
    <div className={`theme-store-page${dark ? ' dark' : ''}`}>
      {/* header */}
      <div className="store-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>
        <h1 className="store-title">{t.title}</h1>
        <div className="header-actions">
          <button className="language-toggle-btn" onClick={() => setLang(l => l === 'vi' ? 'en': 'vi')}>
            <FiGlobe /> {lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </div>

      {/* search */}
      <div className="search-bar">
        <input
          placeholder={t.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* themes grid */}
      <div className="themes-grid">
        {list.map((th) => (
          <ThemeCard
            key={th._id}
            theme={th}
            isFavorite={fav.includes(th._id)}
            owned={owned.includes(th._id) || !th.isPremium}
            onToggleFav={toggleFav}
            onApply={doApply}
            onBuy={buy}
            t={t}
          />
        ))}
        {list.length === 0 && <p>No theme found.</p>}
      </div>

      {/* bottom nav (rút gọn) */}
      <div className="bottom-nav">
        <button onClick={() => navigate('/')}><FiHome /><span>{t.home}</span></button>
        <button onClick={() => navigate(-1)}><FiUser /><span>{t.profile}</span></button>
        <button className="active"><FiShoppingBag /><span>{t.store}</span></button>
        <button onClick={() => setDark((d) => !d)}><FiMoon /><span>{t.night}</span></button>
      </div>
    </div>
  );
}
