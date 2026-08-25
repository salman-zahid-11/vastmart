const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const ActivityLog = require('../models/ActivityLog');

// @desc   Get platform-wide dashboard stats
// @route  GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'customer' });
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments({});
    const pendingProducts = await Product.countDocuments({ isApproved: false });
        const totalOrders = await Order.countDocuments({});

    const revenueOrders = await Order.find({ orderStatus: { $ne: 'cancelled' } });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({
      totalUsers,
      totalSellers,
      totalProducts,
      pendingProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (error) {
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

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllOrdersAdmin,
  getActivityLog,
  updateAdminLevel,
};