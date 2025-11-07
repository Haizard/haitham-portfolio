"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Restaurant } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, MapPin, Clock, BadgePercent } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function RestaurantsPage() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRestaurants() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/restaurants');
        if (!response.ok) {
          throw new Error('Failed to fetch restaurants');
        }
        const data = await response.json();
        setRestaurants(data);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to load restaurants',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchRestaurants();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurants
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover and order from the best restaurants in your area
          </p>
        </div>

        {/* Restaurants Grid */}
        {restaurants.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No restaurants available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <Link
                key={restaurant.id}
                href={`/restaurants/${restaurant.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="p-0">
                    <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                      <Image
                        src={restaurant.logoUrl}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {restaurant.isSponsored && (
                        <Badge className="absolute top-2 right-2 bg-yellow-500 text-white">
                          Sponsored
                        </Badge>
                      )}
                      {restaurant.status === 'Closed' && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive" className="text-lg">
                            Closed
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                      {restaurant.name}
                    </CardTitle>
                    
                    {/* Cuisine Types */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {restaurant.cuisineTypes.map((cuisine, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {cuisine}
                        </Badge>
                      ))}
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <MapPin className="h-4 w-4" />
                      <span>{restaurant.location}</span>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {restaurant.rating.toFixed(1)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        ({restaurant.reviewCount} reviews)
                      </span>
                    </div>

                    {/* Delivery Time */}
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span>Delivery in 20-30 min</span>
                    </div>

                    {/* Special Deals */}
                    {restaurant.specialDeals && (
                      <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md">
                        <BadgePercent className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          {restaurant.specialDeals}
                        </span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mt-3">
                      <Badge
                        variant={restaurant.status === 'Open' ? 'default' : 'secondary'}
                        className={
                          restaurant.status === 'Open'
                            ? 'bg-green-500 hover:bg-green-600'
                            : ''
                        }
                      >
                        {restaurant.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Compare Button */}
        {restaurants.length > 1 && (
          <div className="mt-8 text-center">
            <Link href="/restaurants/compare">
              <Button size="lg" variant="outline">
                Compare Restaurants
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

