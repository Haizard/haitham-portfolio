
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Product } from '@/lib/products-data';
import { useToast } from './use-toast';
import { useUser } from './use-user';

export interface CartItem extends Partial<Product> { // Make fields partial to accommodate simpler restaurant items
  id: string; // id is mandatory
  name: string; // name is mandatory
  price: number; // price is mandatory
  quantity: number;
  imageUrl: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const { user } = useUser();
  const cartKey = user?.id ? `ajira-online-cart-${user.id}` : 'ajira-online-cart-guest';

  // Load cart from local storage when the key changes (user logs in/out)
  useEffect(() => {
    // Check if we are in the browser
    if (typeof window === 'undefined') return;

    try {
      // First, simply clear the in-memory cart to avoid showing stale data while loading
      setCartItems([]);

      const storedCart = localStorage.getItem(cartKey);
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
      // If no stored cart for this key, it remains empty (already set above)
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      localStorage.removeItem(cartKey);
      setCartItems([]);
    }
  }, [cartKey]);

  // Save cart to local storage whenever cartItems or key changes
  useEffect(() => {
    try {
      localStorage.setItem(cartKey, JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems, cartKey]);

  const addToCart = useCallback((product: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    if (!product.id) {
      toast({ title: "Error", description: "Product does not have an ID.", variant: "destructive" });
      return;
    }
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      if (existingItem) {
        // Increase quantity of existing item
        return prevItems.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        // Add new item to cart
        return [...prevItems, { ...product, quantity }];
      }
    });
    toast({
      title: "Added to Order",
      description: `${product.name} (x${quantity}) has been added.`,
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    toast({
      title: "Item Removed",
      description: "The item has been removed from your order.",
      variant: "destructive"
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setCartItems(prevItems => {
      if (quantity <= 0) {
        return prevItems.filter(item => item.id !== productId);
      }
      return prevItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + (item.price || 0) * item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}
