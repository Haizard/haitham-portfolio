
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Star, Search, ChevronRight, Gamepad2, Watch, Armchair, Zap, Sparkles, Tag, ArrowRight, Flame, Newspaper, Award, Info, ThumbsUp, PackageCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import type { BlogPost } from '@/lib/blog-data'; // For Latest Articles
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const mockCategories = [
  { name: "Electronics", icon: Zap, hint: "electronics device", products: 120, image: "https://placehold.co/100x100.png" },
  { name: "Furniture", icon: Armchair, hint: "modern chair", products: 75, image: "https://placehold.co/100x100.png"  },
  { name: "Fashion", icon: Tag, hint: "clothing item", products: 250, image: "https://placehold.co/100x100.png"  },
  { name: "Gaming", icon: Gamepad2, hint: "game controller", products: 90, image: "https://placehold.co/100x100.png"  },
  { name: "Watches", icon: Watch, hint: "smart watch", products: 45, image: "https://placehold.co/100x100.png"  },
  { name: "Appliances", icon: Sparkles, hint: "kitchen appliance", products: 60, image: "https://placehold.co/100x100.png"  },
  { name: "Laptops", icon: Zap, hint: "laptop computer", products: 80, image: "https://placehold.co/100x100.png"},
  { name: "Headphones", icon: Sparkles, hint: "audio headphones", products: 110, image: "https://placehold.co/100x100.png"},
];

const mockHotCategories = [
    { name: "Fridges", products: 217, image: "https://placehold.co/300x200.png", imageHint: "refrigerator appliance" },
    { name: "Cameras", products: 35, image: "https://placehold.co/300x200.png", imageHint: "dslr camera photography" },
    { name: "Smartphones", products: 120, image: "https://placehold.co/300x200.png", imageHint: "smartphone mobile" },
    { name: "Audio Gear", products: 88, image: "https://placehold.co/300x200.png", imageHint: "headphones speaker" },
];

const ProductCard: React.FC<{ product: Product, className?: string, size?: 'small' | 'default' }> = ({ product, className, size = 'default' }) => {
  const [isHovered, setIsHovered] = useState(false);
  const originalPrice = product.price ? product.price * 1.2 : null;

  return (
    <Card 
        className={cn(
            "shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group",
            size === 'small' ? 'h-full' : '',
            className
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className={cn("bg-muted overflow-hidden relative", size === 'small' ? 'aspect-[1/1]' : 'aspect-[4/3]')}>
        <Link href={`/blog/${product.slug || product.id}`} legacyBehavior={false}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes={size === 'small' ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 20vw" }
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.imageHint || "product image"}
          />
        </Link>
        {product.price && originalPrice && product.price < originalPrice && (
            <Badge variant="destructive" className="absolute top-2 left-2 text-xs z-10">
                -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
            </Badge>
        )}
         <div 
            className={cn(
                "absolute bottom-0 left-0 right-0 p-2 flex justify-center items-center gap-2 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isHovered && "opacity-100",
                size === 'small' && 'p-1.5'
            )}
        >
             {product.productType === 'creator' && (
                <Button size={size === 'small' ? 'xs' : 'sm'} variant="primary" className="text-xs flex-1 h-8">
                    <ShoppingCart className="mr-1 h-3.5 w-3.5" /> Add to Cart
                </Button>
            )}
            {product.productType === 'affiliate' && product.links && product.links.length > 0 && (
                 <Button size={size === 'small' ? 'xs' : 'sm'} variant="secondary" className="text-xs flex-1 h-8" asChild>
                    <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-3.5 w-3.5" /> View Offer
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <CardContent className={cn("p-3 flex-grow flex flex-col", size === 'small' && 'p-2')}>
        {product.category && <span className={cn("text-xs text-muted-foreground mb-1", size === 'small' && 'text-[0.65rem] mb-0.5')}>{product.category}</span>}
        <CardTitle className={cn("font-semibold line-clamp-2 mb-1", size === 'small' ? 'text-xs leading-tight' : 'text-sm')}>
            <Link href={`/blog/${product.slug || product.id}`} className="hover:text-primary transition-colors">
                {product.name}
            </Link>
        </CardTitle>
        <div className="flex items-center my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={cn("h-3 w-3", i < Math.floor(Math.random() * 3) + 3 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50", size === 'small' && 'h-2.5 w-2.5')} />
          ))}
           <span className={cn("text-xs text-muted-foreground ml-1", size === 'small' && 'text-[0.65rem] ml-0.5')}>({Math.floor(Math.random() * 50) + 5})</span>
        </div>
        <div className={cn("mt-auto pt-1", size === 'small' && 'pt-0.5')}>
        {product.productType === 'creator' && product.price !== undefined ? (
            <div className="flex items-baseline gap-1.5">
                <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>${product.price.toFixed(2)}</span>
                {originalPrice && <span className={cn("text-xs text-muted-foreground line-through", size === 'small' && 'text-[0.65rem]')}>${originalPrice.toFixed(2)}</span>}
            </div>
            ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
            <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>{product.links[0].priceDisplay}</span>
            ) : (
            <span className={cn("font-bold text-primary", size === 'small' ? 'text-sm' : 'text-base')}>Price N/A</span>
            )}
        </div>
      </CardContent>
    </Card>
  );
};


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
        toast({ title: "Error Loading Store Data", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
  }, [toast]);


  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const featuredProducts = allProducts.slice(0, 10); // Increased count for better layout
  const latestProducts = allProducts.slice(0, 4); // Assuming latest are at the start
  const bestPickOfTheWeek = allProducts.length > 0 ? allProducts[Math.floor(Math.random() * Math.min(allProducts.length, 5))] : null;


  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="container mx-auto py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gradient-to-br from-primary/80 to-accent/80 rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-2xl min-h-[300px] md:min-h-[400px] text-primary-foreground">
            <div className="z-10 text-center md:text-left md:max-w-md">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3">Redmi Buds 5 Pro</h2>
              <p className="text-sm sm:text-base text-primary-foreground/90 mb-5">Immersive Sound, Unrivaled Comfort. Get yours today with a special launch discount!</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                {["207", "11", "38", "02"].map((val, i) => (
                  <div key={i} className="bg-card/20 backdrop-blur-sm text-primary-foreground p-2 rounded-md text-center w-12 shadow-md">
                    <div className="text-lg font-bold">{val}</div>
                    <div className="text-xs text-primary-foreground/80">{["DAYS", "HRS", "MIN", "SEC"][i]}</div>
                  </div>
                ))}
              </div>
              <Button size="lg" variant="secondary" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Shop Now <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
            <div className="relative w-full md:w-1/2 h-48 md:h-full mt-6 md:mt-0">
                <Image src="https://placehold.co/500x500.png" alt="Redmi Buds 5 Pro" fill className="object-contain drop-shadow-2xl" data-ai-hint="earbuds audio product"/>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 flex flex-col items-start justify-between relative shadow-lg overflow-hidden min-h-[190px] border border-border hover:border-accent transition-all group">
                <div className="z-10 text-left w-full">
                    <Badge variant="outline" className="mb-1.5 text-xs border-accent text-accent group-hover:bg-accent group-hover:text-accent-foreground">Special Offer</Badge>
                    <h3 className="text-xl font-semibold text-card-foreground mb-1">Smart Washing Machine</h3>
                    <p className="text-xs text-muted-foreground mb-3">Save 20% this week only!</p>
                    <Button size="sm" variant="outline" className="group-hover:bg-accent group-hover:text-accent-foreground">Shop Now</Button>
                </div>
                <Image src="https://placehold.co/200x200.png" alt="Washing Machine" width={100} height={100} className="absolute right-2 bottom-2 object-contain opacity-50 group-hover:opacity-80 transition-opacity" data-ai-hint="washing machine appliance"/>
            </div>
             <Card className="shadow-lg border border-border">
                <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-base font-semibold flex items-center gap-2"><Flame className="text-destructive h-5 w-5"/>Hot Categories</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-1.5 pt-0">
                    {mockCategories.slice(0,3).map(cat => (
                        <Link key={cat.name} href="#" className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                            <Image src={cat.image} alt={cat.name} width={24} height={24} className="rounded-sm" data-ai-hint={cat.imageHint}/>
                            <span className="flex-grow font-medium">{cat.name}</span>
                            <span className="text-muted-foreground text-[0.7rem] bg-muted px-1.5 py-0.5 rounded-sm">{cat.products}</span>
                        </Link>
                    ))}
                </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Best Pick of the Week Section */}
      {bestPickOfTheWeek && (
        <section className="container mx-auto py-8 md:py-12">
          <div className="bg-gradient-to-r from-accent/20 via-background to-background border border-accent/50 rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-xl">
            <div className="md:w-2/5 relative aspect-square w-full max-w-sm mx-auto md:mx-0">
              <Image src={bestPickOfTheWeek.imageUrl} alt={bestPickOfTheWeek.name} fill className="object-contain rounded-lg drop-shadow-lg" data-ai-hint={bestPickOfTheWeek.imageHint || "highlighted product"}/>
            </div>
            <div className="md:w-3/5 text-center md:text-left">
              <Badge variant="default" className="mb-2 bg-accent text-accent-foreground"><Award className="mr-1.5 h-4 w-4"/>Best Pick of the Week</Badge>
              <h2 className="text-3xl md:text-4xl font-bold font-headline text-foreground mb-3">{bestPickOfTheWeek.name}</h2>
              <p className="text-muted-foreground mb-2 line-clamp-3">{bestPickOfTheWeek.description}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-yellow-500 mb-4">
                  {[...Array(5)].map((_,i)=><Star key={i} className="h-5 w-5 fill-current"/>)} <span className="text-sm text-muted-foreground ml-1">(5.0 from 120 reviews)</span>
              </div>
              <div className="text-2xl font-bold text-primary mb-6">
                {bestPickOfTheWeek.productType === 'creator' && bestPickOfTheWeek.price ? `$${bestPickOfTheWeek.price.toFixed(2)}` : bestPickOfTheWeek.links?.[0]?.priceDisplay || 'Check Price'}
              </div>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-md">
                <ShoppingCart className="mr-2 h-5 w-5"/> View Product
              </Button>
            </div>
          </div>
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

      {/* Promotional Banner */}
      <section className="container mx-auto py-6 md:py-10">
        <div className="bg-blue-600 text-white rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
            <div className="z-10 md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Discount on PS5 Games</h2>
                <p className="text-blue-100 mb-6">Save up to <Badge variant="destructive" className="text-lg p-1">-45%</Badge> on select titles!</p>
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">Browse Games</Button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 md:mt-0 relative">
                {allProducts.filter(p => p.category?.toLowerCase().includes("game") || p.name.toLowerCase().includes("game")).slice(0,3).map(game => (
                    <Card key={game.id} className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
                         <Image src={game.imageUrl} alt={game.name} width={150} height={200} className="w-full aspect-[3/4] object-cover" data-ai-hint={game.imageHint || "game cover"}/>
                         <div className="p-2 text-center">
                             <p className="text-xs font-semibold truncate text-white">{game.name}</p>
                             <p className="text-xxs text-blue-200">${(game.price || Math.random()*50+10).toFixed(2)}</p>
                         </div>
                    </Card>
                ))}
                 {allProducts.filter(p => p.category?.toLowerCase().includes("game") || p.name.toLowerCase().includes("game")).length === 0 && (
                    <p className="col-span-3 text-center text-blue-200 text-sm">Game products coming soon!</p>
                 )}
            </div>
             <Gamepad2 className="absolute -right-10 -bottom-10 text-blue-500/30 h-48 w-48 transform rotate-12 opacity-50 md:opacity-100" />
        </div>
      </section>

      {/* Shop by Category Icons */}
       <section className="container mx-auto py-6 md:py-10 bg-secondary/30 rounded-xl my-8">
        <h2 className="text-2xl md:text-3xl font-bold font-headline mb-8 text-center">Shop by Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 md:gap-6">
          {mockCategories.map(cat => (
            <Link key={cat.name} href="#" className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-background hover:shadow-md transition-all group">
              <div className="bg-card rounded-full p-4 group-hover:bg-primary transition-colors border border-border group-hover:border-primary">
                <cat.icon className="h-7 w-7 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
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
      
       {/* Final CTA / Info Section */}
      <section className="container mx-auto py-10 md:py-16 border-t mt-8 bg-gradient-to-b from-background to-muted/30">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-3">Discover More with CreatorOS</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Explore a wide range of products, services, and content designed to empower your creative journey. Competitive prices, fast shipping, and excellent support.
          </p>
          <Button variant="default" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
            Explore All Products <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </div>
      </section>

      <footer className="py-8 text-center text-muted-foreground text-xs border-t">
        Store content powered by CreatorOS. &copy; {new Date().getFullYear()}
      </footer>

    </div>
  );
}
        