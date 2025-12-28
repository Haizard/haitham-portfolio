
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowRight, ChevronRight, Gamepad2, Headphones, Layers, List, Monitor, Newspaper, Percent, Smartphone, Star, Tv2, Package as PackageIcon } from "lucide-react";
import Image from "next/image";
import type { Product } from '@/lib/products-data';
import type { BlogPost } from '@/lib/blog-data';
import type { ProductCategoryNode } from '@/lib/product-categories-data';
import { useToast } from '@/hooks/use-toast';
import { ProductCard } from '@/components/products/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { FeaturedVendorsCarousel } from '@/components/products/FeaturedVendorsCarousel';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import { Separator } from '@/components/ui/separator';
import { EcommerceHeader } from '@/components/ecommerce/ecommerce-header';


const categoryIcons: { [key: string]: React.ElementType } = {
  "default": PackageIcon,
  "laptops-computers": Monitor,
  "cameras-photography": Headphones, // Placeholder
  "smartphones-tablets": Smartphone,
  "video-games-consoles": Gamepad2,
  "tv-audio": Tv2,
};

const staticDepartments = [
  { name: "Value of The Day", icon: Percent, slug: "deals" },
  { name: "Top 100 Offers", icon: Star, slug: "top-offers" },
  { name: "New Arrivals", icon: Layers, slug: "new-arrivals" },
];


export default function EcommerceStorePage() {
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [latestArticles, setLatestArticles] = useState<BlogPost[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategoryNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productsResponse, articlesResponse, categoriesResponse] = await Promise.all([
        fetch(`/api/products?limit=12`),
        fetch(`/api/blog?enriched=true&limit=2`),
        fetch('/api/product-categories'),
      ]);

      if (!productsResponse.ok) throw new Error('Failed to fetch products.');
      const productsData: Product[] = await productsResponse.json();

      setNewProducts(productsData.slice(0, 5));
      setBestSellers(productsData.slice(5, 10));
      setFeaturedProducts(productsData.slice(2, 7));

      if (!articlesResponse.ok) throw new Error('Failed to fetch latest articles.');
      const articlesData: BlogPost[] = await articlesResponse.json();
      setLatestArticles(articlesData);

      if (!categoriesResponse.ok) throw new Error('Failed to fetch product categories.');
      const categoriesData: ProductCategoryNode[] = await categoriesResponse.json();
      setProductCategories(categoriesData);

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
        {products.map(p => <ProductCard key={p.id} product={p} onQuickView={handleQuickView} />)}
      </div>
    );
  };

  const renderCategoriesRecursive = (nodes: ProductCategoryNode[]) => {
    if (!Array.isArray(nodes)) return null;
    return nodes.map((cat, index) => {
      const Icon = categoryIcons[cat.slug] || categoryIcons.default;
      const hasChildren = cat.children && Array.isArray(cat.children) && cat.children.length > 0;

      return (
        <AccordionItem value={`item-cat-${cat.id}`} key={cat.id} className="border-b-0">
          {hasChildren ? (
            <>
              <AccordionTrigger className="text-sm font-medium hover:bg-accent/50 rounded-md px-2 py-1.5 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" /> {cat.name}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pl-4 py-1 text-sm space-y-1">
                <Link href={`/shop?category=${cat.id}`} className="block py-1 italic text-muted-foreground hover:text-primary mb-1 border-b border-muted/30 pb-1">View all {cat.name}</Link>
                <Accordion type="multiple" className="w-full">
                  {renderCategoriesRecursive(cat.children!)}
                </Accordion>
              </AccordionContent>
            </>
          ) : (
            <Link
              href={`/shop?category=${cat.id}`}
              className="flex items-center gap-2 text-sm font-medium hover:bg-accent/50 rounded-md px-2 py-2.5 hover:no-underline"
            >
              <Icon className="h-4 w-4 text-primary" /> {cat.name}
            </Link>
          )}
        </AccordionItem>
      );
    });
  };


  return (
    <>
      <EcommerceHeader />
      <div className="bg-background">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <Card>
                <CardHeader className="bg-muted/50">
                  <CardTitle className="flex items-center gap-2 text-base"><List className="h-5 w-5" /> Shop By Department</CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <Accordion type="multiple" className="w-full">

                    {staticDepartments.map((dept, index) => (
                      <AccordionItem value={`item-static-${index}`} key={dept.slug} className="border-b-0">
                        <Link href={`/shop?filter=${dept.slug}`} className="block text-sm font-medium hover:bg-accent/50 rounded-md px-2 py-2.5 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <dept.icon className="h-4 w-4 text-primary" /> {dept.name}
                          </div>
                        </Link>
                      </AccordionItem>
                    ))}

                    <Separator className="my-2" />

                    {isLoading ? <Skeleton className="h-24 w-full" /> : renderCategoriesRecursive(productCategories)}
                  </Accordion>
                </CardContent>
              </Card>
            </aside>

            {/* Main Content */}
            <main className="lg:col-span-3 space-y-12">

              {/* Featured Vendors Section */}
              <section>
                <FeaturedVendorsCarousel />
              </section>

              {/* Hero Section */}
              {/* Hero Section */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {featuredProducts.length > 0 ? (
                  <>
                    <div className="md:col-span-2 rounded-lg overflow-hidden relative aspect-[2/1] group">
                      <Link href={`/products/${featuredProducts[0].slug}`} className="block w-full h-full">
                        <Image
                          src={featuredProducts[0].imageUrl}
                          alt={featuredProducts[0].name}
                          fill
                          className="object-contain transition-transform duration-500 group-hover:scale-105"
                          data-ai-hint={featuredProducts[0].imageHint}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-2 shadow-sm">{featuredProducts[0].name}</h2>
                          <p className="text-white/90 line-clamp-2 max-w-lg mb-4 text-shadow-sm">{featuredProducts[0].description}</p>
                          <Button className="w-fit">Shop Now</Button>
                        </div>
                      </Link>
                    </div>
                    <div className="space-y-4">
                      {featuredProducts.length > 1 && (
                        <div className="rounded-lg overflow-hidden relative aspect-[3/2] group">
                          <Link href={`/products/${featuredProducts[1].slug}`} className="block w-full h-full">
                            <Image
                              src={featuredProducts[1].imageUrl}
                              alt={featuredProducts[1].name}
                              fill
                              className="object-contain transition-transform duration-500 group-hover:scale-105"
                              data-ai-hint={featuredProducts[1].imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                              <h3 className="font-semibold text-white text-lg">{featuredProducts[1].name}</h3>
                              <p className="text-xs text-white/80 font-medium">${featuredProducts[1].price?.toFixed(2) || 'Check Price'}</p>
                            </div>
                          </Link>
                        </div>
                      )}
                      {featuredProducts.length > 2 && (
                        <div className="rounded-lg overflow-hidden relative aspect-[3/2] group">
                          <Link href={`/products/${featuredProducts[2].slug}`} className="block w-full h-full">
                            <Image
                              src={featuredProducts[2].imageUrl}
                              alt={featuredProducts[2].name}
                              fill
                              className="object-contain transition-transform duration-500 group-hover:scale-105"
                              data-ai-hint={featuredProducts[2].imageHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                              <h3 className="font-semibold text-white text-lg">{featuredProducts[2].name}</h3>
                              <p className="text-xs text-white/80 font-medium">${featuredProducts[2].price?.toFixed(2) || 'Check Price'}</p>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  !isLoading && <div className="col-span-3 h-64 flex items-center justify-center bg-secondary/20 rounded-lg text-muted-foreground">No featured products found.</div>
                )}
              </section>

              {/* New Products */}
              <section>
                <h2 className="text-2xl font-bold mb-4">New Products</h2>
                {renderProductRow(newProducts, isLoading, 5)}
              </section>

              {/* Ad Banners */}

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
                          <Image src={article.featuredImageUrl || 'https://placehold.co/150x150.png'} alt={article.title} width={150} height={150} className="object-contain rounded-lg aspect-square" data-ai-hint={article.featuredImageHint || "blog post"} />
                        </div>
                        <div className="flex flex-col">
                          <CardHeader className="p-0 mb-2">
                            <CardTitle className="text-base font-semibold leading-snug hover:text-primary"><Link href={`/blog/${article.slug}`}>{article.title}</Link></CardTitle>
                          </CardHeader>
                          <CardContent className="p-0 text-xs text-muted-foreground flex-grow">
                            <p className="line-clamp-3">{article.content.replace(/<[^>]+>/g, '').substring(0, 100)}...</p>
                          </CardContent>
                          <Button variant="link" asChild className="p-0 h-auto mt-2 justify-start text-primary">
                            <Link href={`/blog/${article.slug}`}>Read More <ArrowRight className="ml-1 h-4 w-4" /></Link>
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
      <ProductQuickView product={quickViewProduct} isOpen={isQuickViewOpen} onOpenChange={setIsQuickViewOpen} />
    </>
  );
}
