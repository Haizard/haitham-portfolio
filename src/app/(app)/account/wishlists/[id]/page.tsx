'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Trash2, Share2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function WishlistDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadWishlist();
  }, [params.id]);

  const loadWishlist = async () => {
    try {
      const response = await fetch(`/api/wishlists/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setWishlist(data.wishlist);
        // Load full item details
        await loadItemDetails(data.wishlist.items);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
      toast({
        title: 'Error',
        description: 'Failed to load wishlist',
        variant: 'destructive',
      });
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

  const handleRemoveItem = async (itemId: string) => {
    try {
      const response = await fetch(
        `/api/wishlists/${params.id}/items/${itemId}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Item removed',
          description: 'Item has been removed from wishlist',
        });
        loadWishlist();
      }
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove item',
        variant: 'destructive',
      });
    }
  };

  const handleShare = () => {
    if (wishlist?.shareToken) {
      const link = `${window.location.origin}/wishlists/shared/${wishlist.shareToken}`;
      navigator.clipboard.writeText(link);
      toast({
        title: 'Link copied',
        description: 'Share link has been copied to clipboard',
      });
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

  if (!wishlist) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Wishlist not found</p>
          <Link href="/account/wishlists">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Wishlists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link href="/account/wishlists">
          <Button variant="ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Wishlists
          </Button>
        </Link>
        <div className="flex items-start justify-between mt-4">
          <div>
            <h1 className="text-3xl font-bold">{wishlist.name}</h1>
            {wishlist.description && (
              <p className="text-muted-foreground mt-2">
                {wishlist.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              {wishlist.isDefault && <Badge>Default</Badge>}
              {wishlist.isPublic && <Badge variant="outline">Public</Badge>}
            </div>
          </div>
          {wishlist.isPublic && (
            <Button onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </div>
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
            <Card key={item.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <Badge>{item.wishlistItem.itemType}</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.wishlistItem.itemId)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <h3 className="font-semibold mb-2">
                  {item.name || item.title}
                </h3>
                {item.location && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.location.city}, {item.location.country}
                  </p>
                )}
                {item.basePrice && (
                  <p className="text-lg font-bold text-primary mb-2">
                    ${item.basePrice}
                    {item.wishlistItem.itemType === 'property' && '/night'}
                    {item.wishlistItem.itemType === 'vehicle' && '/day'}
                  </p>
                )}
                {item.wishlistItem.notes && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {item.wishlistItem.notes}
                  </p>
                )}
                <Link
                  href={`/${item.wishlistItem.itemType === 'property' ? 'properties' : item.wishlistItem.itemType === 'vehicle' ? 'vehicles' : item.wishlistItem.itemType === 'tour' ? 'tours' : 'transfers'}/${item.id}`}
                >
                  <Button className="w-full mt-2">View Details</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

