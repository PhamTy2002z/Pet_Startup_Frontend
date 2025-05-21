import React, { useState } from 'react';
import './styles.css';
import { FiLoader, FiSun, FiGlobe, FiHeart, FiCamera, FiStar, FiTv, FiVideo, FiSmile, FiZap } from 'react-icons/fi';

// Theme variations
const themeStyles = {
  default: {
    containerClass: 'pc3-card-container',
    primaryColor: '#FF84C5',
    photoFrameColor: '#6D9BFF',
    photoFrameShadowColor: '#3A78FF',
    photoPlaceholderColor: '#D4FF4E',
    bioPillColor: '#D4FF4E',
    bioPillTextColor: '#564EB3',
    sliderTrackColor: '#F1DD02',
    superpowerBubbleColor: '#F1DD02',
    funFactTitleColor: '#FF84C5'
  },
  blue: {
    containerClass: 'pc3-card-container pc3-card-blue',
    primaryColor: '#4A80F0',
    photoFrameColor: '#86B6FF',
    photoFrameShadowColor: '#5C95FF',
    photoPlaceholderColor: '#50E3C2',
    bioPillColor: '#50E3C2',
    bioPillTextColor: '#1A3C8A',
    sliderTrackColor: '#50E3C2',
    superpowerBubbleColor: '#50E3C2',
    funFactTitleColor: '#4A80F0'
  },
  green: {
    containerClass: 'pc3-card-container pc3-card-green',
    primaryColor: '#4ECDC4',
    photoFrameColor: '#98FB98',
    photoFrameShadowColor: '#7CCD7C',
    photoPlaceholderColor: '#FFDB58',
    bioPillColor: '#FFDB58',
    bioPillTextColor: '#2E8B57',
    sliderTrackColor: '#FFDB58',
    superpowerBubbleColor: '#FFDB58',
    funFactTitleColor: '#4ECDC4'
  },
  dark: {
    containerClass: 'pc3-card-container pc3-card-dark',
    primaryColor: '#2C3E50',
    photoFrameColor: '#667788',
    photoFrameShadowColor: '#445566',
    photoPlaceholderColor: '#F39C12',
    bioPillColor: '#F39C12',
    bioPillTextColor: '#2C3E50',
    sliderTrackColor: '#F39C12',
    superpowerBubbleColor: '#F39C12',
    funFactTitleColor: '#2C3E50'
  }
};

export default function PetCard3({
  firstName = 'ROGER',
  lastName = 'radcliffe',
  imageUrl,
  bio = "I'm a passionate filmmaker and a fan of many classic franchises (total geek about them, tbh). May the force be with you!",
  funFact = "I believe I live in an inception",
  personalityEmoji = '👌🏽',
  theme = 'default'
}) {
  // Track if SVG icons failed to load
  const [iconsFailed, setIconsFailed] = useState({
    cat: false,
    videogames: false,
    movies: false,
    tvShows: false,
    sparkle1: false,
    sparkle2: false,
    star: false
  });

  // Get the current theme styles
  const currentTheme = themeStyles[theme] || themeStyles.default;
  
  // Create dynamic styles based on theme
  const dynamicStyles = {
    photoFrameShadow: {
      backgroundColor: currentTheme.photoFrameShadowColor,
    },
    photoFrame: {
      backgroundColor: currentTheme.photoFrameColor,
    },
    photoPlaceholder: {
      backgroundColor: currentTheme.photoPlaceholderColor,
    },
    bioPill: {
      backgroundColor: currentTheme.bioPillColor,
      color: currentTheme.bioPillTextColor,
    },
    sliderTrack: {
      backgroundColor: currentTheme.sliderTrackColor,
    },
    superpowerBubble: {
      backgroundColor: currentTheme.superpowerBubbleColor,
    },
    funFactTitle: {
      color: currentTheme.funFactTitleColor
    }
  };

  // Calculate approximate position for slider thumb
  // Default to middle if no specific emoji
  const sliderPosition = 42; // Default percentage position

  // Render fallback icons if needed
  const renderSuperPowerIcon = (type) => {
    if (iconsFailed[type]) {
      switch(type) {
        case 'cat': return <span role="img" aria-label="Cat">🐱</span>;
        case 'videogames': return <FiZap size={24} />;
        case 'movies': return <FiVideo size={24} />;
        case 'tvShows': return <FiTv size={24} />;
        default: return <FiStar size={24} />;
      }
    }
    
    return (
      <img 
        src={`/assets/images/pet-card-3/${type === 'cat' ? 'cat' : 
              type === 'videogames' ? 'videogames' : 
              type === 'movies' ? 'movies' : 
              'tv-shows'}.svg`} 
        alt={type}
        className="pc3-superpower-icon"
        onError={() => {
          setIconsFailed(prev => ({ ...prev, [type]: true }));
        }}
      />
    );
  };

  return (
    <div className={currentTheme.containerClass} style={{backgroundColor: currentTheme.primaryColor}}>
      {/* Background Icons */}
      <div className="pc3-background-icons">
        <FiSun className="pc3-bg-flower" />
        <FiGlobe className="pc3-bg-planet" />
        <FiHeart className="pc3-bg-caring" />
      </div>

      {/* Superpowers */}
      <div className="pc3-superpowers">
        <div className="pc3-superpower-bubble" style={dynamicStyles.superpowerBubble}>
          {renderSuperPowerIcon('cat')}
        </div>
        <div className="pc3-superpower-bubble" style={dynamicStyles.superpowerBubble}>
          {renderSuperPowerIcon('videogames')}
        </div>
        <div className="pc3-superpower-bubble" style={dynamicStyles.superpowerBubble}>
          {renderSuperPowerIcon('movies')}
        </div>
        <div className="pc3-superpower-bubble" style={dynamicStyles.superpowerBubble}>
          {renderSuperPowerIcon('tvShows')}
        </div>
      </div>

      {/* Photo and Name Section */}
      <div className="pc3-main-content">
        <div className="pc3-photo-name-section">
          <div className="pc3-photo-section">
            <div className="pc3-photo-frame-shadow" style={dynamicStyles.photoFrameShadow}></div>
            <div className="pc3-photo-frame" style={dynamicStyles.photoFrame}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt={firstName} 
                  className="pc3-photo"
                  style={{
                    objectFit: 'cover',
                    objectPosition: 'center',
                    width: '100%',
                    height: '100%'
                  }}
                /> 
              ) : (
                <div className="pc3-photo-placeholder" style={dynamicStyles.photoPlaceholder}>
                  <FiCamera size={48} style={{ opacity: 0.7 }} />
                </div>
              )}
            </div>
            
            {/* Decorative elements - using Fi icons with conditional fallback */}
            {iconsFailed.sparkle1 ? 
              <FiStar className="pc3-sparkle-filled" /> : 
              <img 
                src="/assets/images/pet-card-3/sparkle-filled.svg" 
                alt="" 
                className="pc3-sparkle-filled"
                onError={() => setIconsFailed(prev => ({ ...prev, sparkle1: true }))}
              />
            }
            
            {iconsFailed.sparkle2 ? 
              <FiLoader className="pc3-sparkle" /> : 
              <img 
                src="/assets/images/pet-card-3/sparkle.svg" 
                alt="" 
                className="pc3-sparkle"
                onError={() => setIconsFailed(prev => ({ ...prev, sparkle2: true }))}
              />
            }
            
            {iconsFailed.star ? 
              <FiStar className="pc3-star-filled" /> : 
              <img 
                src="/assets/images/pet-card-3/star-filled.svg" 
                alt="" 
                className="pc3-star-filled"
                onError={() => setIconsFailed(prev => ({ ...prev, star: true }))}
              />
            }
            
            {/* Name container */}
            <div className="pc3-name-container">
              <div className="pc3-first-name">{firstName}</div>
              <div className="pc3-last-name">{lastName}</div>
            </div>
          </div>
        </div>

        {/* Card Bottom Section */}
        <div className="pc3-bottom-section">
          {/* Bio Section */}
          <div className="pc3-bio-section">
            <div className="pc3-bio-title-wrapper">
              <div className="pc3-bio-pill" style={dynamicStyles.bioPill}>Bio</div>
            </div>
            <div className="pc3-bio-description">
              {bio}
            </div>
          </div>

          {/* Fun fact and Slider Section */}
          <div className="pc3-fun-slider-section">
            {/* Personality Slider */}
            <div className="pc3-slider-personality">
              <div className="pc3-slider-emojis">
                <span role="img" aria-label="Happy">😃</span>
                <span role="img" aria-label="Laughing">😂</span>
              </div>
              <div className="pc3-slider-track-container">
                <div className="pc3-slider-track" style={dynamicStyles.sliderTrack}></div>
                <div className="pc3-slider-thumb" style={{left: `${sliderPosition}%`}}>
                  <span role="img" aria-label="Personality">{personalityEmoji}</span>
                </div>
              </div>
            </div>

            {/* Fun Fact */}
            <div className="pc3-fun-fact" style={{borderColor: '#000000'}}>
              <div className="pc3-fun-fact-title" style={dynamicStyles.funFactTitle}>Fun fact!</div>
              <div className="pc3-fun-fact-text">{funFact}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
