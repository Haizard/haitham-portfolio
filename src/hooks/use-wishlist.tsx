
"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useToast } from './use-toast';
import { useUser } from './use-user';

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
  const { user, isLoading: isUserLoading } = useUser();

  useEffect(() => {
    async function fetchWishlist() {
      // Don't fetch if the user session is still loading or if there is no user.
      if (isUserLoading || !user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch('/api/profile/wishlist');
        if (!response.ok) {
           // We don't throw an error here for non-logged-in users as it's an expected state.
           // The !user check above should handle this gracefully. If we get here with a user, it's a real error.
           if (response.status === 401) {
             console.log("Not logged in, can't fetch wishlist.");
             setWishlist([]);
           } else {
             throw new Error('Failed to fetch wishlist data.');
           }
           return;
        }
        const data = await response.json();
        setWishlist(data.wishlist || []);
      } catch (error: any) {
        console.error("Failed to fetch wishlist from server:", error);
        toast({ title: "Error", description: "Could not load your wishlist.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    
    // If the user logs out, clear the wishlist.
    if (!user && !isUserLoading) {
        setWishlist([]);
        setIsLoading(false);
    } else {
        fetchWishlist();
    }
  }, [user, isUserLoading, toast]);

  const toggleWishlist = useCallback(async (productId: string, productName?: string) => {
    // Prevent toggle if not logged in.
    if (!user) {
        toast({
            title: "Please log in",
            description: "You need to be logged in to manage your wishlist.",
            variant: "destructive"
        });
        return;
    }

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
  }, [wishlist, toast, user]);

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
