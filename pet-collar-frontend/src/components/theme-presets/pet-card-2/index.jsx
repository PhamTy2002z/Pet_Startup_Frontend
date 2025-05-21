import React from 'react';
import './styles.css';

// Import react-icons instead of SVG files
import { 
  FiStar, 
  FiCamera, 
  FiMusic, 
  FiCoffee, 
  FiGlobe, 
  FiHeart, 
  FiLoader, 
  FiSun, 
  FiMoon, 
  FiTarget,
  FiZap
} from 'react-icons/fi';
import { 
  FaPaw, 
  FaVolleyballBall, 
  FaMusic, 
  FaCoffee, 
  FaDog, 
  FaStar, 
  FaSparkles
} from 'react-icons/fa';

// Map superpower names to icon components
const superpowerIcons = {
  'Volleyball': FaVolleyballBall,
  'Coffee': FaCoffee,
  'Dog': FaDog,
  'Music1': FaMusic
};

// Theme variations
const themeStyles = {
  default: {
    containerClass: 'pc2-card-container',
    primaryColor: '#564EB3',
    photoFrameColor: '#FFA5D4',
    photoFrameShadowColor: '#FF84C5',
    photoPlaceholderColor: '#F1DD02',
    bioPillColor: '#F1DD02',
    bioPillTextColor: '#564EB3',
    sliderTrackColor: '#D4FF4E',
    superpowerBubbleColor: '#D4FF4E'
  },
  blue: {
    containerClass: 'pc2-card-container pc2-card-blue',
    primaryColor: '#4A80F0',
    photoFrameColor: '#86B6FF',
    photoFrameShadowColor: '#5C95FF',
    photoPlaceholderColor: '#50E3C2',
    bioPillColor: '#50E3C2',
    bioPillTextColor: '#1A3C8A',
    sliderTrackColor: '#50E3C2',
    superpowerBubbleColor: '#50E3C2'
  },
  green: {
    containerClass: 'pc2-card-container pc2-card-green',
    primaryColor: '#4ECDC4',
    photoFrameColor: '#98FB98',
    photoFrameShadowColor: '#7CCD7C',
    photoPlaceholderColor: '#FFDB58',
    bioPillColor: '#FFDB58',
    bioPillTextColor: '#2E8B57',
    sliderTrackColor: '#FFDB58',
    superpowerBubbleColor: '#FFDB58'
  },
  dark: {
    containerClass: 'pc2-card-container pc2-card-dark',
    primaryColor: '#2C3E50',
    photoFrameColor: '#667788',
    photoFrameShadowColor: '#445566',
    photoPlaceholderColor: '#F39C12',
    bioPillColor: '#F39C12',
    bioPillTextColor: '#2C3E50',
    sliderTrackColor: '#F39C12',
    superpowerBubbleColor: '#F39C12'
  }
};

export default function PetCard2({
  petName = 'Rachel',
  imageUrl,
  bio = 'Hello! If you\'re looking to hang out, dance and enjoy some good music, you can summon me!',
  funFact = 'I dream in black and white',
  superpowers = ['Volleyball', 'Coffee', 'Dog', 'Music1'],
  personalityEmoji = '🌸',
  theme = 'default'
}) {
  // Get the current theme styles, defaulting to default theme
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
    funFactPill: {
      backgroundColor: currentTheme.bioPillColor,
      color: currentTheme.bioPillTextColor,
    },
    sliderTrack: {
      backgroundColor: currentTheme.sliderTrackColor,
    },
    superpowerBubble: {
      backgroundColor: currentTheme.superpowerBubbleColor,
    },
    iconStyle: {
      color: '#746AE1',
      opacity: 0.2,
    }
  };

  return (
    <div className={currentTheme.containerClass} style={{backgroundColor: currentTheme.primaryColor}}>
      <div className="pc2-background-icons">
        <FiSun className="pc2-bg-flower" style={dynamicStyles.iconStyle} />
        <FiGlobe className="pc2-bg-planet" style={dynamicStyles.iconStyle} />
        <FiHeart className="pc2-bg-caring" style={dynamicStyles.iconStyle} />
      </div>

      <div className="pc2-superpowers">
        {superpowers.map((power, index) => {
          const IconComponent = superpowerIcons[power];
          return (
            <div key={index} className="pc2-superpower-bubble" style={dynamicStyles.superpowerBubble}>
              <IconComponent className="pc2-superpower-icon" />
            </div>
          );
        })}
      </div>

      <div className="pc2-main-content">
        <div className="pc2-photo-name-section">
          <div className="pc2-photo-frame-shadow" style={dynamicStyles.photoFrameShadow}></div>
          <div className="pc2-photo-frame" style={dynamicStyles.photoFrame}>
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={petName} 
                className="pc2-photo"
                style={{
                  objectFit: 'cover',
                  objectPosition: 'center'
                }} 
              />
            ) : (
              <div className="pc2-photo-placeholder" style={dynamicStyles.photoPlaceholder}>
                <FiCamera size={40} style={{ opacity: 0.7 }} />
              </div>
            )}
          </div>
          <FiStar className="pc2-sparkle-filled" style={{color: 'white'}} />
          <FiLoader className="pc2-sparkle" style={{color: 'white'}} />
          <FaStar className="pc2-star-filled" style={{color: 'white'}} />
          
          <div className="pc2-name-container">
            <div className="pc2-first-name">{petName}</div>
          </div>
        </div>

        {/* Modified bottom section to have Bio and Fun fact in the same row */}
        <div className="pc2-bottom-section">
          {/* Bio section */}
          <div className="pc2-bio-section">
            <div className="pc2-bio-title-pills">
              <div className="pc2-bio-pill" style={dynamicStyles.bioPill}>Bio</div>
            </div>
            <div className="pc2-bio-description">
              {funFact}
            </div>
          </div>

          {/* Fun fact section - now positioned at the same level as Bio */}
          <div className="pc2-fun-fact">
            <div className="pc2-fun-fact-title-pills">
              <div className="pc2-fun-fact-pill" style={dynamicStyles.funFactPill}>Fun fact</div>
            </div>
            <div className="pc2-fun-fact-text">
              {bio}
            </div>
          </div>
        </div>

        {/* Personality slider now in its own section below */}
        <div className="pc2-slider-section">
          <div className="pc2-slider-personality">
            <div className="pc2-slider-emojis">
              <span role="img" aria-label="Introvert">🙈</span>
              <span role="img" aria-label="Extrovert">🐵</span>
            </div>
            <div className="pc2-slider-track-container">
              <div className="pc2-slider-track" style={dynamicStyles.sliderTrack}></div>
              <div className="pc2-slider-thumb">
                <span role="img" aria-label="Personality">{personalityEmoji}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}