import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MobileSearchOverlay.css';

function MobileSearchOverlay({ isOpen, onClose }) {
  const [term, setTerm] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (term.trim()) {
      navigate(`/?search=${encodeURIComponent(term.trim())}`);
      onClose();
    }
  };

  return (
    <div className="mobile-search-overlay">
      <form onSubmit={handleSubmit} className="mobile-search-overlay__form">
        <button type="button" onClick={onClose} className="mobile-search-overlay__back">←</button>
        <input
          type="text"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search for products..."
          autoFocus
        />
        <button type="submit" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </button>
      </form>
    </div>
  );
}

export default MobileSearchOverlay;