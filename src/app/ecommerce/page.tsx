
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Star, Search, ChevronRight, Gamepad2, Watch, Armchair, Zap, Sparkles, Tag, ArrowRight, Flame, Newspaper, Award, Info, ThumbsUp, PackageCheck, Heart, Eye, Store } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import type { BlogPost } from '@/lib/blog-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { ProductCard } from '@/components/products/ProductCard';
import { StarRating } from '@/components/reviews/StarRating';

const mockHotCategories = [
    { name: "Fridges", products: 217, image: "https://placehold.co/300x200.png", imageHint: "refrigerator appliance" },
    { name: "Cameras", products: 35, image: "https://placehold.co/300x200.png", imageHint: "dslr camera photography" },
    { name: "Smartphones", products: 120, image: "https://placehold.co/300x200.png", imageHint: "smartphone mobile" },
    { name: "Audio Gear", products: 88, image: "https://placehold.co/300x200.png", imageHint: "headphones speaker" },
];


export default function EcommerceStorePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [latestArticles, setLatestArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [productsResponse, articlesResponse] = await Promise.all([
          fetch(`/api/products`),
          fetch(`/api/blog?enriched=true&limit=2`) // Fetch 2 latest articles
        ]);

        if (!productsResponse.ok) throw new Error('Failed to fetch products.');
        const productsData: Product[] = await productsResponse.json();
        setAllProducts(productsData);

        if (!articlesResponse.ok) throw new Error('Failed to fetch latest articles.');
        const articlesData: BlogPost[] = await articlesResponse.json();
        setLatestArticles(articlesData);

      } catch (error: any) {
        console.error("[EcommercePage] Error fetching store data:", error);
        toast({ title: "Error Loading Store Data", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  }, [toast]);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const featuredProducts = allProducts.slice(0, 10); 
  const latestProducts = allProducts.slice(0, 4); 
  const bestPickOfTheWeek = allProducts.length > 0 ? allProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))[0] : null;

  return (
    <div className="bg-background text-foreground">
      <header className="py-16 text-center bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <Store className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-bold tracking-tight font-headline text-primary">CreatorOS Store</h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Discover a curated selection of products from our community of talented creators and vendors.
          </p>
        </div>
      </header>
      
      {/* Main content with a little top margin to lift it over the header bottom */}
      <main className="-mt-8">
        {bestPickOfTheWeek && (
          <section className="container mx-auto py-8 md:py-12">
            <div className="bg-card border border-border rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
              <div className="md:w-2/5 relative aspect-square w-full max-w-sm mx-auto md:mx-0">
                <Image src={bestPickOfTheWeek.imageUrl} alt={bestPickOfTheWeek.name} fill className="object-contain rounded-lg drop-shadow-lg" data-ai-hint={bestPickOfTheWeek.imageHint || "highlighted product"}/>
              </div>
              <div className="md:w-3/5 text-center md:text-left">
                <Badge variant="default" className="mb-2 bg-accent text-accent-foreground"><Award className="mr-1.5 h-4 w-4"/>Best Pick of the Week</Badge>
                <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-3">{bestPickOfTheWeek.name}</h2>
                <p className="text-muted-foreground mb-2 line-clamp-3">{bestPickOfTheWeek.description}</p>
                <div className="flex items-center justify-center md:justify-start gap-2 text-yellow-500 mb-4">
                    <StarRating rating={bestPickOfTheWeek.averageRating || 0} disabled/>
                    <span className="text-sm text-muted-foreground ml-1">({bestPickOfTheWeek.reviewCount || 0} reviews)</span>
                </div>
                <div className="text-2xl font-bold text-primary mb-6">
                  {bestPickOfTheWeek.productType === 'creator' && bestPickOfTheWeek.price ? `$${bestPickOfTheWeek.price.toFixed(2)}` : bestPickOfTheWeek.links?.[0]?.priceDisplay || 'Check Price'}
                </div>
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md" asChild>
                  <Link href={`/products/${bestPickOfTheWeek.slug}`}>
                      <ShoppingCart className="mr-2 h-5 w-5"/> View Product
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}
        {!bestPickOfTheWeek && !isLoading && (
          <section className="container mx-auto py-8 md:py-12 text-center">
            <p className="text-muted-foreground">No products available to feature as Best Pick of the Week.</p>
          </section>
        )}

        {/* Featured Products Section */}
        <section className="container mx-auto py-6 md:py-10">
          <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold font-headline flex items-center gap-2"><ThumbsUp className="text-primary h-7 w-7"/>Featured Products</h2>
          </div>
          {isLoading && featuredProducts.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {[...Array(10)].map((_,i) => <Card key={i} className="aspect-[3/4] bg-muted animate-pulse"></Card>)}
              </div>
          ) : featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No featured products available.</p>
          )}
        </section>

        {/* Latest Products Section */}
        {latestProducts.length > 0 && (
          <section className="container mx-auto py-6 md:py-10">
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6 flex items-center gap-2"><PackageCheck className="text-primary h-7 w-7"/>Latest Arrivals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {latestProducts.map(product => (
                <ProductCard key={`latest-${product.id}`} product={product} size="small"/>
              ))}
            </div>
          </section>
        )}
        {!isLoading && latestProducts.length === 0 && allProducts.length > 0 && (
          <section className="container mx-auto py-6 md:py-10 text-center">
            <p className="text-muted-foreground">No new products marked as latest arrivals from the current product list.</p>
          </section>
        )}

        {/* Hot Categories Section */}
        <section className="container mx-auto py-6 md:py-10">
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6 text-center flex items-center justify-center gap-2"><Flame className="text-destructive h-7 w-7"/>Hot Categories This Week</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockHotCategories.map(cat => (
              <Card key={cat.name} className="shadow-lg overflow-hidden group hover:shadow-2xl transition-shadow duration-300 border-2 border-transparent hover:border-primary">
                <div className="relative aspect-[3/2]">
                  <Image src={cat.image} alt={cat.name} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={cat.imageHint}/>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-semibold">{cat.name}</h3>
                    <p className="text-xs">{cat.products} products</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Latest Articles Section */}
        {latestArticles.length > 0 && (
          <section className="container mx-auto py-6 md:py-10">
            <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6 flex items-center gap-2"><Newspaper className="text-primary h-7 w-7"/>From Our Blog</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {latestArticles.map(article => (
                <Card key={article.slug} className="shadow-lg hover:shadow-xl transition-shadow flex group">
                  {article.featuredImageUrl && (
                    <div className="w-1/3 relative overflow-hidden rounded-l-lg">
                      <Image src={article.featuredImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" data-ai-hint={article.featuredImageHint || "blog article"}/>
                    </div>
                  )}
                  <div className={cn("w-2/3 flex flex-col", !article.featuredImageUrl && "w-full")}>
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary">{article.title}</CardTitle>
                      <CardDescription className="text-xs">By {article.author} on {new Date(article.date).toLocaleDateString()}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground line-clamp-2">{article.content.replace(/<[^>]+>/g, '').substring(0, 80)}...</p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="link" asChild className="p-0 text-primary">
                        <Link href={`/blog/${article.slug}`}>Read More <ArrowRight className="ml-1 h-4 w-4"/></Link>
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
    