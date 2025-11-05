
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { Restaurant } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Filter } from 'lucide-react';
import { RestaurantList } from '@/components/restaurants/restaurant-list';
import { RestaurantFilters, type RestaurantFilterValues } from '@/components/restaurants/restaurant-filters';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { ComparisonBar } from '@/components/restaurants/comparison-bar';

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const fetchRestaurants = useCallback(async (filters: RestaurantFilterValues = {}) => {
    setIsLoading(true);
    try {
      // TODO: Implement API filtering logic
      const response = await fetch(`/api/restaurants`);
      if (!response.ok) {
        throw new Error('Failed to fetch restaurants.');
      }
      const data: Restaurant[] = await response.json();
      setRestaurants(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setIsFilterSheetOpen(false); // Close sheet after applying filters
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchRestaurants({});
  }, [fetchRestaurants]);

  return (
    <>
      <div className="container mx-auto py-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Find Your Next Meal
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Discover and order from the best local restaurants.
          </p>
        </header>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Show Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
               <SheetHeader className="pb-4">
                  <SheetTitle>Filter Restaurants</SheetTitle>
               </SheetHeader>
               <RestaurantFilters onFilterChange={fetchRestaurants} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <RestaurantFilters onFilterChange={fetchRestaurants} />
            </div>
          </aside>
          <main className="lg:col-span-3">
             {isLoading ? (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              ) : (
                  <RestaurantList restaurants={restaurants} />
              )}
          </main>
        </div>
      </div>
      <ComparisonBar />
    </>
  );
}
