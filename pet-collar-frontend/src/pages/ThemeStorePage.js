import React, { useState, useEffect } from 'react';
import './ThemeStorePage.css';

const ThemeStorePage = () => {
  // State for active tab
  const [activeTab, setActiveTab] = useState('free');
  // State for selected theme (for details modal)
  const [selectedTheme, setSelectedTheme] = useState(null);
  // State for previewing theme
  const [previewingTheme, setPreviewingTheme] = useState(null);
  // State for theme data
  const [themes, setThemes] = useState([
    // Free themes
    {
      id: 1,
      name: 'Midnight Blue',
      author: 'PetCollar Design',
      price: 0,
      type: 'free',
      owned: false,
      active: false,
      image: 'https://via.placeholder.com/300x200?text=Midnight+Blue',
      description: 'A dark blue theme for nighttime use',
      features: ['Dark mode', 'Battery efficient', 'Reduced eye strain']
    },
    {
      id: 2,
      name: 'Forest Green',
      author: 'Nature Themes',
      price: 0,
      type: 'free',
      owned: true,
      active: true,
      image: 'https://via.placeholder.com/300x200?text=Forest+Green',
      description: 'Natural green colors for a calming experience',
      features: ['Nature inspired', 'Soft transitions', 'Custom fonts']
    },
    // Premium themes
    {
      id: 3,
      name: 'Gold Edition',
      author: 'Premium Designs',
      price: 1.99,
      paymentModel: 'one-time',
      type: 'premium',
      owned: false,
      active: false,
      image: 'https://via.placeholder.com/300x200?text=Gold+Edition',
      description: 'Luxurious gold-themed interface',
      features: ['Animated transitions', 'Custom icons', 'Dark & light modes']
    },
    {
      id: 4,
      name: 'Pro Charts',
      author: 'Data Viz Team',
      price: 2.99,
      paymentModel: 'subscribe',
      type: 'premium',
      owned: false,
      active: false,
      image: 'https://via.placeholder.com/300x200?text=Pro+Charts',
      description: 'Enhanced charting and data visualization',
      features: ['Advanced analytics', 'Interactive charts', 'Custom data views']
    },
    {
      id: 5,
      name: 'Pet Paradise',
      author: 'Animal Lovers Co.',
      price: 3.99,
      paymentModel: 'one-time',
      type: 'premium',
      owned: true,
      active: false,
      image: 'https://via.placeholder.com/300x200?text=Pet+Paradise',
      description: 'Cute pet-themed interface with paw prints and playful elements',
      features: ['Pet animations', 'Playful sounds', 'Customizable pet icons']
    }
  ]);

  // Filter themes based on active tab
  const filteredThemes = themes.filter(theme => {
    if (activeTab === 'free') return theme.type === 'free';
    if (activeTab === 'premium') return theme.type === 'premium';
    if (activeTab === 'owned') return theme.owned;
    return true;
  });

  // Start theme preview
  const handlePreview = (theme) => {
    setPreviewingTheme(theme);
    // Reset previewing theme after 5 seconds
    setTimeout(() => {
      setPreviewingTheme(null);
    }, 5000);
  };

  // Set active theme
  const handleSetActive = (themeId) => {
    setThemes(themes.map(theme => ({
      ...theme,
      active: theme.id === themeId
    })));
  };

  // Purchase theme
  const handlePurchase = (themeId) => {
    setThemes(themes.map(theme => 
      theme.id === themeId ? { ...theme, owned: true } : theme
    ));
  };

  return (
    <div className={`theme-store-container ${previewingTheme ? 'previewing' : ''}`}>
      {/* Preview Watermark */}
      {previewingTheme && (
        <div className="preview-watermark">
          <span>DEMO</span>
        </div>
      )}

      <h1>Theme Store</h1>
      
      {/* Tabs */}
      <div className="theme-tabs">
        <button 
          className={`tab-button ${activeTab === 'free' ? 'active' : ''}`}
          onClick={() => setActiveTab('free')}
        >
          Free
        </button>
        <button 
          className={`tab-button ${activeTab === 'premium' ? 'active' : ''}`}
          onClick={() => setActiveTab('premium')}
        >
          Premium
        </button>
        <button 
          className={`tab-button ${activeTab === 'owned' ? 'active' : ''}`}
          onClick={() => setActiveTab('owned')}
        >
          Owned
        </button>
      </div>
      
      {/* Theme Grid */}
      <div className="theme-grid">
        {filteredThemes.map(theme => (
          <div 
            key={theme.id} 
            className={`theme-card ${theme.active ? 'active' : ''} ${theme.owned ? 'owned' : 'locked'}`}
            style={{ 
              backgroundImage: `url(${theme.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            onClick={() => setSelectedTheme(theme)}
          >
            {/* Lock Overlay for unpurchased themes */}
            {!theme.owned && (
              <div className="lock-overlay">
                <i className="lock-icon">🔒</i>
                {theme.price > 0 && (
                  <div className="price-tag">
                    <span className="price">${theme.price.toFixed(2)}</span>
                    <span className="payment-model">
                      {theme.paymentModel === 'subscribe' ? 'Subscribe' : 'One-time purchase'}
                    </span>
                  </div>
                )}
              </div>
            )}
            
            {/* Status Badge for owned themes */}
            {theme.owned && (
              <div className="status-badge">
                {theme.active ? 'Active' : 'Yours'}
              </div>
            )}
            
            {/* Theme Name */}
            <div className="theme-name">{theme.name}</div>
            
            {/* Preview Button */}
            <button 
              className="preview-button"
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(theme);
              }}
            >
              Try Preview
            </button>
          </div>
        ))}
      </div>
      
      {/* Theme Details Modal */}
      {selectedTheme && (
        <div className="theme-details-modal">
          <div className="modal-content">
            <button 
              className="close-button"
              onClick={() => setSelectedTheme(null)}
            >
              ✕
            </button>
            
            <div className="theme-preview">
              <img src={selectedTheme.image} alt={selectedTheme.name} />
            </div>
            
            <div className="theme-info">
              <h2>{selectedTheme.name}</h2>
              <p className="author">By {selectedTheme.author}</p>
              
              {selectedTheme.price > 0 && !selectedTheme.owned ? (
                <div className="price-info">
                  <span className="price">${selectedTheme.price.toFixed(2)}</span>
                  <span className="payment-model">
                    {selectedTheme.paymentModel === 'subscribe' ? 'Subscription' : 'One-time purchase'}
                  </span>
                </div>
              ) : selectedTheme.price === 0 ? (
                <div className="price-info">
                  <span className="free-label">Free</span>
                </div>
              ) : null}
              
              <p className="description">{selectedTheme.description}</p>
              
              <div className="features">
                <h3>Features</h3>
                <ul>
                  {selectedTheme.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
              
              <div className="action-buttons">
                {!selectedTheme.owned ? (
                  <button 
                    className="purchase-button"
                    onClick={() => {
                      handlePurchase(selectedTheme.id);
                      setSelectedTheme({...selectedTheme, owned: true});
                    }}
                  >
                    {selectedTheme.price > 0 ? `Purchase ($${selectedTheme.price.toFixed(2)})` : 'Get for Free'}
                  </button>
                ) : !selectedTheme.active ? (
                  <button 
                    className="activate-button"
                    onClick={() => {
                      handleSetActive(selectedTheme.id);
                      setSelectedTheme({...selectedTheme, active: true});
                    }}
                  >
                    Set as Active
                  </button>
                ) : (
                  <button className="active-button" disabled>
                    Currently Active
                  </button>
                )}
                
                <button 
                  className="preview-button-large"
                  onClick={() => handlePreview(selectedTheme)}
                >
                  Preview Theme
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeStorePage;
