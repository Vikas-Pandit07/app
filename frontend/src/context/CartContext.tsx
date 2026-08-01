import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { addToCart, clearRemoteCart, getCart, removeCartItem, updateCartItemQuantity } from '../api/cartService';
import { useAuth } from './AuthContext';
import { buildProductStub } from '../lib/productAdapter';
import type { CartItem, Product } from '../lib/types';

const STORAGE_KEY = 'outloox-guest-cart';

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  shipping: number;
  total: number;
  loading: boolean;
  addItem: (product: Product, size: string, color: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string, size: string, color: string, backendItemId?: number) => Promise<void>;
  updateQuantity: (productId: string, size: string, color: string, quantity: number, backendItemId?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

function readGuestCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items: CartItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [guestItems, setGuestItems] = useState<CartItem[]>(() => (typeof window === 'undefined' ? [] : readGuestCart()));
  const [remoteItems, setRemoteItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const syncRef = useRef(false);

  const currentItems = isAuthenticated ? remoteItems : guestItems;

  useEffect(() => {
    if (!isAuthenticated) {
      syncRef.current = false;
      writeGuestCart(guestItems);
    }
  }, [guestItems, isAuthenticated]);

  const refreshRemoteCart = async () => {
    const data = await getCart();
    const mapped: CartItem[] = data.items.map((item) => ({
      backendItemId: item.cartItemId,
      product: buildProductStub({
        productId: item.productId,
        name: item.productName,
        price: item.price,
        image: item.productImage,
      }),
      quantity: item.quantity,
      size: item.size || 'Standard',
      color: item.color || 'Standard',
    }));
    setRemoteItems(mapped);
  };

  const syncGuestCartToRemote = async () => {
    if (!guestItems.length || syncRef.current) return;
    syncRef.current = true;
    for (const item of guestItems) {
      await addToCart({ productId: item.product.backendId, quantity: item.quantity, size: item.size, color: item.color });
    }
    setGuestItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const refreshCart = async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      await syncGuestCartToRemote();
      await refreshRemoteCart();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refreshCart();
  }, [isAuthenticated, authLoading]);

  const addGuestItem = (product: Product, size: string, color: string, quantity = 1) => {
    setGuestItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id && item.size === size && item.color === color);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id && item.size === size && item.color === color
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { product, size, color, quantity }];
    });
  };

  const addItemHandler = async (product: Product, size: string, color: string, quantity = 1) => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        await addToCart({ productId: product.backendId, quantity, size, color });
        await refreshRemoteCart();
      } finally {
        setLoading(false);
      }
      return;
    }

    addGuestItem(product, size, color, quantity);
  };

  const removeItemHandler = async (productId: string, size: string, color: string, backendItemId?: number) => {
    if (isAuthenticated && backendItemId) {
      setLoading(true);
      try {
        await removeCartItem(backendItemId);
        await refreshRemoteCart();
      } finally {
        setLoading(false);
      }
      return;
    }

    setGuestItems((prev) => prev.filter((item) => !(item.product.id === productId && item.size === size && item.color === color)));
  };

  const updateQuantityHandler = async (
    productId: string,
    size: string,
    color: string,
    quantity: number,
    backendItemId?: number,
  ) => {
    if (quantity < 1) {
      await removeItemHandler(productId, size, color, backendItemId);
      return;
    }

    if (isAuthenticated && backendItemId) {
      setLoading(true);
      try {
        await updateCartItemQuantity({ itemId: backendItemId, quantity });
        await refreshRemoteCart();
      } finally {
        setLoading(false);
      }
      return;
    }

    setGuestItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.size === size && item.color === color ? { ...item, quantity } : item,
      ),
    );
  };

  const clearCartHandler = async () => {
    if (isAuthenticated) {
      setLoading(true);
      try {
        await clearRemoteCart();
        setRemoteItems([]);
      } finally {
        setLoading(false);
      }
      return;
    }

    setGuestItems([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const subtotal = currentItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = currentItems.length === 0 || subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  const totalItems = currentItems.reduce((sum, item) => sum + item.quantity, 0);

  const value = useMemo(
    () => ({
      items: currentItems,
      totalItems,
      subtotal,
      shipping,
      total,
      loading,
      addItem: addItemHandler,
      removeItem: removeItemHandler,
      updateQuantity: updateQuantityHandler,
      clearCart: clearCartHandler,
      refreshCart,
    }),
    [currentItems, totalItems, subtotal, shipping, total, loading, isAuthenticated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export type CartStore = CartContextValue;
