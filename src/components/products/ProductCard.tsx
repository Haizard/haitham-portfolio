
"use client";

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from '@/components/reviews/StarRating';
import { useCart } from '@/hooks/use-cart';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView, className }) => {
  const { addToCart } = useCart();

  const handleAddToCartClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };
  
  const handleQuickViewClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(onQuickView) {
      onQuickView(product);
    }
  };

  const originalPrice = product.price ? product.price * 1.2 : null;

  return (
    <Link href={`/products/${product.slug || product.id}`} className="block group">
        <Card 
            className={cn(
                "shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden h-full",
                className
            )}
        >
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
             {onQuickView && <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                 <Button variant="secondary" size="sm" onClick={handleQuickViewClick}>
                    <Eye className="mr-2 h-4 w-4" /> Quick View
                </Button>
            </div>}
        </div>
        <CardContent className="p-3 text-center flex flex-col flex-grow bg-background">
            {product.categoryName && <p className="text-xs text-muted-foreground mb-1">{product.categoryName}</p>}
            <h3 className="text-sm font-semibold line-clamp-2 flex-grow group-hover:text-primary transition-colors">
                {product.name}
            </h3>
            <div className="flex justify-center my-2">
                 <StarRating rating={product.averageRating || 0} size={14} disabled/>
            </div>
            <div className="flex items-baseline justify-center gap-2 mt-auto">
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
        </Card>
    </Link>
  );
};
