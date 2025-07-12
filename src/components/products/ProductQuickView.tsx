
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ExternalLink, X, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { StarRating } from '@/components/reviews/StarRating';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onOpenChange }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  if (!product) {
    return null;
  }
  
  const isWishlisted = isInWishlist(product.id!);
  
  const handleAddToCart = () => {
    addToCart(product);
    onOpenChange(false); // Close dialog on add to cart
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square w-full overflow-hidden rounded-tl-lg rounded-bl-lg">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
              data-ai-hint={product.imageHint || "product image"}
            />
          </div>
          <div className="p-6 flex flex-col space-y-4">
            <div>
              {product.categoryName && <Badge variant="secondary">{product.categoryName}</Badge>}
              <DialogTitle className="text-2xl font-bold font-headline mt-2">{product.name}</DialogTitle>
              <div className="flex items-center gap-4 mt-1">
                <StarRating rating={product.averageRating || 0} disabled />
                <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">{product.description}</p>
            
            {product.productType === 'creator' ? (
                <span className="text-3xl font-bold text-primary">${product.price?.toFixed(2)}</span>
            ) : product.links?.[0] ? (
                 <span className="text-3xl font-bold text-primary">{product.links[0].priceDisplay}</span>
            ) : null}

            <div className="flex flex-col gap-2">
              {product.productType === 'creator' ? (
                 <Button size="lg" onClick={handleAddToCart}>
                    <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                </Button>
              ) : (
                <Button size="lg" asChild>
                    <Link href={product.links?.[0]?.url || '#'} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-5 w-5" /> View on {product.links?.[0]?.vendorName}
                    </Link>
                </Button>
              )}
               <Button size="lg" variant="outline" onClick={() => toggleWishlist(product.id!, product.name)}>
                  <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current text-destructive")} />
                  {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
               </Button>
            </div>
            
            <Separator />

            <Button variant="link" asChild className="p-0 h-auto self-start">
                 <Link href={`/products/${product.slug}`}>
                    View Full Details <ExternalLink className="ml-2 h-4 w-4" />
                </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
