import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyProducts } from '../services/productService';
import { getMySales } from '../services/orderService';
import { getAbandonedActivity } from '../services/activityService';
import './Dashboard.css';

function SellerDashboard() {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [abandoned, setAbandoned] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, salesData, abandonedData] = await Promise.all([
          getMyProducts(),
          getMySales(),
          getAbandonedActivity(),
        ]);
        setProducts(productsData);
        setSales(salesData);
        setAbandoned(abandonedData);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <p className="page-loading">Loading dashboard...</p>;
  if (error) return <p className="page-error">{error}</p>;

  const totalRevenue = sales.reduce((sum, order) => {
    const myItemsTotal = order.items.reduce((s, item) => s + item.price * item.quantity, 0);
    return sum + myItemsTotal;
  }, 0);

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">Seller Dashboard</p>
          <h1 className="dashboard__title">Your storefront, at a glance.</h1>
        </div>
        <Link to="/seller/products/new" className="dashboard__cta">
          + Add New Product
        </Link>
      </div>

      <div className="dashboard__stats">
        <StatCard label="Total Products" value={products.length} />
        <StatCard label="Total Orders" value={sales.length} />
        <StatCard label="Revenue" value={`৳${totalRevenue.toLocaleString()}`} accent />
      </div>

      <div className="dashboard__section">
        <h3>My Products</h3>
        {products.length === 0 ? (
          <div className="dashboard__empty">
            <p>You haven't listed any products yet.</p>
            <Link to="/seller/products/new">Add your first product →</Link>
          </div>
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id}>
                    <td className="dashboard__table-name">{product.name}</td>
                    <td className="dashboard__table-mono">৳{product.price}</td>
                    <td className="dashboard__table-mono">{product.stock}</td>
                    <td>
                      {product.isApproved ? (
                        <span className="pill pill--success">Approved</span>
                      ) : (
                        <span className="pill pill--pending">Pending</span>
                      )}
                    </td>
                    <td>
                      <Link to={`/seller/products/edit/${product._id}`} className="dashboard__action-btn">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard__section">
        <h3>Recent Orders</h3>
        {sales.length === 0 ? (
          <div className="dashboard__empty">
            <p>No orders yet — they'll show up here once customers start buying.</p>
          </div>
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((order) => (
                  <tr key={order._id}>
                    <td className="dashboard__table-mono">#{order._id.slice(-8).toUpperCase()}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`pill pill--status-${order.orderStatus}`}>{order.orderStatus}</span>
                    </td>
                    <td className="dashboard__table-mono">
                      ৳{order.items.reduce((s, item) => s + item.price * item.quantity, 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="dashboard__section">
        <h3>Missed Opportunities</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-ink-muted)', marginBottom: 'var(--space-md)' }}>
          Customers who viewed or added your products to cart but didn't buy — worth a follow-up.
        </p>
        {abandoned.length === 0 ? (
          <div className="dashboard__empty"><p>No missed opportunities right now.</p></div>
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Product</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {abandoned.map((entry) => (
                  <tr key={entry._id}>
                    <td className="dashboard__table-name">{entry.user?.name || 'Unknown'}</td>
                    <td style={{ fontSize: '13px' }}>{entry.user?.email}</td>
                    <td>{entry.product?.name}</td>
                    <td>
                      <span className={`pill ${entry.action === 'added_to_cart' ? 'pill--pending' : 'pill--success'}`}>
                        {entry.action === 'added_to_cart' ? 'In Cart' : 'Viewed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
    </div>
  );
}

export default SellerDashboard;