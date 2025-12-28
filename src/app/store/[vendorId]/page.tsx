
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Star, Phone, Mail, MapPin, Search, MessageSquare } from 'lucide-react';
import type { Product } from '@/lib/products-data';
import type { FreelancerProfile } from '@/lib/user-profile-data';
import { ProductCard } from '@/components/products/ProductCard';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductQuickView } from '@/components/products/ProductQuickView';
import { useToast } from '@/hooks/use-toast';

interface VendorData {
  profile: FreelancerProfile;
  products: Product[];
}

const StoreSidebar = () => {
  const { toast } = useToast();
  const router = useRouter();
  return (
    <aside className="lg:col-span-1 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Store Product Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="hover:text-primary cursor-pointer">Cell Phones</li>
            <li className="hover:text-primary cursor-pointer">Tablets</li>
            <li className="hover:text-primary cursor-pointer">Smart watches</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact Vendor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Your Name" />
          <Input type="email" placeholder="you@example.com" />
          <Textarea placeholder="Type your message.." />
          <Button className="w-full" onClick={() => router.push(`/chat?recipientId=${vendorId}`)}>
            <MessageSquare className="mr-2 h-4 w-4" /> Send Message
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
};


export default function VendorStorefrontPage() {
  const params = useParams<{ vendorId: string }>();
  const router = useRouter();
  const { vendorId } = params;

  const [vendorData, setVendorData] = useState<VendorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setIsQuickViewOpen(true);
  };

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

  const { profile, products } = vendorData;

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <StoreSidebar />

            <main className="lg:col-span-3 space-y-8">
              {/* Vendor Info Card */}
              <Card className="bg-secondary/30 p-8 shadow-lg">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <Avatar className="h-28 w-28 border-4 border-background ring-4 ring-primary">
                    <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="vendor avatar" />
                    <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-3 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-headline">{profile.name}</h1>
                    <div className="space-y-1 text-muted-foreground">
                      <p className="flex items-center justify-center md:justify-start gap-2"><MapPin className="h-4 w-4 text-primary" /> 72 Comfort St, Apt 910, Austin, Texas, United States (US)</p>
                      <p className="flex items-center justify-center md:justify-start gap-2"><Phone className="h-4 w-4 text-primary" /> +1 212-555-1717</p>
                      <p className="flex items-center justify-center md:justify-start gap-2"><Mail className="h-4 w-4 text-primary" /> {profile.email}</p>
                      <p className="flex items-center justify-center md:justify-start gap-2"><Star className="h-4 w-4 text-primary" /> No ratings found yet!</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Product Search & Sort */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-full md:w-auto md:flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input placeholder="Enter product name" className="pl-10" />
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/80 w-full md:w-auto">Search</Button>
                <Select defaultValue="default">
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Default sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default sorting</SelectItem>
                    <SelectItem value="popularity">Sort by popularity</SelectItem>
                    <SelectItem value="rating">Sort by average rating</SelectItem>
                    <SelectItem value="date">Sort by latest</SelectItem>
                    <SelectItem value="price-asc">Sort by price: low to high</SelectItem>
                    <SelectItem value="price-desc">Sort by price: high to low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Grid */}
              <div>
                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map(product => <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />)}
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
              </div>
            </main>
          </div>
        </div>
      </div>
      <ProductQuickView product={quickViewProduct} isOpen={isQuickViewOpen} onOpenChange={setIsQuickViewOpen} />
    </>
  )
}
