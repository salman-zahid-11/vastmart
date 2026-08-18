import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById } from '../services/productService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
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
      await addItem(product._id, 1);
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
      await addItem(product._id, 1);
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

  return (
    <div className="product-detail">
      <div className="product-detail__image-wrap">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/500'}
          alt={product.name}
          className="product-detail__image"
        />
      </div>

      <div className="product-detail__info">
        <p className="product-detail__category">
          {product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}
        </p>
        <h1 className="product-detail__name">{product.name}</h1>

        <div className="product-detail__price-row">
          <span className="product-detail__price">৳{product.discountPrice || product.price}</span>
          {hasDiscount && <span className="product-detail__price-strike">৳{product.price}</span>}
        </div>

        <p className={`product-detail__stock ${product.stock > 0 ? 'in-stock' : 'out-stock'}`}>
          {product.stock > 0 ? `In Stock — ${product.stock} available` : 'Out of Stock'}
        </p>

        <p className="product-detail__description">{product.description}</p>

        <p className="product-detail__seller">Sold by <strong>{product.seller?.name || 'Unknown Seller'}</strong></p>

                <div className="product-detail__cta-row">
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className="product-detail__cta product-detail__cta--secondary"
          >
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>

          <button
            onClick={handleBuyNow}
            disabled={product.stock === 0 || adding}
            className="product-detail__cta"
          >
            Place Order
          </button>
        </div>

        {message && <p className="product-detail__feedback">{message}</p>}
      </div>
    </div>
  );
}

export default ProductDetail;