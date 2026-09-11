import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import { trackActivity } from '../services/activityService';
import { motion } from 'framer-motion';
import './ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        trackActivity(id, 'viewed');
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      await addItem(product._id, quantity);
      trackActivity(product._id, 'added_to_cart');
      setMessage('Added to cart!');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAdding(true);
    setMessage('');
    try {
      await addItem(product._id, quantity);
      trackActivity(product._id, 'added_to_cart');
      navigate('/checkout');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to proceed to checkout');
      setAdding(false);
    }
  };

  if (loading) return <p className="page-loading">Loading...</p>;
  if (error) return <p className="page-error">{error}</p>;
  if (!product) return null;

  const hasDiscount = Boolean(product.discountPrice);
  const currentPrice = product.discountPrice || product.price;
  const whatsappNumber = '8801570263779';
  const orderReference = `VM${Date.now().toString(36).slice(-8).toUpperCase()}`;
  const customerName = user?.name || 'Guest customer';
  const customerPhone = user?.phone || 'Not provided';
  const customerEmail = user?.email || 'Not provided';
  const itemsTotal = currentPrice * quantity;
  const whatsappMessage = encodeURIComponent(`Order ID: #${orderReference}
Customer: ${customerName}
Phone: ${customerPhone}
Email: ${customerEmail}

Items:
* ${product.name} × ${quantity} — ৳${itemsTotal}

Subtotal: ৳${itemsTotal}
Shipping: ৳60
Total: ৳${itemsTotal + 60}

Payment Method: COD

Delivery Address:
To be provided

Please confirm and arrange delivery. Thank you!`);

  return (
    <motion.div
      className="product-detail"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <ImageGallery images={product.images} />
      </motion.div>

      <div className="product-detail__info">
        <h1 className="product-detail__name">{product.name}</h1>

        <div className="product-detail__price-row">
          <span className="product-detail__price">৳{currentPrice}</span>
          {hasDiscount && <span className="product-detail__price-strike">৳{product.price}</span>}
        </div>

        <div className="product-detail__quantity">
          <span>Quantity:</span>
          <div className="product-detail__quantity-control">
            <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity">−</button>
            <span>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))}
              disabled={product.stock === 0 || quantity >= product.stock}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>

        <div className="product-detail__cta-grid">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="product-detail__cta product-detail__cta--cart"
          >
            {adding ? 'Adding...' : '🛍 Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0 || adding}
            className="product-detail__cta product-detail__cta--buy"
          >
            Buy Now
          </button>
        </div>

        <div className="product-detail__contact-grid">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
            target="_blank"
            rel="noreferrer"
            className="product-detail__contact product-detail__contact--whatsapp"
          >
            <span>◉</span> Order on WhatsApp
          </a>
          <a href="tel:+8801570263779" className="product-detail__contact product-detail__contact--call">
            <span>☎</span> Call for Order
          </a>
        </div>

        {product.brand && (
          <p className="product-detail__brand"><strong>Brand:</strong> {product.brand}</p>
        )}
        <details className="product-detail__details" open>
          <summary>Product Details</summary>
          <p>{product.description}</p>
          <p className={`product-detail__stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
            {product.stock > 0 ? `In Stock — ${product.stock} available` : 'Out of Stock'}
          </p>
          <p className="product-detail__seller">Sold by <strong>{product.seller?.name || 'Unknown Seller'}</strong></p>
        </details>

        {message && <p className="product-detail__feedback">{message}</p>}
      </div>
    </motion.div>
  );
}

export default ProductDetail;