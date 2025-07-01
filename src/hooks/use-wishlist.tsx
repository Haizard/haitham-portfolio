
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string, productName?: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchWishlist() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/profile/wishlist');
        if (!response.ok) {
          throw new Error('Failed to fetch wishlist data.');
        }
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } catch (error) {
        console.error("Failed to fetch wishlist from server:", error);
        toast({ title: "Error", description: "Could not load your wishlist.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchWishlist();
  }, [toast]);

  const toggleWishlist = useCallback(async (productId: string, productName?: string) => {
    const originalWishlist = [...wishlist];
    const wasInWishlist = originalWishlist.includes(productId);

    // Optimistic UI update
    const newWishlist = wasInWishlist
      ? originalWishlist.filter(id => id !== productId)
      : [...originalWishlist, productId];
    setWishlist(newWishlist);

    try {
      const response = await fetch('/api/profile/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Server error updating wishlist.');
      }
      
      // Sync with server state to be safe
      setWishlist(data.wishlist);

      // Show toast based on the actual initial state
      if (wasInWishlist) {
        toast({
          title: "Removed from Wishlist",
          description: `${productName || 'The item'} has been removed from your wishlist.`,
        });
      } else {
        toast({
          title: "Added to Wishlist",
          description: `${productName || 'The item'} has been added to your wishlist.`,
        });
      }

    } catch (error: any) {
      // Revert optimistic update on error
      setWishlist(originalWishlist);
      toast({
        title: "Error",
        description: `Could not update wishlist: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [wishlist, toast]);

  const isInWishlist = useCallback((productId: string) => {
    return wishlist.includes(productId);
  }, [wishlist]);

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider value={{
      wishlist,
      toggleWishlist,
      isInWishlist,
      wishlistCount,
      isLoading
    }}>
      {children}
    </WishlistContext.Provider>
  );
}
