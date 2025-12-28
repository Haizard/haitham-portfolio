
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

interface StoreSidebarProps {
  categories: string[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  vendorId: string;
}

const StoreSidebar = ({ categories, selectedCategory, onSelectCategory, vendorId }: StoreSidebarProps) => {
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
            <li
              className={`cursor-pointer hover:text-primary ${selectedCategory === null ? 'font-bold text-primary' : ''}`}
              onClick={() => onSelectCategory(null)}
            >
              All Products
            </li>
            {categories.map((category) => (
              <li
                key={category}
                className={`cursor-pointer hover:text-primary ${selectedCategory === category ? 'font-bold text-primary' : ''}`}
                onClick={() => onSelectCategory(category)}
              >
                {category}
              </li>
            ))}
            {categories.length === 0 && <li className="text-muted-foreground italic">No categories found</li>}
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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("default");

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

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.categoryName).filter(Boolean))) as string[];

  // Filter and Sort Products
  let filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? product.categoryName === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  if (sortBy === 'price-asc') {
    filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
  } else if (sortBy === 'price-desc') {
    filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
  } else if (sortBy === 'rating') {
    filteredProducts.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  }
  // 'default' and 'popularity' can be handled by default order or added logic if 'sales' field exists

  return (
    <>
      <div className="bg-background">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <StoreSidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              vendorId={vendorId as string}
            />

            <main className="lg:col-span-3 space-y-8">
              {/* Vendor Info Card */}
              {/* Vendor Info Card */}
              <Card className="bg-secondary/30 shadow-lg overflow-hidden">
                <div className="flex flex-col md:flex-row gap-0">
                  {/* Rectangular Store Image */}
                  <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto md:h-auto min-h-[200px]">
                    {/* Using a placeholder or profile.coverImage if available, fallback to avatar but large/boxy */}
                    {/* Since we don't have coverImage in type yet, we use avatarUrl but displayed big/boxy */}
                    {/* Or better, simulate a store front image */}
                    <div className="absolute inset-0 bg-muted flex items-center justify-center">
                      <img
                        src={profile.avatarUrl || "https://placehold.co/600x400"}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="flex-1 p-8 flex flex-col justify-center">
                    <h1 className="text-3xl font-bold font-headline mb-4">{profile.name}</h1>
                    <div className="space-y-2 text-muted-foreground">
                      <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> 72 Comfort St, Apt 910, Austin, Texas, United States (US)</p>
                      <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> +1 212-555-1717</p>
                      <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {profile.email}</p>
                      <p className="flex items-center gap-2"><Star className="h-4 w-4 text-primary" /> No ratings found yet!</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Product Search & Sort */}
              <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4 border rounded-lg">
                <div className="relative w-full md:w-auto md:flex-grow">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter product name"
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/80 w-full md:w-auto">Search</Button>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Default sorting" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default sorting</SelectItem>
                    <SelectItem value="popularity">Sort by popularity</SelectItem>
                    <SelectItem value="rating">Sort by average rating</SelectItem>
                    <SelectItem value="price-asc">Sort by price: low to high</SelectItem>
                    <SelectItem value="price-desc">Sort by price: high to low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Product Grid */}
              <div>
                {filteredProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProducts.map(product => <ProductCard key={product.id} product={product} onQuickView={handleQuickView} />)}
                  </div>
                ) : (
                  <Card className="text-center py-12">
                    <CardHeader>
                      <CardTitle>No Products Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">Try adjusting your filters or search query.</p>
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
