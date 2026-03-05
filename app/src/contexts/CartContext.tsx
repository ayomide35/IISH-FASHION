import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string;
  size: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  availableQuantity: number;
}

interface Cart {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  currency: string;
  currencySymbol: string;
}

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addToCart: (productId: number, size: string, quantity: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<boolean>;
  removeItem: (itemId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const defaultCart: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
  currency: 'NGN',
  currencySymbol: '₦'
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(defaultCart);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchCart(token);
    }
  }, []);

  const fetchCart = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCart(data.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  const addToCart = async (productId: number, size: string, quantity: number): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to add items to cart');
      return false;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, size, quantity })
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data.data);
        toast.success('Added to cart');
        return true;
      } else {
        toast.error(data.message || 'Failed to add to cart');
        return false;
      }
    } catch {
      toast.error('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity })
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data.data);
        return true;
      } else {
        toast.error(data.message || 'Failed to update cart');
        return false;
      }
    } catch {
      toast.error('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId: number): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCart(data.data);
        toast.success('Item removed from cart');
        return true;
      } else {
        toast.error(data.message || 'Failed to remove item');
        return false;
      }
    } catch {
      toast.error('Network error. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async (): Promise<boolean> => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const response = await fetch(`${API_URL}/cart`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setCart(defaultCart);
        toast.success('Cart cleared');
        return true;
      } else {
        toast.error(data.message || 'Failed to clear cart');
        return false;
      }
    } catch {
      toast.error('Network error. Please try again.');
      return false;
    }
  };

  const refreshCart = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchCart(token);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      isLoading,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      refreshCart
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
