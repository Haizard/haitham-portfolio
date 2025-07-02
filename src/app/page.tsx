
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Briefcase, Sparkles, Store, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from '@/components/products/ProductCard';
import type { Product } from '@/lib/products-data';
import type { Service } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredServices, setFeaturedServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchShowcaseData() {
      setIsLoading(true);
      try {
        const [productsRes, servicesRes] = await Promise.all([
          fetch('/api/products?productType=creator&limit=4'),
          fetch('/api/services?limit=3')
        ]);
        if (!productsRes.ok) throw new Error('Failed to fetch featured products.');
        if (!servicesRes.ok) throw new Error('Failed to fetch featured services.');
        
        const productsData = await productsRes.json();
        const servicesData = await servicesRes.json();

        setFeaturedProducts(productsData);
        setFeaturedServices(servicesData);

      } catch (error: any) {
        toast({ title: "Error loading page data", description: error.message, variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    fetchShowcaseData();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
          <div className="container mx-auto px-4 z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline mb-6">
              The Operating System for Modern Creators
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              CreatorOS is an all-in-one platform to build your brand, sell products, offer services, and find freelance work. Your entire creative business, unified.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Link href="/dashboard">Get Started <ArrowRight className="ml-2 h-5 w-5"/></Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/ecommerce">Explore the Store</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold font-headline">Featured Products</h2>
              <p className="text-muted-foreground">Discover top-quality goods from our talented vendors.</p>
            </div>
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-96 w-full"/>)}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map(product => <ProductCard key={product.id} product={product}/>)}
              </div>
            )}
            <div className="text-center mt-12">
              <Button asChild variant="outline">
                <Link href="/ecommerce">View All Products <ArrowRight className="ml-2 h-4 w-4"/></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Platform Features Section */}
        <section className="py-16 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl font-bold font-headline">One Platform, Endless Possibilities</h2>
                <p className="text-muted-foreground">
                  Whether you're selling digital goods, offering bespoke services, or looking for your next gig, CreatorOS provides the tools you need to succeed.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-primary/20 text-primary rounded-full"><Store className="h-5 w-5"/></div>
                    <div>
                      <h4 className="font-semibold">Multi-Vendor Marketplace</h4>
                      <p className="text-sm text-muted-foreground">Launch your own storefront and sell products directly to a dedicated community.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-primary/20 text-primary rounded-full"><Briefcase className="h-5 w-5"/></div>
                    <div>
                      <h4 className="font-semibold">Freelancer Hub</h4>
                      <p className="text-sm text-muted-foreground">Find work, manage projects, and offer your professional services to clients.</p>
                    </div>
                  </li>
                   <li className="flex items-start gap-3">
                    <div className="p-2 bg-primary/20 text-primary rounded-full"><Sparkles className="h-5 w-5"/></div>
                    <div>
                      <h4 className="font-semibold">AI-Powered Content Tools</h4>
                      <p className="text-sm text-muted-foreground">Generate blog posts, social media content, and more with our integrated AI suite.</p>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="relative aspect-[4/3] w-full h-full">
                <Image src="https://placehold.co/800x600.png" alt="CreatorOS dashboard preview" fill className="object-cover rounded-lg shadow-xl" data-ai-hint="dashboard interface"/>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Services Section */}
        <section className="py-16 bg-background">
           <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-headline">Popular Services</h2>
                <p className="text-muted-foreground">Hire talented freelancers for your next project.</p>
              </div>
               {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-64 w-full"/>)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {featuredServices.map(service => (
                      <Card key={service.id} className="shadow-md hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 my-2">{service.description}</p>
                          <div className="flex justify-between items-center pt-3 border-t">
                            <span className="font-bold text-primary">${service.price}</span>
                             <Button size="sm" variant="link" asChild className="p-0">
                                <Link href={`/our-services/${service.slug}`}>View Service <ArrowRight className="ml-1 h-4 w-4"/></Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
           </div>
        </section>

      </main>
      <footer className="text-center text-muted-foreground py-8 border-t bg-card">
        <p>&copy; {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
      </footer>
    </div>
  );
}
    