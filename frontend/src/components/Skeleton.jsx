import './Skeleton.css';

export function SkeletonBlock({ width = '100%', height = '20px', radius = 'var(--radius-sm)', className = '' }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: radius }}
    ></div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="skeleton-product-card">
      <SkeletonBlock height="180px" radius="var(--radius-md)" />
      <div style={{ padding: '12px 0 0' }}>
        <SkeletonBlock width="60%" height="12px" className="skeleton-mb" />
        <SkeletonBlock width="90%" height="16px" className="skeleton-mb" />
        <SkeletonBlock width="40%" height="18px" />
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="products-grid">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  );
}