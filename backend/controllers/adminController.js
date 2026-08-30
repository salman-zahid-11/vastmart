const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// @desc   Get platform-wide dashboard stats
// @route  GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const Coupon = require('../models/Coupon');
    const Category = require('../models/Category');
    const Notice = require('../models/Notice');
    const Banner = require('../models/Banner');
    const SellerApplication = require('../models/SellerApplication');
    const VisitorActivity = require('../models/VisitorActivity');

    const [
      totalCustomers,
      totalSellers,
      totalAdmins,
      totalProducts,
      pendingProducts,
      totalOrders,
      pendingOrders,
      deliveredOrders,
      cancelledOrders,
      totalCategories,
      activeCoupons,
      activeNotices,
      activeBanners,
      pendingApplications,
      revenueOrders,
      abandonedCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'seller' }),
      User.countDocuments({ role: 'admin' }),
      Product.countDocuments({}),
      Product.countDocuments({ isApproved: false }),
      Order.countDocuments({}),
      Order.countDocuments({ orderStatus: { $in: ['placed', 'processing'] } }),
      Order.countDocuments({ orderStatus: 'delivered' }),
      Order.countDocuments({ orderStatus: 'cancelled' }),
      Category.countDocuments({ isActive: true }),
      Coupon.countDocuments({ isActive: true }),
      Notice.countDocuments({ isActive: true }),
      Banner.countDocuments({ isActive: true }),
      SellerApplication.countDocuments({ status: 'pending' }),
      Order.find({ orderStatus: { $ne: 'cancelled' } }),
      VisitorActivity.countDocuments({ converted: false, user: { $ne: null } }),
    ]);

    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const avgOrderValue = revenueOrders.length > 0 ? Math.round(totalRevenue / revenueOrders.length) : 0;

    res.status(200).json({
      users: { customers: totalCustomers, sellers: totalSellers, admins: totalAdmins },
      products: { total: totalProducts, pending: pendingProducts },
      orders: {
        total: totalOrders,
        pending: pendingOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: { total: totalRevenue, avgOrderValue },
      catalog: { categories: totalCategories, activeCoupons, activeNotices, activeBanners },
      applications: { pending: pendingApplications },
      abandoned: { count: abandonedCount },
      // kept for backward compatibility with any older frontend code still reading flat fields
      totalUsers: totalCustomers,
      totalSellers,
      totalProducts,
      pendingProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get all users (for admin user management)
// @route  GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Suspend or reactivate a user
// @route  PUT /api/admin/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'suspended', 'banned'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own account status' });
    }

    user.status = status;
    await user.save();

    res.status(200).json({ _id: user._id, name: user.name, status: user.status });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get ALL orders platform-wide
// @route  GET /api/admin/orders
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get recent activity log entries
// @route  GET /api/admin/activity
const getActivityLog = async (req, res) => {
  try {
    let logs = await ActivityLog.find({}).sort({ createdAt: -1 }).limit(200);

    // Moderators see everyone's activity except super admins' — keeps
    // super admin actions (coupon/banner management etc.) private from staff
    if (req.user.adminLevel !== 'super_admin') {
      const superAdmins = await User.find({ role: 'admin', adminLevel: 'super_admin' }).select('_id');
      const superAdminIds = superAdmins.map((u) => u._id.toString());
      logs = logs.filter((log) => !superAdminIds.includes(log.user?.toString()));
    }

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Promote/demote a user's admin level (super admin only)
// @route  PUT /api/admin/users/:id/admin-level
const updateAdminLevel = async (req, res) => {
  try {
    const { role, adminLevel } = req.body; // role: 'admin' | 'customer' (to revoke), adminLevel: 'moderator' | 'super_admin' | null

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own admin level' });
    }

    if (role === 'admin') {
      if (!['moderator', 'super_admin'].includes(adminLevel)) {
        return res.status(400).json({ message: 'Invalid admin level' });
      }
      user.role = 'admin';
      user.adminLevel = adminLevel;
    } else {
      // Revoking admin access — return them to customer
      user.role = 'customer';
      user.adminLevel = null;
    }

    await user.save();

    res.status(200).json({ _id: user._id, name: user.name, role: user.role, adminLevel: user.adminLevel });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get daily revenue/order trends for a given date range
// @route  GET /api/admin/analytics/sales?days=30
const getSalesAnalytics = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      createdAt: { $gte: startDate },
      orderStatus: { $ne: 'cancelled' },
    });

    // Group by day
    const dailyMap = {};
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach((order) => {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (dailyMap[key]) {
        dailyMap[key].revenue += order.totalAmount;
        dailyMap[key].orders += 1;
      }
    });

    const dailyData = Object.values(dailyMap);

    res.status(200).json({ dailyData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get top-selling products by revenue
// @route  GET /api/admin/analytics/top-products
const getTopProducts = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: 'cancelled' } });

    const productMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.product.toString();
        if (!productMap[key]) {
          productMap[key] = { name: item.name, revenue: 0, quantity: 0 };
        }
        productMap[key].revenue += item.price * item.quantity;
        productMap[key].quantity += item.quantity;
      });
    });

    const topProducts = Object.values(productMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.status(200).json(topProducts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get top-performing sellers by revenue
// @route  GET /api/admin/analytics/top-sellers
const getTopSellers = async (req, res) => {
  try {
    const orders = await Order.find({ orderStatus: { $ne: 'cancelled' } });

    const sellerMap = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const key = item.seller?.toString();
        if (!key) return;
        if (!sellerMap[key]) {
          sellerMap[key] = { sellerId: key, revenue: 0, orders: new Set() };
        }
        sellerMap[key].revenue += item.price * item.quantity;
        sellerMap[key].orders.add(order._id.toString());
      });
    });

    const sellerIds = Object.keys(sellerMap);
    const sellers = await User.find({ _id: { $in: sellerIds } }).select('name email');
    const sellerLookup = Object.fromEntries(sellers.map((s) => [s._id.toString(), s]));

    const topSellers = sellerIds
      .map((id) => ({
        name: sellerLookup[id]?.name || 'Unknown',
        email: sellerLookup[id]?.email || '',
        revenue: sellerMap[id].revenue,
        orderCount: sellerMap[id].orders.size,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    res.status(200).json(topSellers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get order status breakdown
// @route  GET /api/admin/analytics/order-status
const getOrderStatusBreakdown = async (req, res) => {
  try {
    const statuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];
    const counts = await Promise.all(
      statuses.map((status) => Order.countDocuments({ orderStatus: status }))
    );

    const breakdown = statuses.map((status, i) => ({ status, count: counts[i] }));
    res.status(200).json(breakdown);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  updateAdminLevel,
  getSalesAnalytics,
  getTopProducts,
  getTopSellers,
  getOrderStatusBreakdown,
};