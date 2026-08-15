import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { itemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar__logo">
        Vast<span>Mart</span>
      </Link>

      <div className="navbar__links">
        <Link to="/" className="navbar__link">Home</Link>

        {user ? (
          <>
            {user.role === 'admin' && (
  <Link to="/admin/dashboard">Admin</Link>
)}
{user.role === 'seller' && (
  <Link to="/seller/dashboard">Seller Dashboard</Link>
)}

            <Link to="/orders" className="navbar__link">My Orders</Link>

            <Link to="/cart" className="navbar__cart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              {itemCount > 0 && <span className="navbar__cart-badge">{itemCount}</span>}
            </Link>

            <div className="navbar__user">
  <Link to="/profile" className="navbar__avatar">
    {user.avatar ? (
      <img src={`http://localhost:5000${user.avatar}`} alt={user.name} />
    ) : (
      user.name.charAt(0).toUpperCase()
    )}
  </Link>
  <button onClick={handleLogout} className="navbar__logout">Logout</button>
</div>


          </>
        ) : (
          <>
            <Link to="/login" className="navbar__link">Login</Link>
            <Link to="/register" className="navbar__cta">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;