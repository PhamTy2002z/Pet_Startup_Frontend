import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiHeart, FiShoppingCart, FiHome, FiUser, FiShoppingBag, FiMoon, FiGlobe } from 'react-icons/fi';
import './ThemeStorePage.css';

// Memoized theme card component for better performance
const ThemeCard = memo(({ theme, isFavorite, onToggleFavorite, onApplyTheme, onAddToCart, t }) => {
  return (
    <div className="theme-card">
      <div className="theme-thumbnail">
        <img 
          src={theme.thumbnailUrl} 
          alt={theme.name}
          loading="lazy" 
        />
        <button 
          className={`favorite-button ${isFavorite ? 'favorited' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(theme.id);
          }}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <FiHeart />
        </button>
        {theme.price === 0 && (
          <span className="free-badge">{t.free}</span>
        )}
      </div>
      <div className="theme-info">
        <div>
          <h3 className="theme-name">{theme.name}</h3>
          <div className="theme-colors">
            {theme.colors.map((color, index) => (
              <span 
                key={index} 
                className="color-dot" 
                style={{ backgroundColor: color }}
                aria-label={`Theme color ${index + 1}`}
              ></span>
            ))}
          </div>
        </div>
        <div className="theme-actions">
          <span className="theme-price">
            {theme.price === 0 ? t.free : `${theme.price.toLocaleString()} ₫`}
          </span>
          <div className="action-buttons">
            <button 
              className="apply-button" 
              onClick={() => onApplyTheme(theme.id)}
              aria-label={`Apply ${theme.name} theme`}
            >
              {t.apply}
            </button>
            {theme.price > 0 && (
              <button 
                className="cart-add-button" 
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(theme.id);
                }}
                aria-label={`Add ${theme.name} to cart`}
              >
                <FiShoppingCart />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

const ThemeStorePage = () => {
  const navigate = useNavigate();
  const [themes, setThemes] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);
  const [language, setLanguage] = useState('vi');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('themeStore');
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Labels for both languages
  const labels = {
    vi: {
      title: 'Cửa hàng Chủ đề',
      categories: 'Danh mục',
      all: 'Tất cả',
      popular: 'Phổ biến',
      new: 'Mới nhất',
      seasonal: 'Theo mùa',
      premium: 'Cao cấp',
      free: 'Miễn phí',
      search: 'Tìm kiếm chủ đề...',
      recommended: 'Đề xuất cho bạn',
      trending: 'Xu hướng',
      apply: 'Áp dụng',
      addToCart: 'Thêm vào giỏ',
      free: 'Miễn phí',
      home: 'Trang chủ',
      profile: 'Hồ sơ',
      chat: 'Trò chuyện',
      books: 'Sách',
      store: 'Cửa hàng',
      changeLanguage: 'English',
      night: 'Đêm',
      loading: 'Đang tải...'
    },
    en: {
      title: 'Theme Store',
      categories: 'Categories',
      all: 'All',
      popular: 'Popular',
      new: 'New',
      seasonal: 'Seasonal',
      premium: 'Premium',
      free: 'Free',
      search: 'Search themes...',
      recommended: 'Recommended for you',
      trending: 'Trending',
      apply: 'Apply',
      addToCart: 'Add to cart',
      free: 'Free',
      home: 'Home',
      profile: 'Profile',
      chat: 'Chat',
      books: 'Books',
      store: 'Store',
      changeLanguage: 'Tiếng Việt',
      night: 'Night',
      loading: 'Loading...'
    }
  };

  // Get current language labels
  const t = labels[language];

  // Toggle language
  const toggleLanguage = useCallback(() => {
    setLanguage(prevLang => prevLang === 'vi' ? 'en' : 'vi');
  }, []);

  // Mock themes data - in a real app, this would come from an API
  useEffect(() => {
    const fetchThemes = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API request
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const mockThemes = [
          {
            id: 1,
            name: 'Pastel Paws',
            category: 'popular',
            price: 0,
            thumbnailUrl: 'https://placehold.co/300x200/FFCAE9/FFF?text=Pastel+Paws',
            previewImages: ['https://placehold.co/300x200/FFCAE9/FFF?text=Preview+1', 'https://placehold.co/300x200/FFCAE9/FFF?text=Preview+2'],
            description: 'A soft pastel theme with cute paw prints',
            colors: ['#FFCAE9', '#B5EAEA', '#FFDCDC']
          },
          {
            id: 2,
            name: 'Forest Friends',
            category: 'seasonal',
            price: 299,
            thumbnailUrl: 'https://placehold.co/300x200/C1F4C5/333?text=Forest+Friends',
            previewImages: ['https://placehold.co/300x200/C1F4C5/333?text=Preview+1', 'https://placehold.co/300x200/C1F4C5/333?text=Preview+2'],
            description: 'Nature-inspired theme with woodland creatures',
            colors: ['#C1F4C5', '#6ECEDA', '#FFF5BA']
          },
          {
            id: 3,
            name: 'Cosmic Cats',
            category: 'premium',
            price: 499,
            thumbnailUrl: 'https://placehold.co/300x200/D4A5FF/FFF?text=Cosmic+Cats',
            previewImages: ['https://placehold.co/300x200/D4A5FF/FFF?text=Preview+1', 'https://placehold.co/300x200/D4A5FF/FFF?text=Preview+2'],
            description: 'Space-themed design with celestial felines',
            colors: ['#D4A5FF', '#FFB2E6', '#9381FF']
          },
          {
            id: 4,
            name: 'Playful Puppies',
            category: 'popular',
            price: 0,
            thumbnailUrl: 'https://placehold.co/300x200/FFE6C7/333?text=Playful+Puppies',
            previewImages: ['https://placehold.co/300x200/FFE6C7/333?text=Preview+1', 'https://placehold.co/300x200/FFE6C7/333?text=Preview+2'],
            description: 'Energetic and playful dog-themed design',
            colors: ['#FFE6C7', '#FFA9A3', '#B1E1FF']
          },
          {
            id: 5,
            name: 'Aquarium Adventure',
            category: 'new',
            price: 399,
            thumbnailUrl: 'https://placehold.co/300x200/B5F8FE/333?text=Aquarium+Adventure',
            previewImages: ['https://placehold.co/300x200/B5F8FE/333?text=Preview+1', 'https://placehold.co/300x200/B5F8FE/333?text=Preview+2'],
            description: 'Underwater paradise for fish and aquatic pets',
            colors: ['#B5F8FE', '#A6DCEF', '#DDF3FF']
          },
          {
            id: 6,
            name: 'Holiday Paws',
            category: 'seasonal',
            price: 349,
            thumbnailUrl: 'https://placehold.co/300x200/FF858D/FFF?text=Holiday+Paws',
            previewImages: ['https://placehold.co/300x200/FF858D/FFF?text=Preview+1', 'https://placehold.co/300x200/FF858D/FFF?text=Preview+2'],
            description: 'Festive theme perfect for holiday season',
            colors: ['#FF858D', '#FFF7D6', '#C9F0FF']
          }
        ];

        setThemes(mockThemes);
      } catch (error) {
        console.error("Error fetching themes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchThemes();
  }, []);

  // Filter themes based on selected category and search query
  const filteredThemes = themes.filter(theme => {
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    const matchesSearch = !searchQuery || 
                          theme.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          theme.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Toggle favorite status for a theme
  const toggleFavorite = useCallback((themeId) => {
    setFavorites(prevFavorites => 
      prevFavorites.includes(themeId) 
        ? prevFavorites.filter(id => id !== themeId)
        : [...prevFavorites, themeId]
    );
  }, []);

  // Add a theme to cart
  const addToCart = useCallback((themeId) => {
    setCart(prevCart => 
      prevCart.includes(themeId) 
        ? prevCart 
        : [...prevCart, themeId]
    );
  }, []);

  // Apply a theme
  const applyTheme = useCallback((themeId) => {
    const theme = themes.find(theme => theme.id === themeId);
    if (theme) {
      // In a real app, this would update the user's selected theme
      alert(`Theme applied: ${theme.name}`);
    }
  }, [themes]);

  // Handle category selection
  const handleCategorySelect = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  // Handle search input change with debounce
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Get the simplified language display text
  const getLanguageDisplayText = () => {
    return language === 'vi' ? 'English' : 'Tiếng Việt';
  };

  if (isLoading) {
    return (
      <div className={`theme-store-page${darkMode ? ' dark' : ''}`}>
        <div className="store-header">
          <button className="back-button" onClick={() => navigate(-1)}>
            <FiChevronLeft />
          </button>
          <h1 className="store-title">{t.title}</h1>
          <div className="header-actions">
            <button 
              className="language-toggle-btn" 
              onClick={toggleLanguage}
              aria-label="Change language"
            >
              <FiGlobe size={14} />
              <span>{language === 'vi' ? 'EN' : 'VI'}</span>
            </button>
          </div>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`theme-store-page${darkMode ? ' dark' : ''}`}>
      <div className="store-header">
        <button 
          className="back-button" 
          onClick={() => navigate(-1)}
          aria-label="Go back"
        >
          <FiChevronLeft />
        </button>
        <h1 className="store-title">{t.title}</h1>
        <div className="header-actions">
          <button 
            className="language-toggle-btn" 
            onClick={toggleLanguage}
            aria-label="Change language"
          >
            <FiGlobe size={14} />
            <span>{language === 'vi' ? 'EN' : 'VI'}</span>
          </button>
          <button 
            className="cart-button"
            aria-label={`Shopping cart with ${cart.length} items`}
          >
            <FiShoppingCart />
            {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
          </button>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder={t.search}
          value={searchQuery}
          onChange={handleSearchChange}
          aria-label="Search themes"
        />
      </div>

      <div className="categories-scroller" role="tablist">
        {['all', 'popular', 'new', 'seasonal', 'premium', 'free'].map(category => (
          <button 
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`} 
            onClick={() => handleCategorySelect(category)}
            role="tab"
            aria-selected={selectedCategory === category}
            aria-controls={`${category}-themes`}
          >
            {t[category]}
          </button>
        ))}
      </div>

      {selectedCategory === 'all' && filteredThemes.length > 0 && (
        <div className="theme-section">
          <h2 className="section-title">{t.recommended}</h2>
          <div className="themes-grid" role="region" aria-label="Recommended themes">
            {filteredThemes.slice(0, 3).map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isFavorite={favorites.includes(theme.id)}
                onToggleFavorite={toggleFavorite}
                onApplyTheme={applyTheme}
                onAddToCart={addToCart}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {filteredThemes.length > 0 ? (
        <div className="theme-section">
          <h2 className="section-title">
            {selectedCategory === 'all' ? t.trending : t[selectedCategory]}
          </h2>
          <div 
            className="themes-grid" 
            role="region" 
            aria-label={selectedCategory === 'all' ? t.trending : t[selectedCategory]}
            id={`${selectedCategory}-themes`}
          >
            {filteredThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isFavorite={favorites.includes(theme.id)}
                onToggleFavorite={toggleFavorite}
                onApplyTheme={applyTheme}
                onAddToCart={addToCart}
                t={t}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="no-results">
          <p>No themes found matching your search criteria.</p>
        </div>
      )}

      <div className="bottom-nav">
        <button 
          className={`nav-button ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('home');
            navigate('/');
          }}
          aria-label="Home"
        >
          <FiHome />
          <span className="nav-label">{t.home}</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('profile');
            navigate(-1); // Navigate back to the user profile page
          }}
          aria-label="Profile"
        >
          <FiUser />
          <span className="nav-label">{t.profile}</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'themeStore' ? 'active' : ''}`}
          aria-label="Theme Store"
          aria-current="page"
        >
          <FiShoppingBag />
          <span className="nav-label">{t.store}</span>
        </button>
        <button 
          className={`nav-button ${activeTab === 'night' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('night');
            setDarkMode(prev => !prev);
          }}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          <FiMoon />
          <span className="nav-label">{t.night}</span>
        </button>
      </div>
    </div>
  );
};

export default ThemeStorePage;
