
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ExternalLink, Star, Search, ChevronRight, Gamepad2, Watch, Armchair, Zap, Sparkles, Tag, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from '@/lib/products-data';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// Mock data for sections not covered by existing Product data
const mockCategories = [
  { name: "Electronics", icon: Zap, hint: "electronics device" },
  { name: "Furniture", icon: Armchair, hint: "modern chair" },
  { name: "Fashion", icon: Tag, hint: "clothing item" },
  { name: "Gaming", icon: Gamepad2, hint: "game controller" },
  { name: "Watches", icon: Watch, hint: "smart watch" },
  { name: "Appliances", icon: Sparkles, hint: "kitchen appliance" },
  { name: "Laptops", icon: Zap, hint: "laptop computer"},
  { name: "Headphones", icon: Sparkles, hint: "audio headphones"},
];

const mockTopCategories = [
    { name: "Fridges", products: 217, image: "https://placehold.co/80x80.png", imageHint: "refrigerator" },
    { name: "Cameras", products: 35, image: "https://placehold.co/80x80.png", imageHint: "dslr camera" },
    { name: "Smartphones", products: 120, image: "https://placehold.co/80x80.png", imageHint: "smartphone device" },
    { name: "Audio", products: 88, image: "https://placehold.co/80x80.png", imageHint: "speaker system" },
];

const ProductCard: React.FC<{ product: Product, className?: string }> = ({ product, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  const originalPrice = product.price ? product.price * 1.2 : null; // Mock original price

  return (
    <Card 
        className={cn("shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden group", className)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden relative">
        <Link href={`/blog/${product.slug || product.id}`} legacyBehavior={false}>
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
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
                "absolute bottom-0 left-0 right-0 p-2 flex justify-center items-center gap-2 bg-black/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                isHovered && "opacity-100" // Ensure visibility on hover
            )}
        >
             {product.productType === 'creator' && (
                <Button size="sm" variant="primary" className="text-xs flex-1">
                    <ShoppingCart className="mr-1 h-4 w-4" /> Add to Cart
                </Button>
            )}
            {product.productType === 'affiliate' && product.links && product.links.length > 0 && (
                 <Button size="sm" variant="secondary" className="text-xs flex-1" asChild>
                    <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-1 h-4 w-4" /> View Offer
                    </Link>
                </Button>
            )}
        </div>
      </div>
      <CardContent className="p-3 flex-grow flex flex-col">
        {product.category && <span className="text-xs text-muted-foreground mb-1">{product.category}</span>}
        <CardTitle className="text-sm font-semibold line-clamp-2 mb-1">
            <Link href={`/blog/${product.slug || product.id}`} className="hover:text-primary transition-colors">
                {product.name}
            </Link>
        </CardTitle>
        <div className="flex items-center my-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className={`h-3 w-3 ${i < Math.floor(Math.random() * 3) + 3 ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"}`} />
          ))}
           <span className="text-xs text-muted-foreground ml-1">({Math.floor(Math.random() * 50) + 5})</span>
        </div>
        <div className="mt-auto pt-1">
        {product.productType === 'creator' && product.price !== undefined ? (
            <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-primary">${product.price.toFixed(2)}</span>
                {originalPrice && <span className="text-xs text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>}
            </div>
            ) : product.productType === 'affiliate' && product.links && product.links.length > 0 ? (
            <span className="text-base font-bold text-primary">{product.links[0].priceDisplay}</span>
            ) : (
            <span className="text-base font-bold text-primary">Price N/A</span>
            )}
        </div>
      </CardContent>
    </Card>
  );
};


export default function EcommerceStorePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/products`);
        if (!response.ok) throw new Error('Failed to fetch products.');
        const data: Product[] = await response.json();
        setAllProducts(data);
      } catch (error: any) {
        toast({ title: "Error Loading Products", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, [toast]);

  const featuredProducts = allProducts.slice(0, 8);
  const recommendedProducts = allProducts.slice(3, 11);


  return (
    <div className="bg-background text-foreground">
      {/* Removed main <header> and <Store> icon as that's more for a simple list page */}
      {/* The Woodmart design implies a more complex global header which is outside this page's scope */}

      {/* Hero Section */}
      <section className="container mx-auto py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Main Banner */}
          <div className="lg:col-span-2 bg-secondary rounded-xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-lg min-h-[300px] md:min-h-[400px]">
            <div className="z-10 text-center md:text-left md:max-w-md">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-2">Redmi Buds 3</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-4">Feel the beat, lose the noise. Premium sound, ultimate comfort.</p>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                {["207", "11", "38", "02"].map((val, i) => (
                  <div key={i} className="bg-card text-card-foreground p-2 rounded-md text-center w-12">
                    <div className="text-lg font-bold">{val}</div>
                    <div className="text-xs text-muted-foreground">{["DAYS", "HRS", "MIN", "SEC"][i]}</div>
                  </div>
                ))}
              </div>
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">Shop Now <ArrowRight className="ml-2 h-4 w-4"/></Button>
            </div>
            <div className="relative w-full md:w-1/2 h-48 md:h-full mt-6 md:mt-0">
                <Image src="https://placehold.co/400x400.png" alt="Redmi Buds 3" fill className="object-contain md:object-cover" data-ai-hint="earbuds audio"/>
            </div>
          </div>

          {/* Right Side Banners/Categories */}
          <div className="space-y-6">
            <div className="bg-card rounded-xl p-6 flex flex-col items-center justify-between relative shadow-lg overflow-hidden min-h-[190px]">
                <div className="z-10 text-left w-full">
                    <Badge variant="secondary" className="mb-1 text-xs">Special Offer</Badge>
                    <h3 className="text-xl font-semibold text-card-foreground mb-1">Washing Machine</h3>
                    <p className="text-xs text-muted-foreground mb-3">Clean smarter, not harder.</p>
                    <Button size="sm" variant="outline">Shop Now</Button>
                </div>
                <Image src="https://placehold.co/200x200.png" alt="Washing Machine" width={100} height={100} className="absolute right-2 bottom-2 object-contain opacity-80" data-ai-hint="washing machine"/>
            </div>
            <Card className="shadow-lg">
                <CardHeader className="pb-3 pt-5">
                    <CardTitle className="text-base font-semibold">Top Categories</CardTitle>
                </CardHeader>
                <CardContent className="text-xs space-y-2 pt-0">
                    {mockTopCategories.map(cat => (
                        <Link key={cat.name} href="#" className="flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors">
                            <Image src={cat.image} alt={cat.name} width={24} height={24} className="rounded" data-ai-hint={cat.imageHint}/>
                            <span className="flex-grow">{cat.name}</span>
                            <span className="text-muted-foreground">{cat.products}</span>
                        </Link>
                    ))}
                </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="container mx-auto py-6 md:py-10">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold font-headline">Featured Products</h2>
            {/* Add Tabs for "New Arrivals", "Best Sellers", "Trending" if needed later */}
        </div>
        {isLoading && featuredProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[...Array(8)].map((_,i) => <Card key={i} className="aspect-[3/4] bg-muted animate-pulse"></Card>)}
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

      {/* Promotional Banner (e.g., PS5 Games) */}
      <section className="container mx-auto py-6 md:py-10">
        <div className="bg-blue-600 text-white rounded-xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-xl relative overflow-hidden">
            <div className="z-10 md:w-1/2">
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Get Discount on PS5 Games</h2>
                <p className="text-blue-100 mb-6">Save up to <Badge variant="destructive" className="text-lg p-1">-45%</Badge> on select titles!</p>
                <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50">Browse Games</Button>
            </div>
            <div className="md:w-1/2 grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 md:mt-0 relative">
                 {/* Smaller product cards for the banner */}
                {allProducts.filter(p => p.category?.toLowerCase().includes("game") || p.name.toLowerCase().includes("game")).slice(0,3).map(game => (
                    <Card key={game.id} className="bg-white/10 backdrop-blur-sm border-white/20 overflow-hidden">
                         <Image src={game.imageUrl} alt={game.name} width={150} height={200} className="w-full aspect-[3/4] object-cover" data-ai-hint={game.imageHint}/>
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
      <section className="container mx-auto py-6 md:py-10">
        <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6 text-center">Shop by Categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {mockCategories.map(cat => (
            <Link key={cat.name} href="#" className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-muted transition-colors group">
              <div className="bg-secondary rounded-full p-4 group-hover:bg-primary transition-colors">
                <cat.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
              </div>
              <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

       {/* Large Ad Banners */}
      <section className="container mx-auto py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Next level adventure", subtitle: "Apple Watch Ultra", image: "https://placehold.co/400x500.png", hint: "smartwatch display", bgColor: "bg-gray-100 dark:bg-gray-800", textColor: "text-gray-800 dark:text-gray-200" },
            { title: "Hearth loft series", subtitle: "Cozy & Modern Furniture", image: "https://placehold.co/400x500.png", hint: "living room sofa", bgColor: "bg-neutral-800 dark:bg-neutral-900", textColor: "text-white" },
            { title: "Hair dryer blue blush", subtitle: "Professional Styling at Home", image: "https://placehold.co/400x500.png", hint: "hair dryer product", bgColor: "bg-pink-100 dark:bg-pink-900", textColor: "text-pink-800 dark:text-pink-200" },
          ].map((banner, i) => (
            <Card key={i} className={cn("shadow-lg overflow-hidden relative min-h-[350px] md:min-h-[450px] flex flex-col justify-between p-6 md:p-8", banner.bgColor)}>
                <Image src={banner.image} alt={banner.title} layout="fill" className="object-cover opacity-20 md:opacity-100 md:object-right-bottom md:w-3/4 md:h-3/4" data-ai-hint={banner.hint}/>
              <div className={cn("relative z-10", banner.textColor)}>
                <h3 className="text-2xl md:text-3xl font-bold">{banner.title}</h3>
                <p className="text-sm opacity-90 mb-4">{banner.subtitle}</p>
              </div>
              <Button variant={i === 1 ? "secondary" : "default"} className="relative z-10 w-fit mt-auto">Shop Now</Button>
            </Card>
          ))}
        </div>
      </section>

      {/* More Recommended Products */}
      <section className="container mx-auto py-6 md:py-10">
        <h2 className="text-2xl md:text-3xl font-bold font-headline mb-6">More Recommended Products</h2>
         {isLoading && recommendedProducts.length === 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-5">
                {[...Array(5)].map((_,i) => <Card key={`rec-skel-${i}`} className="aspect-[3/4] bg-muted animate-pulse"></Card>)}
            </div>
        ) : recommendedProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-5">
            {recommendedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
            <p className="text-center text-muted-foreground py-8">No other products to recommend at this time.</p>
        )}
      </section>
      
       {/* Final CTA / Info Section */}
      <section className="container mx-auto py-10 md:py-16 border-t mt-8">
        <div className="text-center">
          <h2 className="text-2xl md:text-3xl font-bold font-headline mb-3">Online store of household appliances and electronics</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Discover a wide range of products to make your life easier and more enjoyable. We offer competitive prices, fast shipping, and excellent customer service.
          </p>
          <Button variant="outline" size="lg">
            View All Products <ArrowRight className="ml-2 h-4 w-4"/>
          </Button>
        </div>
      </section>

      {/* Basic Footer placeholder - actual footer is in RootLayout */}
       <footer className="py-8 text-center text-muted-foreground text-xs">
        Store content powered by CreatorOS.
      </footer>

    </div>
  );
}

    