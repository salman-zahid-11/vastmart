import { useEffect, useState } from 'react';
import { getActivePopup } from '../services/promotionalPopupService';
import './PromotionalPopup.css';

function PromotionalPopup() {
  const [popup, setPopup] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('vastmart-popup-dismissed')) return undefined;
    let active = true;
    getActivePopup().then((result) => {
      if (active && result) {
        setPopup(result);
        setVisible(true);
      }
    }).catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!visible || !popup) return undefined;
    const timer = setTimeout(() => {
      sessionStorage.setItem('vastmart-popup-dismissed', 'true');
      setVisible(false);
    }, popup.duration * 1000);
    return () => clearTimeout(timer);
  }, [visible, popup]);

  if (!visible || !popup) return null;
  const content = <img src={popup.image} alt={popup.title || 'Promotion'} />;
  return (
    <div className="promotional-popup__backdrop" role="dialog" aria-label="Promotion">
      <div className="promotional-popup">
        <button type="button" className="promotional-popup__close" onClick={() => { sessionStorage.setItem('vastmart-popup-dismissed', 'true'); setVisible(false); }} aria-label="Close promotion">×</button>
        {popup.link ? <a href={popup.link}>{content}</a> : content}
      </div>
    </div>
  );
}

export default PromotionalPopup;
