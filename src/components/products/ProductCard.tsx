
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
            "shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full group",
            className
        )}
    >
      <Link href={`/products/${product.slug || product.id}`} className="block">
        <div className="bg-card border-b border-border p-4 flex-grow flex items-center justify-center relative">
            <div className="aspect-square w-full relative">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                    data-ai-hint={product.imageHint || "product image"}
                />
            </div>
             {product.price && originalPrice && product.price < originalPrice && (
                <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full z-10">
                    - {Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
                </span>
            )}
             {onQuickView && <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                 <Button variant="secondary" size="icon" className="h-8 w-8" onClick={handleQuickViewClick} aria-label="Quick view">
                    <Eye className="h-4 w-4" />
                </Button>
            </div>}
        </div>
      </Link>
      <CardContent className="p-3 text-center flex flex-col flex-grow bg-background">
          {product.categoryName && <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>}
          <h3 className="text-sm font-semibold line-clamp-2 flex-grow group-hover:text-primary transition-colors">
              <Link href={`/products/${product.slug || product.id}`}>{product.name}</Link>
          </h3>
          <div className="flex justify-center my-2">
                <StarRating rating={product.averageRating || 0} size={14} disabled/>
          </div>
          <div className="flex items-baseline justify-center gap-2">
          {product.productType === 'creator' && product.price !== undefined ? (
              <>
                  <span className="font-bold text-primary text-base">${product.price.toFixed(2)}</span>
                  {originalPrice && <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
              </>
          ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
              <span className="font-bold text-primary text-base">{product.links[0].priceDisplay}</span>
          ) : null}
          </div>
      </CardContent>
       <CardFooter className="p-3 pt-0 border-t-transparent group-hover:border-t-border transition-colors duration-300">
          <div className="w-full h-10 flex items-center justify-center">
            {/* This content shows on hover */}
            <div className="flex w-full justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleWishlistClick} aria-label="Add to wishlist">
                    <Heart className={cn("h-4 w-4", isWishlisted && "fill-current text-destructive")} />
                </Button>
                <Button variant="default" size="sm" onClick={handleAddToCartClick} aria-label="Add to cart" className="text-xs px-3 h-8">
                    <ShoppingCart className="mr-2 h-4 w-4"/> Add to cart
                </Button>
            </div>
            {/* This content shows by default (when not hovered) */}
            <div className="text-xs text-muted-foreground opacity-100 group-hover:opacity-0 transition-opacity duration-300">
              Hover to see actions
            </div>
          </div>
        </CardFooter>
    </Card>
  );
};
