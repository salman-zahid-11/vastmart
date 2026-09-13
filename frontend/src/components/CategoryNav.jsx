import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getActiveCategories } from '../services/categoryService';
import './CategoryNav.css';

function CategoryNav() {
  const [categories, setCategories] = useState([]);
  const [openCategory, setOpenCategory] = useState(null);
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loadingProducts, setLoadingProducts] = useState(false);

  useEffect(() => {
    getActiveCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleCategoryEnter = async (category) => {
    setOpenCategory(category._id);
    if (productsByCategory[category.name]) return;
    setLoadingProducts(true);
    try {
      const result = await getAllProducts({ category: category.name, page: 1, limit: 6 });
      const products = Array.isArray(result) ? result : result.products || [];
      setProductsByCategory((current) => ({ ...current, [category.name]: products }));
    } catch (error) {
      setProductsByCategory((current) => ({ ...current, [category.name]: [] }));
    } finally {
      setLoadingProducts(false);
    }
  };

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
        {categories.map((category) => (
          <div
            key={category._id}
            className="category-nav__item"
            onMouseEnter={() => handleCategoryEnter(category)}
            onFocus={() => handleCategoryEnter(category)}
          >
            <Link to={`/?category=${encodeURIComponent(category.name)}`} className="category-nav__link">
              {category.name}
              {(category.subCategories || []).length > 0 && <span className="category-nav__chevron">⌄</span>}
            </Link>
            {openCategory === category._id && (
              <div className="category-nav__menu" onMouseLeave={() => setOpenCategory(null)}>
                <div className="category-nav__subcategories">
                  <p className="category-nav__menu-title">Shop {category.name}</p>
                  <Link to={`/?category=${encodeURIComponent(category.name)}`}>All {category.name}</Link>
                  {(category.subCategories || []).map((subCategory) => (
                    <Link key={subCategory} to={`/?category=${encodeURIComponent(category.name)}&subCategory=${encodeURIComponent(subCategory)}`}>
                      {subCategory}
                    </Link>
                  ))}
                </div>
                <div className="category-nav__products">
                  <p className="category-nav__menu-title">Popular products</p>
                  {loadingProducts && <span className="category-nav__status">Loading products...</span>}
                  {!loadingProducts && (productsByCategory[category.name] || []).length === 0 && (
                    <span className="category-nav__status">No products found</span>
                  )}
                  {!loadingProducts && (productsByCategory[category.name] || []).map((product) => (
                    <Link key={product._id} to={`/products/${product._id}`} className="category-nav__product">
                      <img src={product.images?.[0] || 'https://via.placeholder.com/44'} alt="" />
                      <span>{product.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

export default CategoryNav;