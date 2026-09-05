import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import BannerCarousel from '../components/BannerCarousel';
import CategoryGrid from '../components/CategoryGrid';
import Reveal from '../components/Reveal';
import StaggerGrid, { StaggerItem } from '../components/StaggerGrid';
import { SkeletonGrid } from '../components/Skeleton';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';

  const [filters, setFilters] = useState({ category: categoryFromUrl, minPrice: '', maxPrice: '' });
  const [sort, setSort] = useState('');

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
  }, [categoryFromUrl]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        if (filters.category) params.category = filters.category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (sort) params.sort = sort;

        const data = await getAllProducts(params);
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, filters, sort]);

  const handleClearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '' });
    setSort('');
  };

  return (
    <div>
      <BannerCarousel />
      <Reveal>
        <CategoryGrid />
      </Reveal>

      <section id="products" className="products-section">
        <div className="products-section__header">
          <h2>{searchQuery ? `Results for "${searchQuery}"` : 'All Products'}</h2>
          <div className="products-section__controls">
            <span className="products-section__count">
              {loading ? '' : `${products.length} item${products.length !== 1 ? 's' : ''}`}
            </span>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="products-section__sort">
              <option value="">Sort: Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name_asc">Name: A-Z</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        <div className="products-section__layout">
          <FilterSidebar filters={filters} onChange={setFilters} onClear={handleClearFilters} />

          <div className="products-section__results">
        {loading && <SkeletonGrid count={8} />}
            {error && <p className="products-section__message products-section__message--error">{error}</p>}

            {!loading && !error && products.length === 0 && (
              <p className="products-section__message">
                {searchQuery ? `No products found for "${searchQuery}".` : 'No products match these filters.'}
              </p>
            )}

             {!loading && !error && products.length > 0 && (
              <StaggerGrid className="products-grid">
                {products.map((product) => (
                  <StaggerItem key={product._id}>
                    <ProductCard product={product} />
                  </StaggerItem>
                ))}
              </StaggerGrid>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;