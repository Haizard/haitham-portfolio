'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface WishlistButtonProps {
  itemType: 'property' | 'vehicle' | 'tour' | 'transfer';
  itemId: string;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function WishlistButton({
  itemType,
  itemId,
  className,
  variant = 'ghost',
  size = 'icon',
}: WishlistButtonProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if item is in wishlist on mount
  useEffect(() => {
    checkIfSaved();
  }, [itemId]);

  const checkIfSaved = async () => {
    try {
      const response = await fetch('/api/wishlists');
      const data = await response.json();

      if (data.success) {
        const saved = data.wishlists.some((wishlist: any) =>
          wishlist.items.some((item: any) => item.itemId === itemId)
        );
        setIsSaved(saved);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    try {
      if (isSaved) {
        // Remove from wishlist
        // First, find which wishlist contains this item
        const wishlistsResponse = await fetch('/api/wishlists');
        const wishlistsData = await wishlistsResponse.json();

        if (wishlistsData.success) {
          const wishlist = wishlistsData.wishlists.find((w: any) =>
            w.items.some((item: any) => item.itemId === itemId)
          );

          if (wishlist) {
            const response = await fetch(
              `/api/wishlists/${wishlist.id}/items/${itemId}`,
              { method: 'DELETE' }
            );

            const data = await response.json();

            if (data.success) {
              setIsSaved(false);
              toast({
                title: 'Removed from wishlist',
                description: 'Item has been removed from your wishlist',
              });
            }
          }
        }
      } else {
        // Add to default wishlist
        // First, get or create default wishlist
        const wishlistsResponse = await fetch('/api/wishlists');
        const wishlistsData = await wishlistsResponse.json();

        let defaultWishlist = wishlistsData.wishlists?.find(
          (w: any) => w.isDefault
        );

        if (!defaultWishlist) {
          // Create default wishlist
          const createResponse = await fetch('/api/wishlists', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'My Favorites',
              isDefault: true,
            }),
          });

          const createData = await createResponse.json();
          if (createData.success) {
            defaultWishlist = createData.wishlist;
          }
        }

        if (defaultWishlist) {
          const response = await fetch(
            `/api/wishlists/${defaultWishlist.id}/items`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ itemType, itemId }),
            }
          );

          const data = await response.json();

          if (data.success) {
            setIsSaved(true);
            toast({
              title: 'Added to wishlist',
              description: 'Item has been added to your wishlist',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to update wishlist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleToggle}
      disabled={isLoading}
    >
      <Heart
        className={cn(
          'h-5 w-5',
          isSaved && 'fill-red-500 text-red-500'
        )}
      />
    </Button>
  );
}

