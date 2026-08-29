import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../services/ticketService';
import { getMyOrders } from '../services/orderService';
import './SupportTickets.css';

const CATEGORIES = [
  { value: 'order_issue', label: 'Order Issue' },
  { value: 'product_issue', label: 'Product Issue' },
  { value: 'payment_issue', label: 'Payment Issue' },
  { value: 'account_issue', label: 'Account Issue' },
  { value: 'seller_issue', label: 'Seller Issue' },
  { value: 'other', label: 'Other' },
];

function NewTicket() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'other',
    message: '',
    relatedOrder: '',
    priority: 'medium',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMyOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ticket = await createTicket(formData);
      navigate(`/support/${ticket._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="support-page" style={{ maxWidth: '600px' }}>
      <h1>Raise a Support Ticket</h1>
      <p>Tell us what's going on — we'll get back to you as soon as we can.</p>

      {error && <p className="checkout-form__error">{error}</p>}

      <form onSubmit={handleSubmit} className="checkout-section" style={{ marginTop: 'var(--space-lg)' }}>
        <div className="checkout-form__field">
          <label>Subject</label>
          <input type="text" name="subject" value={formData.subject} onChange={handleChange} required placeholder="Brief summary of the issue" />
        </div>

        <div className="checkout-form__row">
          <div className="checkout-form__field">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="checkout-form__field">
            <label>Priority</label>
            <select name="priority" value={formData.priority} onChange={handleChange}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {orders.length > 0 && (
          <div className="checkout-form__field">
            <label>Related Order (optional)</label>
            <select name="relatedOrder" value={formData.relatedOrder} onChange={handleChange}>
              <option value="">None</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  #{o._id.slice(-8).toUpperCase()} — ৳{o.totalAmount} ({new Date(o.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="checkout-form__field">
          <label>Message</label>
          <textarea name="message" value={formData.message} onChange={handleChange} rows={5} required placeholder="Describe your issue in detail..." />
        </div>

        <button type="submit" disabled={loading} className="become-seller__submit">
          {loading ? 'Submitting...' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );
}

export default NewTicket;