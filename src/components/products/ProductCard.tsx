
"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, ExternalLink, Heart, Eye } from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from '@/components/reviews/StarRating';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';

interface ProductCardProps {
  product: Product;
  className?: string;
  size?: 'small' | 'default';
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className, size = 'default' }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id!);
  const [isHovered, setIsHovered] = useState(false);
  const originalPrice = product.price ? product.price * 1.2 : null;

  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id!, product.name);
  };
  
  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  return (
    <Card 
        className={cn(
            "shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group",
            size === 'small' ? 'h-full' : '',
            className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("bg-muted overflow-hidden relative", size === 'small' ? 'aspect-[1/1]' : 'aspect-[4/3]')}>
        <Button
            size="icon"
            variant="ghost"
            className="absolute top-2 right-2 z-10 h-8 w-8 rounded-full bg-card/60 hover:bg-card text-destructive"
            onClick={handleWishlistClick}
            aria-label="Add to wishlist"
        >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-destructive")} />
        </Button>
        <Link href={`/products/${product.slug || product.id}`}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={size === 'small' ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw" }
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.imageHint || "product image"}
          />
        </Link>
        {product.price && originalPrice && product.price < originalPrice && (
            <Badge variant="destructive" className="absolute top-2 left-2 text-xs z-10">
                -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
            </Badge>
        )}
         <div 
            className={cn(
                "absolute bottom-0 left-0 right-0 p-2 flex justify-center items-stretch gap-2 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isHovered && "opacity-100",
                size === 'small' && 'p-1.5 gap-1'
            )}
        >
            <Button size={size === 'small' ? 'xs' : 'sm'} variant="outline" className="text-xs flex-1 h-8" asChild>
                <Link href={`/products/${product.slug || product.id}`}>
                    <Eye className="mr-1 h-3.5 w-3.5" /> View
                </Link>
            </Button>
             {product.productType === 'creator' && (
                <Button size={size === 'small' ? 'xs' : 'sm'} variant="primary" className="text-xs flex-1 h-8" onClick={handleAddToCartClick}>
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Cart
                </Button>
            )}
            {product.productType === 'affiliate' && product.links && product.links.length > 0 && (
                 <Button size={size === 'small' ? 'xs' : 'sm'} variant="secondary" className="text-xs flex-1 h-8" asChild>
                    <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> Offer
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <CardContent className={cn("p-3 flex-grow flex flex-col", size === 'small' && 'p-2')}>
        {product.category && <span className={cn("text-xs text-muted-foreground mb-1", size === 'small' && 'text-[0.65rem] mb-0.5')}>{product.category}</span>}
        <CardTitle className={cn("font-semibold line-clamp-2 mb-1", size === 'small' ? 'text-xs leading-tight' : 'text-sm')}>
            <Link href={`/products/${product.slug || product.id}`} className="hover:text-primary transition-colors">
                {product.name}
            </Link>
        </CardTitle>
        {product.vendorName && (
             <Link href={`/store/${product.vendorId}`} className={cn("text-xs font-medium text-muted-foreground hover:text-primary transition-colors", size === 'small' && 'text-[0.65rem] mb-0.5')}>
                by {product.vendorName}
            </Link>
        )}
        <div className="flex items-center my-1 gap-2 flex-wrap">
          <div className="flex items-center">
            <StarRating rating={product.averageRating || 0} size={size === 'small' ? 10 : 12} disabled/>
           <span className={cn("text-xs text-muted-foreground ml-1", size === 'small' && 'text-[0.65rem] ml-0.5')}>({product.reviewCount || 0})</span>
          </div>
           <span className={cn("text-xs text-muted-foreground", size === 'small' && 'text-[0.65rem]')}>({product.sales || 0} sold)</span>
        </div>
        <div className={cn("mt-auto pt-1", size === 'small' && 'pt-0.5')}>
        {product.productType === 'creator' && product.price !== undefined ? (
            <div className="flex items-baseline gap-1.5">
                <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>${product.price.toFixed(2)}</span>
                {originalPrice && <span className={cn("text-xs text-muted-foreground line-through", size === 'small' && 'text-[0.65rem]')}>${originalPrice.toFixed(2)}</span>}
            </div>
            ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
            <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>{product.links[0].priceDisplay}</span>
            ) : (
            <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>Price N/A</span>
            )}
        </div>
      </CardContent>
    </Card>
  );
};
