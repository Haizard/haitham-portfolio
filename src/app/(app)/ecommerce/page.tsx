
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Loader2, Store, Filter, Layers, UserSquare } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';

const ALL_CATEGORIES_FILTER = "All Categories";
const ALL_PRODUCT_TYPES_FILTER = "All Types";
const CREATOR_PRODUCTS_FILTER = "My Products";
const AFFILIATE_PRODUCTS_FILTER = "Affiliate";


export default function EcommerceStorePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_FILTER);
  const [selectedProductType, setSelectedProductType] = useState<string>(ALL_PRODUCT_TYPES_FILTER);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products`);
        if (!response.ok) {
          let serverErrorMessage = 'Failed to fetch products from the server.';
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              serverErrorMessage = `Server error: ${errorData.message}`;
            }
          } catch (jsonError) {
            serverErrorMessage = `Server error: ${response.status} ${response.statusText || 'Unknown error'}`;
          }
          throw new Error(serverErrorMessage);
        }
        const data: Product[] = await response.json();
        setAllProducts(data);
        setFilteredProducts(data); // Initially show all
      } catch (error: any) {
        console.error("Error fetching products for store:", error);
        toast({
          title: "Error Loading Products",
          description: error.message || "Could not load products for the store. Check server logs.",
          variant: "destructive",
        });
        setAllProducts([]);
        setFilteredProducts([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const uniqueCategories = useMemo(() => {
    const categories = new Set<string>();
    allProducts.forEach(product => {
      if (product.category) categories.add(product.category);
    });
    return [ALL_CATEGORIES_FILTER, ...Array.from(categories).sort()];
  }, [allProducts]);

  const productTypeOptions = [ALL_PRODUCT_TYPES_FILTER, CREATOR_PRODUCTS_FILTER, AFFILIATE_PRODUCTS_FILTER];

  useEffect(() => {
    let tempFiltered = allProducts;

    if (selectedCategory !== ALL_CATEGORIES_FILTER) {
      tempFiltered = tempFiltered.filter(product => product.category === selectedCategory);
    }

    if (selectedProductType === CREATOR_PRODUCTS_FILTER) {
      tempFiltered = tempFiltered.filter(product => product.productType === 'creator');
    } else if (selectedProductType === AFFILIATE_PRODUCTS_FILTER) {
      tempFiltered = tempFiltered.filter(product => product.productType === 'affiliate');
    }
    // If ALL_PRODUCT_TYPES_FILTER, no type filtering is done on tempFiltered here

    setFilteredProducts(tempFiltered);
  }, [selectedCategory, selectedProductType, allProducts]);


  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to Cart (Mock)",
      description: `${product.name} would be added to your cart.`,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Store className="mr-3 h-10 w-10 text-primary" />
          Our Store
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Browse our curated collection of products and recommendations.
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start md:items-center">
        <div className="flex-grow">
            <h2 className="text-lg font-semibold mb-2 flex items-center"><Filter className="mr-2 h-5 w-5 text-muted-foreground"/>Filter Products:</h2>
            <div className="flex flex-wrap gap-3">
                {/* Category Filter */}
                <div>
                    <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
                    <select
                        id="category-filter"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="p-2 border rounded-md bg-background text-sm min-w-[180px] h-10 focus:ring-primary focus:border-primary"
                    >
                        {uniqueCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </div>
                {/* Product Type Filter */}
                <div>
                    <label htmlFor="type-filter" className="sr-only">Filter by Product Type</label>
                    <select
                        id="type-filter"
                        value={selectedProductType}
                        onChange={(e) => setSelectedProductType(e.target.value)}
                        className="p-2 border rounded-md bg-background text-sm min-w-[180px] h-10 focus:ring-primary focus:border-primary"
                    >
                        {productTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
         <p className="text-sm text-muted-foreground md:text-right mt-4 md:mt-0">
            Showing {filteredProducts.length} of {allProducts.length} products.
        </p>
      </div>


      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <Card className="text-center shadow-lg py-10">
            <CardHeader>
                <CardTitle>No Products Found</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">
                    No products match your current filters. Try adjusting them or check back later!
                </p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
              <div className="aspect-[16/10] overflow-hidden bg-muted relative">
                <Image
                  src={product.imageUrl}
                  alt={product.name}
                  width={600}
                  height={375}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={product.imageHint}
                />
                 <Badge 
                    variant={product.productType === 'creator' ? "default" : "secondary"} 
                    className="absolute top-2 right-2 text-xs"
                  >
                    {product.productType === 'creator' ? <UserSquare className="h-3 w-3 mr-1" /> : <Layers className="h-3 w-3 mr-1" />}
                    {product.productType === 'creator' ? 'Our Product' : 'Affiliate'}
                  </Badge>
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-xl font-semibold line-clamp-2">{product.name}</CardTitle>
                    {product.category && <Badge variant="outline" className="text-xs whitespace-nowrap shrink-0 ml-2">{product.category}</Badge>}
                </div>
                <CardDescription className="text-sm line-clamp-3 h-[3.75rem]">{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-0">
                {product.productType === 'creator' && product.price !== undefined && (
                  <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                )}
                {product.productType === 'affiliate' && product.links && product.links.map((link, index) => (
                  <Button key={index} asChild variant="outline" size="sm" className="w-full justify-start hover:border-primary">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer sponsored">
                      <ExternalLink className="mr-2 h-4 w-4 text-muted-foreground" />
                      {link.vendorName}: <span className="font-semibold ml-1">{link.priceDisplay}</span>
                    </Link>
                  </Button>
                ))}
              </CardContent>
              <CardFooter className="border-t pt-4">
                {product.productType === 'creator' ? (
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart (Mock)
                  </Button>
                ) : (
                  <Button asChild variant="default" className="w-full">
                    <Link href={product.links?.[0]?.url || '#'} target="_blank" rel="noopener noreferrer sponsored">
                        View on {product.links?.[0]?.vendorName || 'Vendor Site'} <ExternalLink className="ml-2 h-4 w-4"/>
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

    