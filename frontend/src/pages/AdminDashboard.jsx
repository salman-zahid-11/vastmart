import { useCallback, useEffect, useState } from 'react';
import {
  getDashboardStats,
  getAllProductsAdmin,
  approveProduct,
  setTrendingProduct,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  getSalesAnalytics,
  getTopProducts,
  getTopSellers,
  getOrderStatusBreakdown,
  logoutAllUsers,
} from '../services/adminService';
import { getAllApplications, reviewApplication } from '../services/sellerApplicationService';
import { updateOrderStatus } from '../services/adminService';
import { getAllNotices, createNotice, toggleNotice, deleteNotice } from '../services/noticeService';
import { createNotification } from '../services/notificationService';
import { getAllBanners, createBanner, toggleBanner, deleteBanner } from '../services/bannerService';
import { getAllPopups, createPopup, updatePopup, togglePopup, deletePopup } from '../services/promotionalPopupService';
import { getAllCoupons, createCoupon, toggleCoupon, deleteCoupon } from '../services/couponService';
import { useAuth } from '../context/AuthContext';
import { updateAdminLevel } from '../services/adminService';
import { getAbandonedActivity } from '../services/activityService';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  addSubCategory,
  removeSubCategory,
  toggleCategory,
  deleteCategory,
} from '../services/categoryService';
import { getAllTickets, updateTicket, addTicketMessage } from '../services/ticketService';
import { bulkApproveProducts } from '../services/adminService';
import { bulkReviewApplications } from '../services/sellerApplicationService';
import { getAllReviewsAdmin, createReview, deleteReview } from '../services/reviewService';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedCounter from '../components/AnimatedCounter';
import './AdminDashboard.css';

const removeImageBackground = (file) => new Promise((resolve, reject) => {
  const sourceUrl = URL.createObjectURL(file);
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.onload = () => {
    URL.revokeObjectURL(sourceUrl);
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) {
      reject(new Error('Unable to prepare image editor'));
      return;
    }
    context.drawImage(image, 0, 0);
    let imageData;
    try {
      imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    } catch (error) {
      reject(new Error('This image cannot be edited because its host blocks browser image access. Please upload the image again.'));
      return;
    }
    const { data, width, height } = imageData;
    const background = [data[0], data[1], data[2]];
    const visited = new Uint8Array(width * height);
    const queue = [];
    const enqueue = (x, y) => {
      const index = y * width + x;
      if (visited[index]) return;
      visited[index] = 1;
      queue.push([x, y]);
    };
    for (let x = 0; x < width; x += 1) {
      enqueue(x, 0);
      enqueue(x, height - 1);
    }
    for (let y = 1; y < height - 1; y += 1) {
      enqueue(0, y);
      enqueue(width - 1, y);
    }
    const matchesBackground = (x, y) => {
      const pixel = (y * width + x) * 4;
      const difference = Math.abs(data[pixel] - background[0])
        + Math.abs(data[pixel + 1] - background[1])
        + Math.abs(data[pixel + 2] - background[2]);
      return difference < 75 && data[pixel + 3] > 0;
    };
    while (queue.length) {
      const [x, y] = queue.shift();
      if (!matchesBackground(x, y)) continue;
      const pixel = (y * width + x) * 4;
      data[pixel + 3] = 0;
      if (x > 0) enqueue(x - 1, y);
      if (x < width - 1) enqueue(x + 1, y);
      if (y > 0) enqueue(x, y - 1);
      if (y < height - 1) enqueue(x, y + 1);
    }
    context.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Unable to create transparent image'));
        return;
      }
      resolve(new File([blob], `${file.name.replace(/\.[^.]+$/, '')}-no-background.png`, { type: 'image/png' }));
    }, 'image/png');
  };
  image.onerror = () => {
    URL.revokeObjectURL(sourceUrl);
    reject(new Error('Unable to read selected image'));
  };
  image.src = sourceUrl;
});


function AdminDashboard() {
  const { user, logout } = useAuth();
  const isSuperAdmin = user?.adminLevel === 'super_admin';
  const ALL_SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'manage-admins', label: 'Manage Admins', superOnly: true },
    { id: 'coupons', label: 'Coupons', superOnly: true },
    { id: 'banners', label: 'Banners', superOnly: true },
    { id: 'promotional-popups', label: 'Promo Popups' },
    { id: 'notices', label: 'Notices' },
    { id: 'notifications', label: 'Notifications', superOnly: true },
    { id: 'security', label: 'Security', superOnly: true },
    { id: 'applications', label: 'Seller Applications' },
    { id: 'users', label: 'Users' },
    { id: 'products', label: 'Products' },
    { id: 'reviews', label: 'Reviews' },
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
  const [popups, setPopups] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [abandoned, setAbandoned] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [reviews, setReviews] = useState([]);

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
        reviewsData,
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
        getAllReviewsAdmin(),
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
      setReviews(Array.isArray(reviewsData) ? reviewsData : []);

      // Only super admins can access these. A 403 here must not break the
      // rest of the dashboard for moderators.
      if (isSuperAdmin) {
        try {
          const [bannersData, couponsData, popupsData] = await Promise.all([
            getAllBanners(),
            getAllCoupons(),
            getAllPopups(),
          ]);
          setBanners(Array.isArray(bannersData) ? bannersData : []);
          setCoupons(Array.isArray(couponsData) ? couponsData : []);
          setPopups(Array.isArray(popupsData) ? popupsData : []);
        } catch (err) {
          console.error('Failed to load super-admin data', err);
          setBanners([]);
          setCoupons([]);
          try {
            const popupsData = await getAllPopups();
            setPopups(Array.isArray(popupsData) ? popupsData : []);
          } catch (err) {
            console.error('Failed to load promotional popups', err);
            setPopups([]);
          }
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
        {activeSection === 'notifications' && <NotificationsSection users={users} />}
        {activeSection === 'security' && <SecuritySection logout={logout} />}
        {activeSection === 'applications' && (
          <ApplicationsSection applications={applications} setApplications={setApplications} refreshAll={fetchAll} />
        )}
        {activeSection === 'users' && <UsersSection users={users} setUsers={setUsers} isSuperAdmin={isSuperAdmin} />}
        {activeSection === 'products' && (
          <ProductsSection products={products} setProducts={setProducts} refreshStats={fetchAll} />
        )}
        {activeSection === 'reviews' && (
          <ReviewsSection products={products} reviews={reviews} setReviews={setReviews} />
        )}
        {activeSection === 'orders' && <OrdersSection orders={orders} setOrders={setOrders} />}
        {activeSection === 'activity' && <ActivitySection activity={activity} />}
        {activeSection === 'banners' && <BannersSection banners={banners} setBanners={setBanners} />}
        {activeSection === 'coupons' && <CouponsSection coupons={coupons} setCoupons={setCoupons} />}
        {activeSection === 'promotional-popups' && <PromotionalPopupsSection popups={popups} setPopups={setPopups} />}
        {activeSection === 'abandoned' && <AbandonedSection abandoned={abandoned} />}
        {activeSection === 'manage-admins' && <ManageAdminsSection users={users} setUsers={setUsers} />}
        {activeSection === 'categories' && <CategoriesSection categories={categories} setCategories={setCategories} />}
        {activeSection === 'tickets' && <TicketsSection tickets={tickets} setTickets={setTickets} />}
        {activeSection === 'analytics' && <AnalyticsSection />}
      </main>
    </div>
  );
}



/* ===== Reviews ===== */
function ReviewsSection({ products, reviews, setReviews }) {
  const [form, setForm] = useState({
    product: '',
    customerName: '',
    customerRole: 'Customer',
    customerAvatar: '',
    comment: '',
    rating: 5,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const review = await createReview(form);
      setReviews((current) => [review, ...current]);
      setForm({ product: '', customerName: '', customerRole: 'Customer', customerAvatar: '', comment: '', rating: 5 });
      setMessage('Review added successfully.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add review.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setDeletingId(reviewId);
    try {
      await deleteReview(reviewId);
      setReviews((current) => current.filter((review) => review._id !== reviewId));
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to delete review.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <div>
          <h2 className="admin-content__title">Customer Reviews</h2>
          <p className="admin-content__subtitle">Add customer feedback that appears on the relevant product page.</p>
        </div>
      </div>

      <form className="review-admin-form" onSubmit={handleSubmit}>
        <label>
          Product
          <select value={form.product} onChange={(event) => setForm({ ...form, product: event.target.value })} required>
            <option value="">Select a product</option>
            {products.map((product) => <option key={product._id} value={product._id}>{product.name}</option>)}
          </select>
        </label>
        <label>
          Customer name
          <input value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} required />
        </label>
        <label>
          Customer role
          <input value={form.customerRole} onChange={(event) => setForm({ ...form, customerRole: event.target.value })} />
        </label>
        <label>
          Rating
          <select value={form.rating} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} stars</option>)}
          </select>
        </label>
        <label className="review-admin-form__wide">
          Avatar URL (optional)
          <input value={form.customerAvatar} onChange={(event) => setForm({ ...form, customerAvatar: event.target.value })} />
        </label>
        <label className="review-admin-form__wide">
          Review
          <textarea value={form.comment} onChange={(event) => setForm({ ...form, comment: event.target.value })} rows="4" required />
        </label>
        <button type="submit" className="dashboard__action-btn dashboard__action-btn--success" disabled={saving}>
          {saving ? 'Adding...' : 'Add Review'}
        </button>
        {message && <p className="review-admin-form__message">{message}</p>}
      </form>

      {reviews.length === 0 ? (
        <div className="dashboard__empty"><p>No reviews have been added.</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Product</th><th>Customer</th><th>Rating</th><th>Review</th><th>Action</th></tr></thead>
            <tbody>
              {reviews.map((review) => (
                <tr key={review._id}>
                  <td>{review.product?.name || 'Unknown product'}</td>
                  <td>{review.customerName}<br /><small>{review.customerRole}</small></td>
                  <td className="review-admin-stars">{'★'.repeat(review.rating)}</td>
                  <td>{review.comment}</td>
                  <td>
                    <button
                      type="button"
                      className="dashboard__action-btn dashboard__action-btn--danger"
                      disabled={deletingId === review._id}
                      onClick={() => handleDelete(review._id)}
                    >
                      {deletingId === review._id ? 'Deleting...' : 'Delete'}
                    </button>
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
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryOrder, setNewCategoryOrder] = useState(0);
  const [newSubCategoryInputs, setNewSubCategoryInputs] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    displayOrder: 0,
    image: null,
    imageFit: 'cover',
    imagePositionX: 50,
    imagePositionY: 50,
    imageZoom: 100,
  });
  const [imagePreview, setImagePreview] = useState('');
  const [processingImage, setProcessingImage] = useState(false);
  const [newImagePreview, setNewImagePreview] = useState('');
  const [newImageSettings, setNewImageSettings] = useState({
    imageFit: 'cover',
    imagePositionX: 50,
    imagePositionY: 50,
    imageZoom: 100,
  });

  useEffect(() => () => {
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  useEffect(() => () => {
    if (newImagePreview.startsWith('blob:')) URL.revokeObjectURL(newImagePreview);
  }, [newImagePreview]);

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const data = new FormData();
      data.append('name', newCategoryName.trim());
      data.append('displayOrder', newCategoryOrder);
      data.append('imageFit', newImageSettings.imageFit);
      data.append('imagePositionX', newImageSettings.imagePositionX);
      data.append('imagePositionY', newImageSettings.imagePositionY);
      data.append('imageZoom', newImageSettings.imageZoom);
      if (newCategoryImage) data.append('image', newCategoryImage);
      const created = await createCategory(data);
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setNewCategoryName('');
      setNewCategoryImage(null);
      setNewCategoryOrder(0);
      setNewImagePreview('');
      setNewImageSettings({ imageFit: 'cover', imagePositionX: 50, imagePositionY: 50, imageZoom: 100 });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setImagePreview(category.image || '');
    setEditForm({
      name: category.name,
      displayOrder: category.displayOrder || 0,
      image: null,
      imageFit: category.imageFit || 'cover',
      imagePositionX: category.imagePositionX ?? 50,
      imagePositionY: category.imagePositionY ?? 50,
      imageZoom: category.imageZoom ?? 100,
    });
  };

  const handleEdit = async (categoryId) => {
    setBusyId(categoryId);
    try {
      const data = new FormData();
      data.append('name', editForm.name);
      data.append('displayOrder', editForm.displayOrder);
      data.append('imageFit', editForm.imageFit);
      data.append('imagePositionX', editForm.imagePositionX);
      data.append('imagePositionY', editForm.imagePositionY);
      data.append('imageZoom', editForm.imageZoom);
      if (editForm.image) data.append('image', editForm.image);
      const updated = await updateCategory(categoryId, data);
      setCategories((prev) => prev.map((c) => (c._id === categoryId ? updated : c)));
      setEditingId(null);
      setImagePreview('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category');
    } finally {
      setBusyId(null);
    }
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
    setEditForm((current) => ({ ...current, image: file }));
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveBackground = async () => {
    let sourceFile = editForm.image;
    if (!sourceFile && imagePreview && !imagePreview.startsWith('blob:')) {
      try {
        const response = await fetch(imagePreview);
        if (!response.ok) throw new Error('Image could not be loaded for editing');
        const blob = await response.blob();
        sourceFile = new File([blob], 'category-image.png', { type: blob.type || 'image/png' });
      } catch (err) {
        setError('Choose a replacement image before removing its background.');
        return;
      }
    }
    if (!sourceFile) {
      setError('Choose an image before removing its background.');
      return;
    }
    setProcessingImage(true);
    setError('');
    try {
      const processed = await removeImageBackground(sourceFile);
      handleImageFile(processed);
    } catch (err) {
      setError(err.message || 'Failed to remove image background');
    } finally {
      setProcessingImage(false);
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
        <input         type="number" min="0" value={newCategoryOrder} onChange={(e) => setNewCategoryOrder(e.target.value)} placeholder="Order" aria-label="Display order" />
        <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          if (newImagePreview.startsWith('blob:')) URL.revokeObjectURL(newImagePreview);
          setNewCategoryImage(file);
          setNewImagePreview(URL.createObjectURL(file));
        }}
        />
        <button type="submit" disabled={submitting || !newCategoryName.trim()} className="dashboard__cta">
        {submitting ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {newImagePreview && (
        <div className="category-card__image-editor category-card__image-editor--new">
        <div className="category-card__image-preview">
          <img
            src={newImagePreview}
            alt="New category preview"
            style={{
              objectFit: newImageSettings.imageFit,
              objectPosition: `${newImageSettings.imagePositionX}% ${newImageSettings.imagePositionY}%`,
              transform: `translate(${(50 - newImageSettings.imagePositionX) * 0.8}%, ${(50 - newImageSettings.imagePositionY) * 0.8}%) scale(${newImageSettings.imageZoom / 100})`,
            }}
          />
        </div>
        <div className="category-card__image-controls">
          <strong>Preview before adding</strong>
          <label>
            Fit
            <select value={newImageSettings.imageFit} onChange={(e) => setNewImageSettings({ ...newImageSettings, imageFit: e.target.value })}>
              <option value="cover">Crop to fill</option>
              <option value="contain">Show full image</option>
            </select>
          </label>
          <label>
            Horizontal: {newImageSettings.imagePositionX}%
            <input type="range" min="0" max="100" value={newImageSettings.imagePositionX} onChange={(e) => setNewImageSettings({ ...newImageSettings, imagePositionX: Number(e.target.value) })} />
          </label>
          <label>
            Vertical: {newImageSettings.imagePositionY}%
            <input type="range" min="0" max="100" value={newImageSettings.imagePositionY} onChange={(e) => setNewImageSettings({ ...newImageSettings, imagePositionY: Number(e.target.value) })} />
          </label>
          <label>
            Zoom: {newImageSettings.imageZoom}%
            <input type="range" min="100" max="300" value={newImageSettings.imageZoom} onChange={(e) => setNewImageSettings({ ...newImageSettings, imageZoom: Number(e.target.value) })} />
          </label>
          <button type="button" className="dashboard__action-btn" onClick={async () => {
            setProcessingImage(true);
            setError('');
            try {
              const processed = await removeImageBackground(newCategoryImage);
              if (newImagePreview.startsWith('blob:')) URL.revokeObjectURL(newImagePreview);
              setNewCategoryImage(processed);
              setNewImagePreview(URL.createObjectURL(processed));
            } catch (err) {
              setError(err.message || 'Failed to remove image background');
            } finally {
              setProcessingImage(false);
            }
          }} disabled={processingImage || !newCategoryImage}>
            {processingImage ? 'Removing...' : 'Remove background'}
          </button>
        </div>
        </div>
      )}

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
                  {editingId === category._id ? (
                    <div className="category-card__edit">
                      <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      <input type="number" value={editForm.displayOrder} onChange={(e) => setEditForm({ ...editForm, displayOrder: e.target.value })} aria-label="Display order" />
                      <label className="category-card__image-upload">
                        <span>Replace image</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(e) => {
                            handleImageFile(e.target.files?.[0]);
                          }}
                        />
                      </label>
                      {imagePreview && (
                        <div className="category-card__image-editor">
                          <div className="category-card__image-preview">
                            <img
                              src={imagePreview}
                              alt={`${category.name} preview`}
                              style={{
                                objectFit: editForm.imageFit,
                                objectPosition: `${editForm.imagePositionX}% ${editForm.imagePositionY}%`,
                                transform: `translate(${(50 - editForm.imagePositionX) * 0.8}%, ${(50 - editForm.imagePositionY) * 0.8}%) scale(${editForm.imageZoom / 100})`,
                              }}
                            />
                          </div>
                          <div className="category-card__image-controls">
                            <label>
                              Fit
                              <select value={editForm.imageFit} onChange={(e) => setEditForm({ ...editForm, imageFit: e.target.value })}>
                                <option value="cover">Crop to fill</option>
                                <option value="contain">Show full image</option>
                              </select>
                            </label>
                            <label>
                              Horizontal: {editForm.imagePositionX}%
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={editForm.imagePositionX}
                                onChange={(e) => setEditForm({ ...editForm, imagePositionX: Number(e.target.value) })}
                              />
                            </label>
                            <label>
                              Vertical: {editForm.imagePositionY}%
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={editForm.imagePositionY}
                                onChange={(e) => setEditForm({ ...editForm, imagePositionY: Number(e.target.value) })}
                              />
                            </label>
                            <label>
                              Zoom: {editForm.imageZoom}%
                              <input
                                type="range"
                                min="100"
                                max="300"
                                value={editForm.imageZoom}
                                onChange={(e) => setEditForm({ ...editForm, imageZoom: Number(e.target.value) })}
                              />
                            </label>
                            <button
                              type="button"
                              className="dashboard__action-btn"
                              onClick={handleRemoveBackground}
                              disabled={processingImage || !editForm.image}
                            >
                              {processingImage ? 'Removing...' : 'Remove background'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : <h4>{category.name}</h4>}
                  <div className="category-card__header-actions">
                    {editingId === category._id ? (
                      <button disabled={isBusy} onClick={() => handleEdit(category._id)} className="dashboard__action-btn dashboard__action-btn--success">Save</button>
                    ) : (
                      <button disabled={isBusy} onClick={() => startEdit(category)} className="dashboard__action-btn">Edit</button>
                    )}
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


/* ===== Notifications ===== */
function NotificationsSection({ users }) {
  const [audience, setAudience] = useState('selected');
  const [recipientIds, setRecipientIds] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setFeedback('');
    try {
      await createNotification({ audience, recipientIds, title, message });
      setTitle('');
      setMessage('');
      setRecipientIds([]);
      setFeedback('Notification sent successfully.');
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Failed to send notification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Send Notification</h2>
      </div>
      <p className="admin-section__description">Send a private notification to any customer, seller, or admin account.</p>
      <form className="notification-form" onSubmit={handleSubmit}>
        <label>
          Recipients
          <select value={audience} onChange={(event) => { setAudience(event.target.value); setRecipientIds([]); }} required>
            <option value="selected">Selected accounts</option>
            <option value="all">All users</option>
            <option value="customers">All customers</option>
            <option value="sellers">All sellers</option>
            <option value="moderators">All moderators</option>
            <option value="admins">All admins</option>
          </select>
        </label>
        {audience === 'selected' && (
          <label>
            Select accounts ({recipientIds.length} selected)
            <select
              multiple
              value={recipientIds}
              onChange={(event) => setRecipientIds(Array.from(event.target.selectedOptions, (option) => option.value))}
              required
              className="notification-form__account-list"
            >
              {users.map((account) => (
                <option key={account._id} value={account._id}>
                  {account.name} ({account.email}) · {account.role}
                </option>
              ))}
            </select>
            <small>Hold Ctrl (Windows) or Command (Mac) to select multiple accounts.</small>
          </label>
        )}
        <label>
          Title
          <input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required placeholder="Notification title" />
        </label>
        <label>
          Message
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={1000} required rows="5" placeholder="Write your message..." />
        </label>
        <button type="submit" className="dashboard__action-btn dashboard__action-btn--success" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Notification'}
        </button>
        {feedback && <p className="notification-form__feedback">{feedback}</p>}
      </form>
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


function PromotionalPopupsSection({ popups, setPopups }) {
  const emptyForm = { title: '', link: '', duration: 5 };
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  const reset = () => {
    setForm(emptyForm);
    setImage(null);
    setEditingId(null);
    setError('');
    setPreview('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!editingId && !image) {
      setError('Please select a popup image');
      return;
    }
    const data = new FormData();
    if (image) data.append('image', image);
    Object.entries(form).forEach(([key, value]) => data.append(key, value));
    try {
      const saved = editingId ? await updatePopup(editingId, data) : await createPopup(data);
      setPopups((current) => editingId
        ? current.map((popup) => (popup._id === editingId ? saved : popup))
        : [saved, ...current]);
      reset();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promotional popup');
    }
  };

  const handleEdit = (popup) => {
    setEditingId(popup._id);
    setForm({ title: popup.title || '', link: popup.link || '', duration: popup.duration || 5 });
    setImage(null);
    setPreview(popup.image || '');
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleToggle = async (id) => {
    setBusyId(id);
    try {
      const updated = await togglePopup(id);
      setPopups((current) => current.map((popup) => (popup._id === id ? updated : popup)));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id) => {
    setBusyId(id);
    try {
      await deletePopup(id);
      setPopups((current) => current.filter((popup) => popup._id !== id));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <h2 className="admin-content__title">Promotional Popup</h2>
        {editingId && <button className="dashboard__action-btn" onClick={reset}>Cancel Edit</button>}
      </div>
      <p className="admin-section__description">The active popup appears once per visitor session and closes automatically after its duration. Admins and Super Admins can manage it here.</p>
      <form className="banner-form popup-form" onSubmit={handleSubmit}>
        {error && <p className="checkout-form__error">{error}</p>}
        <div className="popup-form__grid">
          <div className="popup-form__upload">
            <div className="popup-form__preview">
              {preview ? <img src={preview} alt="Popup preview" /> : <span>Preview image</span>}
            </div>
            <label className="popup-form__file">
              <span>{image ? image.name : 'Choose popup image'}</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} required={!editingId} />
            </label>
            <small>JPG, PNG or WebP. Use a wide promotional image for the best result.</small>
          </div>
          <div className="popup-form__fields">
            <label>Popup title <span>Optional</span>
              <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="e.g. Weekend Mega Sale" />
            </label>
            <label>Click destination <span>Optional</span>
              <input value={form.link} onChange={(event) => setForm({ ...form, link: event.target.value })} placeholder="e.g. /?category=Electronics" />
            </label>
            <label>Display duration <span>Seconds</span>
              <input type="number" min="1" max="30" value={form.duration} onChange={(event) => setForm({ ...form, duration: event.target.value })} required />
            </label>
            <button className="dashboard__cta" type="submit">{editingId ? 'Save Popup Changes' : 'Add Popup'}</button>
          </div>
        </div>
      </form>
      <div className="banner-list">
        {popups.map((popup) => (
          <div key={popup._id} className="banner-list__item" style={{ opacity: busyId === popup._id ? 0.5 : 1 }}>
            <img src={popup.image} alt={popup.title || 'Promotional popup'} className="banner-list__thumb" />
            <div className="banner-list__info">
              <span className={`pill pill--${popup.isActive ? 'success' : 'pending'}`}>{popup.isActive ? 'Active' : 'Inactive'}</span>
              <p className="banner-list__title">{popup.title || 'Untitled popup'}</p>
              <p className="banner-list__link">{popup.duration}s {popup.link ? `· ${popup.link}` : ''}</p>
            </div>
            <div className="banner-list__actions">
              <button disabled={busyId === popup._id} onClick={() => handleEdit(popup)} className="dashboard__action-btn">Edit</button>
              <button disabled={busyId === popup._id} onClick={() => handleToggle(popup._id)} className="dashboard__action-btn">{popup.isActive ? 'Deactivate' : 'Activate'}</button>
              <button disabled={busyId === popup._id} onClick={() => handleDelete(popup._id)} className="dashboard__action-btn dashboard__action-btn--danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
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
                        <div className="admin-user-actions">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(u._id, 'suspended')}
                            className="dashboard__action-btn dashboard__action-btn--danger"
                          >
                            Suspend
                          </button>
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(u._id, 'banned')}
                            className="dashboard__action-btn dashboard__action-btn--danger"
                          >
                            Terminate
                          </button>
                        </div>
                      ) : (
                        <div className="admin-user-actions">
                          <button
                            disabled={isUpdating}
                            onClick={() => handleStatusChange(u._id, 'active')}
                            className="dashboard__action-btn dashboard__action-btn--success"
                          >
                            Reactivate
                          </button>
                          {u.status === 'suspended' && (
                            <button
                              disabled={isUpdating}
                              onClick={() => handleStatusChange(u._id, 'banned')}
                              className="dashboard__action-btn dashboard__action-btn--danger"
                            >
                              Terminate
                            </button>
                          )}
                        </div>
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

/* ===== Security ===== */
function SecuritySection({ logout }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogoutAll = async () => {
    const confirmed = window.confirm(
      'Log out every account, including your Super Admin session? Everyone will need to sign in again.',
    );
    if (!confirmed) return;

    setIsLoggingOut(true);
    setMessage('');
    setError('');
    try {
      const result = await logoutAllUsers();
      setMessage(`${result.message} Redirecting you to the login page...`);
      setTimeout(() => {
        logout();
        window.location.assign('/login');
      }, 1200);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to invalidate user sessions.');
      setIsLoggingOut(false);
    }
  };

  return (
    <div>
      <div className="admin-content__header">
        <div>
          <h2 className="admin-content__title">Security</h2>
          <p className="admin-content__subtitle">Manage emergency session controls for the entire platform.</p>
        </div>
      </div>
      <div className="dashboard-card security-card">
        <h3>Global session logout</h3>
        <p>
          Immediately invalidate every active account session. This is useful if you suspect
          unauthorized access or need to perform an emergency security reset.
        </p>
        <p className="security-card__note">
          All customers, sellers, moderators, and Super Admins will be required to sign in again.
          This action cannot be undone.
        </p>
        <button
          type="button"
          className="dashboard__action-btn dashboard__action-btn--danger"
          onClick={handleLogoutAll}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? 'Invalidating sessions...' : 'Log out all users'}
        </button>
        {message && <p className="security-card__success">{message}</p>}
        {error && <p className="security-card__error">{error}</p>}
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
  const [productSearch, setProductSearch] = useState('');
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
  const handleTrending = async (productId, isTrending) => {
    setUpdatingId(productId);
    try {
      const updated = await setTrendingProduct(productId, isTrending);
      setProducts((prev) => prev.map((p) => (p._id === productId ? updated : p)));
    } catch (err) {
      console.error('Failed to update trending status', err);
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
  const trendingCount = products.filter((p) => p.isTrending).length;
  const visibleProducts = products
    .filter((p) => {
      if (filter === 'pending') return !p.isApproved;
      // Trending Now is the management view: admins need the full approved
      // catalogue here so they can add or remove any product.
      if (filter === 'trending') return p.isApproved;
      return true;
    })
    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));

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
          <button className={`admin-tab ${filter === 'trending' ? 'admin-tab--active' : ''}`} onClick={() => setFilter('trending')}>
            Trending Now ({trendingCount})
          </button>
                  {filter === 'pending' && visibleProducts.length > 0 && (
          <button onClick={toggleSelectAll} style={{ fontSize: '12.5px', color: 'var(--color-primary)', fontWeight: 600, marginLeft: 'var(--space-sm)' }}>
            {selectedIds.length === visibleProducts.length ? 'Deselect all' : 'Select all'}
          </button>
        )}
        </div>
      </div>
      <div className="admin-products__toolbar">
        <input
          type="search"
          value={productSearch}
          onChange={(event) => setProductSearch(event.target.value)}
          placeholder="Search products to manage Trending Now..."
          aria-label="Search products to manage Trending Now"
        />
        {filter === 'trending' && <span>Select Add or Remove to edit the Trending Now products.</span>}
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
                <th>Trending</th>
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
                      <button
                        disabled={isUpdating || !product.isApproved}
                        onClick={() => handleTrending(product._id, !product.isTrending)}
                        className={`dashboard__action-btn ${product.isTrending ? 'dashboard__action-btn--success' : ''}`}
                      >
                        {product.isTrending ? 'Remove' : 'Add'}
                      </button>
                      {product.isTrending && <span className="admin-products__featured-label">Currently shown</span>}
                    </td>
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