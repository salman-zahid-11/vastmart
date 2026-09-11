import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../services/productService';
import './MobileMenuDrawer.css';

function MobileMenuDrawer({ isOpen, onClose }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  if (!isOpen) return null;

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      <div className="mobile-drawer" onClick={(e) => e.stopPropagation()}>
        <button className="mobile-drawer__close" onClick={onClose}>×</button>

        <div className="mobile-drawer__greeting">
          <div className="mobile-drawer__avatar">
            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : (user?.name?.charAt(0).toUpperCase() || '👤')}
          </div>
          <div>
            <p className="mobile-drawer__hello">{user ? `Hi, ${user.name}` : 'Hello there!'}</p>
            {!user && <Link to="/login" onClick={onClose} className="mobile-drawer__signin">Sign in</Link>}
          </div>
        </div>

        <div className="mobile-drawer__section">
          <button
            type="button"
            className="mobile-drawer__link mobile-drawer__link--filter"
            onClick={() => {
              onClose();
              window.dispatchEvent(new CustomEvent('vastmart:toggle-filters'));
            }}
          >
            ☷ &nbsp; Filters
          </button>
          <Link to="/" onClick={onClose} className="mobile-drawer__link mobile-drawer__link--bold">All Products</Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              to={`/?category=${encodeURIComponent(cat)}`}
              onClick={onClose}
              className="mobile-drawer__link"
            >
              {cat}
            </Link>
          ))}
        </div>

        <div className="mobile-drawer__quicklinks">
          <p className="mobile-drawer__quicklinks-title">Quick Links</p>
          {user ? (
            <>
              <Link to="/profile" onClick={onClose} className="mobile-drawer__link">My Profile</Link>
              <Link to="/orders" onClick={onClose} className="mobile-drawer__link">My Orders</Link>
              {user.role === 'customer' && (
                <Link to="/become-seller" onClick={onClose} className="mobile-drawer__link">Become a Seller</Link>
              )}
              {user.role === 'seller' && (
                <Link to="/seller/dashboard" onClick={onClose} className="mobile-drawer__link">Seller Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin/dashboard" onClick={onClose} className="mobile-drawer__link">Admin Dashboard</Link>
              )}
            </>
          ) : (
            <Link to="/register" onClick={onClose} className="mobile-drawer__link">Create an Account</Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default MobileMenuDrawer;