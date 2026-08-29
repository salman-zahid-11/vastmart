import { Link } from 'react-router-dom';
import './CategoryNav.css';

const CATEGORIES = [
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Groceries',
  'Sports',
  'Books',
];

function CategoryNav() {
  return (
    <nav className="category-nav">
      <div className="category-nav__inner">
        <Link to="/" className="category-nav__link category-nav__link--all">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
          All Products
        </Link>
        {CATEGORIES.map((cat) => (
  <Link key={cat} to={`/?category=${encodeURIComponent(cat)}`} className="category-nav__link">
    {cat}
  </Link>
))}
      </div>
    </nav>
  );
}

export default CategoryNav;