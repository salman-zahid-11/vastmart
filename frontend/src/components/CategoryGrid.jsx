import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import { getActiveCategories } from '../services/categoryService';
import './CategoryGrid.css';

function CategoryGrid() {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});

  useEffect(() => {
    let active = true;
    Promise.all([
      getActiveCategories(),
      getAllProducts({ page: 1, limit: 50 }),
    ]).then(([categoryData, productData]) => {
      if (!active) return;
      const products = Array.isArray(productData) ? productData : productData.products || [];
      const images = products.reduce((result, product) => {
        const category = product.category?.toLowerCase();
        if (category && product.images?.[0] && !result[category]) result[category] = product.images[0];
        return result;
      }, {});
      const managedCategories = Array.isArray(categoryData) ? categoryData : [];
      setCategories(managedCategories.slice(0, 12));
      setCategoryImages({
        ...images,
        ...managedCategories.reduce((result, category) => {
          if (category.image) result[category.name.toLowerCase()] = category.image;
          return result;
        }, {}),
      });
    }).catch(() => {
      if (active) setCategories([]);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="category-grid-section">
      <h2 className="category-grid-section__title">Categories</h2>

      <div className="category-grid">
        {categories.map((category) => {
          const name = category.name;
          return (
            <Link
              key={name}
              to={`/?category=${encodeURIComponent(name)}`}
              className="category-grid__item"
            >
              <span className="category-grid__image-wrap">
                {categoryImages[name.toLowerCase()] ? (
                  <img
                    src={categoryImages[name.toLowerCase()]}
                    alt=""
                    className="category-grid__image"
                    style={{
                      objectFit: category.imageFit || 'cover',
                      objectPosition: `${category.imagePositionX ?? 50}% ${category.imagePositionY ?? 50}%`,
                      transform: `translate(${(50 - (category.imagePositionX ?? 50)) * 0.8}%, ${(50 - (category.imagePositionY ?? 50)) * 0.8}%) scale(${(category.imageZoom || 100) / 100})`,
                    }}
                  />
                ) : (
                  <span className="category-grid__image-fallback">🛍️</span>
                )}
              </span>
              <span className="category-grid__label">{name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CategoryGrid;