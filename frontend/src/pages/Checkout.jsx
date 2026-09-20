import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { createOrder } from '../services/orderService';
import { validateCoupon } from '../services/couponService';
import './Checkout.css';
import { districts, locationData, thanaDataByDistrict } from '../data/bangladeshLocations';
import { generateOrderWhatsAppMessage } from '../utils/generateWhatsAppMessage';

function LocationPicker({ prefix, address, onChange }) {
  const [districtSearch, setDistrictSearch] = useState('');
  const visibleDistricts = districts.filter((district) => district.toLowerCase().includes(districtSearch.toLowerCase()));
  const thanaOptions = thanaDataByDistrict[address.city] || [];
  const upazilaOptions = locationData[address.city] || [];

  return (
    <div className="checkout-location-picker">
      <div className="checkout-form__field">
        <label htmlFor={`${prefix}-district`}>District <span>*</span></label>
        <input value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)} placeholder="Search district..." aria-label={`${prefix} search district`} />
        <select id={`${prefix}-district`} name={`${prefix}District`} value={address.city} onChange={(e) => onChange({ city: e.target.value, thana: '', upazila: '' })} required>
          <option value="">Select district *</option>
          {visibleDistricts.map((district) => <option key={district} value={district}>{district}</option>)}
        </select>
      </div>
      <div className="checkout-form__field">
        <label htmlFor={`${prefix}-thana`}>Thana <small>(optional if upazila is selected)</small></label>
        <select id={`${prefix}-thana`} name={`${prefix}Thana`} value={address.thana || ''} onChange={(e) => onChange({ thana: e.target.value })} disabled={!address.city}>
          <option value="">{address.city ? 'Select thana (optional)' : 'Select district first'}</option>
          {thanaOptions.map((thana) => <option key={`thana-${thana}`} value={thana}>{thana}</option>)}
        </select>
      </div>
      <div className="checkout-form__field">
        <label htmlFor={`${prefix}-upazila`}>Upazila <small>(optional if thana is selected)</small></label>
        <select id={`${prefix}-upazila`} name={`${prefix}Upazila`} value={address.upazila || ''} onChange={(e) => onChange({ upazila: e.target.value })} disabled={!address.city}>
          <option value="">{address.city ? 'Select upazila (optional)' : 'Select district first'}</option>
          {upazilaOptions.map((upazila) => <option key={`upazila-${upazila}`} value={upazila}>{upazila}</option>)}
        </select>
      </div>
      <p className="checkout-location-picker__hint">Select either thana or upazila. Only one is required.</p>
    </div>
  );
}

function AddressPreview({ address }) {
  const parts = [
    address.street,
    address.thana || address.upazila,
    address.thana && address.upazila ? address.upazila : '',
    address.city,
    address.postalCode,
    address.country,
  ].filter(Boolean);

  return (
    <div className="checkout-form__billing-preview">
      <strong>Full address preview</strong>
      <span>{parts.length ? parts.join(', ') : 'Complete the address fields to preview it here.'}</span>
    </div>
  );
}

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
    upazila: '',
    postalCode: '',
    country: 'Bangladesh',
    phone: '',
    alternatePhone: '',
    deliveryNotes: '',
  });
  const [billingAddress, setBillingAddress] = useState({ city: '', thana: '', upazila: '', street: '', postalCode: '', country: 'Bangladesh' });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);

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

  const updateBilling = (changes) => setBillingAddress((current) => ({ ...current, ...changes }));

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

  const isCheckoutValid = Boolean(
    formData.fullName.trim()
    && formData.email.trim()
    && formData.phone.trim()
    && formData.street.trim()
    && formData.city
    && (formData.thana || formData.upazila)
    && formData.country.trim()
    && (billingSameAsShipping
      || (billingAddress.street.trim() && billingAddress.city && (billingAddress.thana || billingAddress.upazila) && billingAddress.country.trim())),
  );

  const handleSubmit = async (e, channel = 'checkout') => {
    e.preventDefault();
    if (!document.getElementById('checkout-form')?.checkValidity()) {
      document.getElementById('checkout-form')?.reportValidity();
      return;
    }
    setError('');
    setLoading(true);

    try {
      const order = await createOrder({
        shippingAddress: formData,
        billingAddress: billingSameAsShipping ? formData : billingAddress,
        paymentMethod,
        couponCode: appliedCoupon?.code,
      });

      if (channel === 'whatsapp') {
        window.location.assign(`https://wa.me/8801570263779?text=${generateOrderWhatsAppMessage(order)}`);
        return;
      }

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
            <LocationPicker prefix="shipping" address={formData} onChange={(changes) => setFormData((current) => ({ ...current, ...changes }))} />
            <div className="checkout-form__field">
              <label className="checkout-form__address-label">House and street details</label>
              <input type="text" name="street" value={formData.street} onChange={handleChange} required placeholder="House / building / street / area *" />
            </div>
            <div className="checkout-form__row">
              <div className="checkout-form__field">
                <input type="text" name="country" value={formData.country} onChange={handleChange} required placeholder="Country" />
              </div>
              <div className="checkout-form__field">
                <input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="Postal code (optional)" />
              </div>
            </div>
            <AddressPreview address={formData} />
            <div className="checkout-form__field">
              <textarea name="deliveryNotes" value={formData.deliveryNotes} onChange={handleChange} placeholder="Special notes (optional)" rows="3" />
            </div>
          </section>

          <section className="checkout-section checkout-section--billing">
            <h3>Billing Address</h3>
            <label className="checkout-form__same-address">
              <input type="checkbox" checked={billingSameAsShipping} onChange={(e) => setBillingSameAsShipping(e.target.checked)} />
              Same as shipping address
            </label>
            {!billingSameAsShipping && (
              <>
                <LocationPicker prefix="billing" address={billingAddress} onChange={updateBilling} />
                <div className="checkout-form__field">
                  <label className="checkout-form__address-label">House and street details</label>
                  <input className="checkout-billing-input" value={billingAddress.street} onChange={(e) => updateBilling({ street: e.target.value })} placeholder="House / building / street / area *" required />
                </div>
                <div className="checkout-form__row">
                  <input className="checkout-billing-input" value={billingAddress.country} onChange={(e) => updateBilling({ country: e.target.value })} placeholder="Country" required />
                  <input className="checkout-billing-input" value={billingAddress.postalCode} onChange={(e) => updateBilling({ postalCode: e.target.value })} placeholder="Postal code (optional)" />
                </div>
                <AddressPreview address={billingAddress} />
              </>
            )}
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
          <button
            type="button"
            disabled={loading || !isCheckoutValid}
            className="checkout-form__submit checkout-form__submit--whatsapp"
            onClick={(event) => handleSubmit(event, 'whatsapp')}
          >
            {loading ? 'Preparing...' : 'Order on WhatsApp'}
          </button>
          <button type="submit" form="checkout-form" disabled={loading || !isCheckoutValid} className="checkout-form__submit">
            {loading ? 'Placing order...' : `Place Order — ৳${total}`}
          </button>
          </section>
        </aside>
      </div>
    </div>
  );
}

export default Checkout;