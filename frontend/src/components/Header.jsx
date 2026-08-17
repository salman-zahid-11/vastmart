import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getAllProducts } from '../services/productService';
import './Header.css';

function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const searchRef = useRef(null);
  const debounceTimer = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced live search-as-you-type
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (searchTerm.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await getAllProducts({ search: searchTerm.trim() });
        setSuggestions(results.slice(0, 6));
      } catch (err) {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer.current);
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    navigate(searchTerm.trim() ? `/?search=${encodeURIComponent(searchTerm.trim())}` : '/');
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="site-header__logo">
          Vast<span>Mart</span>
        </Link>

        <div className="site-header__search-wrap" ref={searchRef}>
          <form onSubmit={handleSearch} className="site-header__search">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search for products, brands, categories..."
              autoComplete="off"
            />
            <button type="submit" aria-label="Search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>

          {showSuggestions && searchTerm.trim().length >= 2 && (
            <div className="site-header__suggestions">
              {searching && <p className="site-header__suggestions-status">Searching...</p>}

              {!searching && suggestions.length === 0 && (
                <p className="site-header__suggestions-status">No products found for "{searchTerm}"</p>
              )}

              {!searching && suggestions.map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="site-header__suggestion-item"
                  onClick={() => {
                    setShowSuggestions(false);
                    setSearchTerm('');
                  }}
                >
                  <img
                    src={product.images?.[0] || 'https://via.placeholder.com/40'}
                    alt={product.name}
                  />
                  <div>
                    <p className="site-header__suggestion-name">{product.name}</p>
                    <p className="site-header__suggestion-meta">{product.category} · ৳{product.discountPrice || product.price}</p>
                  </div>
                </Link>
              ))}

              {!searching && suggestions.length > 0 && (
                <button
                  className="site-header__suggestion-viewall"
                  onClick={() => {
                    setShowSuggestions(false);
                    navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
                  }}
                >
                  View all results for "{searchTerm}"
                </button>
              )}
            </div>
          )}
        </div>

        <div className="site-header__actions">
          {user && (
            <Link to="/orders" className="site-header__action">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>Track Order</span>
            </Link>
          )}

          <Link to="/cart" className="site-header__action">
            <span className="site-header__cart-icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {itemCount > 0 && <span className="site-header__cart-badge">{itemCount}</span>}
            </span>
            <span>Cart</span>
          </Link>

          {user ? (
            <div className="site-header__account" ref={menuRef}>
              <button className="site-header__action" onClick={() => setMenuOpen((prev) => !prev)}>
                <div className="site-header__avatar">
                  {user.avatar ? (
                    <img src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar}`} alt={user.name} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <span>Account</span>
              </button>

              {menuOpen && (
                <div className="site-header__dropdown">
                  <p className="site-header__dropdown-name">{user.name}</p>
                  <p className="site-header__dropdown-email">{user.email}</p>
                  <hr />
                  <Link to="/profile" onClick={() => setMenuOpen(false)}>My Profile</Link>
<Link to="/orders" onClick={() => setMenuOpen(false)}>My Orders</Link>
{user.role === 'customer' && (
  <Link to="/become-seller" onClick={() => setMenuOpen(false)}>Become a Seller</Link>
)}
{user.role === 'seller' && (
                    <Link to="/seller/dashboard" onClick={() => setMenuOpen(false)}>Seller Dashboard</Link>
                  )}
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</Link>
                  )}
                  <hr />
                  <button onClick={handleLogout} className="site-header__dropdown-logout">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <div className="site-header__auth-buttons">
              <Link to="/login" className="site-header__action">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span>Login</span>
              </Link>
              <Link to="/register" className="site-header__cta">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;