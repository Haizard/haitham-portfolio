'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SharedWishlistPage() {
  const params = useParams();
  const [wishlist, setWishlist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWishlist();
  }, [params.token]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlists/shared/${params.token}`);
      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist);
        await loadItemDetails(data.wishlist.items);
      } else {
        setError(data.error || 'Wishlist not found');
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      setError('Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  const loadItemDetails = async (wishlistItems: any[]) => {
    try {
      const promises = wishlistItems.map(async (item) => {
        const endpoint = `/${item.itemType === 'property' ? 'properties' : item.itemType === 'vehicle' ? 'vehicles' : item.itemType === 'tour' ? 'tours' : 'transfers'}/${item.itemId}`;
        const response = await fetch(`/api${endpoint}`);
        const data = await response.json();
        return data.success ? { ...data[item.itemType], wishlistItem: item } : null;
      });

      const results = await Promise.all(promises);
      setItems(results.filter((item) => item !== null));
    } catch (error) {
      console.error('Error loading item details:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  if (error || !wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            {error || 'Wishlist not found or not public'}
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <Heart className="h-12 w-12 mx-auto text-primary mb-4" />
        <h1 className="text-3xl font-bold">{wishlist.name}</h1>
        {wishlist.description && (
          <p className="text-muted-foreground mt-2">
            {wishlist.description}
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-4">
          {items.length} {items.length === 1 ? 'item' : 'items'} in this wishlist
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            This wishlist is empty
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <Badge className="mb-2">{item.wishlistItem.itemType}</Badge>
                <h3 className="font-semibold mb-2 text-lg">
                  {item.name || item.title}
                </h3>
                {item.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.location.city}, {item.location.country}
                  </p>
                )}
                {item.basePrice && (
                  <p className="text-xl font-bold text-primary mb-2">
                    ${item.basePrice}
                    {item.wishlistItem.itemType === 'property' && '/night'}
                    {item.wishlistItem.itemType === 'vehicle' && '/day'}
                  </p>
                )}
                {item.rating && (
                  <p className="text-sm mb-2">
                    ⭐ {item.rating.toFixed(1)}
                  </p>
                )}
                {item.wishlistItem.notes && (
                  <p className="text-sm text-muted-foreground mb-3 italic">
                    "{item.wishlistItem.notes}"
                  </p>
                )}
                <Link
                  href={`/${item.wishlistItem.itemType === 'property' ? 'properties' : item.wishlistItem.itemType === 'vehicle' ? 'vehicles' : item.wishlistItem.itemType === 'tour' ? 'tours' : 'transfers'}/${item.id}`}
                >
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

