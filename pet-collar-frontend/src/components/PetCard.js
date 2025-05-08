import React from 'react';
import { FiCopy, FiExternalLink } from 'react-icons/fi';
import './PetCard.css';

export default function PetCard({ pet }) {
  const editUrl = `${window.location.origin}/user/edit/${pet._id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(editUrl);
    // Bạn có thể thêm toast/alert ở đây nếu muốn feedback
  };

  return (
    <div className="pet-card">
      <div className="qr-container">
        <img src={pet.qrCodeUrl} alt="QR code" />
      </div>

      <div className="info">
        <span className="id">ID: {pet._id}</span>
        <button onClick={copyLink} className="copy-button">
          <FiCopy />
        </button>
      </div>

      <a
        href={editUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="edit-button"
      >
        Chỉnh sửa
        <FiExternalLink className="icon" />
      </a>
    </div>
  );
}
