import './TopBar.css';

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
        <a href="tel:+8801700000000">📞 +880 1700-000000</a>
        <span className="topbar__divider">|</span>
        <a href="https://wa.me/8801700000000" target="_blank" rel="noreferrer">WhatsApp</a>
      </div>
    </div>
  );
}

export default TopBar;