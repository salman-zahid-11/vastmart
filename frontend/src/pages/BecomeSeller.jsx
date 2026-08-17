import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { submitApplication, getMyApplication } from '../services/sellerApplicationService';
import './BecomeSeller.css';

function BecomeSeller() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [existingApp, setExistingApp] = useState(undefined); // undefined = loading
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'individual',
    businessAddress: '',
    nidNumber: '',
    tradeLicenseNumber: '',
    additionalNotes: '',
  });
  const [nidFile, setNidFile] = useState(null);
  const [tradeLicenseFile, setTradeLicenseFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user.role === 'seller' || user.role === 'admin') {
      navigate('/seller/dashboard');
      return;
    }
    getMyApplication()
      .then(setExistingApp)
      .catch(() => setExistingApp(null));
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!nidFile) {
      setError('NID document is required');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));
      data.append('nidDocument', nidFile);
      if (tradeLicenseFile) data.append('tradeLicenseDocument', tradeLicenseFile);

      const result = await submitApplication(data);
      setExistingApp(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (existingApp === undefined) {
    return <p className="page-loading">Loading...</p>;
  }

  // Already has a pending or approved application
  if (existingApp && existingApp.status === 'pending') {
    return (
      <div className="become-seller become-seller--status">
        <div className="status-card status-card--pending">
          <span className="status-card__icon">⏳</span>
          <h2>Application Under Review</h2>
          <p>We're reviewing your seller application. This usually takes 1-2 business days.</p>
          <div className="status-card__details">
            <p><strong>Business:</strong> {existingApp.businessName}</p>
            <p><strong>Submitted:</strong> {new Date(existingApp.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  if (existingApp && existingApp.status === 'rejected') {
    return (
      <div className="become-seller become-seller--status">
        <div className="status-card status-card--rejected">
          <span className="status-card__icon">✕</span>
          <h2>Application Not Approved</h2>
          <p><strong>Reason:</strong> {existingApp.rejectionReason}</p>
          <p>You can review the details below and submit a new application.</p>
          <button onClick={() => setExistingApp(null)} className="status-card__retry">
            Submit New Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="become-seller">
      <h1 className="become-seller__title">Become a VastMart Seller</h1>
      <p className="become-seller__subtitle">
        Tell us about your business. We verify every seller to keep VastMart trustworthy for buyers.
      </p>

      {error && <p className="checkout-form__error">{error}</p>}

      <form onSubmit={handleSubmit} className="become-seller__form">
        <section className="checkout-section">
          <h3>Business Information</h3>

          <div className="checkout-form__field">
            <label>Business / Shop Name</label>
            <input type="text" name="businessName" value={formData.businessName} onChange={handleChange} required />
          </div>

          <div className="checkout-form__row">
            <div className="checkout-form__field">
              <label>Business Type</label>
              <select name="businessType" value={formData.businessType} onChange={handleChange}>
                <option value="individual">Individual</option>
                <option value="proprietorship">Sole Proprietorship</option>
                <option value="partnership">Partnership</option>
                <option value="company">Company</option>
              </select>
            </div>
            <div className="checkout-form__field">
              <label>Trade License Number (optional)</label>
              <input type="text" name="tradeLicenseNumber" value={formData.tradeLicenseNumber} onChange={handleChange} />
            </div>
          </div>

          <div className="checkout-form__field">
            <label>Business Address</label>
            <input type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} required />
          </div>
        </section>

        <section className="checkout-section">
          <h3>Identity Verification</h3>

          <div className="checkout-form__field">
            <label>National ID (NID) Number</label>
            <input type="text" name="nidNumber" value={formData.nidNumber} onChange={handleChange} required />
          </div>

          <div className="checkout-form__field">
            <label>NID Document (photo/scan) — required</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setNidFile(e.target.files[0])}
              required
            />
          </div>

          <div className="checkout-form__field">
            <label>Trade License Document (optional)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => setTradeLicenseFile(e.target.files[0])}
            />
          </div>

          <div className="checkout-form__field">
            <label>Additional Notes (optional)</label>
            <textarea
              name="additionalNotes"
              value={formData.additionalNotes}
              onChange={handleChange}
              rows={3}
              placeholder="Anything else you'd like us to know"
            />
          </div>
        </section>

        <button type="submit" disabled={loading} className="become-seller__submit">
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default BecomeSeller;