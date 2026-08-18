const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logActivity = require('../utils/logActivity');


// @desc   Create a new order from the user's cart
// @route  POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.email ||
      !shippingAddress.street ||
      !shippingAddress.city ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({ message: 'Please fill in all required delivery details' });
    }

    // 1. Get the user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your cart is empty' });
    }

    // 2. Validate stock and build snapshotted order items
    const orderItems = [];
    let itemsTotal = 0;

    for (const cartItem of cart.items) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({ message: 'A product in your cart no longer exists' });
      }

      if (product.stock < cartItem.quantity) {
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      }

      const price = product.discountPrice || product.price;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: cartItem.quantity,
        seller: product.seller,
      });

      itemsTotal += price * cartItem.quantity;
    }

    const shippingFee = 60; // flat rate for now — can be dynamic later
    const totalAmount = itemsTotal + shippingFee;

    // 3. Create the order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || 'cod',
      itemsTotal,
      shippingFee,
      totalAmount,
    });

    // 4. Reduce stock for each product
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity },
      });
    }

    // 5. Clear the cart
    cart.items = [];
    await cart.save();


    await logActivity({
      user: req.user,
      action: 'order_placed',
      description: `${req.user.name} placed an order for ৳${totalAmount}`,
      meta: { orderId: order._id },
    });

    
    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get logged-in user's orders
// @route  GET /api/orders/myorders
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get a single order by ID (only if it belongs to the requester, or admin)
// @route  GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only the order's owner or an admin can view it
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Get orders that contain at least one of the seller's products
// @route  GET /api/orders/seller/my-sales
const getMySales = async (req, res) => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc   Update order status (admin only)
// @route  PUT /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const validStatuses = ['placed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.orderStatus = orderStatus;

    // Mark payment as paid automatically once delivered (for COD orders)
    if (orderStatus === 'delivered' && order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
    }

    await order.save();

    await logActivity({
      user: req.user,
      action: 'order_placed', // reused enum — see note below
      description: `Admin updated order #${order._id.toString().slice(-8).toUpperCase()} to "${orderStatus}"`,
      meta: { orderId: order._id },
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { createOrder, getMyOrders, getOrderById, getMySales, getAllOrdersAdmin, updateOrderStatus };