import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import './Home.css';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';



function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAllProducts();
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = searchQuery
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  return (
    <div>
      {/* Hero */}
      <BannerCarousel />
      <CategoryGrid />

      {/* Products */}
      <section id="products" className="products-section">
        <div className="products-section__header">
          <h2>{searchQuery ? `Results for "${searchQuery}"` : 'All Products'}</h2>
          <span className="products-section__count">
            {loading ? '' : `${filteredProducts.length} item${filteredProducts.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {loading && <p className="products-section__message">Loading products...</p>}
        {error && <p className="products-section__message products-section__message--error">{error}</p>}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="products-section__message">
            {searchQuery ? `No products found for "${searchQuery}".` : 'No products available yet.'}
          </p>
        )}

        {!loading && !error && filteredProducts.length > 0 && (
          <div className="products-grid">
            {filteredProducts.map((product, i) => (
              <div
                key={product._id}
                className="products-grid__item"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;