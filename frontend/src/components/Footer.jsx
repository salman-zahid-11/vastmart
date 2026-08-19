import { Link } from 'react-router-dom';
import './Footer.css';

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__top">
          <div className="site-footer__brand">
            <Link to="/" className="site-footer__logo">
              Vast<span>Mart</span>
            </Link>
            <p className="site-footer__tagline">
              Bangladesh's next-generation marketplace — thousands of sellers,
              one seamless storefront.
            </p>
            <div className="site-footer__social">
              <a href="https://www.facebook.com/vastmartbd" aria-label="Facebook" className="site-footer__social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9v-2.9h2.54V9.8c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34v6.99A10 10 0 0 0 22 12z"/></svg>
              </a>
              <a href="https://www.instagram.com/vastmartbd" aria-label="Instagram" className="site-footer__social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
              </a>
              <a href="#" aria-label="YouTube" className="site-footer__social-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
              </a>
            </div>
          </div>

          <div className="site-footer__col">
            <h4>Shop</h4>
            <Link to="/">All Products</Link>
            <Link to="/?search=Electronics">Electronics</Link>
            <Link to="/?search=Fashion">Fashion</Link>
            <Link to="/?search=Home%20%26%20Living">Home &amp; Living</Link>
          </div>

          <div className="site-footer__col">
            <h4>Account</h4>
            <Link to="/profile">My Profile</Link>
            <Link to="/orders">My Orders</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/become-seller">Become a Seller</Link>
          </div>

          <div className="site-footer__col">
            <h4>Support</h4>
            <a href="tel:+8801570263779">Call Us</a>
            <a href="https://wa.me/8801570263779" target="_blank" rel="noreferrer">WhatsApp</a>
            <Link to="/forgot-password">Reset Password</Link>
          </div>

          <div className="site-footer__newsletter">
            <h4>Stay in the loop</h4>
            <p>Get updates on flash sales and new arrivals.</p>
            <form className="site-footer__newsletter-form" onSubmit={(e) => e.preventDefault()}>
              <input type="email" placeholder="you@example.com" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>

        <div className="site-footer__bottom">
          <p>© {year} VastMart. All rights reserved.</p>
          <div className="site-footer__payments">
            <span>Cash on Delivery</span>
            <span>·</span>
            <span>bKash</span>
            <span>·</span>
            <span>Nagad</span>
            <span>·</span>
            <span>Cards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;