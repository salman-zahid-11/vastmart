import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getMyNotifications, markNotificationRead } from '../services/notificationService';
import './MobileBottomNav.css';

function MobileBottomNav({ onOpenMenu, onOpenSearch }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setNotifications([]);
      return undefined;
    }
    getMyNotifications()
      .then((items) => {
        if (active) setNotifications(Array.isArray(items) ? items : []);
      })
      .catch(() => {
        if (active) setNotifications([]);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const unreadCount = notifications.filter((notification) => !notification.isRead).length;
  const handleNotificationRead = async (notification) => {
    if (notification.isRead) return;
    try {
      await markNotificationRead(notification._id);
      setNotifications((current) => current.map((item) => (
        item._id === notification._id ? { ...item, isRead: true } : item
      )));
    } catch (err) {
      console.error('Failed to mark notification as read', err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="mobile-bottom-nav">
      <button className="mobile-bottom-nav__item" onClick={() => navigate('/')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
        <span>Home</span>
      </button>

      <button className="mobile-bottom-nav__item" onClick={onOpenMenu}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
        <span>Menu</span>
      </button>

      <Link to="/cart" className="mobile-bottom-nav__item mobile-bottom-nav__item--cart">
        <span className="mobile-bottom-nav__cart-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
          {itemCount > 0 && <span className="mobile-bottom-nav__badge">{itemCount}</span>}
        </span>
        <span>Cart</span>
      </Link>

      <button className="mobile-bottom-nav__item" onClick={onOpenSearch}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <span>Search</span>
      </button>

      {user && (
        <div className="mobile-bottom-nav__notification-wrap">
          <button
            className="mobile-bottom-nav__item"
            onClick={() => setNotificationsOpen((open) => !open)}
            aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
          >
            <span className="mobile-bottom-nav__notification-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              {unreadCount > 0 && <span className="mobile-bottom-nav__badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
            </span>
            <span>Alerts</span>
          </button>
          {notificationsOpen && (
            <div className="mobile-bottom-nav__notifications">
              <strong>Notifications</strong>
              {notifications.length === 0 ? (
                <p>No notifications yet.</p>
              ) : notifications.slice(0, 6).map((notification) => (
                <button
                  type="button"
                  key={notification._id}
                  className={!notification.isRead ? 'mobile-bottom-nav__notification--unread' : ''}
                  onClick={() => handleNotificationRead(notification)}
                >
                  <b>{notification.title}</b>
                  <span>{notification.message}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <Link to={user ? '/profile' : '/login'} className="mobile-bottom-nav__item">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <span>Account</span>
      </Link>
    </nav>
  );
}

export default MobileBottomNav;