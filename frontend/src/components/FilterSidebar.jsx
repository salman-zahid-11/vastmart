import { useEffect, useState } from 'react';
import { getCategories } from '../services/productService';
import './FilterSidebar.css';

function FilterSidebar({ filters, onChange, onClear }) {
  const [categories, setCategories] = useState([]);
  const [priceInputs, setPriceInputs] = useState({
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleCategoryClick = (cat) => {
    onChange({ ...filters, category: filters.category === cat ? '' : cat });
  };

  const handlePriceApply = () => {
    onChange({ ...filters, minPrice: priceInputs.minPrice, maxPrice: priceInputs.maxPrice });
  };

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice;

  return (
    <aside className="filter-sidebar">
      <div className="filter-sidebar__header">
        <h3>Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClear} className="filter-sidebar__clear">Clear all</button>
        )}
      </div>

      <div className="filter-sidebar__group">
        <h4>Category</h4>
        <div className="filter-sidebar__options">
          {categories.length === 0 && <p className="filter-sidebar__empty">No categories yet</p>}
          {categories.map((cat) => (
            <label key={cat} className="filter-sidebar__checkbox">
              <input
                type="checkbox"
                checked={filters.category === cat}
                onChange={() => handleCategoryClick(cat)}
              />
              <span>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="filter-sidebar__group">
        <h4>Price Range (৳)</h4>
        <div className="filter-sidebar__price-row">
          <input
            type="number"
            placeholder="Min"
            value={priceInputs.minPrice}
            onChange={(e) => setPriceInputs({ ...priceInputs, minPrice: e.target.value })}
          />
          <span>—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceInputs.maxPrice}
            onChange={(e) => setPriceInputs({ ...priceInputs, maxPrice: e.target.value })}
          />
        </div>
        <button onClick={handlePriceApply} className="filter-sidebar__apply">Apply</button>
      </div>
    </aside>
  );
}

export default FilterSidebar;