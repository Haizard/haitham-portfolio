
"use client";

import { useEffect, useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Loader2, Package, Layers, Info, Tag as TagIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ALL_CATEGORIES_FILTER = "All";
const ALL_PRODUCT_TYPES_FILTER = "All Types";

export default function EcommercePage() {
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
        setFilteredProducts(data); // Initially display all products
      } catch (error: any) {
        console.error("Error fetching products for e-commerce page:", error);
        toast({
          title: "Error Loading Products",
          description: error.message || "Could not load products. Check server logs for more details.",
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
    allProducts.forEach(product => {
      if (product.category) categories.add(product.category);
    });
    return [ALL_CATEGORIES_FILTER, ...Array.from(categories).sort()];
  }, [allProducts]);

  const productTypes = useMemo(() => {
    const types = new Set<string>();
    allProducts.forEach(product => types.add(product.productType));
    return [ALL_PRODUCT_TYPES_FILTER, ...Array.from(types).sort((a,b) => a.localeCompare(b))];
  }, [allProducts]);

  const applyFilters = () => {
    let tempProducts = allProducts;

    if (selectedCategory !== ALL_CATEGORIES_FILTER) {
      tempProducts = tempProducts.filter(product => product.category === selectedCategory);
    }

    if (selectedProductType !== ALL_PRODUCT_TYPES_FILTER) {
      tempProducts = tempProducts.filter(product => product.productType === selectedProductType);
    }
    setFilteredProducts(tempProducts);
  };

  useEffect(() => {
    applyFilters();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedProductType, allProducts]);


  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Package className="mr-3 h-10 w-10 text-primary" />
          E-commerce Store
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Browse affiliate recommendations and my own exclusive products.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div>
          <h2 className="text-lg font-semibold mb-3">Filter by Category:</h2>
          <div className="flex flex-wrap gap-2">
            {uniqueCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="text-sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-3">Filter by Product Type:</h2>
          <div className="flex flex-wrap gap-2">
            {productTypes.map(type => (
              <Button
                key={type}
                variant={selectedProductType === type ? "default" : "outline"}
                onClick={() => setSelectedProductType(type)}
                className="text-sm capitalize"
              >
                {type === ALL_PRODUCT_TYPES_FILTER ? "All Types" : type}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
       <Alert className="mb-8 border-accent bg-accent/10 text-accent-foreground [&>svg]:text-accent">
        <Info className="h-5 w-5" />
        <AlertTitle className="font-semibold">Affiliate Disclosure</AlertTitle>
        <AlertDescription className="text-sm">
          Some products on this page are affiliate links. If you purchase through these links, 
          CreatorOS may earn a small commission at no extra cost to you. Thank you for your support!
        </AlertDescription>
      </Alert>

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
                    No products match your current filter selection.
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
                  height={375} 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  data-ai-hint={product.imageHint}
                />
              </div>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start mb-1">
                    <CardTitle className="text-xl font-semibold line-clamp-2">{product.name}</CardTitle>
                    <Badge variant={product.productType === 'affiliate' ? "secondary" : "default"} className="text-xs whitespace-nowrap shrink-0 ml-2 capitalize">
                      {product.productType === 'affiliate' ? <Layers className="mr-1 h-3 w-3"/> : <Package className="mr-1 h-3 w-3"/>}
                      {product.productType}
                    </Badge>
                </div>
                <CardDescription className="text-sm line-clamp-3 h-[3.75rem]">{product.description}</CardDescription> 
                 {product.category && <Badge variant="outline" className="text-xs mt-2 self-start">{product.category}</Badge>}
              </CardHeader>
              <CardContent className="flex-grow space-y-3 pt-0">
                {product.productType === 'affiliate' && product.links && product.links.map((link, index) => (
                  <Button key={index} asChild variant="outline" className="w-full justify-start hover:border-primary">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer sponsored">
                      <ShoppingCart className="mr-2 h-4 w-4 text-primary" />
                      {link.vendorName}: <span className="font-semibold ml-1">{link.priceDisplay}</span>
                      <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground" />
                    </Link>
                  </Button>
                ))}
                {product.productType === 'creator' && product.price !== undefined && (
                  <>
                    <p className="text-2xl font-bold text-primary">${product.price.toFixed(2)}</p>
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => toast({title: "Coming Soon!", description: "Shopping cart functionality is under development."})}>
                      <ShoppingCart className="mr-2 h-4 w-4" /> Add to Cart (Coming Soon)
                    </Button>
                  </>
                )}
              </CardContent>
              {product.tags && product.tags.length > 0 && (
                <CardFooter className="pt-2 pb-4">
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs flex items-center"><TagIcon className="mr-1 h-3 w-3"/>{tag}</Badge>)}
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

    