import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import * as cartService from '../services/cartService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(false);

  // Load cart whenever user logs in; clear it when they log out
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart({ items: [] });
    }
  }, [user]);

  const refreshCart = async () => {
    setLoading(true);
    try {
      const data = await cartService.getCart();
      console.log('refreshCart received:', data);
      setCart(data);
    } catch (error) {
      console.error('Failed to load cart', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (productId, quantity = 1) => {
    const data = await cartService.addToCart(productId, quantity);
    setCart(data);
  };

  const updateItem = async (productId, quantity) => {
    const data = await cartService.updateCartItem(productId, quantity);
    setCart(data);
  };

  const removeItem = async (productId) => {
    const data = await cartService.removeFromCart(productId);
    setCart(data);
  };

  // Total number of individual items (for the Navbar badge)
  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateItem, removeItem, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}