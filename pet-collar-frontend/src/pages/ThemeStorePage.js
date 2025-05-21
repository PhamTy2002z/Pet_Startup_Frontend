/* src/pages/ThemeStorePage.js */
import { useNavigate, useParams } from 'react-router-dom';
import React, {
  useState,
  useEffect,
  useCallback,
  memo,
  useRef,
} from 'react';
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
  FiClock,
} from 'react-icons/fi';

import {
  getStoreThemes,
  purchaseThemeStore,          // ⬅ lấy luôn từ cùng file
  getMyPurchaseHistory,
} from '../api/storeThemeService';
import { getPurchasedThemes } from '../api/themeService';
import { useThemeStoreAuth } from '../contexts/ThemeStoreAuthContext';
import PurchaseModal from '../components/PurchaseModal';
import { toast } from 'react-toastify';
import './ThemeStorePage.css';

const API_BASE =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const ThemeCard = memo(
  ({ theme, owned, onToggleFav, onBuy, isFav, t, inStore, purchaseDate }) => {
    return (
    <div className="store-theme-card">
      <div className="store-theme-thumbnail">
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
          className={`store-favorite-button ${isFav ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(theme._id);
          }}
        >
          <FiHeart />
        </button>
        {!theme.isPremium && <span className="store-free-badge">{t.free}</span>}
        {theme.isPremium && <span className="store-premium-badge">{t.premium}</span>}
        {owned && inStore && (
          <span className="store-own-badge">
            <FiCheck /> {t.owned}
          </span>
        )}
      </div>

      <div className="store-theme-info">
        <div>
          <h3 className="store-theme-name">{theme.name}</h3>
          {theme.description && (
            <p className="store-theme-description">{theme.description}</p>
          )}
          {purchaseDate && (
            <p className="store-purchase-date">
              <FiClock style={{ marginRight: 4 }} /> 
              {t.purchasedOn}: {new Date(purchaseDate).toLocaleDateString()}
            </p>
          )}
        </div>

        {inStore && (
          <div className="store-theme-actions">
            <span className="store-theme-price">
              {theme.isPremium ? `${theme.price.toLocaleString()} ₫` : t.free}
            </span>
            {owned ? (
              <span className="store-in-collection-text">
                <FiCheck style={{ marginRight: 4 }} />
                {t.inCollection}
              </span>
            ) : (
              <button className="store-apply-button" onClick={() => onBuy(theme)}>
                <FiShoppingCart style={{ marginRight: 6 }} />
                {t.buy}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )});

export default function ThemeStorePage() {
  const navigate = useNavigate();
  const { id: petId } = useParams();
  const { user, logout } = useThemeStoreAuth();

  const [themes, setThemes] = useState([]);
  const [purchased, setPurchased] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [fav, setFav] = useState([]);
  const [owned, setOwned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lang, setLang] = useState('vi');
  const [search, setSearch] = useState('');
  const [dark, setDark] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filter, setFilter] = useState('all');
  const [profileOpen, setProfileOpen] = useState(false);
  const [collectionMode, setCollectionMode] = useState(false);
  const [historyView, setHistoryView] = useState(false);

  const [buyModalTheme, setBuyModalTheme] = useState(null);

  const profileRef = useRef(null);
  const toggleDarkMode = () => setDark((d) => !d);

  const t = {
    vi: {
      title: 'Cửa hàng Theme',
      free: 'Miễn phí',
      premium: 'Premium',
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
      purchaseHistory: 'Lịch sử mua',
      purchasedOn: 'Mua ngày',
      loadingHistory: 'Đang tải lịch sử mua...',
      myThemes: 'Bộ sưu tập của tôi',
    },
    en: {
      title: 'Theme Store',
      free: 'Free',
      premium: 'Premium',
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
      purchaseHistory: 'Purchase History',
      purchasedOn: 'Purchased on',
      loadingHistory: 'Loading purchase history...',
      myThemes: 'My Themes',
    },
  }[lang];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        // 1. Get store themes
        const list = await getStoreThemes();
        setThemes(
          list.map((th) => ({
            ...th,
            imageUrl: th.imageUrl.startsWith('http')
              ? th.imageUrl
              : `${API_BASE}${
                  th.imageUrl.startsWith('/') ? '' : '/'
                }${th.imageUrl}`,
          })),
        );
        
        let ownedThemeIds = [];
        
        // 2. Load purchased themes if pet ID is available
        if (petId) {
          try {
            const purchasedList = await getPurchasedThemes(petId);
            setPurchased(purchasedList);
            const petOwnedIds = purchasedList.map(p => p.theme._id);
            ownedThemeIds = [...ownedThemeIds, ...petOwnedIds];
            console.log('Pet purchased themes:', petOwnedIds);
          } catch (err) {
            console.error('Error loading pet purchased themes:', err);
          }
        }
        
        // 3. Load purchase history if user is logged in
        if (user) {
          try {
            const { results } = await getMyPurchaseHistory();
            setPurchaseHistory(results);
            const historyIds = results.map(item => item.theme._id);
            ownedThemeIds = [...ownedThemeIds, ...historyIds];
            console.log('User purchase history:', historyIds);
          } catch (err) {
            console.error('Error loading purchase history:', err);
          }
        }
        
        // Set final owned state with unique IDs
        const uniqueOwnedIds = [...new Set(ownedThemeIds)];
        console.log('Setting initial owned themes:', uniqueOwnedIds);
        setOwned(uniqueOwnedIds);
        
      } catch (err) {
        toast.error(err.response?.data?.error || 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [profileOpen]);

  const toggleFav = useCallback((id) => {
    setFav((f) => (f.includes(id) ? f.filter((i) => i !== id) : [...f, id]));
  }, []);

  const handleBuy = (theme) => setBuyModalTheme(theme);

  const completePurchase = async (themeId) => {
    try {
      const res = await purchaseThemeStore(themeId);
      const code = res.redemptionCode.code;
      
      console.log('Purchase successful, theme ID:', themeId);
      
      // Immediately update owned state
      setOwned(prevOwned => {
        const newOwned = [...new Set([...prevOwned, themeId])];
        console.log('Updated owned themes after purchase:', newOwned);
        return newOwned;
      });
      
      // Close the purchase modal immediately
      setBuyModalTheme(null);
      
      toast.success(t.buyOK);
      
      // Refresh all purchased themes data
      if (user) {
        await loadPurchaseHistory();
      } else if (petId) {
        await loadPurchased();
      }
      
      return code;
    } catch (e) {
      toast.error(e.response?.data?.error || 'Error');
      throw e;
    }
  };

  // Add effect to refresh purchase data when user or petId changes
  useEffect(() => {
    const refreshPurchaseData = async () => {
      if (petId) {
        await loadPurchased();
      }
      if (user) {
        await loadPurchaseHistory();
      }
    };

    if (!loading) {
      refreshPurchaseData();
    }
  }, [user, petId, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-add these functions for later use
  const loadPurchased = async () => {
    try {
      const list = await getPurchasedThemes(petId);
      setPurchased(list);
      
      // Extract theme IDs and update owned state
      const ownedIds = list.map(p => p.theme._id);
      console.log('Purchased themes loaded:', ownedIds);
      
      setOwned(prevOwned => {
        const combinedIds = [...new Set([...prevOwned, ...ownedIds])];
        console.log('Updated owned themes after loadPurchased:', combinedIds);
        return combinedIds;
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    }
  };

  const loadPurchaseHistory = async () => {
    setHistoryLoading(true);
    try {
      const { results } = await getMyPurchaseHistory();
      setPurchaseHistory(results);
      
      // Extract theme IDs from purchase history
      const historyIds = results.map(item => item.theme._id);
      console.log('Purchase history loaded:', historyIds);
      
      // Update owned themes from purchase history
      setOwned(prevOwned => {
        const combinedIds = [...new Set([...prevOwned, ...historyIds])];
        console.log('Combined owned themes after loadPurchaseHistory:', combinedIds);
        return combinedIds;
      });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const baseList = collectionMode 
    ? (historyView
        ? (purchaseHistory.length > 0 
            ? purchaseHistory.map(item => ({
                ...item.theme,
                purchaseDate: item.createdAt
              }))
            : [])
        : purchased.map((p) => p.theme))
    : themes;

  let filtered = baseList.filter(
    (th) =>
      th.name.toLowerCase().includes(search.toLowerCase()) ||
      (th.description || '').toLowerCase().includes(search.toLowerCase()),
  );
  if (!collectionMode) {
    if (filter === 'free') filtered = filtered.filter((th) => !th.isPremium);
    else if (filter === 'premium')
      filtered = filtered.filter((th) => th.isPremium);
    else if (filter === 'favorite')
      filtered = filtered.filter((th) => fav.includes(th._id));
    else if (filter === 'owned')
      filtered = filtered.filter(
        (th) => owned.includes(th._id) || !th.isPremium,
      );
  }

  if (loading) {
    return (
      <div className={`theme-store-page${dark ? ' dark' : ''}`}>
        <div className="store-loading-container">
          <div className="store-loading-spinner" />
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
      <header className="store-header">
        <button className="store-back-button" onClick={() => navigate(-1)}>
          <FiChevronLeft />
        </button>

        <h1 className="store-title">
          {collectionMode ? t.collection : t.title}
        </h1>

        <div className="store-header-actions">
          {user && (
            <div className="store-profile-wrapper" ref={profileRef}>
              <button
                className="store-profile-button"
                onClick={() => setProfileOpen((v) => !v)}
              >
                <span className="store-profile-avatar">{initials}</span>
                <span className="store-profile-name">
                  {user.name.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div className="store-profile-dropdown">
                  <button
                    onClick={async () => {
                      if (user) {
                        await loadPurchaseHistory();
                      } else {
                        await loadPurchased();
                      }
                      setCollectionMode(true);
                      setHistoryView(false);
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
            className="store-language-toggle-btn"
            onClick={() => setLang((l) => (l === 'vi' ? 'en' : 'vi'))}
          >
            <FiGlobe size={14} />
            <span>{lang === 'vi' ? 'EN' : 'VI'}</span>
          </button>

          <button className="store-dark-mode-btn" onClick={toggleDarkMode}>
            {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
        </div>
      </header>

      {!collectionMode && (
        <>
          <div className="store-search-and-filters">
            <div className="store-search-bar">
              <input
                type="text"
                placeholder={t.search}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                className="store-filter-button"
                onClick={() => setFilterOpen(true)}
              >
                <FiFilter size={18} />
              </button>
            </div>

            <div className={`store-filter-drawer ${filterOpen ? 'open' : ''}`}>
              <div className="store-filter-header">
                <h3>{t.filters}</h3>
                <button
                  className="store-close-filter"
                  onClick={() => setFilterOpen(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
              <div className="store-filter-options">
                {['all', 'free', 'premium', 'favorite', 'owned'].map((k) => (
                  <button
                    key={k}
                    className={`store-filter-option ${
                      filter === k ? 'active' : ''
                    }`}
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

          <div className="store-filter-chips">
            {['all', 'free', 'premium', 'favorite', 'owned'].map((k) => (
              <button
                key={k}
                className={`store-filter-chip ${filter === k ? 'active' : ''}`}
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

      {collectionMode && (
        <div className="store-collection-toggle">
          <button 
            className={!historyView ? 'active' : ''} 
            onClick={() => setHistoryView(false)}
          >
            {t.myThemes}
          </button>
          <button 
            className={historyView ? 'active' : ''} 
            onClick={() => {
              setHistoryView(true);
              loadPurchaseHistory();
            }}
          >
            {t.purchaseHistory}
          </button>
        </div>
      )}

      {historyLoading ? (
        <div className="store-loading-container">
          <div className="store-loading-spinner" />
          <p>{t.loadingHistory}</p>
        </div>
      ) : (
        <div className="store-themes-grid">
          {filtered.map((th) => {
            // Log the ownership status for debugging
            console.log(`Rendering theme ${th.name} (${th._id}), owned: ${owned.includes(th._id)}, owned array:`, owned);
            
            return (
              <ThemeCard
                key={th._id}
                theme={th}
                owned={owned.includes(th._id)}
                isFav={fav.includes(th._id)}
                onToggleFav={toggleFav}
                onBuy={handleBuy}
                t={t}
                inStore={!collectionMode}
                purchaseDate={collectionMode && historyView ? th.purchaseDate : null}
              />
            );
          })}

          {filtered.length === 0 && (
            <div className="store-no-results">
              <p>{t.noResults}</p>
              <p>{t.tryAdjust}</p>
            </div>
          )}
        </div>
      )}

      <div className="store-bottom-nav">
        <button onClick={() => navigate('/')}>
          <FiHome />
          <span className="store-nav-label">Home</span>
        </button>
        <button
          onClick={() => {
            setCollectionMode(false);
            setHistoryView(false);
            setSearch('');
          }}
          className={!collectionMode ? 'active' : undefined}
        >
          <FiShoppingBag />
          <span className="store-nav-label">{t.store}</span>
        </button>
        <button
          onClick={async () => {
            if (user) {
              await loadPurchaseHistory();
            } else {
              await loadPurchased();
            }
            setCollectionMode(true);
            setHistoryView(false);
            setSearch('');
          }}
          className={collectionMode ? 'active' : undefined}
        >
          <FiLayers />
          <span className="store-nav-label">{t.collection}</span>
        </button>
        <button onClick={toggleDarkMode}>
          {dark ? <FiSun /> : <FiMoon />}
        </button>
      </div>

      {filterOpen && (
        <div
          className="store-filter-overlay"
          onClick={() => setFilterOpen(false)}
        />
      )}

      {buyModalTheme && (
        <PurchaseModal
          theme={buyModalTheme}
          onClose={() => setBuyModalTheme(null)}
          onPurchase={completePurchase}
        />
      )}
    </div>
  );
}
