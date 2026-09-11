import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/productService';
import './CategoryGrid.css';

const CATEGORY_STYLES = [
  { match: 'electronic', emoji: '💻', color: 'var(--color-primary-tint)' },
  { match: 'fashion', emoji: '👗', color: 'var(--color-accent-tint)' },
  { match: 'home', emoji: '🛋️', color: 'var(--color-success-tint)' },
  { match: 'beauty', emoji: '💄', color: '#FCE7F3' },
  { match: 'grocery', emoji: '🛒', color: '#FEF9C3' },
  { match: 'sport', emoji: '🏸', color: '#DBEAFE' },
];

function CategoryGrid() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  return (
    <section className="category-grid-section">
      <h2 className="category-grid-section__title">Shop by Category</h2>

      <div className="category-grid">
        {categories.map((name) => {
          const style = CATEGORY_STYLES.find(({ match }) => name.toLowerCase().includes(match)) || {
            emoji: '🛍️',
            color: 'var(--color-canvas-raised)',
          };
          return (
         <Link
  key={name}
  to={`/?category=${encodeURIComponent(name)}`}
  className="category-grid__item"
  style={{ background: style.color }}
>
            <span className="category-grid__emoji">{style.emoji}</span>
            <span className="category-grid__label">{name}</span>
          </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;