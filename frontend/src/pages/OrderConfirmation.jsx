import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { generateReceiptPDF } from '../utils/generateReceipt';
import './OrderConfirmation.css';

function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const data = await getOrderById(id);
        setOrder(data);
      } catch (err) {
        setError('Order not found');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const handleDownload = () => {
    setDownloading(true);
    try {
      generateReceiptPDF(order);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <p className="page-loading">Loading...</p>;
  if (error) return <p className="page-error">{error}</p>;
  if (!order) return null;

  const addr = order.shippingAddress;

  return (
    <div className="confirmation-page">
      <div className="confirmation-hero">
        <div className="confirmation-hero__check">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <p className="confirmation-hero__eyebrow">Order confirmed</p>
        <h1 className="confirmation-hero__title">Thank you, {addr.fullName.split(' ')[0]} — it's on its way.</h1>
        <p className="confirmation-hero__id">
          Order <span>#{order._id.slice(-8).toUpperCase()}</span> · Placed {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>

      <div className="confirmation-layout">
        <div className="confirmation-card">
          <h3>Items</h3>
          {order.items.map((item) => (
            <div key={item.product} className="confirmation-row">
              <span>{item.name} × {item.quantity}</span>
              <span className="confirmation-row__amount">৳{item.price * item.quantity}</span>
            </div>
          ))}
          <hr />
          <div className="confirmation-row">
            <span>Subtotal</span>
            <span className="confirmation-row__amount">৳{order.itemsTotal}</span>
          </div>
          <div className="confirmation-row">
            <span>Shipping</span>
            <span className="confirmation-row__amount">৳{order.shippingFee}</span>
          </div>
          <hr />
          <div className="confirmation-row confirmation-row--total">
            <span>Total</span>
            <span className="confirmation-row__amount">৳{order.totalAmount}</span>
          </div>
        </div>

        <div className="confirmation-side">
          <div className="confirmation-card">
            <h3>Status</h3>
            <div className="confirmation-status">
              <span className="confirmation-status__dot"></span>
              <span className="confirmation-status__label">{order.orderStatus}</span>
            </div>
            <p className="confirmation-meta">Payment: {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p className="confirmation-meta">Payment status: {order.paymentStatus}</p>
          </div>

          <div className="confirmation-card">
            <h3>Contact</h3>
            <p className="confirmation-address">
              {addr.fullName}<br />
              {addr.email}<br />
              {addr.phone}{addr.alternatePhone ? ` / ${addr.alternatePhone}` : ''}
            </p>
          </div>

          <div className="confirmation-card">
            <h3>Shipping to</h3>
            <p className="confirmation-address">
              {addr.label && <><strong>{addr.label}</strong><br /></>}
              {addr.street}<br />
              {addr.city}{addr.postalCode ? `, ${addr.postalCode}` : ''}<br />
              {addr.country}
            </p>
            {addr.deliveryNotes && (
              <p className="confirmation-notes">Note: {addr.deliveryNotes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="confirmation-actions">
        <button onClick={handleDownload} disabled={downloading} className="confirmation-actions__ghost confirmation-actions__download">
          {downloading ? 'Preparing...' : 'Download Receipt (PDF)'}
        </button>
        <Link to="/orders" className="confirmation-actions__ghost">View all orders</Link>
        <Link to="/" className="confirmation-actions__primary">Continue shopping</Link>
      </div>
    </div>
  );
}

export default OrderConfirmation;