
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Loader2, List, LayoutGrid, ChevronRight, Home, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import type { CategoryNode } from '@/lib/categories-data';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';

const priceRanges = [
  { label: "$0.00 - $50.00", min: 0, max: 50 },
  { label: "$50.00 - $100.00", min: 50, max: 100 },
  { label: "$100.00 - $150.00", min: 100, max: 150 },
  { label: "$150.00 - $200.00", min: 150, max: 200 },
  { label: "$200.00+", min: 200, max: Infinity },
];

export default function ShopPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<number[][]>([]);
  const [sortOption, setSortOption] = useState("featured");

  const { toast } = useToast();

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [productsRes, categoriesRes, bestSellersRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/products?sortBy=sales&limit=5')
        ]);
        if (!productsRes.ok || !categoriesRes.ok || !bestSellersRes.ok) throw new Error("Failed to fetch shop data.");
        
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const bestSellersData = await bestSellersRes.json();
        
        setAllProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setBestSellers(bestSellersData);

      } catch (err: any) {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [toast]);
  
  const applyFiltersAndSort = useCallback(() => {
    let tempProducts = [...allProducts];

    // Category filtering
    if (selectedCategories.length > 0) {
      tempProducts = tempProducts.filter(p => selectedCategories.includes(p.category));
    }
    
    // Price filtering
    if (selectedPriceRanges.length > 0) {
      tempProducts = tempProducts.filter(p => 
        selectedPriceRanges.some(range => p.price! >= range[0] && p.price! <= range[1])
      );
    }
    
    // Sorting
    switch(sortOption) {
      case 'price-asc':
        tempProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-desc':
        tempProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'name-asc':
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        tempProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      // Default 'featured' does no sorting, keeps original order
    }
    
    setFilteredProducts(tempProducts);

  }, [allProducts, selectedCategories, selectedPriceRanges, sortOption]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);
  
  const handleCategoryChange = (categoryName: string, checked: boolean | 'indeterminate') => {
    setSelectedCategories(prev => 
      checked ? [...prev, categoryName] : prev.filter(c => c !== categoryName)
    );
  };
  
  const handlePriceRangeChange = (range: number[], checked: boolean | 'indeterminate') => {
      setSelectedPriceRanges(prev => 
      checked ? [...prev, range] : prev.filter(r => r[0] !== range[0] || r[1] !== range[1])
    );
  };

  const Sidebar = () => (
    <aside className="lg:col-span-1 space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Shop By Department</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center justify-between">
                <label htmlFor={`cat-${cat.id}`} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                   <Checkbox id={`cat-${cat.id}`} onCheckedChange={(c) => handleCategoryChange(cat.name, c)} /> {cat.name}
                </label>
                <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Shop By Price</CardTitle></CardHeader>
        <CardContent>
           <ul className="space-y-2 text-sm">
            {priceRanges.map(range => (
              <li key={range.label} className="flex items-center">
                <label htmlFor={`price-${range.min}`} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                   <Checkbox id={`price-${range.min}`} onCheckedChange={(c) => handlePriceRangeChange([range.min, range.max], c)} /> {range.label}
                </label>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Best Sellers</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? <Skeleton className="h-48 w-full" /> : bestSellers.map(p => (
            <Link href={`/products/${p.slug}`} key={p.id} className="flex gap-3 group">
              <Image src={p.imageUrl} alt={p.name} width={64} height={64} className="rounded-md object-cover border" data-ai-hint={p.imageHint}/>
              <div>
                <p className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary">{p.name}</p>
                <p className="text-xs font-semibold text-primary mt-1">${p.price?.toFixed(2)}</p>
                <div className="flex text-yellow-400 mt-1">{[...Array(5)].map((_,i) => <Star key={i} className="h-3 w-3 fill-current"/>)}</div>
              </div>
            </Link>
          ))}
        </CardContent>
      </Card>
    </aside>
  );

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-6 flex items-center text-sm text-muted-foreground">
            <Link href="/" className="hover:text-primary flex items-center gap-1"><Home className="h-4 w-4"/> Home</Link>
            <ChevronRight className="h-4 w-4 mx-1" />
            <span>Shop</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar />
          <main className="lg:col-span-3">
             <div className="flex flex-col sm:flex-row justify-between items-center border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold font-headline mb-2 sm:mb-0">Shop All</h1>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">View:</span>
                        <Button variant="outline" size="icon"><LayoutGrid className="h-4 w-4"/></Button>
                        <Button variant="ghost" size="icon"><List className="h-4 w-4"/></Button>
                    </div>
                    <Select value={sortOption} onValueChange={setSortOption}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="featured">Sort by: Featured</SelectItem>
                            <SelectItem value="price-asc">Sort by: Price low to high</SelectItem>
                            <SelectItem value="price-desc">Sort by: Price high to low</SelectItem>
                            <SelectItem value="name-asc">Sort by: Name A-Z</SelectItem>
                            <SelectItem value="name-desc">Sort by: Name Z-A</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {[...Array(9)].map((_, i) => <Skeleton key={i} className="h-80 w-full" />)}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            ) : (
                <div className="text-center py-20">
                    <h2 className="text-xl font-semibold">No Products Found</h2>
                    <p className="text-muted-foreground mt-2">Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}
            {/* TODO: Add Pagination */}
          </main>
        </div>
      </div>
    </div>
  );
}
