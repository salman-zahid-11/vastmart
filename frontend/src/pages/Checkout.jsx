import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import Reveal from '../components/Reveal';
import './Checkout.css';

const districtThanas = {
  Dhaka: ['Dhanmondi', 'Gulshan', 'Mirpur', 'Uttara', 'Kafrul', 'Motijheel', 'Tejgaon'],
  Chattogram: ['Kotwali', 'Pahartali', 'Panchlaish', 'Halishahar', 'Bayezid'],
  Gazipur: ['Gazipur Sadar', 'Tongi', 'Kaliakair', 'Kapasia'],
  Narayanganj: ['Narayanganj Sadar', 'Fatullah', 'Rupganj', 'Siddhirganj'],
  Cumilla: ['Cumilla Sadar', 'Chandina', 'Daudkandi', 'Burichong'],
  Sylhet: ['Sylhet Sadar', 'South Surma', 'Beanibazar', 'Golapganj'],
  Rajshahi: ['Rajshahi Sadar', 'Boalia', 'Motihar', 'Shah Makhdum'],
  Khulna: ['Khulna Sadar', 'Sonadanga', 'Khalishpur', 'Daulatpur'],
  Barishal: ['Barishal Sadar', 'Bakerganj', 'Banaripara', 'Wazirpur'],
  Rangpur: ['Rangpur Sadar', 'Gangachara', 'Mithapukur', 'Pirganj'],
  Mymensingh: ['Mymensingh Sadar', 'Trishal', 'Muktagachha', 'Bhaluka'],
  Bogura: ['Bogura Sadar', 'Shibganj', 'Sherpur', 'Dupchanchia'],
};

const districts = Object.keys(districtThanas);

function Checkout() {
  const navigate = useNavigate();
  const { cart, refreshCart } = useCart();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    label: 'Home',
    street: '',
    city: '',
    thana: '',
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

  const handleDistrictChange = (e) => {
    setFormData({ ...formData, city: e.target.value, thana: '' });
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
      <div className="checkout-page__heading">
        <h1 className="checkout-page__title">Checkout</h1>
        <p>Home <span>›</span> Checkout</p>
      </div>

      <div className="checkout-page__layout">
        <form id="checkout-form" onSubmit={handleSubmit} className="checkout-form">
          <section className="checkout-section">
            <h3>Shipping Address</h3>

            {error && <p className="checkout-form__error">{error}</p>}

            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required placeholder="Your full name *" aria-label="Full name" />
              </div>
              <div className="checkout-form__field">
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} required placeholder="01XXXXXXXXX *" aria-label="Phone number" />
              </div>
            </div>
            <div className="checkout-form__field">
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@gmail.com (Optional)" aria-label="Email address" />
            </div>
            <div className="checkout-form__field">
              <label className="checkout-form__address-label">Your Address</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required placeholder="House no. / building / street / area *" />
            </div>
            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <select name="city" value={formData.city} onChange={handleDistrictChange} required aria-label="District">
                  <option value="">Select district *</option>
                  {districts.map((district) => <option key={district} value={district}>{district}</option>)}
                </select>
              </div>
              <div className="checkout-form__field">
                <select name="thana" value={formData.thana} onChange={handleChange} required disabled={!formData.city} aria-label="Thana">
                  <option value="">{formData.city ? 'Select thana *' : 'Select district first'}</option>
                  {(districtThanas[formData.city] || []).map((thana) => <option key={thana} value={thana}>{thana}</option>)}
                </select>
              </div>
            </div>
            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <input type="text" name="country" value={formData.country} onChange={handleChange} required placeholder="Country" />
              </div>
              <div className="checkout-form__field">
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code (optional)" />
              </div>
            </div>
            <div className="checkout-form__field">
              <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Special notes (optional)" rows="3" />
            </div>
          </section>

          <section className="checkout-section checkout-section--billing">
            <h3>Billing Address</h3>
            <p className="checkout-form__billing-note">Same as shipping address</p>
            <div className="checkout-form__billing-preview">{formData.fullName || 'Your full name'} · {formData.city || 'District'} · {formData.thana || 'Thana'}</div>
          </section>
        </form>

        <aside className="checkout-sidebar">
          <section className="checkout-section checkout-section--order">
            <h3>Order Review</h3>
          {cart.items.map((item) => (
            <div key={item.product._id} className="checkout-item">
              <img src={item.product.images?.[0] || 'https://via.placeholder.com/56'} alt="" />
              <span>{item.product.name}<small>Qty: {item.quantity}</small></span>
              <strong>৳{(item.product.discountPrice || item.product.price) * item.quantity}</strong>
            </div>
          ))}
          </section>

          <section className="checkout-section checkout-section--payment">
            <h3>Payment Method</h3>
            <div className="payment-options">
              {paymentOptions.map((option) => (
                <label key={option.value} className={`payment-option ${paymentMethod === option.value ? 'payment-option--active' : ''}`}>
                  <input type="radio" name="paymentMethod" value={option.value} checked={paymentMethod === option.value} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="checkout-section checkout-section--coupon">
            <h3>Have any coupon or gift voucher?</h3>
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
          </section>
          <section className="checkout-summary">
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
          <button type="submit" form="checkout-form" disabled={loading} className="checkout-form__submit">
            {loading ? 'Placing order...' : `Place Order — ৳${total}`}
          </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;