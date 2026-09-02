import { Routes, Route, useLocation } from 'react-router-dom';
import TopBar from './components/TopBar';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import SellerDashboard from './pages/SellerDashboard';
import AddProduct from './pages/AddProduct';
import AdminDashboard from './pages/AdminDashboard';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import BecomeSeller from './pages/BecomeSeller';
import Footer from './components/Footer';
import SupportTickets from './pages/SupportTickets';
import NewTicket from './pages/NewTicket';
import TicketDetail from './pages/TicketDetail';

import { AnimatePresence, motion } from 'framer-motion';

import { useState } from 'react';
import MobileMenuDrawer from './components/MobileMenuDrawer';
import MobileBottomNav from './components/MobileBottomNav';
import MobileSearchOverlay from './components/MobileSearchOverlay';

function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const location = useLocation();

  return (
    <div>
      <TopBar />
      <Header />
      <CategoryNav />

      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route
              path="/order-confirmation/:id"
              element={<OrderConfirmation />}
            />
            <Route path="/orders" element={<OrderHistory />} />
            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/products/new" element={<AddProduct />} />
            <Route path="/seller/products/edit/:id" element={<AddProduct />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-seller" element={<BecomeSeller />} />
            <Route path="/support" element={<SupportTickets />} />
            <Route path="/support/new" element={<NewTicket />} />
            <Route path="/support/:id" element={<TicketDetail />} />
          </Routes>
        </motion.div>
      </AnimatePresence>

      <Footer />

      {/* Mobile Navigation Components */}
      <MobileMenuDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      <MobileSearchOverlay
        isOpen={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
      />

      <MobileBottomNav
        onOpenMenu={() => setDrawerOpen(true)}
        onOpenSearch={() => setMobileSearchOpen(true)}
      />
    </div>
  );
}

export default App;