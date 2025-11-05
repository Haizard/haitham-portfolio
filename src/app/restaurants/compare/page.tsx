
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowLeft, Star, MapPin, Utensils, CheckCircle, XCircle } from 'lucide-react';
import type { Restaurant } from '@/lib/restaurants-data';
import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '@/components/reviews/StarRating';
import { Badge } from '@/components/ui/badge';

function ComparisonPageComponent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ids = searchParams.get('ids')?.split(',');
    if (!ids || ids.length === 0) {
      setError("No restaurants selected for comparison.");
      setIsLoading(false);
      return;
    }

    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const fetchedRestaurants = await Promise.all(
          ids.map(id =>
            fetch(`/api/restaurants/${id}`).then(res => {
              if (!res.ok) throw new Error(`Failed to fetch restaurant ID ${id}`);
              return res.json();
            })
          )
        );
        setRestaurants(fetchedRestaurants);
      } catch (err: any) {
        setError(err.message || "Could not load restaurant data.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchRestaurants();
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading comparison data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-destructive font-semibold">{error}</p>
        <Button onClick={() => router.push('/restaurants')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Restaurants
        </Button>
      </div>
    );
  }
  
  if (restaurants.length === 0) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">No restaurant data to display.</p>
        <Button onClick={() => router.push('/restaurants')} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Restaurants
        </Button>
      </div>
    );
  }

  const featuresToCompare = [
    { key: 'rating', label: 'Rating', icon: Star },
    { key: 'location', label: 'Location', icon: MapPin },
    { key: 'cuisineTypes', label: 'Cuisines', icon: Utensils },
    { key: 'status', label: 'Status', icon: CheckCircle },
    { key: 'isSponsored', label: 'Sponsored', icon: CheckCircle },
  ];
  
  const gridColsClass = `grid-cols-[1fr_repeat(${restaurants.length},_minmax(0,_2fr))]`;

  return (
    <div className="w-full">
        <div className={`grid ${gridColsClass}`}>
            {/* Header Row */}
            <div className="p-4 border-b border-r">
                <h2 className="font-bold text-lg">Feature</h2>
            </div>
            {restaurants.map(r => (
                <div key={r.id} className="p-4 border-b border-r text-center">
                    <Link href={`/restaurants/${r.id}`}>
                        <Image src={r.logoUrl} alt={r.name} width={80} height={80} className="rounded-md object-contain mx-auto mb-2 border" />
                        <h3 className="font-semibold text-primary hover:underline">{r.name}</h3>
                    </Link>
                </div>
            ))}
        </div>
        
        {/* Feature Rows */}
        {featuresToCompare.map(feature => (
             <div key={feature.key} className={`grid ${gridColsClass} odd:bg-muted/50`}>
                <div className="p-4 border-b border-r font-medium flex items-center gap-2 text-sm">
                    <feature.icon className="h-4 w-4 text-muted-foreground"/>
                    {feature.label}
                </div>
                {restaurants.map(r => (
                    <div key={r.id} className="p-4 border-b border-r text-center text-sm">
                        {(() => {
                            const value = r[feature.key as keyof Restaurant];
                            if (feature.key === 'rating') {
                                return <div className="flex items-center justify-center gap-1"><StarRating rating={r.rating} disabled size={16}/> ({r.reviewCount})</div>
                            }
                            if (feature.key === 'cuisineTypes' && Array.isArray(value)) {
                                return value.join(', ');
                            }
                             if (feature.key === 'isSponsored') {
                                return value ? <CheckCircle className="h-5 w-5 text-green-500 mx-auto"/> : <XCircle className="h-5 w-5 text-muted-foreground mx-auto"/>;
                            }
                            if (feature.key === 'status') {
                                return <Badge variant={r.status === 'Open' ? 'default' : 'destructive'} className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{r.status}</Badge>;
                            }
                            return value?.toString() || '-';
                        })()}
                    </div>
                ))}
            </div>
        ))}
    </div>
  );
}


export default function RestaurantComparisonPage() {
    return (
        <div className="container mx-auto py-8">
            <header className="mb-8">
                <h1 className="text-4xl font-bold tracking-tight font-headline">Restaurant Comparison</h1>
                <p className="text-xl text-muted-foreground mt-2">
                    Compare your selected restaurants side-by-side.
                </p>
            </header>
            <Card className="shadow-lg">
                <CardContent className="p-0 overflow-x-auto">
                    <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
                        <ComparisonPageComponent />
                    </Suspense>
                </CardContent>
            </Card>
        </div>
    );
}
