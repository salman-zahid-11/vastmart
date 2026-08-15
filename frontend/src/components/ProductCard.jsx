import { Link } from 'react-router-dom';
import './ProductCard.css';

function ProductCard({ product }) {
  const hasDiscount = Boolean(product.discountPrice);

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <div className="product-card__image-wrap">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/400'}
          alt={product.name}
          className="product-card__image"
        />
        {hasDiscount && <span className="product-card__badge">Sale</span>}
        {product.stock === 0 && <span className="product-card__badge product-card__badge--out">Out of Stock</span>}
      </div>

      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h4 className="product-card__name">{product.name}</h4>

        <div className="product-card__price-row">
          <span className="product-card__price">৳{product.discountPrice || product.price}</span>
          {hasDiscount && <span className="product-card__price-strike">৳{product.price}</span>}
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;