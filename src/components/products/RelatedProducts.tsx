
"use client";

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products-data';
import { ProductCard } from './ProductCard';
import { Loader2 } from 'lucide-react';
import { ThumbsUp } from 'lucide-react';

interface RelatedProductsProps {
  categoryId: string;
  currentProductId: string;
}

export function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products?category=${categoryId}&limit=4`);
        if (!response.ok) {
          throw new Error('Failed to fetch related products');
        }
        let data: Product[] = await response.json();
        // Filter out the current product from the results
        data = data.filter(p => p.id !== currentProductId);
        // Ensure we only show up to 3 related products
        setRelatedProducts(data.slice(0, 3));
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRelated();
  }, [categoryId, currentProductId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null; // Don't render the section if no related products are found
  }

  return (
    <section>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight font-headline mb-6 flex items-center">
        <ThumbsUp className="mr-3 h-7 w-7 text-primary" /> You Might Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
