
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star, Rss, Wallet, ShoppingCart, Package, Clock } from 'lucide-react';
import type { Product } from '@/lib/products-data';
import type { FreelancerProfile } from '@/lib/user-profile-data';
import type { VendorFinanceSummary } from '@/lib/payouts-data';
import type { Order } from '@/lib/orders-data';
import Image from "next/image";
import { ProductCard } from '@/components/products/ProductCard';
import { MetricCard } from '@/components/dashboard/metric-card';
import { formatDistanceToNow } from 'date-fns';

interface VendorData {
  profile: FreelancerProfile;
  products: Product[];
  financeSummary: VendorFinanceSummary;
  orders: Order[];
}

export default function VendorStorefrontPage() {
  const params = useParams<{ vendorId: string }>();
  const router = useRouter();
  const { vendorId } = params;

  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchVendorData() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/vendors/${vendorId}`);
        if (!response.ok) {
          if (response.status === 404) notFound();
          throw new Error('Failed to fetch vendor data.');
        }
        const data: VendorData = await response.json();
        setVendorData(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching vendor data:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchVendorData();
  }, [vendorId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto text-center py-10">
        <h2 className="text-xl font-semibold text-destructive">Error Loading Storefront</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          Go Back
        </Button>
      </div>
    );
  }
  
  if (!vendorData) {
    notFound();
    return null;
  }
  
  const { profile, products, financeSummary, orders } = vendorData;
  const lastOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="bg-secondary/30">
      <div className="container mx-auto py-8">
        <div className="relative h-48 md:h-64 rounded-lg overflow-hidden mb-[-4rem] md:mb-[-5rem] z-0">
            <Image src="https://placehold.co/1200x400.png" alt={`${profile.name} cover photo`} fill className="object-cover" data-ai-hint="store cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
        
        <header className="relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 p-6 bg-card rounded-lg shadow-xl">
            <Avatar className="h-32 w-32 border-4 border-background ring-4 ring-primary">
                <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="vendor avatar" />
                <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-grow">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">{profile.name}</h1>
                <p className="text-muted-foreground">{profile.occupation}</p>
                 <div className="flex items-center justify-center md:justify-start gap-2 pt-2 text-sm text-yellow-500">
                    {[...Array(5)].map((_,i)=><Star key={i} className="h-4 w-4 fill-current"/>)} 
                    <span className="text-muted-foreground ml-1">({profile.averageRating?.toFixed(1)} from {profile.reviewCount} reviews)</span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline"><Rss className="mr-2 h-4 w-4"/> Follow</Button>
            </div>
        </header>
        
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 my-8">
          <MetricCard
            title="Available Balance"
            value={`$${financeSummary.availableBalance.toFixed(2)}`}
            icon={Wallet}
            description={`Total earnings: $${financeSummary.totalEarnings.toFixed(2)}`}
            className="shadow-md"
          />
          <MetricCard
            title="Total Orders"
            value={orders.length.toString()}
            icon={ShoppingCart}
            description="All-time orders received"
            className="shadow-md"
          />
          <MetricCard
            title="Listed Products"
            value={products.length.toString()}
            icon={Package}
            description="Currently for sale"
            className="shadow-md"
          />
          <MetricCard
            title="Last Order"
            value={lastOrder ? formatDistanceToNow(new Date(lastOrder.orderDate), { addSuffix: true }) : 'N/A'}
            icon={Clock}
            description={lastOrder ? `by ${lastOrder.customerName}` : 'No orders yet'}
            className="shadow-md"
          />
        </section>

        <main>
            <h2 className="text-2xl font-bold font-headline mb-6">Products from {profile.name}</h2>
            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map(product => <ProductCard key={product.id} product={product} />)}
                </div>
            ) : (
                <Card className="text-center py-12">
                     <CardHeader>
                        <CardTitle>No Products Yet</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">This vendor hasn't listed any products for sale.</p>
                    </CardContent>
                </Card>
            )}
        </main>
      </div>
    </div>
  )
}

    