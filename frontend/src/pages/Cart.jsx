import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import './Cart.css';

function Cart() {
  const { cart, updateItem, removeItem, loading } = useCart();
  const navigate = useNavigate();
  const [updatingId, setUpdatingId] = useState(null);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingId(productId);
    try {
      await updateItem(productId, newQuantity);
    } catch (err) {
      console.error('Failed to update quantity', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRemove = async (productId) => {
    setUpdatingId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      console.error('Failed to remove item', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const total = cart.items.reduce((sum, item) => {
    const price = item.product.discountPrice || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  if (loading) return <p className="page-loading">Loading cart...</p>;

  if (cart.items.length === 0) {
    return (
      <div className="cart-empty">
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="cart-empty__cta">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Your Cart</h1>

      <div className="cart-page__layout">
                <div className="cart-page__items">
          <AnimatePresence>
          {cart.items.map((item) => {
            const product = item.product;
            const price = product.discountPrice || product.price;
            const isUpdating = updatingId === product._id;

            return (
              <motion.div
                key={product._id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: isUpdating ? 0.5 : 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="cart-item"
              >
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/90'}
                  alt={product.name}
                  className="cart-item__image"
                />

                <div className="cart-item__info">
                  <Link to={`/products/${product._id}`} className="cart-item__name">{product.name}</Link>
                  <p className="cart-item__unit-price">৳{price} each</p>
                </div>

                <div className="cart-item__qty">
                  <button disabled={isUpdating} onClick={() => handleQuantityChange(product._id, item.quantity - 1)}>−</button>
                  <span>{item.quantity}</span>
                  <button disabled={isUpdating} onClick={() => handleQuantityChange(product._id, item.quantity + 1)}>+</button>
                </div>

                <p className="cart-item__total">৳{price * item.quantity}</p>

                                <button disabled={isUpdating} onClick={() => handleRemove(product._id)} className="cart-item__remove">
                  Remove
                </button>
              </motion.div>
            );
          })}
          </AnimatePresence>
        </div>

        <div className="cart-page__summary">
          <h3>Order Summary</h3>
          <div className="cart-page__summary-row">
            <span>Subtotal</span>
            <span>৳{total}</span>
          </div>
          <p className="cart-page__summary-note">Shipping calculated at checkout</p>
          <hr />
          <div className="cart-page__summary-row cart-page__summary-row--total">
            <span>Total</span>
            <span>৳{total}</span>
          </div>
          <button onClick={() => navigate('/checkout')} className="cart-page__checkout-btn">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}

export default Cart;