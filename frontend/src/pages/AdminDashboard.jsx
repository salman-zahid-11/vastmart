import { useEffect, useState } from 'react';
import {
  getDashboardStats,
  getAllProductsAdmin,
  approveProduct,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
} from '../services/adminService';
import './AdminDashboard.css';

import {
  getDashboardStats,
  getAllProductsAdmin,
  approveProduct,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
} from '../services/adminService';
import { getAllApplications, reviewApplication } from '../services/sellerApplicationService';


const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'applications', label: 'Seller Applications' },
  { id: 'users', label: 'Users' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'activity', label: 'Activity Log' },
];

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('overview');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, []);

const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsData, productsData, usersData, ordersData, activityData, applicationsData] = await Promise.all([
        getDashboardStats(),
        getAllProductsAdmin(),
        getAllUsers(),
        getAllOrdersAdmin(),
        getActivityLog(),
        getAllApplications(),
      ]);
      setStats(statsData);
      setProducts(productsData);
      setUsers(usersData);
      setOrders(ordersData);
      setActivity(activityData);
      setApplications(applicationsData);
    } catch (err) {
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="page-loading">Loading admin dashboard...</p>;
  if (error) return <p className="page-error">{error}</p>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__eyebrow">Admin</p>
        <nav className="admin-sidebar__nav">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`admin-sidebar__link ${activeSection === section.id ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
              {section.id === 'products' && stats.pendingProducts > 0 && (
                <span className="admin-sidebar__badge">{stats.pendingProducts}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        {activeSection === 'overview' && <OverviewSection stats={stats} />}
        {activeSection === 'applications' && (
          <ApplicationsSection applications={applications} setApplications={setApplications} refreshAll={fetchAll} />
        )}
        {activeSection === 'users' && <UsersSection users={users} setUsers={setUsers} />}
        {activeSection === 'products' && (
          <ProductsSection products={products} setProducts={setProducts} refreshStats={fetchAll} />
        )}
        {activeSection === 'orders' && <OrdersSection orders={orders} />}
        {activeSection === 'activity' && <ActivitySection activity={activity} />}
      </main>
    </div>
  );
}

/* ===== Overview ===== */
function OverviewSection({ stats }) {
  return (
    <div>
      <h2 className="admin-content__title">Platform Overview</h2>
      <div className="admin-stats">
        <StatCard label="Customers" value={stats.totalUsers} />
        <StatCard label="Sellers" value={stats.totalSellers} />
        <StatCard label="Total Products" value={stats.totalProducts} />
        <StatCard label="Pending Approval" value={stats.pendingProducts} warn={stats.pendingProducts > 0} />
        <StatCard label="Total Orders" value={stats.totalOrders} />
        <StatCard label="Revenue" value={`৳${stats.totalRevenue.toLocaleString()}`} accent />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, warn }) {
  return (
    <div className={`stat-card ${accent ? 'stat-card--accent' : ''} ${warn ? 'stat-card--warn' : ''}`}>
      <p className="stat-card__label">{label}</p>
      <p className="stat-card__value">{value}</p>
    </div>
  );
}

/* ===== Users ===== */
function UsersSection({ users, setUsers }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');

  const handleStatusChange = async (userId, newStatus) => {
    setUpdatingId(userId);
    try {
      await updateUserStatus(userId, newStatus);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, status: newStatus } : u)));
    } catch (err) {
      console.error('Failed to update user status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleUsers = roleFilter === 'all' ? users : users.filter((u) => u.role === roleFilter);

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Users</h2>
        <div className="admin-tabs">
          {['all', 'customer', 'seller', 'admin'].map((role) => (
            <button
              key={role}
              className={`admin-tab ${roleFilter === role ? 'admin-tab--active' : ''}`}
              onClick={() => setRoleFilter(role)}
            >
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.map((u) => {
              const isUpdating = updatingId === u._id;
              return (
                <tr key={u._id} style={{ opacity: isUpdating ? 0.5 : 1 }}>
                  <td className="admin-table__name">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-pill role-pill--${u.role}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <span className={`pill pill--${u.status === 'active' ? 'success' : 'danger'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    {u.status === 'active' ? (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(u._id, 'suspended')}
                        className="dashboard__action-btn dashboard__action-btn--danger"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        disabled={isUpdating}
                        onClick={() => handleStatusChange(u._id, 'active')}
                        className="dashboard__action-btn dashboard__action-btn--success"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


/* ===== Seller Applications ===== */
function ApplicationsSection({ applications, setApplications, refreshAll }) {
  const [filter, setFilter] = useState('pending');
  const [reviewingId, setReviewingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  const handleApprove = async (id) => {
    setReviewingId(id);
    try {
      await reviewApplication(id, 'approved');
      await refreshAll();
    } catch (err) {
      console.error('Failed to approve application', err);
    } finally {
      setReviewingId(null);
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) return;
    setReviewingId(id);
    try {
      await reviewApplication(id, 'rejected', rejectionReason);
      await refreshAll();
      setRejectingId(null);
      setRejectionReason('');
    } catch (err) {
      console.error('Failed to reject application', err);
    } finally {
      setReviewingId(null);
    }
  };

  const pendingCount = applications.filter((a) => a.status === 'pending').length;
  const visible = filter === 'all' ? applications : applications.filter((a) => a.status === filter);

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Seller Applications</h2>
        <div className="admin-tabs">
          <button className={`admin-tab ${filter === 'pending' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('pending')}>
            Pending ({pendingCount})
          </button>
          <button className={`admin-tab ${filter === 'approved' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('approved')}>
            Approved
          </button>
          <button className={`admin-tab ${filter === 'rejected' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('rejected')}>
            Rejected
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="dashboard__empty"><p>No applications here.</p></div>
      ) : (
        <div className="applications-list">
          {visible.map((app) => {
            const isReviewing = reviewingId === app._id;
            return (
              <div key={app._id} className="application-card" style={{ opacity: isReviewing ? 0.5 : 1 }}>
                <div className="application-card__header">
                  <div>
                    <h4>{app.businessName}</h4>
                    <p className="application-card__meta">
                      {app.user?.name} · {app.user?.email} · Applied {new Date(app.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`pill pill--${app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'pending'}`}>
                    {app.status}
                  </span>
                </div>

                <div className="application-card__body">
                  <div className="application-card__field">
                    <span>Business Type</span>
                    <p>{app.businessType}</p>
                  </div>
                  <div className="application-card__field">
                    <span>Address</span>
                    <p>{app.businessAddress}</p>
                  </div>
                  <div className="application-card__field">
                    <span>NID Number</span>
                    <p>{app.nidNumber}</p>
                  </div>
                  {app.tradeLicenseNumber && (
                    <div className="application-card__field">
                      <span>Trade License</span>
                      <p>{app.tradeLicenseNumber}</p>
                    </div>
                  )}
                </div>

                <div className="application-card__documents">
                  <a href={`${API_BASE}${app.nidDocument}`} target="_blank" rel="noreferrer" className="application-card__doc-link">
                    📄 View NID Document
                  </a>
                  {app.tradeLicenseDocument && (
                    <a href={`${API_BASE}${app.tradeLicenseDocument}`} target="_blank" rel="noreferrer" className="application-card__doc-link">
                      📄 View Trade License
                    </a>
                  )}
                </div>

                {app.status === 'rejected' && app.rejectionReason && (
                  <p className="application-card__rejection">Rejected: {app.rejectionReason}</p>
                )}

                {app.status === 'pending' && (
                  <div className="application-card__actions">
                    {rejectingId === app._id ? (
                      <div className="application-card__reject-form">
                        <input
                          type="text"
                          placeholder="Reason for rejection..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <button onClick={() => handleReject(app._id)} disabled={isReviewing} className="dashboard__action-btn dashboard__action-btn--danger">
                          Confirm Reject
                        </button>
                        <button onClick={() => { setRejectingId(null); setRejectionReason(''); }} className="dashboard__action-btn">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => handleApprove(app._id)} disabled={isReviewing} className="dashboard__action-btn dashboard__action-btn--success">
                          Approve
                        </button>
                        <button onClick={() => setRejectingId(app._id)} disabled={isReviewing} className="dashboard__action-btn dashboard__action-btn--danger">
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ===== Products ===== */
function ProductsSection({ products, setProducts, refreshStats }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState('pending');

  const handleApprove = async (productId, isApproved) => {
    setUpdatingId(productId);
    try {
      const updated = await approveProduct(productId, isApproved);
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
      refreshStats();
    } catch (err) {
      console.error('Failed to update product approval', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const pendingCount = products.filter((p) => !p.isApproved).length;
  const visibleProducts = filter === 'pending' ? products.filter((p) => !p.isApproved) : products;

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Products</h2>
        <div className="admin-tabs">
          <button className={`admin-tab ${filter === 'pending' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('pending')}>
            Pending ({pendingCount})
          </button>
          <button className={`admin-tab ${filter === 'all' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('all')}>
            All ({products.length})
          </button>
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="dashboard__empty"><p>Nothing to show here.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Seller</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map((product) => {
                const isUpdating = updatingId === product._id;
                return (
                  <tr key={product._id} style={{ opacity: isUpdating ? 0.5 : 1 }}>
                    <td className="admin-table__name">{product.name}</td>
                    <td>{product.seller?.name || 'Unknown'}</td>
                    <td className="admin-table__mono">৳{product.price}</td>
                    <td>
                      {product.isApproved ? (
                        <span className="pill pill--success">Approved</span>
                      ) : (
                        <span className="pill pill--pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {product.isApproved ? (
                        <button disabled={isUpdating} onClick={() => handleApprove(product._id, false)} className="dashboard__action-btn dashboard__action-btn--danger">
                          Reject
                        </button>
                      ) : (
                        <button disabled={isUpdating} onClick={() => handleApprove(product._id, true)} className="dashboard__action-btn dashboard__action-btn--success">
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ===== Orders ===== */
function OrdersSection({ orders }) {
  return (
    <div>
      <h2 className="admin-content__title">All Orders</h2>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="admin-table__mono">#{order._id.slice(-8).toUpperCase()}</td>
                <td>{order.user?.name || 'Unknown'}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td><span className={`pill pill--status-${order.orderStatus}`}>{order.orderStatus}</span></td>
                <td>{order.paymentMethod.replace('_', ' ')}</td>
                <td className="admin-table__mono">৳{order.totalAmount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ===== Activity Log ===== */
function ActivitySection({ activity }) {
  const iconFor = (action) => {
    if (action === 'user_registered') return '👤';
    if (action === 'user_login') return '🔑';
    if (action === 'product_created') return '📦';
    if (action === 'product_approved') return '✅';
    if (action === 'product_rejected') return '⛔';
    if (action === 'order_placed') return '🛒';
    return '•';
  };

  return (
    <div>
      <h2 className="admin-content__title">Activity Log</h2>
      <p className="admin-content__subtitle">Most recent 200 platform events, newest first.</p>

      <div className="activity-feed">
        {activity.map((log) => (
          <div key={log._id} className="activity-feed__item">
            <span className="activity-feed__icon">{iconFor(log.action)}</span>
            <div className="activity-feed__body">
              <p className="activity-feed__desc">{log.description}</p>
              <p className="activity-feed__meta">
                {log.userEmail} · {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminDashboard;