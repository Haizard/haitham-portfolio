
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Loader2, Layers, Info } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AffiliateProduct } from '@/lib/affiliate-products-data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ALL_CATEGORIES_FILTER = "All";

export default function AffiliateShowcasePage() {
  const [allProducts, setAllProducts] = useState<AffiliateProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<AffiliateProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_FILTER);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/affiliate-products`);
        if (!response.ok) {
          throw new Error('Failed to fetch affiliate products');
        }
        const data: AffiliateProduct[] = await response.json();
        setAllProducts(data);
        setFilteredProducts(data); // Initially show all products
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load affiliate products.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => categories.add(product.category));
    return [ALL_CATEGORIES_FILTER, ...Array.from(categories).sort()];
  }, [allProducts]);

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    if (category === ALL_CATEGORIES_FILTER) {
      setFilteredProducts(allProducts);
    } else {
      setFilteredProducts(allProducts.filter(product => product.category === category));
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Layers className="mr-3 h-10 w-10 text-primary" />
          Affiliate Showcase
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Discover recommended products and services. Your purchases through these links help support CreatorOS.
        </p>
      </header>

      <Alert className="mb-8 border-accent bg-accent/10 text-accent-foreground [&>svg]:text-accent">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-semibold">Affiliate Disclosure</AlertTitle>
        <AlertDescription className="text-sm">
          This page contains affiliate links. If you purchase a product or service through one of these links, 
          CreatorOS may earn a small commission at no extra cost to you. Thank you for your support!
        </AlertDescription>
      </Alert>

      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Filter by Category:</h2>
        <div className="flex flex-wrap gap-2">
          {uniqueCategories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => handleCategoryFilter(category)}
              className="text-sm"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center shadow-lg">
            <CardHeader>
                <CardTitle>No Products Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    {selectedCategory === ALL_CATEGORIES_FILTER 
                        ? "There are no products in the showcase yet." 
                        : `No products found in the "${selectedCategory}" category.`}
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
              <div className="aspect-[16/10] overflow-hidden bg-muted">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={375} // Adjusted for 16:10 aspect ratio
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={product.imageHint}
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-xl font-semibold line-clamp-2">{product.name}</CardTitle>
                    <Badge variant="secondary" className="text-xs whitespace-nowrap shrink-0 ml-2">{product.category}</Badge>
                </div>
                <CardDescription className="text-sm line-clamp-3 h-[3.75rem]">{product.description}</CardDescription> 
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-0">
                {product.links.map((link, index) => (
                  <Button key={index} asChild variant="outline" className="w-full justify-start hover:border-primary">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer sponsored">
                      <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                      {link.vendorName}: <span className="font-semibold ml-1">{link.priceDisplay}</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
              {product.tags && product.tags.length > 0 && (
                <CardFooter className="pt-2 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                  </div>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
