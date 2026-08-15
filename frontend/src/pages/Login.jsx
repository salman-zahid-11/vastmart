import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import { useLocation } from 'react-router-dom';


function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const location = useLocation();
  const resetSuccess = location.state?.resetSuccess;

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);
      login(response.data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="auth-panel__eyebrow">Welcome back</p>
        <h1 className="auth-panel__title">Pick up right where you left off.</h1>
        <p className="auth-panel__subtitle">
          Your cart, your orders, your wishlist — all waiting for you.
        </p>

        <div className="auth-panel__stats">
          <div>
            <p className="auth-panel__stat-num">10K+</p>
            <p className="auth-panel__stat-label">Products</p>
          </div>
          <div>
            <p className="auth-panel__stat-num">500+</p>
            <p className="auth-panel__stat-label">Sellers</p>
          </div>
          <div>
            <p className="auth-panel__stat-num">4.8★</p>
            <p className="auth-panel__stat-label">Avg. Rating</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form onSubmit={handleSubmit} className="auth-form">
          <Link to="/" className="auth-form__logo">Vast<span>Mart</span></Link>

          <h2 className="auth-form__title">Log in</h2>
          <p className="auth-form__subtitle">
            New here? <Link to="/register">Create an account</Link>
          </p>

          {resetSuccess && <p className="auth-form__success">Password reset! Log in with your new password.</p>}
{error && <p className="auth-form__error">{error}</p>}


          <div className="auth-form__field">
            <label>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
          </div>

          <div className="auth-form__field">
            <label>Password</label>
            <div className="auth-form__password-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Your password"
              />
              <button
                type="button"
                className="auth-form__eye-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="auth-form__forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" disabled={loading} className="auth-form__submit">
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;