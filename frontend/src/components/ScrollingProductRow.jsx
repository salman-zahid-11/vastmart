import { Link } from 'react-router-dom';
import './ScrollingProductRow.css';

function ScrollingProductRow({ title, products = [] }) {
  // A short list should remain unique; duplicating two or three products makes
  // the same cards appear twice before the marquee has room to loop.
  const shouldLoop = products.length >= 6;
  const loopedProducts = shouldLoop ? [...products, ...products] : products;

  if (products.length === 0) return null;

  return (
    <section className="scrolling-row">
      <h2 className="scrolling-row__title">{title}</h2>

      <div className="scrolling-row__viewport">
        <div className={`scrolling-row__track ${shouldLoop ? '' : 'scrolling-row__track--static'}`}>
          {loopedProducts.map((product, i) => (
            <div
              key={`${product._id}-${i}`}
              className="scrolling-row__item"
            >
              <Link to={`/products/${product._id}`}>
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/220x300'}
                  alt={product.name}
                />
                <div className="scrolling-row__item-overlay">
                  <p className="scrolling-row__item-name">{product.name}</p>
                  <p className="scrolling-row__item-price">৳{product.discountPrice || product.price}</p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScrollingProductRow;