/* src/components/PurchaseModal.jsx */
import { useState } from 'react';
import { FiX, FiCheck, FiCopy } from 'react-icons/fi';
import './PurchaseModal.css';

export default function PurchaseModal({ theme, onClose, onPurchase }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');

  const handleBuy = async () => {
    setLoading(true);
    try {
      const code = await onPurchase(theme._id); // returns code
      setRedeemCode(code);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-backdrop">
      <div className="pm-card">
        <button className="pm-close" onClick={onClose}>
          <FiX size={20} />
        </button>

        {!done ? (
          <>
            <h2 className="pm-title">{theme.name}</h2>
            <img src={theme.imageUrl} alt={theme.name} className="pm-img" />
            <p className="pm-desc">{theme.description}</p>

            <div className="pm-price">
              {theme.isPremium
                ? `${theme.price.toLocaleString()} ₫`
                : 'Free'}
            </div>

            <button
              className="pm-buy-btn"
              disabled={loading}
              onClick={handleBuy}
            >
              {loading ? 'Processing…' : 'Pay (mock)'}
            </button>
          </>
        ) : (
          <>
            <FiCheck size={36} className="pm-done-icon" />
            <h3>Purchase successful!</h3>
            <p className="pm-code">{redeemCode}</p>
            <button
              className="pm-copy-btn"
              onClick={() => navigator.clipboard.writeText(redeemCode)}
            >
              <FiCopy style={{ marginRight: 6 }} />
              Copy Code
            </button>
            <button className="pm-close-main" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
}
