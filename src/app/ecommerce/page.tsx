
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, ChevronRight, Gamepad2, Headphones, Layers, List, Monitor, Newspaper, Percent, Smartphone, Star, Tv2 } from "lucide-react";
import Image from "next/image";
import type { Product } from '@/lib/products-data';
import type { BlogPost } from '@/lib/blog-data';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/ProductCard'; // We will use the updated ProductCard
import { Skeleton } from '@/components/ui/skeleton';


const categoryIcons = {
  "Laptops & Computers": Monitor,
  "Cameras & Photography": Headphones, // Placeholder, no camera icon
  "Smartphones & Tablets": Smartphone,
  "Video Games & Consoles": Gamepad2,
  "TV & Audio": Tv2,
};

const departments = [
    { name: "Value of The Day", icon: Percent },
    { name: "Top 100 Offers", icon: Star },
    { name: "New Arrivals", icon: Layers },
    ...Object.keys(categoryIcons).map(name => ({ name, icon: categoryIcons[name as keyof typeof categoryIcons] }))
];


export default function EcommerceStorePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestArticles, setLatestArticles] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAllData = useCallback(async () => {
      setIsLoading(true);
      try {
        const [productsResponse, articlesResponse] = await Promise.all([
          fetch(`/api/products?limit=12`),
          fetch(`/api/blog?enriched=true&limit=2`) 
        ]);

        if (!productsResponse.ok) throw new Error('Failed to fetch products.');
        const productsData: Product[] = await productsResponse.json();
        
        // Split product data for different sections
        setNewProducts(productsData.slice(0, 5));
        setBestSellers(productsData.slice(5, 10));
        setFeaturedProducts(productsData.slice(2, 7)); // Overlap for variety
        

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

  const renderProductRow = (products: Product[], isLoading: boolean, count: number) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[...Array(count)].map((_, i) => <Skeleton key={i} className="h-64 w-full bg-muted" />)}
        </div>
      );
    }
    if (products.length === 0) return <p className="text-muted-foreground">No products to display in this section.</p>;
    
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products.map(p => <ProductCard key={p.id} product={p}/>)}
        </div>
    );
  };
  

  return (
    <div className="bg-background">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card>
              <CardHeader className="bg-muted/50">
                <CardTitle className="flex items-center gap-2 text-base"><List className="h-5 w-5"/> Shop By Department</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                  {departments.map((dept, index) => (
                     <AccordionItem value={`item-${index}`} key={dept.name} className="border-b-0">
                      <AccordionTrigger className="text-sm font-medium hover:bg-accent/50 rounded-md px-2 py-1.5 hover:no-underline">
                        <div className="flex items-center gap-2">
                           <dept.icon className="h-4 w-4 text-primary"/> {dept.name}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pl-4 py-1 text-sm">
                        {/* Placeholder for sub-categories */}
                        <Link href="#" className="block py-1 hover:text-primary">Sub-category 1</Link>
                        <Link href="#" className="block py-1 hover:text-primary">Sub-category 2</Link>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-12">
            {/* Hero Section */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 rounded-lg overflow-hidden relative aspect-[2/1]">
                 <Image src="https://placehold.co/800x400.png" alt="Books for Cooks" fill className="object-cover" data-ai-hint="cooking books"/>
                 <div className="absolute inset-0 bg-black/30 flex flex-col justify-center p-8">
                    <h2 className="text-4xl font-bold text-white">BOOKS FOR COOKS</h2>
                    <p className="text-white/90 mt-2">Find your next new recipe</p>
                    <Button className="mt-4 w-fit bg-accent text-accent-foreground hover:bg-accent/80">Shop Now</Button>
                 </div>
              </div>
              <div className="space-y-4">
                <div className="rounded-lg overflow-hidden relative aspect-[3/2]">
                    <Image src="https://placehold.co/400x300.png" alt="Headphones deal" fill className="object-cover" data-ai-hint="headphones product"/>
                    <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                        <h3 className="font-semibold text-white">Big Sale -50%</h3>
                        <p className="text-xs text-white/80">Headphones & Headsets</p>
                    </div>
                </div>
                 <div className="rounded-lg overflow-hidden relative aspect-[3/2]">
                    <Image src="https://placehold.co/400x300.png" alt="Gaming console" fill className="object-cover" data-ai-hint="gaming console"/>
                     <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-4">
                        <h3 className="font-semibold text-white">New Arrivals</h3>
                        <p className="text-xs text-white/80">Game Console</p>
                    </div>
                </div>
              </div>
            </section>
            
            {/* New Products */}
            <section>
                <h2 className="text-2xl font-bold mb-4">New Products</h2>
                {renderProductRow(newProducts, isLoading, 5)}
            </section>

             {/* Ad Banners */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="rounded-lg overflow-hidden relative aspect-video"><Image src="https://placehold.co/600x400.png" alt="Ad banner 1" fill className="object-cover" data-ai-hint="smartphone ad"/></div>
                <div className="rounded-lg overflow-hidden relative aspect-video"><Image src="https://placehold.co/600x400.png" alt="Ad banner 2" fill className="object-cover" data-ai-hint="camera ad"/></div>
                <div className="rounded-lg overflow-hidden relative aspect-video"><Image src="https://placehold.co/600x400.png" alt="Ad banner 3" fill className="object-cover" data-ai-hint="fruit juicy"/></div>
            </section>

            {/* Best Sellers */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Best Sellers</h2>
                {renderProductRow(bestSellers, isLoading, 5)}
            </section>

            {/* Featured Products */}
            <section>
                <h2 className="text-2xl font-bold mb-4">Featured Products</h2>
                 {renderProductRow(featuredProducts, isLoading, 5)}
            </section>

            {/* From Our Blog */}
            <section>
                <h2 className="text-2xl font-bold mb-4">From Our Blog</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {isLoading ? (
                    <>
                        <Skeleton className="h-48 w-full bg-muted" />
                        <Skeleton className="h-48 w-full bg-muted" />
                    </>
                ) : latestArticles.length > 0 ? (
                    latestArticles.map(article => (
                    <Card key={article.slug} className="shadow-none border-none flex gap-4">
                        <div className="flex-shrink-0">
                             <Image src={article.featuredImageUrl || 'https://placehold.co/150x150.png'} alt={article.title} width={150} height={150} className="object-cover rounded-lg aspect-square" data-ai-hint={article.featuredImageHint || "blog post"}/>
                        </div>
                        <div className="flex flex-col">
                            <CardHeader className="p-0 mb-2">
                                <CardTitle className="text-base font-semibold leading-snug hover:text-primary"><Link href={`/blog/${article.slug}`}>{article.title}</Link></CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 text-xs text-muted-foreground flex-grow">
                                <p className="line-clamp-3">{article.content.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                            </CardContent>
                            <Button variant="link" asChild className="p-0 h-auto mt-2 justify-start text-primary">
                                <Link href={`/blog/${article.slug}`}>Read More <ArrowRight className="ml-1 h-4 w-4"/></Link>
                            </Button>
                        </div>
                    </Card>
                    ))
                ) : (
                    <p className="text-muted-foreground">No recent articles.</p>
                )}
                </div>
            </section>

          </main>
        </div>
      </div>
    </div>
  );
}
