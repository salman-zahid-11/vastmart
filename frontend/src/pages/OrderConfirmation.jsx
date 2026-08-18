import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById } from '../services/orderService';
import { generateReceiptPDF } from '../utils/generateReceipt';
import { generateOrderWhatsAppMessage } from '../utils/generateWhatsAppMessage';
import OrderStatusTracker from '../components/OrderStatusTracker';
import './OrderConfirmation.css';

const ADMIN_WHATSAPP = '8801570263779';

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
  const whatsappLink = 'https://wa.me/' + ADMIN_WHATSAPP + '?text=' + generateOrderWhatsAppMessage(order);

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
            <h3>Order Status</h3>
            <OrderStatusTracker status={order.orderStatus} />
            <p className="confirmation-meta">Payment: {order.paymentMethod.replace('_', ' ').toUpperCase()}</p>
            <p className="confirmation-meta">Payment status: {order.paymentStatus}</p>
          </div>

          <div className="confirmation-card">
            <h3>Contact</h3>
            <p className="confirmation-address">
              {addr.fullName}<br />
              {addr.email}<br />
              {addr.phone}{addr.alternatePhone ? ' / ' + addr.alternatePhone : ''}
            </p>
          </div>

          <div className="confirmation-card">
            <h3>Shipping to</h3>
            <p className="confirmation-address">
              {addr.label && <><strong>{addr.label}</strong><br /></>}
              {addr.street}<br />
              {addr.city}{addr.postalCode ? ', ' + addr.postalCode : ''}<br />
              {addr.country}
            </p>
            {addr.deliveryNotes && (
              <p className="confirmation-notes">Note: {addr.deliveryNotes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="confirmation-whatsapp">
        <p className="confirmation-whatsapp__text">Send your order details to us on WhatsApp so we can confirm it faster.</p>
        <a href={whatsappLink} target="_blank" rel="noreferrer" className="confirmation-whatsapp__btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.87 9.87 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.85 9.85 0 0 0 12.04 2zm5.8 14.03c-.24.68-1.4 1.3-1.93 1.38-.5.08-1.11.11-1.79-.11a16.5 16.5 0 0 1-1.62-.6c-2.86-1.24-4.72-4.13-4.87-4.32-.14-.2-1.17-1.55-1.17-2.96s.73-2.1 1-2.38c.26-.29.57-.36.76-.36l.55.01c.17.01.41-.06.64.49.24.57.81 1.98.88 2.12.07.15.12.32.02.51-.09.19-.14.32-.28.49-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.29.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.29.14.46.12.62-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.68-.17 1.36z"/>
          </svg>
          Send Order via WhatsApp
        </a>
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