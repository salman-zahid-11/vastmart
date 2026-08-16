import './TopBar.css';

const PHONE_NUMBER = '+880 1570-263779';
const WHATSAPP_NUMBER = '880 1570-263779';

function TopBar() {
  return (
    <div className="topbar">
      <div className="topbar__ticker">
        <div className="topbar__ticker-track">
          <span className="topbar__message">Free delivery inside Dhaka on orders over ৳1000</span>
          <span className="topbar__message">Free delivery inside Dhaka on orders over ৳1000</span>
          <span className="topbar__message">Free delivery inside Dhaka on orders over ৳1000</span>
        </div>
      </div>
      <div className="topbar__contact">
        <a href={`tel:${PHONE_NUMBER}`}>📞 {PHONE_NUMBER}</a>
        <span className="topbar__divider">|</span>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noreferrer" className="topbar__whatsapp">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11a16.5 16.5 0 0 1-1.62-.6c-2.86-1.24-4.72-4.13-4.87-4.32-.14-.2-1.17-1.55-1.17-2.96s.73-2.1 1-2.38c.26-.29.57-.36.76-.36l.55.01c.17.01.41-.06.64.49.24.57.81 1.98.88 2.12.07.15.12.32.02.51-.09.19-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.29.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.29.14.46.12.62-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/></svg>
          WhatsApp
        </a>
      </div>
    </div>
  );
}

export default TopBar;