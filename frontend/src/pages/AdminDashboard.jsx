import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardStats,
  getAllProductsAdmin,
  approveProduct,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  getSalesAnalytics,
  getTopProducts,
  getTopSellers,
  getOrderStatusBreakdown,
} from '../services/adminService';
import { getAllApplications, reviewApplication } from '../services/sellerApplicationService';
import { updateOrderStatus } from '../services/adminService';
import { getAllNotices, createNotice, toggleNotice, deleteNotice } from '../services/noticeService';
import { getAllBanners, createBanner, toggleBanner, deleteBanner } from '../services/bannerService';
import { getAllCoupons, createCoupon, toggleCoupon, deleteCoupon } from '../services/couponService';
import { useAuth } from '../context/AuthContext';
import { updateAdminLevel } from '../services/adminService';
import { getAbandonedActivity } from '../services/activityService';
import {
  getAllCategories,
  createCategory,
  addSubCategory,
  removeSubCategory,
  toggleCategory,
  deleteCategory,
} from '../services/categoryService';
import { getAllTickets, updateTicket, addTicketMessage } from '../services/ticketService';
import { bulkApproveProducts } from '../services/adminService';
import { bulkReviewApplications } from '../services/sellerApplicationService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import './AdminDashboard.css';


function AdminDashboard() {
  const { user } = useAuth();
  const isSuperAdmin = user?.adminLevel === 'super_admin';
  const ALL_SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'manage-admins', label: 'Manage Admins', superOnly: true },
    { id: 'coupons', label: 'Coupons', superOnly: true },
    { id: 'banners', label: 'Banners', superOnly: true },
    { id: 'notices', label: 'Notices' },
    { id: 'applications', label: 'Seller Applications' },
    { id: 'users', label: 'Users' },
    { id: 'products', label: 'Products' },
    { id: 'orders', label: 'Orders' },
    { id: 'abandoned', label: 'Abandoned Interest' },
    { id: 'activity', label: 'Activity Log' },
    { id: 'categories', label: 'Categories' },
    { id: 'tickets', label: 'Support Tickets' },
    { id: 'analytics', label: 'Analytics' },
  ];
  const sections = ALL_SECTIONS.filter((section) => !section.superOnly || isSuperAdmin);
  const [activeSection, setActiveSection] = useState('overview');

  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activity, setActivity] = useState([]);
  const [applications, setApplications] = useState([]);
  const [notices, setNotices] = useState([]);
  const [banners, setBanners] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [abandoned, setAbandoned] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [
        statsData,
        productsData,
        usersData,
        ordersData,
        applicationsData,
        noticesData,
        activityData,
        abandonedData,
        categoriesData,
        ticketsData,
      ] = await Promise.all([
        getDashboardStats(),
        getAllProductsAdmin(),
        getAllUsers(),
        getAllOrdersAdmin(),
        getAllApplications(),
        getAllNotices(),
        getActivityLog(),
        getAbandonedActivity(),
        getAllCategories(),
        getAllTickets(),
      ]);

      setStats(statsData || {});
      setProducts(Array.isArray(productsData) ? productsData : []);
      setUsers(Array.isArray(usersData) ? usersData : []);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
      setNotices(Array.isArray(noticesData) ? noticesData : []);
      setActivity(Array.isArray(activityData) ? activityData : []);
      setAbandoned(Array.isArray(abandonedData) ? abandonedData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);

      // Only super admins can access these. A 403 here must not break the
      // rest of the dashboard for moderators.
      if (isSuperAdmin) {
        try {
          const [bannersData, couponsData] = await Promise.all([
            getAllBanners(),
            getAllCoupons(),
          ]);
          setBanners(Array.isArray(bannersData) ? bannersData : []);
          setCoupons(Array.isArray(couponsData) ? couponsData : []);
        } catch (err) {
          console.error('Failed to load super-admin data', err);
          setBanners([]);
          setCoupons([]);
        }
      } else {
        setBanners([]);
        setCoupons([]);
      }
    } catch (err) {
      console.error('Failed to load admin data', err);
      setError(err?.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user, fetchAll]);


  if (loading) return <p className="page-loading">Loading admin dashboard...</p>;
  if (error) return <p className="page-error">{error}</p>;

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <p className="admin-sidebar__eyebrow">
  Admin {isSuperAdmin ? <span className="admin-sidebar__tier">Super Admin</span> : <span className="admin-sidebar__tier admin-sidebar__tier--mod">Moderator</span>}
</p>
        <nav className="admin-sidebar__nav">
          {sections.map((section) => (
            <button
              key={section.id}
              className={`admin-sidebar__link ${activeSection === section.id ? 'admin-sidebar__link--active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              {section.label}
              {section.id === 'products' && stats.products?.pending > 0 && (
                <span className="admin-sidebar__badge">{stats.products.pending}</span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      <main className="admin-content">
        {activeSection === 'overview' && <OverviewSection stats={stats} />}
        {activeSection === 'notices' && <NoticesSection notices={notices} setNotices={setNotices} />}
        {activeSection === 'applications' && (
          <ApplicationsSection applications={applications} setApplications={setApplications} refreshAll={fetchAll} />
        )}
        {activeSection === 'users' && <UsersSection users={users} setUsers={setUsers} isSuperAdmin={isSuperAdmin} />}
        {activeSection === 'products' && (
          <ProductsSection products={products} setProducts={setProducts} refreshStats={fetchAll} />
        )}
        {activeSection === 'orders' && <OrdersSection orders={orders} setOrders={setOrders} />}
        {activeSection === 'activity' && <ActivitySection activity={activity} />}
        {activeSection === 'banners' && <BannersSection banners={banners} setBanners={setBanners} />}
        {activeSection === 'coupons' && <CouponsSection coupons={coupons} setCoupons={setCoupons} />}
        {activeSection === 'abandoned' && <AbandonedSection abandoned={abandoned} />}
        {activeSection === 'manage-admins' && <ManageAdminsSection users={users} setUsers={setUsers} />}
        {activeSection === 'categories' && <CategoriesSection categories={categories} setCategories={setCategories} />}
        {activeSection === 'tickets' && <TicketsSection tickets={tickets} setTickets={setTickets} />}
        {activeSection === 'analytics' && <AnalyticsSection />}
      </main>
    </div>
  );
}



/* ===== Analytics ===== */
const CHART_COLORS = ['#5B3DF5', '#FF8A3D', '#1FAE6E', '#0284C7', '#E5484D'];

function AnalyticsSection() {
  const [days, setDays] = useState(30);
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [topSellers, setTopSellers] = useState([]);
  const [statusBreakdown, setStatusBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSalesAnalytics(days),
      getTopProducts(),
      getTopSellers(),
      getOrderStatusBreakdown(),
    ])
      .then(([sales, products, sellers, statuses]) => {
        setSalesData(sales.dailyData);
        setTopProducts(products);
        setTopSellers(sellers);
        setStatusBreakdown(statuses.filter((s) => s.count > 0));
      })
      .finally(() => setLoading(false));
  }, [days]);

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  };

  if (loading) return <p className="page-loading">Loading analytics...</p>;

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Analytics</h2>
        <div className="admin-tabs">
          {[7, 30, 90].map((d) => (
            <button key={d} className={`admin-tab ${days === d ? 'admin-tab--active' : ''}`} onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>

      <div className="analytics-chart-card">
        <h4>Revenue Trend</h4>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
              formatter={(value, name) => [name === 'revenue' ? `৳${value}` : value, name === 'revenue' ? 'Revenue' : 'Orders']}
            />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#5B3DF5" strokeWidth={2} dot={false} name="Revenue" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="analytics-grid">
        <div className="analytics-chart-card">
          <h4>Top Products by Revenue</h4>
          {topProducts.length === 0 ? (
            <p className="dashboard__empty" style={{ border: 'none' }}>No sales data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={topProducts} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" width={120} fontSize={11} tick={{ width: 110 }} />
                <Tooltip formatter={(value) => `৳${value}`} />
                <Bar dataKey="revenue" fill="#5B3DF5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="analytics-chart-card">
          <h4>Order Status Breakdown</h4>
          {statusBreakdown.length === 0 ? (
            <p className="dashboard__empty" style={{ border: 'none' }}>No orders yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => `${entry.status} (${entry.count})`}
                >
                  {statusBreakdown.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="analytics-chart-card">
        <h4>Top Sellers by Revenue</h4>
        {topSellers.length === 0 ? (
          <p className="dashboard__empty" style={{ border: 'none' }}>No seller sales yet.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Seller</th>
                  <th>Orders</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topSellers.map((s, i) => (
                  <tr key={i}>
                    <td className="admin-table__name">{s.name}</td>
                    <td className="admin-table__mono">{s.orderCount}</td>
                    <td className="admin-table__mono">৳{s.revenue.toLocaleString()}</td>
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

/* ===== Support Tickets ===== */
function TicketsSection({ tickets, setTickets }) {
  const [filter, setFilter] = useState('open');
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  const handleOpenTicket = (ticket) => {
    setSelected(ticket);
    setReply('');
  };

  const handleStatusChange = async (id, status) => {
    const updated = await updateTicket(id, { status });
    setTickets(tickets.map((t) => (t._id === id ? updated : t)));
    if (selected?._id === id) setSelected(updated);
  };

  const handleReply = async () => {
    if (!reply.trim() || !selected) return;
    setSending(true);
    try {
      const updated = await addTicketMessage(selected._id, reply.trim());
      setTickets(tickets.map((t) => (t._id === selected._id ? updated : t)));
      setSelected(updated);
      setReply('');
    } finally {
      setSending(false);
    }
  };

  const visible = filter === 'all' ? tickets : tickets.filter((t) => t.status === filter);

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Support Tickets</h2>
        <div className="admin-tabs">
          {['open', 'in_progress', 'resolved', 'closed', 'all'].map((s) => (
            <button key={s} className={`admin-tab ${filter === s ? 'admin-tab--active' : ''}`} onClick={() => setFilter(s)}>
              {s === 'all' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '340px 1fr' : '1fr', gap: 'var(--space-lg)' }}>
        <div className="ticket-list">
          {visible.length === 0 && <div className="dashboard__empty"><p>No tickets here.</p></div>}
          {visible.map((t) => (
            <button key={t._id} onClick={() => handleOpenTicket(t)} className="ticket-card" style={{ textAlign: 'left', cursor: 'pointer', borderColor: selected?._id === t._id ? 'var(--color-primary)' : undefined }}>
              <div className="ticket-card__top">
                <span className={`pill pill--status-${t.status.replace('_', '-')}`}>{t.status.replace('_', ' ')}</span>
                <span className="ticket-card__date">{new Date(t.updatedAt).toLocaleDateString()}</span>
              </div>
              <h3>{t.subject}</h3>
              <p className="ticket-card__preview">{t.user?.name} · {t.user?.email}</p>
            </button>
          ))}
        </div>

        {selected && (
          <div className="ticket-detail__panel">
            <div className="ticket-detail__header">
              <div>
                <h3>{selected.subject}</h3>
                <p className="ticket-card__date">{selected.user?.name} · {selected.user?.email}</p>
              </div>
              <select value={selected.status} onChange={(e) => handleStatusChange(selected._id, e.target.value)} className="admin-table__status-select">
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="ticket-thread">
              {selected.messages.map((msg, i) => (
                <div key={i} className={`ticket-message ${msg.senderRole === 'admin' ? 'ticket-message--staff' : 'ticket-message--mine'}`}>
                  <div className="ticket-message__meta">
                    <strong>{msg.senderRole === 'admin' ? 'You (Support)' : msg.senderName}</strong>
                    <span>{new Date(msg.createdAt).toLocaleString()}</span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              ))}
            </div>

            <div className="ticket-reply-form">
              <textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Reply to customer..." rows={3} />
              <button onClick={handleReply} disabled={sending} className="dashboard__cta">
                {sending ? 'Sending...' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Categories ===== */
function CategoriesSection({ categories, setCategories }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newSubCategoryInputs, setNewSubCategoryInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await createCategory(newCategoryName.trim());
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSub = async (categoryId) => {
    const value = newSubCategoryInputs[categoryId]?.trim();
    if (!value) return;
    setBusyId(categoryId);
    try {
      const updated = await addSubCategory(categoryId, value);
      setCategories((prev) => prev.map((c) => (c._id === categoryId ? updated : c)));
      setNewSubCategoryInputs({ ...newSubCategoryInputs, [categoryId]: '' });
    } catch (err) {
      console.error('Failed to add sub-category', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleRemoveSub = async (categoryId, subCategory) => {
    setBusyId(categoryId);
    try {
      const updated = await removeSubCategory(categoryId, subCategory);
      setCategories((prev) => prev.map((c) => (c._id === categoryId ? updated : c)));
    } catch (err) {
      console.error('Failed to remove sub-category', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const updated = await toggleCategory(id);
      setCategories((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="admin-content__title">Categories</h2>
      <p className="admin-content__subtitle">Manage the categories and sub-categories sellers can choose from.</p>

      <form onSubmit={handleCreateCategory} className="notice-form">
        {error && <p className="checkout-form__error" style={{ flexBasis: '100%' }}>{error}</p>}
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="e.g. Toys & Games"
        />
        <button type="submit" disabled={submitting || !newCategoryName.trim()} className="dashboard__cta">
          {submitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {categories.length === 0 ? (
        <div className="dashboard__empty"><p>No categories yet.</p></div>
      ) : (
        <div className="category-list">
          {categories.map((category) => {
            const isBusy = busyId === category._id;
            return (
              <div key={category._id} className="category-card" style={{ opacity: isBusy ? 0.5 : 1 }}>
                <div className="category-card__header">
                  <span className={`pill pill--${category.isActive ? 'success' : 'pending'}`}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <h4>{category.name}</h4>
                  <div className="category-card__header-actions">
                    <button disabled={isBusy} onClick={() => handleToggle(category._id)} className="dashboard__action-btn">
                      {category.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button disabled={isBusy} onClick={() => handleDelete(category._id)} className="dashboard__action-btn dashboard__action-btn--danger">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="category-card__subs">
                  {(category.subCategories || []).map((sub) => (
                    <span key={sub} className="category-card__sub-tag">
                      {sub}
                      <button onClick={() => handleRemoveSub(category._id, sub)}>×</button>
                    </span>
                  ))}
                  {(!category.subCategories || category.subCategories.length === 0) && (
                    <span style={{ fontSize: '12.5px', color: 'var(--color-ink-faint)' }}>No sub-categories yet</span>
                  )}
                </div>

                <div className="category-card__add-sub">
                  <input
                    type="text"
                    value={newSubCategoryInputs[category._id] || ''}
                    onChange={(e) => setNewSubCategoryInputs({ ...newSubCategoryInputs, [category._id]: e.target.value })}
                    placeholder="Add sub-category..."
                  />
                  <button disabled={isBusy} onClick={() => handleAddSub(category._id)} className="dashboard__action-btn">
                    Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ===== Overview ===== */
function OverviewSection({ stats }) {
  // Support both the new nested shape and a possible flat fallback
  const users = stats.users || {};
  const products = stats.products || {};
  const orders = stats.orders || {};
  const revenue = stats.revenue || {};
  const catalog = stats.catalog || {};
  const applications = stats.applications || {};
  const abandoned = stats.abandoned || {};

  return (
    <div>
      <h2 className="admin-content__title">Platform Overview</h2>
      <p className="admin-content__subtitle">A snapshot of everything happening on VastMart right now.</p>

      <div className="overview-hero">
        <div className="overview-hero__main">
          <p className="overview-hero__label">Total Revenue</p>
          <p className="overview-hero__value">
            <AnimatedCounter value={revenue.total || 0} prefix="৳" />
          </p>
          <p className="overview-hero__sub">
            Avg. order value: <AnimatedCounter value={revenue.avgOrderValue || 0} prefix="৳" />
          </p>
        </div>
        <div className="overview-hero__side">
          <div>
            <p className="overview-hero__side-value"><AnimatedCounter value={orders.total || 0} /></p>
            <p className="overview-hero__side-label">Total Orders</p>
          </div>
          <div>
            <p className="overview-hero__side-value"><AnimatedCounter value={orders.delivered || 0} /></p>
            <p className="overview-hero__side-label">Delivered</p>
          </div>
          <div>
            <p className="overview-hero__side-value"><AnimatedCounter value={orders.pending || 0} /></p>
            <p className="overview-hero__side-label">In Progress</p>
          </div>
        </div>
      </div>

      <div className="overview-grid">
        <OverviewGroup title="People">
          <MiniStat label="Customers" value={users.customers} />
          <MiniStat label="Sellers" value={users.sellers} />
          <MiniStat label="Admins" value={users.admins} />
        </OverviewGroup>

        <OverviewGroup title="Catalog">
          <MiniStat label="Products" value={products.total} />
          <MiniStat label="Pending Approval" value={products.pending} warn={products.pending > 0} />
          <MiniStat label="Categories" value={catalog.categories} />
        </OverviewGroup>

        <OverviewGroup title="Orders">
          <MiniStat label="Delivered" value={orders.delivered} good />
          <MiniStat label="Pending" value={orders.pending} />
          <MiniStat label="Cancelled" value={orders.cancelled} warn={orders.cancelled > 0} />
        </OverviewGroup>

        <OverviewGroup title="Marketing">
          <MiniStat label="Active Coupons" value={catalog.activeCoupons} />
          <MiniStat label="Active Notices" value={catalog.activeNotices} />
          <MiniStat label="Active Banners" value={catalog.activeBanners} />
        </OverviewGroup>

        <OverviewGroup title="Needs Attention">
          <MiniStat label="Seller Applications" value={applications.pending} warn={applications.pending > 0} />
          <MiniStat label="Products Pending" value={products.pending} warn={products.pending > 0} />
          <MiniStat label="Abandoned Carts" value={abandoned.count} warn={abandoned.count > 0} />
        </OverviewGroup>
      </div>
    </div>
  );
}

function OverviewGroup({ title, children }) {
  return (
    <div className="overview-group">
      <h4 className="overview-group__title">{title}</h4>
      <div className="overview-group__stats">{children}</div>
    </div>
  );
}

function MiniStat({ label, value, warn, good }) {
  return (
    <div className="mini-stat">
      <span className={`mini-stat__value ${warn ? 'mini-stat__value--warn' : ''} ${good ? 'mini-stat__value--good' : ''}`}>
        <AnimatedCounter value={value ?? 0} />
      </span>
      <span className="mini-stat__label">{label}</span>
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


/* ===== Notices ===== */
function NoticesSection({ notices, setNotices }) {
  const [newMessage, setNewMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSubmitting(true);
    try {
      const created = await createNotice(newMessage.trim());
      setNotices((prev) => [created, ...prev]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to create notice', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const updated = await toggleNotice(id);
      setNotices((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (err) {
      console.error('Failed to toggle notice', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteNotice(id);
      setNotices((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error('Failed to delete notice', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <h2 className="admin-content__title">Notice Banner</h2>
      <p className="admin-content__subtitle">
        Active notices scroll across the top of every page on the site.
      </p>

      <form onSubmit={handleCreate} className="notice-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="e.g. Eid Sale! 20% off everything this week."
        />
        <button type="submit" disabled={submitting || !newMessage.trim()} className="dashboard__cta">
          {submitting ? 'Adding...' : 'Add Notice'}
        </button>
      </form>

      {notices.length === 0 ? (
        <div className="dashboard__empty"><p>No notices yet.</p></div>
      ) : (
        <div className="notice-list">
          {notices.map((notice) => {
            const isBusy = busyId === notice._id;
            return (
              <div key={notice._id} className="notice-item" style={{ opacity: isBusy ? 0.5 : 1 }}>
                <span className={`pill pill--${notice.isActive ? 'success' : 'pending'}`}>
                  {notice.isActive ? 'Active' : 'Inactive'}
                </span>
                <p className="notice-item__message">{notice.message}</p>
                <div className="notice-item__actions">
                  <button
                    disabled={isBusy}
                    onClick={() => handleToggle(notice._id)}
                    className="dashboard__action-btn"
                  >
                    {notice.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    disabled={isBusy}
                    onClick={() => handleDelete(notice._id)}
                    className="dashboard__action-btn dashboard__action-btn--danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ===== Banners ===== */
function BannersSection({ banners, setBanners }) {
  const [showForm, setShowForm] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    eyebrow: '',
    title: '',
    subtitle: '',
    ctaLabel: '',
    ctaLink: '',
    fullImage: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);


  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!imageFile) {
      setError('Please select a banner image');
      return;
    }

    setSubmitting(true);
    try {
      const data = new FormData();
      data.append('image', imageFile);
      Object.entries(formData).forEach(([key, value]) => data.append(key, value));

      const created = await createBanner(data);
      setBanners((prev) => [created, ...prev]);
      setShowForm(false);
      setImageFile(null);
      setPreview(null);
      setFormData({ eyebrow: '', title: '', subtitle: '', ctaLabel: '', ctaLink: '', fullImage: false });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create banner');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const updated = await toggleBanner(id);
      setBanners((prev) => prev.map((b) => (b._id === id ? updated : b)));
    } catch (err) {
      console.error('Failed to toggle banner', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteBanner(id);
      setBanners((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error('Failed to delete banner', err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Homepage Banners</h2>
        <button onClick={() => setShowForm(!showForm)} className="dashboard__cta">
          {showForm ? 'Cancel' : '+ Add Banner'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="banner-form">
          {error && <p className="checkout-form__error">{error}</p>}

          <div className="banner-form__layout">
            <div>
              <div className="banner-form__preview">
                {preview ? <img src={preview} alt="Preview" /> : <span>Image preview</span>}
              </div>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
            </div>

            <div className="banner-form__fields">
              <label className="banner-form__checkbox">
                <input type="checkbox" name="fullImage" checked={formData.fullImage} onChange={handleChange} />
                <span>Full-image banner (text already baked into the image, e.g. a designed ad)</span>
              </label>

              {!formData.fullImage && (
                <>
                  <input type="text" name="eyebrow" value={formData.eyebrow} onChange={handleChange} placeholder="Eyebrow text (e.g. Flash Sale)" />
                  <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Headline" />
                  <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtitle" />
                  <input type="text" name="ctaLabel" value={formData.ctaLabel} onChange={handleChange} placeholder="Button label (e.g. Shop now)" />
                </>
              )}

              <input type="text" name="ctaLink" value={formData.ctaLink} onChange={handleChange} placeholder="Link when clicked (e.g. /?search=Electronics)" />

              <button type="submit" disabled={submitting} className="dashboard__cta">
                {submitting ? 'Uploading...' : 'Create Banner'}
              </button>
            </div>
          </div>
        </form>
      )}

      {banners.length === 0 ? (
        <div className="dashboard__empty"><p>No banners yet.</p></div>
      ) : (
        <div className="banner-list">
          {banners.map((banner) => {
            const isBusy = busyId === banner._id;
            return (
              <div key={banner._id} className="banner-list__item" style={{ opacity: isBusy ? 0.5 : 1 }}>
                <img src={banner.image} alt={banner.title || 'Banner'} className="banner-list__thumb" />
                <div className="banner-list__info">
                  <span className={`pill pill--${banner.isActive ? 'success' : 'pending'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <p className="banner-list__title">{banner.title || (banner.fullImage ? 'Full-image banner' : 'Untitled')}</p>
                  {banner.ctaLink && <p className="banner-list__link">→ {banner.ctaLink}</p>}
                </div>
                <div className="banner-list__actions">
                  <button disabled={isBusy} onClick={() => handleToggle(banner._id)} className="dashboard__action-btn">
                    {banner.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button disabled={isBusy} onClick={() => handleDelete(banner._id)} className="dashboard__action-btn dashboard__action-btn--danger">
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


/* ===== Users ===== */
function UsersSection({ users, setUsers, isSuperAdmin }) {
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
                    {isSuperAdmin ? (
                      u.status === 'active' ? (
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
                      )
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-ink-faint)' }}>Super admin only</span>
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
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);



  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    const pendingVisible = visible.filter((a) => a.status === 'pending');
    if (selectedIds.length === pendingVisible.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingVisible.map((a) => a._id));
    }
  };

  const handleBulkDecision = async (decision) => {
    setBulkBusy(true);
    try {
      await bulkReviewApplications(selectedIds, decision);
      await refreshAll();
      setSelectedIds([]);
    } catch (err) {
      console.error('Bulk review failed', err);
    } finally {
      setBulkBusy(false);
    }
  };

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
                  {app.status === 'pending' && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(app._id)}
                      onChange={() => toggleSelect(app._id)}
                      style={{ marginRight: '8px' }}
                    />
                  )}
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
                  <a href={app.nidDocument} target="_blank" rel="noreferrer" className="application-card__doc-link">
  📄 View NID Document
</a>
{app.tradeLicenseDocument && (
  <a href={app.tradeLicenseDocument} target="_blank" rel="noreferrer" className="application-card__doc-link">
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
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    setSelectedIds([]);
  }, [filter]);

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
  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === visibleProducts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(visibleProducts.map((p) => p._id));
    }
  };

  const handleBulkAction = async (isApproved) => {
    setBulkBusy(true);
    try {
      await bulkApproveProducts(selectedIds, isApproved);
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p._id) ? { ...p, isApproved } : p))
      );
      setSelectedIds([]);
      refreshStats();
    } catch (err) {
      console.error('Bulk action failed', err);
    } finally {
      setBulkBusy(false);
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
                  {filter === 'pending' && visibleProducts.length > 0 && (
          <button onClick={toggleSelectAll} style={{ fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 600, marginLeft: 'var(--space-sm)' }}>
            {selectedIds.length === visibleProducts.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
        </div>
      </div>

      {visibleProducts.length === 0 ? (
        <div className="dashboard__empty"><p>Nothing to show here.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={visibleProducts.length > 0 && selectedIds.length === visibleProducts.length}
                    onChange={toggleSelectAll}
                  />
                </th>
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
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(product._id)}
                        onChange={() => toggleSelect(product._id)}
                      />
                    </td>
                    <td className="admin-table__name">
                      <button className="admin-table__link-btn" onClick={() => setSelectedProduct(product)}>
                        {product.name}
                      </button>
                    </td>
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
                      <button onClick={() => setSelectedProduct(product)} className="dashboard__action-btn">
                        View
                      </button>
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


      {selectedIds.length > 0 && (
        <div className="bulk-action-bar">
          <span>{selectedIds.length} selected</span>
          <button disabled={bulkBusy} onClick={() => handleBulkAction(true)} className="dashboard__action-btn dashboard__action-btn--success">
            Approve Selected
          </button>
          <button disabled={bulkBusy} onClick={() => handleBulkAction(false)} className="dashboard__action-btn dashboard__action-btn--danger">
            Reject Selected
          </button>
          <button onClick={() => setSelectedIds([])} className="dashboard__action-btn">
            Cancel
          </button>
        </div>
      )}

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onApprove={(id, approved) => {
            handleApprove(id, approved);
            setSelectedProduct(null);
          }}
          isUpdating={updatingId === selectedProduct._id}
        />
      )}
    </div>
  );
}


/* ===== Product Detail Modal ===== */
function ProductDetailModal({ product, onClose, onApprove, isUpdating }) {
  const [activeImage, setActiveImage] = useState(0);
  const images = Array.isArray(product.images) && product.images.length > 0 ? product.images : ['/placeholder-product.png'];

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="product-modal">
          <div className="product-modal__images">
            <div className="product-modal__main-image">
              <img src={images[activeImage]} alt={product.name} />
            </div>
            {images.length > 1 && (
              <div className="product-modal__thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`product-modal__thumb ${i === activeImage ? 'product-modal__thumb--active' : ''}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={img} alt={`View ${i + 1}`} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-modal__info">
            <span className={`pill pill--${product.isApproved ? 'success' : 'pending'}`}>
              {product.isApproved ? 'Approved' : 'Pending Review'}
            </span>

            <h2 className="product-modal__title">{product.name}</h2>
            <p className="product-modal__price">৳{product.price}</p>

            <div className="product-modal__meta-grid">
              <div>
                <span>Category</span>
                <p>{product.category}{product.subCategory ? ` / ${product.subCategory}` : ''}</p>
              </div>
              <div>
                <span>Brand</span>
                <p>{product.brand || '—'}</p>
              </div>
              <div>
                <span>Stock</span>
                <p>{product.stock} units</p>
              </div>
              <div>
                <span>Type</span>
                <p style={{ textTransform: 'capitalize' }}>{product.productType}</p>
              </div>
              <div>
                <span>Seller</span>
                <p>{product.seller?.name || 'Unknown'}</p>
              </div>
              <div>
                <span>Seller Email</span>
                <p>{product.seller?.email || '—'}</p>
              </div>
            </div>

            <div className="product-modal__description">
              <span>Description</span>
              <p>{product.description}</p>
            </div>

            <div className="product-modal__actions">
              {product.isApproved ? (
                <button
                  disabled={isUpdating}
                  onClick={() => onApprove(product._id, false)}
                  className="dashboard__action-btn dashboard__action-btn--danger"
                >
                  Reject Product
                </button>
              ) : (
                <>
                  <button
                    disabled={isUpdating}
                    onClick={() => onApprove(product._id, true)}
                    className="dashboard__action-btn dashboard__action-btn--success"
                  >
                    Approve Product
                  </button>
                  <button
                    disabled={isUpdating}
                    onClick={() => onApprove(product._id, false)}
                    className="dashboard__action-btn dashboard__action-btn--danger"
                  >
                    Reject Product
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
            </motion.div>
    </motion.div>
  );
}


/* ===== Orders ===== */
function OrdersSection({ orders, setOrders }) {
  const [updatingId, setUpdatingId] = useState(null);

  const STATUS_OPTIONS = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o._id === orderId ? updated : o)));
    } catch (err) {
      console.error('Failed to update order status', err);
    } finally {
      setUpdatingId(null);
    }
  };

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
              <th>Update Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const isUpdating = updatingId === order._id;
              return (
                <tr key={order._id} style={{ opacity: isUpdating ? 0.5 : 1 }}>
                  <td className="admin-table__mono">#{String(order._id || '').slice(-8).toUpperCase()}</td>
                  <td>{order.user?.name || 'Unknown'}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td><span className={`pill pill--status-${order.orderStatus}`}>{order.orderStatus}</span></td>
                  <td>{order.paymentMethod?.replace('_', ' ') || 'N/A'}</td>
                  <td className="admin-table__mono">৳{order.totalAmount}</td>
                  <td>
                    <select
                      value={order.orderStatus}
                      disabled={isUpdating}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="admin-table__status-select"
                    >
                      {STATUS_OPTIONS.map((status) => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
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

/* ===== Coupons ===== */
function CouponsSection({ coupons, setCoupons }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minOrderValue: '',
    maxDiscountAmount: '',
    usageLimit: '',
    perUserLimit: '1',
    expiresAt: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const created = await createCoupon({
        code: formData.code,
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        minOrderValue: formData.minOrderValue ? Number(formData.minOrderValue) : 0,
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : undefined,
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
        perUserLimit: Number(formData.perUserLimit) || 1,
        expiresAt: formData.expiresAt || undefined,
      });
      setCoupons((prev) => [created, ...prev]);
      setShowForm(false);
      setFormData({
        code: '', discountType: 'percentage', discountValue: '', minOrderValue: '',
        maxDiscountAmount: '', usageLimit: '', perUserLimit: '1', expiresAt: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const updated = await toggleCoupon(id);
      setCoupons((prev) => prev.map((c) => (c._id === id ? updated : c)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deleteCoupon(id);
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Coupons</h2>
        <button onClick={() => setShowForm(!showForm)} className="dashboard__cta">
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="coupon-form">
          {error && <p className="checkout-form__error">{error}</p>}

          <div className="coupon-form__row">
            <input type="text" name="code" value={formData.code} onChange={handleChange} placeholder="CODE (e.g. SAVE10)" required style={{ textTransform: 'uppercase' }} />
            <select name="discountType" value={formData.discountType} onChange={handleChange}>
              <option value="percentage">Percentage (%)</option>
              <option value="flat">Flat Amount (৳)</option>
            </select>
            <input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} placeholder="Value" required min="0" />
          </div>

          <div className="coupon-form__row">
            <input type="number" name="minOrderValue" value={formData.minOrderValue} onChange={handleChange} placeholder="Min order value (৳)" min="0" />
            {formData.discountType === 'percentage' && (
              <input type="number" name="maxDiscountAmount" value={formData.maxDiscountAmount} onChange={handleChange} placeholder="Max discount cap (৳, optional)" min="0" />
            )}
            <input type="date" name="expiresAt" value={formData.expiresAt} onChange={handleChange} />
          </div>

          <div className="coupon-form__row">
            <input type="number" name="usageLimit" value={formData.usageLimit} onChange={handleChange} placeholder="Total usage limit (blank = unlimited)" min="1" />
            <input type="number" name="perUserLimit" value={formData.perUserLimit} onChange={handleChange} placeholder="Per-customer limit" min="1" />
          </div>

          <button type="submit" disabled={submitting} className="dashboard__cta">
            {submitting ? 'Creating...' : 'Create Coupon'}
          </button>
        </form>
      )}

      {coupons.length === 0 ? (
        <div className="dashboard__empty"><p>No coupons yet.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Discount</th>
                <th>Min Order</th>
                <th>Usage</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((coupon) => {
                const isBusy = busyId === coupon._id;
                return (
                  <tr key={coupon._id} style={{ opacity: isBusy ? 0.5 : 1 }}>
                    <td className="admin-table__mono" style={{ fontWeight: 700 }}>{coupon.code}</td>
                    <td>{coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `৳${coupon.discountValue}`}</td>
                    <td className="admin-table__mono">৳{coupon.minOrderValue}</td>
                    <td className="admin-table__mono">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ''}</td>
                    <td>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={`pill pill--${coupon.isActive ? 'success' : 'pending'}`}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 6 }}>
                      <button disabled={isBusy} onClick={() => handleToggle(coupon._id)} className="dashboard__action-btn">
                        {coupon.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button disabled={isBusy} onClick={() => handleDelete(coupon._id)} className="dashboard__action-btn dashboard__action-btn--danger">
                        Delete
                      </button>
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


/* ===== Manage Admins (Super Admin only) ===== */
function ManageAdminsSection({ users, setUsers }) {
  const [busyId, setBusyId] = useState(null);

  const handlePromote = async (userId, level) => {
    setBusyId(userId);
    try {
      const updated = await updateAdminLevel(userId, 'admin', level);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: updated.role, adminLevel: updated.adminLevel } : u)));
    } catch (err) {
      console.error('Failed to update admin level', err);
    } finally {
      setBusyId(null);
    }
  };

  const handleRevoke = async (userId) => {
    setBusyId(userId);
    try {
      const updated = await updateAdminLevel(userId, 'customer', null);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: updated.role, adminLevel: updated.adminLevel } : u)));
    } catch (err) {
      console.error('Failed to revoke admin access', err);
    } finally {
      setBusyId(null);
    }
  };

  const admins = users.filter((u) => u.role === 'admin');
  const nonAdmins = users.filter((u) => u.role !== 'admin');

  return (
    <div>
      <h2 className="admin-content__title">Manage Admins</h2>
      <p className="admin-content__subtitle">Promote staff to moderator or super admin, or revoke access.</p>

      <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Current Admins</h3>
      <div className="admin-table-wrap" style={{ marginBottom: 'var(--space-xl)' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Level</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((u) => {
              const isBusy = busyId === u._id;
              return (
                <tr key={u._id} style={{ opacity: isBusy ? 0.5 : 1 }}>
                  <td className="admin-table__name">{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`role-pill ${u.adminLevel === 'super_admin' ? 'role-pill--admin' : 'role-pill--seller'}`}>
                      {u.adminLevel === 'super_admin' ? 'Super Admin' : 'Moderator'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {u.adminLevel !== 'super_admin' && (
                      <button disabled={isBusy} onClick={() => handlePromote(u._id, 'super_admin')} className="dashboard__action-btn dashboard__action-btn--success">
                        Make Super Admin
                      </button>
                    )}
                    {u.adminLevel !== 'moderator' && (
                      <button disabled={isBusy} onClick={() => handlePromote(u._id, 'moderator')} className="dashboard__action-btn">
                        Make Moderator
                      </button>
                    )}
                    <button disabled={isBusy} onClick={() => handleRevoke(u._id)} className="dashboard__action-btn dashboard__action-btn--danger">
                      Revoke Access
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h3 style={{ fontSize: '15px', marginBottom: '12px' }}>Promote a User to Admin</h3>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Current Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {nonAdmins.map((u) => {
              const isBusy = busyId === u._id;
              return (
                <tr key={u._id} style={{ opacity: isBusy ? 0.5 : 1 }}>
                  <td className="admin-table__name">{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className={`role-pill role-pill--${u.role}`}>{u.role}</span></td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    <button disabled={isBusy} onClick={() => handlePromote(u._id, 'moderator')} className="dashboard__action-btn">
                      Make Moderator
                    </button>
                    <button disabled={isBusy} onClick={() => handlePromote(u._id, 'super_admin')} className="dashboard__action-btn dashboard__action-btn--success">
                      Make Super Admin
                    </button>
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


/* ===== Abandoned Interest ===== */
function AbandonedSection({ abandoned }) {
  const viewedOnly = abandoned.filter((a) => a.action === 'viewed');
  const cartOnly = abandoned.filter((a) => a.action === 'added_to_cart');

  return (
    <div>
      <h2 className="admin-content__title">Abandoned Interest</h2>
      <p className="admin-content__subtitle">
        Logged-in customers who viewed or added a product to cart but never completed the order.
      </p>

      <div className="admin-stats" style={{ marginBottom: 'var(--space-xl)' }}>
        <StatCard label="Viewed, no purchase" value={viewedOnly.length} />
        <StatCard label="In cart, no purchase" value={cartOnly.length} warn={cartOnly.length > 0} />
      </div>

      {abandoned.length === 0 ? (
        <div className="dashboard__empty"><p>No missed opportunities right now — nice.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact</th>
                <th>Product</th>
                <th>Action</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {abandoned.map((entry) => (
                <tr key={entry._id}>
                  <td className="admin-table__name">{entry.user?.name || 'Unknown'}</td>
                  <td>
                    <div style={{ fontSize: '12.5px' }}>{entry.user?.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-ink-faint)' }}>{entry.user?.phone || '—'}</div>
                  </td>
                  <td>{entry.product?.name || 'Unknown product'}</td>
                  <td>
                    <span className={`pill pill--${entry.action === 'added_to_cart' ? 'pending' : 'success'}`}>
                      {entry.action === 'added_to_cart' ? 'In Cart' : 'Viewed'}
                    </span>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--color-ink-faint)' }}>
                    {new Date(entry.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
export default AdminDashboard;