
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName?: string) => void;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem('creatoros-wishlist');
      if (storedWishlist) {
        setWishlist(JSON.parse(storedWishlist));
      }
    } catch (error) {
        console.error("Failed to parse wishlist from localStorage", error);
        localStorage.removeItem('creatoros-wishlist');
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('creatoros-wishlist', JSON.stringify(wishlist));
    } catch (error) {
        console.error("Failed to save wishlist to localStorage", error);
    }
  }, [wishlist]);

  const toggleWishlist = useCallback((productId: string, productName?: string) => {
    setWishlist(prevWishlist => {
      const isIn = prevWishlist.includes(productId);
      if (isIn) {
        toast({
          title: "Removed from Wishlist",
          description: `${productName || 'The item'} has been removed from your wishlist.`,
        });
        return prevWishlist.filter(id => id !== productId);
      } else {
        toast({
          title: "Added to Wishlist",
          description: `${productName || 'The item'} has been added to your wishlist.`,
        });
        return [...prevWishlist, productId];
      }
    });
  }, [toast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
