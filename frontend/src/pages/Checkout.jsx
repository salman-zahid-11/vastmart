import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import './Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    label: 'Home',
    street: '',
    city: '',
    postalCode: '',
    country: 'Bangladesh',
    phone: '',
    alternatePhone: '',
    deliveryNotes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const itemsTotal = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);
  const shippingFee = 60;
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const total = itemsTotal + shippingFee - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError('');
    setValidatingCoupon(true);
    try {
      const result = await validateCoupon(couponCode.trim(), itemsTotal);
      setAppliedCoupon(result);
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const order = await createOrder({
        shippingAddress: formData,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      navigate(`/order-confirmation/${order._id}`);
      refreshCart().catch((err) => console.error('Failed to refresh cart:', err));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Nothing to check out</h2>
        <p>Your cart is empty right now.</p>
      </div>
    );
  }

  const paymentOptions = [
    { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when your order arrives' },
    { value: 'mobile_banking', label: 'Mobile Banking', desc: 'bKash, Nagad, or Rocket' },
    { value: 'card', label: 'Card', desc: 'Visa, Mastercard, or local cards' },
  ];

  return (
    <div className="checkout-page">
      <h1 className="checkout-page__title">Checkout</h1>

      <div className="checkout-page__layout">
        <form onSubmit={handleSubmit} className="checkout-form">

          

          <section className="checkout-section">
            <h3>Contact Details</h3>

            {error && <p className="checkout-form__error">{error}</p>}

            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <label>Full Name</label>
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Recipient's full name" />
              </div>
              <div className="checkout-form__field">
                <label>Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" />
              </div>
            </div>
          </section>

          <section className="checkout-section">
            <h3>Shipping Address</h3>

            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <label>Address Label</label>
                <input type="text" name="label" value={formData.label} onChange={handleChange} placeholder="Home, Office..." />
              </div>
              <div className="checkout-form__field">
                <label>Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="01XXXXXXXXX" />
              </div>
            </div>

            <div className="checkout-form__field">
              <label>Street Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required placeholder="House, road, area" />
            </div>

            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} required />
              </div>
              <div className="checkout-form__field">
                <label>Postal Code</label>
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} />
              </div>
            </div>

            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <label>Country</label>
                <input type="text" name="country" value={formData.country} onChange={handleChange} required />
              </div>
              <div className="checkout-form__field">
                <label>Alternate Phone (optional)</label>
                <input type="text" name="alternatePhone" value={formData.alternatePhone} onChange={handleChange} placeholder="Backup contact number" />
              </div>
            </div>

            <div className="checkout-form__field">
              <label>Delivery Notes (optional)</label>
              <input type="text" name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Gate code, landmark, delivery instructions..." />
            </div>
          </section>


          <button type="submit" disabled={loading} className="checkout-form__submit">
            {loading ? 'Placing order...' : `Place Order — ৳${total}`}
          </button>
        </form>

                <aside className="checkout-summary">
          <h3>Order Summary</h3>
          {cart.items.map((item) => (
            <div key={item.product._id} className="checkout-summary__row">
              <span>{item.product.name} × {item.quantity}</span>
              <span>৳{(item.product.discountPrice || item.product.price) * item.quantity}</span>
            </div>
          ))}
          <hr />

          <div className="checkout-coupon">
            {appliedCoupon ? (
              <div className="checkout-coupon__applied">
                <span>🎟️ {appliedCoupon.code} applied</span>
                <button type="button" onClick={handleRemoveCoupon}>Remove</button>
              </div>
            ) : (
              <div className="checkout-coupon__input-row">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Coupon code"
                  style={{ textTransform: 'uppercase' }}
                />
                <button type="button" onClick={handleApplyCoupon} disabled={validatingCoupon}>
                  {validatingCoupon ? '...' : 'Apply'}
                </button>
              </div>
            )}
            {couponError && <p className="checkout-coupon__error">{couponError}</p>}
          </div>

          <hr />
          <div className="checkout-summary__row">
            <span>Subtotal</span>
            <span>৳{itemsTotal}</span>
          </div>
          {discountAmount > 0 && (
            <div className="checkout-summary__row checkout-summary__row--discount">
              <span>Discount</span>
              <span>−৳{discountAmount}</span>
            </div>
          )}
          <div className="checkout-summary__row">
            <span>Shipping</span>
            <span>৳{shippingFee}</span>
          </div>
          <hr />
          <div className="checkout-summary__row checkout-summary__row--total">
            <span>Total</span>
            <span>৳{total}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;