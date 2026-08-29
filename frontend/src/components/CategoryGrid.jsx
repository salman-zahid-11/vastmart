import { Link } from 'react-router-dom';
import './CategoryGrid.css';

const CATEGORIES = [
  { name: 'Electronics', emoji: '💻', color: 'var(--color-primary-tint)' },
  { name: 'Fashion', emoji: '👗', color: 'var(--color-accent-tint)' },
  { name: 'Home & Living', emoji: '🛋️', color: 'var(--color-success-tint)' },
  { name: 'Beauty', emoji: '💄', color: '#FCE7F3' },
  { name: 'Groceries', emoji: '🛒', color: '#FEF9C3' },
  { name: 'Sports', emoji: '🏸', color: '#DBEAFE' },
];

function CategoryGrid() {
  return (
    <section className="category-grid-section">
      <h2 className="category-grid-section__title">Shop by Category</h2>

      <div className="category-grid">
        {CATEGORIES.map((cat) => (
         <Link
  key={cat.name}
  to={`/?category=${encodeURIComponent(cat.name)}`}
  className="category-grid__item"
  style={{ background: cat.color }}
>
            <span className="category-grid__emoji">{cat.emoji}</span>
            <span className="category-grid__label">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default CategoryGrid;