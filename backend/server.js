const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const sellerApplicationRoutes = require('./routes/sellerApplicationRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const couponRoutes = require('./routes/couponRoutes');
const visitorActivityRoutes = require('./routes/visitorActivityRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const { generalLimiter } = require('./middleware/rateLimiters');

connectDB();

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL,
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.use(generalLimiter);

app.use('/uploads', express.static('public/uploads'));

app.get('/', (req, res) => {
  res.send('VastMart API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/seller-applications', sellerApplicationRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/activity', visitorActivityRoutes);
app.use('/api/categories', categoryRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});