import React from 'react';
import './PetCard.css';

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

export default function PetCard({ breed, name, age, description, imageUrl }) {
  return (
    <div className="pet-card">
      <div className="pet-card-inner" />
      <div className="pet-card-header">
        <span className="pet-card-breed">{breed}</span>
        <span className="pet-card-dots">
          <span className="dot" />
          <span className="dot" />
          <span className="dot" />
        </span>
      </div>
      <div className="pet-card-image-wrapper">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="pet-card-image" />
        ) : (
          <div className="placeholder">Chưa có ảnh</div>
        )}
      </div>
      <div className="pet-card-name-bg">
        <span className="pet-card-name">{name}</span>
      </div>
      <div className="pet-card-desc" title={`${age} tuổi, ${description}`}>
        {age} tuổi, {description}
      </div>
      <div className="pet-card-badge">
        <KiwiBadge />
      </div>
    </div>
  );
}
