//src/components/theme-presets/PetCard.js
import React from 'react';
import './styles.css';

function KiwiBadge() {
  return (
    <svg width="63" height="63" viewBox="0 0 63 63" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="31.5" cy="31.5" r="30" fill="#5C9E31" stroke="#000" strokeWidth="4" />
      <ellipse cx="31.5" cy="31.5" rx="15.5" ry="15" fill="#B1CC33" stroke="#000" strokeWidth="4" />
      {/* Seeds */}
      <rect x="30" y="10" width="3" height="8" rx="1.5" fill="#000" transform="rotate(-10 31.5 31.5)" />
      <rect x="30" y="45" width="3" height="8" rx="1.5" fill="#000" transform="rotate(10 31.5 31.5)" />
      <rect x="10" y="30" width="8" height="3" rx="1.5" fill="#000" transform="rotate(-10 31.5 31.5)" />
      <rect x="45" y="30" width="8" height="3" rx="1.5" fill="#000" transform="rotate(10 31.5 31.5)" />
      <rect x="18" y="18" width="3" height="8" rx="1.5" fill="#000" transform="rotate(-45 31.5 31.5)" />
      <rect x="42" y="18" width="3" height="8" rx="1.5" fill="#000" transform="rotate(45 31.5 31.5)" />
      <rect x="18" y="42" width="3" height="8" rx="1.5" fill="#000" transform="rotate(45 31.5 31.5)" />
      <rect x="42" y="42" width="3" height="8" rx="1.5" fill="#000" transform="rotate(-45 31.5 31.5)" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 17C14.2091 17 16 15.2091 16 13C16 10.7909 14.2091 9 12 9C9.79086 9 8 10.7909 8 13C8 15.2091 9.79086 17 12 17Z" stroke="#777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Define theme styles
const themeStyles = {
  default: {
    cardClass: 'pet-card',
    innerClass: 'pet-card-inner',
    headerClass: 'pet-card-header',
    breedClass: 'pet-card-breed',
    dotsClass: 'pet-card-dots',
    imageWrapperClass: 'pet-card-image-wrapper',
    nameClass: 'pet-card-name',
    nameBgClass: 'pet-card-name-bg',
    descClass: 'pet-card-desc',
    badgeClass: 'pet-card-badge'
  },
  blue: {
    cardClass: 'pet-card pet-card-blue',
    innerClass: 'pet-card-inner pet-card-inner-blue',
    headerClass: 'pet-card-header pet-card-header-blue',
    breedClass: 'pet-card-breed',
    dotsClass: 'pet-card-dots pet-card-dots-blue',
    imageWrapperClass: 'pet-card-image-wrapper pet-card-image-wrapper-blue',
    nameClass: 'pet-card-name',
    nameBgClass: 'pet-card-name-bg pet-card-name-bg-blue',
    descClass: 'pet-card-desc pet-card-desc-blue',
    badgeClass: 'pet-card-badge'
  },
  green: {
    cardClass: 'pet-card pet-card-green',
    innerClass: 'pet-card-inner pet-card-inner-green',
    headerClass: 'pet-card-header pet-card-header-green',
    breedClass: 'pet-card-breed',
    dotsClass: 'pet-card-dots pet-card-dots-green',
    imageWrapperClass: 'pet-card-image-wrapper pet-card-image-wrapper-green',
    nameClass: 'pet-card-name',
    nameBgClass: 'pet-card-name-bg pet-card-name-bg-green',
    descClass: 'pet-card-desc pet-card-desc-green',
    badgeClass: 'pet-card-badge'
  },
  dark: {
    cardClass: 'pet-card pet-card-dark',
    innerClass: 'pet-card-inner pet-card-inner-dark',
    headerClass: 'pet-card-header pet-card-header-dark',
    breedClass: 'pet-card-breed',
    dotsClass: 'pet-card-dots pet-card-dots-dark',
    imageWrapperClass: 'pet-card-image-wrapper pet-card-image-wrapper-dark',
    nameClass: 'pet-card-name',
    nameBgClass: 'pet-card-name-bg pet-card-name-bg-dark',
    descClass: 'pet-card-desc pet-card-desc-dark',
    badgeClass: 'pet-card-badge'
  }
};

export default function PetCard({ breed, name, age, description, imageUrl, theme = 'default' }) {
  // Format the description based on age
  const formattedDescription = description || '';
  
  // Limit description to 40 chars excluding spaces
  const limitDescription = (text) => {
    if (!text) return '';
    // Remove spaces for counting
    const textWithoutSpaces = text.replace(/\s/g, '');
    if (textWithoutSpaces.length <= 40) return text;
    
    // If we need to truncate, we'll do it with the original text (with spaces)
    let charCount = 0;
    let truncatedText = '';
    
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== ' ') charCount++;
      truncatedText += text[i];
      if (charCount >= 40) break;
    }
    
    return truncatedText + '...';
  };
  
  const truncatedDescription = limitDescription(formattedDescription);
  const ageText = typeof age === 'number' && age > 0 ? `${age} tuổi` : '';
  
  // Combine age and description if both exist
  const displayText = ageText && truncatedDescription 
    ? `${ageText}, ${truncatedDescription}`
    : ageText || truncatedDescription;

  // Get the appropriate theme styles
  const currentTheme = themeStyles[theme] || themeStyles.default;

  return (
    <div className={currentTheme.cardClass}>
      <div className={currentTheme.innerClass} />
      <div className={currentTheme.headerClass}>
        <span className={currentTheme.breedClass}>{breed}</span>
        <span className={currentTheme.dotsClass}>
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      </div>
      <div className={currentTheme.imageWrapperClass}>
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="pet-card-image" />
        ) : (
          <div className="placeholder">
            <CameraIcon />
            <span className="upload-text">Upload On Profile</span>
          </div>
        )}
      </div>
      <div className={currentTheme.nameBgClass}>
        <span className={currentTheme.nameClass}>{name}</span>
      </div>
      <div className={currentTheme.descClass} title={formattedDescription}>
        {displayText}
      </div>
      <div className={currentTheme.badgeClass}>
        <KiwiBadge />
      </div>
    </div>
  );
}
