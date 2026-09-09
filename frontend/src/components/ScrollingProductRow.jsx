import { useRef, useState } from 'react';
import { motion, useAnimationFrame } from 'framer-motion';
import { Link } from 'react-router-dom';
import './ScrollingProductRow.css';

function ScrollingProductRow({ title, products = [] }) {
  const trackRef = useRef(null);
  const viewportRef = useRef(null);
  const itemRefs = useRef([]);
  const [isPaused, setIsPaused] = useState(false);
  const [scales, setScales] = useState([]);
  const offsetRef = useRef(0);
  const speed = 0.5;

  const loopedProducts = [...products, ...products];

  useAnimationFrame(() => {
    if (!trackRef.current || products.length === 0) return;

    if (!isPaused) {
      offsetRef.current -= speed;
      const trackWidth = trackRef.current.scrollWidth / 2;
      if (Math.abs(offsetRef.current) >= trackWidth) {
        offsetRef.current = 0;
      }
      trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
    }

    if (viewportRef.current) {
      const viewportRect = viewportRef.current.getBoundingClientRect();
      const viewportCenter = viewportRect.left + viewportRect.width / 2;

      const newScales = itemRefs.current.map((el) => {
        if (!el) return 1;
        const rect = el.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(itemCenter - viewportCenter);
        const maxDistance = viewportRect.width / 2;
        const proximity = Math.max(0, 1 - distance / maxDistance);
        return 1 + proximity * 0.35;
      });
      setScales(newScales);
    }
  });

  if (products.length === 0) return null;

  return (
    <section className="scrolling-row">
      <h2 className="scrolling-row__title">{title}</h2>

      <div className="scrolling-row__viewport" ref={viewportRef}>
        <div ref={trackRef} className="scrolling-row__track">
          {loopedProducts.map((product, i) => (
            <motion.div
              key={`${product._id}-${i}`}
              ref={(el) => (itemRefs.current[i] = el)}
              className="scrolling-row__item"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              animate={{ scale: scales[i] || 1 }}
              transition={{ duration: 0.15, ease: 'linear' }}
              style={{ zIndex: Math.round((scales[i] || 1) * 10) }}
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ScrollingProductRow;