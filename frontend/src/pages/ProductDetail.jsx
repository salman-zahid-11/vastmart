import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAllProducts, getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ImageGallery from '../components/ImageGallery';
import { trackActivity } from '../services/activityService';
import { motion } from 'framer-motion';
import ProductCard from '../components/ProductCard';
import { createReview, getProductReviews } from '../services/reviewService';
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
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');
  const canReview = user?.role === 'customer';

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
        trackActivity(id, 'viewed');
        const [relatedResult, reviewsResult] = await Promise.allSettled([
          getAllProducts({ category: data.category }),
          getProductReviews(id),
        ]);
        if (relatedResult.status === 'fulfilled') {
          const relatedProductsData = Array.isArray(relatedResult.value)
            ? relatedResult.value
            : relatedResult.value.products;
          setRelatedProducts(relatedProductsData.filter((item) => item._id !== data._id).slice(0, 5));
        }
        if (reviewsResult.status === 'fulfilled') {
          setReviews(Array.isArray(reviewsResult.value) ? reviewsResult.value : []);
        }
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
    if (!canReview) {
      setReviewMessage('Only customer accounts can submit product reviews.');
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

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage('');
    try {
      const review = await createReview({
        product: product._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviews((current) => [review, ...current]);
      setProduct((current) => ({
        ...current,
        ratingsAverage: current.numReviews
          ? ((current.ratingsAverage * current.numReviews + review.rating) / (current.numReviews + 1))
          : review.rating,
        numReviews: (current.numReviews || 0) + 1,
      }));
      setReviewForm({ rating: 5, comment: '' });
      setReviewMessage('Thank you. Your review has been published.');
    } catch (err) {
      setReviewMessage(err.response?.data?.message || 'Unable to publish your review.');
    } finally {
      setReviewSubmitting(false);
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
      className="product-detail-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <p className="product-detail__breadcrumb">
        Home <span>›</span> Products <span>›</span> {product.category}
      </p>

      <div className="product-detail">
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
          {message && <p className="product-detail__feedback">{message}</p>}
        </div>
      </div>

      <section className="product-detail__tabs" aria-label="Product information">
        <button type="button" className="product-detail__tab product-detail__tab--active">Description</button>
        <button
          type="button"
          className="product-detail__tab"
          onClick={() => document.getElementById('customer-reviews-heading')?.scrollIntoView({ behavior: 'smooth' })}
        >
          Customer Reviews ({reviews.length})
        </button>
      </section>

      <section className="product-detail__description-panel">
        <h2>Product Details</h2>
        <p>{product.description}</p>
        <div className="product-detail__spec-grid">
          <span>Category</span><strong>{product.category}</strong>
          {product.subCategory && <><span>Sub-category</span><strong>{product.subCategory}</strong></>}
          {product.brand && <><span>Brand</span><strong>{product.brand}</strong></>}
          <span>Availability</span><strong>{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</strong>
          <span>Sold by</span><strong>{product.seller?.name || 'Unknown Seller'}</strong>
        </div>
      </section>

      <section className="product-detail__reviews" aria-labelledby="customer-reviews-heading">
        <div className="product-detail__section-heading">
          <h2 id="customer-reviews-heading">Customer Reviews</h2>
          {reviews.length > 0 && (
            <span className="product-detail__review-summary">
              <strong>{product.ratingsAverage?.toFixed(1) || '0.0'}</strong> / 5
            </span>
          )}
        </div>
        {reviews.length === 0 ? (
          <p className="product-detail__empty-reviews">No customer reviews yet.</p>
        ) : (
          <div className="product-detail__review-grid">
            {reviews.map((review) => (
              <article className="product-detail__review-card" key={review._id}>
                <p className="product-detail__review-comment">{review.comment}</p>
                <div className="product-detail__review-stars" aria-label={`${review.rating} out of 5 stars`}>
                  {'★'.repeat(review.rating)}<span>{'★'.repeat(5 - review.rating)}</span>
                </div>
                <div className="product-detail__review-author">
                  {review.customerAvatar ? (
                    <img src={review.customerAvatar} alt="" />
                  ) : (
                    <span className="product-detail__review-avatar">
                      {review.customerName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div>
                    <strong>{review.customerName}</strong>
                    <small>{review.customerRole || 'Customer'}</small>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <form className="product-detail__review-form" onSubmit={handleReviewSubmit}>
          <div className="product-detail__review-form-heading">
            <div>
              <h3>{canReview ? 'Share your experience' : 'Want to leave a review?'}</h3>
              <p>
                {canReview
                  ? `Reviewing as ${user.name}`
                  : user?.role === 'admin'
                    ? 'Use the admin dashboard to publish a customer review.'
                    : 'Log in as a customer to rate and review this product.'}
              </p>
            </div>
            {!user && (
              <button type="button" className="product-detail__review-login" onClick={() => navigate('/login')}>
                Log in
              </button>
            )}
          </div>
          <div className="product-detail__review-form-fields">
            <div className="product-detail__rating-picker" aria-label="Choose a rating">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  type="button"
                  key={value}
                  className={value <= reviewForm.rating ? 'is-selected' : ''}
                  onClick={() => setReviewForm((current) => ({ ...current, rating: value }))}
                  aria-label={`${value} star${value === 1 ? '' : 's'}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={reviewForm.comment}
              onChange={(event) => setReviewForm((current) => ({ ...current, comment: event.target.value }))}
              placeholder="Tell other customers what you think..."
              rows="4"
              maxLength="1000"
              required
              disabled={!canReview || reviewSubmitting}
            />
          </div>
          <div className="product-detail__review-form-footer">
            {reviewMessage && <p>{reviewMessage}</p>}
            <button type="submit" className="product-detail__review-submit" disabled={!canReview || reviewSubmitting}>
              {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </section>

      {relatedProducts.length > 0 && (
        <section className="product-detail__related">
          <div className="product-detail__section-heading">
            <h2>Related Products</h2>
            <a href={`/?category=${encodeURIComponent(product.category)}`}>More Products →</a>
          </div>
          <div className="product-detail__related-grid">
            {relatedProducts.map((related) => <ProductCard key={related._id} product={related} />)}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default ProductDetail;