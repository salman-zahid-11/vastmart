import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword, verifyResetCode, resetPassword } from '../services/authService';
import './Auth.css';

function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: email, 2: code, 3: new password
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setMessage('If that email exists, a 6-digit code has been sent.');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyResetCode(email, code);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email, code, newPassword);
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-panel">
        <p className="auth-panel__eyebrow">Account recovery</p>
        <h1 className="auth-panel__title">Let's get you back in.</h1>
        <p className="auth-panel__subtitle">
          It happens to the best of us. We'll send a code to verify it's really you.
        </p>

        <div className="auth-steps">
          <div className={`auth-steps__item ${step >= 1 ? 'auth-steps__item--active' : ''}`}>
            <span>1</span> Enter email
          </div>
          <div className={`auth-steps__item ${step >= 2 ? 'auth-steps__item--active' : ''}`}>
            <span>2</span> Verify code
          </div>
          <div className={`auth-steps__item ${step >= 3 ? 'auth-steps__item--active' : ''}`}>
            <span>3</span> New password
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <div className="auth-form">
          <Link to="/" className="auth-form__logo">Vast<span>Mart</span></Link>

          {step === 1 && (
            <>
              <h2 className="auth-form__title">Reset your password</h2>
              <p className="auth-form__subtitle">
                Remembered it? <Link to="/login">Back to login</Link>
              </p>

              {error && <p className="auth-form__error">{error}</p>}

              <form onSubmit={handleSendCode}>
                <div className="auth-form__field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-form__submit">
                  {loading ? 'Sending...' : 'Send reset code'}
                </button>
              </form>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="auth-form__title">Check your inbox</h2>
              <p className="auth-form__subtitle">
                Enter the 6-digit code sent to <strong>{email}</strong>
              </p>

              {message && <p className="auth-form__success">{message}</p>}
              {error && <p className="auth-form__error">{error}</p>}

              <form onSubmit={handleVerifyCode}>
                <div className="auth-form__field">
                  <label>Verification Code</label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    placeholder="123456"
                    className="auth-form__code-input"
                    maxLength={6}
                  />
                </div>

                <button type="submit" disabled={loading || code.length !== 6} className="auth-form__submit">
                  {loading ? 'Verifying...' : 'Verify code'}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="auth-form__link-btn"
                >
                  Use a different email
                </button>
              </form>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="auth-form__title">Set a new password</h2>
              <p className="auth-form__subtitle">Make it something you'll remember this time.</p>

              {error && <p className="auth-form__error">{error}</p>}

              <form onSubmit={handleResetPassword}>
                <div className="auth-form__field">
                  <label>New Password</label>
                  <div className="auth-form__password-wrap">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                    />
                    <button
                      type="button"
                      className="auth-form__eye-btn"
                      onClick={() => setShowPassword((prev) => !prev)}
                    >
                      <EyeIcon open={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="auth-form__field">
                  <label>Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Re-enter new password"
                  />
                </div>

                <button type="submit" disabled={loading} className="auth-form__submit">
                  {loading ? 'Resetting...' : 'Reset password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  );
}

export default ForgotPassword;