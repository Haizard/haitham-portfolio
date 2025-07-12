
"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Eye, Heart } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from '@/components/reviews/StarRating';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, className }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleWishlistClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product.id) return;
    toggleWishlist(product.id, product.name);
  };
  
  const handleQuickViewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(onQuickView) {
      onQuickView(product);
    }
  };

  const originalPrice = product.price ? product.price * 1.2 : null;
  const isWishlisted = isInWishlist(product.id!);

  return (
    <Card 
        className={cn(
            "group relative flex h-full w-full flex-col overflow-hidden rounded-lg border-2 border-transparent bg-card shadow-md transition-all duration-300 ease-in-out hover:border-primary hover:shadow-xl",
            className
        )}
    >
        <Link href={`/products/${product.slug || product.id}`} className="block h-full flex flex-col">
            <div className="relative flex-1 overflow-hidden bg-muted/30 p-4">
                <div className="relative aspect-square w-full">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        className="object-contain transition-transform duration-500 group-hover:scale-105"
                        data-ai-hint={product.imageHint || "product image"}
                    />
                </div>
                {product.price && originalPrice && product.price < originalPrice && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                        SALE
                    </span>
                )}
            </div>

            <CardContent className="flex flex-col p-4">
                <p className="text-xs font-medium text-muted-foreground">{product.categoryName || 'Category'}</p>
                <h3 className="mt-1 text-base font-semibold text-foreground line-clamp-2">{product.name}</h3>
                <div className="mt-2 flex items-center">
                    <StarRating rating={product.averageRating || 0} size={16} disabled/>
                    <span className="ml-2 text-xs text-muted-foreground">({product.reviewCount})</span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                    {product.productType === 'creator' && product.price !== undefined ? (
                        <>
                            <span className="font-bold text-primary text-lg">${product.price.toFixed(2)}</span>
                            {originalPrice && <span className="text-sm text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
                        </>
                    ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
                        <span className="font-bold text-primary text-lg">{product.links[0].priceDisplay}</span>
                    ) : null}
                </div>
            </CardContent>
        </Link>
        
        {/* Absolute positioned actions for hover state */}
        <div className="absolute top-3 right-3 z-10 flex flex-col items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button variant="secondary" size="icon" className="h-9 w-9 shadow-md" onClick={handleWishlistClick} aria-label="Add to wishlist">
                <Heart className={cn("h-5 w-5", isWishlisted && "fill-current text-destructive")} />
            </Button>
            {onQuickView && (
                 <Button variant="secondary" size="icon" className="h-9 w-9 shadow-md" onClick={handleQuickViewClick} aria-label="Quick view">
                    <Eye className="h-5 w-5" />
                </Button>
            )}
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
            <Button
                size="sm"
                className="w-full translate-y-4 text-sm font-bold opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
                onClick={handleAddToCartClick}
                aria-label="Add to cart"
            >
                <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart
            </Button>
        </div>
    </Card>
  );
};
