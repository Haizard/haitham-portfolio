
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, ExternalLink, X, Heart, MessageSquare, Store } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { StarRating } from '@/components/reviews/StarRating';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';

interface ProductQuickViewProps {
  product: Product | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export const ProductQuickView: React.FC<ProductQuickViewProps> = ({ product, isOpen, onOpenChange }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

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
      <DialogContent className="sm:max-w-4xl p-0 h-[90vh] flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 h-full">
          <div className="relative w-full h-full overflow-hidden rounded-tl-lg rounded-bl-lg hidden md:block">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-contain"
              data-ai-hint={product.imageHint || "product image"}
            />
          </div>
          <div className="p-6 flex flex-col">
             <ScrollArea className="h-full pr-4">
              <div className="space-y-4">
                <div>
                  {product.categoryName && <Badge variant="secondary">{product.categoryName}</Badge>}
                  <DialogTitle className="text-2xl lg:text-3xl font-bold font-headline mt-2">{product.name}</DialogTitle>
                  <div className="flex items-center gap-4 mt-2">
                    <StarRating rating={product.averageRating || 0} disabled />
                    <span className="text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
                
                 <Separator/>

                 <div className="space-y-3">
                    <h4 className="font-semibold text-sm">Seller Information</h4>
                    <div className="flex items-center justify-between p-3 rounded-md bg-secondary/50">
                        <div className="flex items-center gap-3">
                            <Avatar>
                                <AvatarImage src="https://placehold.co/100x100.png?text=V" alt={product.vendorName} data-ai-hint="vendor avatar"/>
                                <AvatarFallback>{product.vendorName?.substring(0,1)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-xs text-muted-foreground">Sold by</p>
                                <Link href={`/store/${product.vendorId}`} className="font-semibold hover:text-primary transition-colors text-sm">{product.vendorName}</Link>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/store/${product.vendorId}`}><Store className="mr-2 h-4 w-4"/>Visit Shop</Link>
                            </Button>
                              <Button size="sm" variant="ghost" onClick={() => toast({title: "Coming Soon!", description: "Messaging feature is under development."})}>
                                <MessageSquare className="mr-2 h-4 w-4"/> Message
                            </Button>
                        </div>
                    </div>
                 </div>

              </div>
            </ScrollArea>
             <div className="mt-auto pt-6 space-y-4">
                 {product.productType === 'creator' ? (
                    <span className="text-3xl lg:text-4xl font-bold text-primary">${product.price?.toFixed(2)}</span>
                ) : product.links?.[0] ? (
                    <span className="text-3xl lg:text-4xl font-bold text-primary">{product.links[0].priceDisplay}</span>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-3">
                  {product.productType === 'creator' ? (
                    <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                        <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                    </Button>
                  ) : (
                    <Button size="lg" asChild className="flex-1">
                        <Link href={product.links?.[0]?.url || '#'} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-5 w-5" /> View on {product.links?.[0]?.vendorName}
                        </Link>
                    </Button>
                  )}
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => toggleWishlist(product.id!, product.name)}>
                      <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current text-destructive")} />
                      {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                  </Button>
                </div>
                 <Button variant="link" asChild className="p-0 h-auto self-start mx-auto block mt-2 text-sm">
                    <Link href={`/products/${product.slug}`}>
                        View Full Product Details <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
