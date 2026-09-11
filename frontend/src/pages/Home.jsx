import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllProducts } from '../services/productService';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import BannerCarousel from '../components/BannerCarousel';
import StaggerGrid, { StaggerItem } from '../components/StaggerGrid';
import { SkeletonGrid } from '../components/Skeleton';
import ScrollingProductRow from '../components/ScrollingProductRow';
import './Home.css';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const pageSize = 20;
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || '';

  const [filters, setFilters] = useState({ category: categoryFromUrl, minPrice: '', maxPrice: '' });
  const [sort, setSort] = useState('');

  useEffect(() => {
    let active = true;
    const loadTrending = async () => {
      try {
        const featuredData = await getAllProducts({ trending: true, limit: 12 });
        const featured = Array.isArray(featuredData) ? featuredData : featuredData.products || [];
        if (featured.length > 0) {
          if (active) setTrendingProducts(featured);
          return;
        }

        const fallbackData = await getAllProducts({ page: 1, limit: 12 });
        if (active) {
          setTrendingProducts(Array.isArray(fallbackData) ? fallbackData : fallbackData.products || []);
        }
      } catch (error) {
        if (!active) return;
        setTrendingProducts([]);
      }
    };
    loadTrending();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const toggleFilters = () => setFiltersOpen((open) => !open);
    window.addEventListener('vastmart:toggle-filters', toggleFilters);
    return () => window.removeEventListener('vastmart:toggle-filters', toggleFilters);
  }, []);

  useEffect(() => {
    setFilters((prev) => ({ ...prev, category: categoryFromUrl }));
  }, [categoryFromUrl]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, categoryFromUrl, filters.category, filters.minPrice, filters.maxPrice, sort]);

  useEffect(() => {
    let active = true;
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = {};
        if (searchQuery) params.search = searchQuery;
        // Use the URL category immediately when navigation comes from the
        // category menu, rather than waiting for local filter state to sync.
        const category = categoryFromUrl || filters.category;
        if (category) params.category = category;
        if (filters.minPrice) params.minPrice = filters.minPrice;
        if (filters.maxPrice) params.maxPrice = filters.maxPrice;
        if (sort) params.sort = sort;
        params.page = page;
        params.limit = pageSize;

        const data = await getAllProducts(params);
        if (!active) return;
        const nextProducts = Array.isArray(data) ? data : data.products;
        setProducts((prev) => (page === 1 ? nextProducts : [...prev, ...nextProducts]));
        setHasMore(Array.isArray(data) ? false : data.hasMore);
      } catch (err) {
        if (active) setError('Failed to load products');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchProducts();
    return () => {
      active = false;
    };
  }, [
    searchQuery,
    categoryFromUrl,
    filters.category,
    filters.minPrice,
    filters.maxPrice,
    sort,
    page,
  ]);

  const handleLoadMore = () => setPage((currentPage) => currentPage + 1);

  const handleClearFilters = () => {
    setFilters({ category: '', minPrice: '', maxPrice: '' });
    setSort('');
  };

  return (
    <div>
      <BannerCarousel />
      {trendingProducts.length > 0 && (
        <ScrollingProductRow title="Trending Now" products={trendingProducts} />
      )}

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
          {filtersOpen && <div className="filter-backdrop" onClick={() => setFiltersOpen(false)} />}
          <FilterSidebar
            filters={filters}
            onChange={setFilters}
            onClear={handleClearFilters}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
          />

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
            {!loading && !error && hasMore && (
              <button type="button" className="products-load-more" onClick={handleLoadMore}>
                Load More
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;