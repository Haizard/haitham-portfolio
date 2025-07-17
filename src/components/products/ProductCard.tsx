
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
import { motion } from 'framer-motion';

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
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Card 
          className={cn(
              "group relative flex w-full flex-col overflow-hidden rounded-lg border-gray-700 bg-gray-800 text-white shadow-lg",
              className
          )}
      >
        <div className="absolute top-2 right-2 z-20 flex flex-col items-center gap-1.5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800" onClick={handleWishlistClick} aria-label="Add to wishlist">
                  <Heart className={cn("h-4 w-4 text-gray-400", isWishlisted && "fill-destructive text-destructive")} />
              </Button>
              {onQuickView && (
                   <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-md bg-gray-900/70 backdrop-blur-sm hover:bg-gray-800" onClick={handleQuickViewClick} aria-label="Quick view">
                      <Eye className="h-4 w-4 text-primary" />
                  </Button>
              )}
          </div>

          <Link href={`/products/${product.slug || product.id}`} className="block h-full flex flex-col">
              <div className="relative overflow-hidden bg-gray-900/50 p-2">
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
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full z-10">
                          SALE
                      </span>
                  )}
              </div>
              
              <div className="p-4 flex flex-col flex-grow">
                  <p className="text-xs font-medium text-gray-400">{product.categoryName || 'Category'}</p>
                  <h3 className="mt-1 text-sm font-semibold text-white line-clamp-2">{product.name}</h3>
                  <div className="mt-2 flex items-center">
                      <StarRating rating={product.averageRating || 0} size={14} disabled/>
                      <span className="ml-1.5 text-xs text-gray-400">({product.reviewCount})</span>
                  </div>
              </div>
               <CardFooter className="p-3 mt-auto border-t border-gray-700">
                  <div className="w-full flex items-center justify-between">
                      {product.productType === 'creator' && product.price !== undefined ? (
                          <div className="flex items-baseline gap-1.5">
                              <span className="font-bold text-primary text-base">${product.price.toFixed(2)}</span>
                              {originalPrice && <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>}
                          </div>
                      ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
                          <span className="font-bold text-primary text-sm">{product.links[0].priceDisplay}</span>
                      ) :  <div />}

                       <Button
                          size="sm"
                          className="h-8 bg-primary/20 text-primary hover:bg-primary/30"
                          variant="secondary"
                          onClick={handleAddToCartClick}
                          aria-label="Add to cart"
                      >
                          <ShoppingCart className="h-4 w-4" />
                      </Button>
                  </div>
              </CardFooter>
          </Link>
      </Card>
    </motion.div>
  );
};
