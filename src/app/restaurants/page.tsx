"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { Restaurant } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Star, MapPin, Clock, BadgePercent, Heart, ChevronDown, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type SortOption = 'best-match' | 'alphabetical' | 'rating' | 'min-order' | 'delivery-fee' | 'fastest-delivery';

export default function RestaurantsPage() {
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [searchLocation, setSearchLocation] = useState('');
  const [searchRadius, setSearchRadius] = useState('10');
  const [sortBy, setSortBy] = useState<SortOption>('best-match');
  const [showCuisinesExpanded, setShowCuisinesExpanded] = useState(true);
  const [showOpeningExpanded, setShowOpeningExpanded] = useState(true);
  const [showOpenOnly, setShowOpenOnly] = useState(false);

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

  // Get unique cuisines from all restaurants
  const availableCuisines = useMemo(() => {
    const cuisineSet = new Set<string>();
    restaurants.forEach(r => r.cuisineTypes.forEach(c => cuisineSet.add(c)));
    return Array.from(cuisineSet).sort();
  }, [restaurants]);

  // Filter and sort restaurants
  const filteredAndSortedRestaurants = useMemo(() => {
    let filtered = [...restaurants];

    // Apply cuisine filter
    if (selectedCuisines.length > 0) {
      filtered = filtered.filter(r =>
        r.cuisineTypes.some(c => selectedCuisines.includes(c))
      );
    }

    // Apply location filter
    if (searchLocation.trim()) {
      const searchTerm = searchLocation.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.location.toLowerCase().includes(searchTerm) ||
        r.name.toLowerCase().includes(searchTerm)
      );
    }

    // Apply open/closed filter
    if (showOpenOnly) {
      filtered = filtered.filter(r => r.status === 'Open');
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'fastest-delivery':
        // For now, just sort by rating as we don't have delivery time data
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'best-match':
      default:
        // Keep original order or sort by sponsored first
        filtered.sort((a, b) => {
          if (a.isSponsored && !b.isSponsored) return -1;
          if (!a.isSponsored && b.isSponsored) return 1;
          return b.rating - a.rating;
        });
    }

    return filtered;
  }, [restaurants, selectedCuisines, sortBy, searchLocation, showOpenOnly]);

  const handleCuisineToggle = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleResetFilters = () => {
    setSelectedCuisines([]);
    setSearchLocation('');
    setSearchRadius('10');
    setShowOpenOnly(false);
    setSortBy('best-match');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="lg:col-span-3">
            <div className="space-y-4">
              {/* Cuisines Filter */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowCuisinesExpanded(!showCuisinesExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Cuisines
                    </CardTitle>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      showCuisinesExpanded && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
                {showCuisinesExpanded && (
                  <CardContent className="pt-0">
                    {availableCuisines.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No cuisines available</p>
                    ) : (
                      <>
                        <ul className="space-y-2 text-sm max-h-64 overflow-y-auto">
                          {availableCuisines.map(cuisine => {
                            // Count total restaurants with this cuisine
                            const count = restaurants.filter(r =>
                              r.cuisineTypes.includes(cuisine)
                            ).length;
                            return (
                              <li key={cuisine} className="flex items-center justify-between">
                                <label
                                  htmlFor={`cuisine-${cuisine}`}
                                  className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary flex-1"
                                >
                                  <Checkbox
                                    id={`cuisine-${cuisine}`}
                                    checked={selectedCuisines.includes(cuisine)}
                                    onCheckedChange={() => handleCuisineToggle(cuisine)}
                                  />
                                  <span>{cuisine}</span>
                                </label>
                                <span className="text-xs text-muted-foreground">({count})</span>
                              </li>
                            );
                          })}
                        </ul>
                        {availableCuisines.length > 5 && (
                          <Button
                            variant="link"
                            className="text-xs text-primary mt-2 p-0 h-auto"
                          >
                            See more cuisines
                          </Button>
                        )}
                      </>
                    )}
                  </CardContent>
                )}
              </Card>

              {/* Opening Hours Filter */}
              <Card>
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setShowOpeningExpanded(!showOpeningExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Opening
                    </CardTitle>
                    <ChevronDown className={cn(
                      "h-4 w-4 transition-transform",
                      showOpeningExpanded && "rotate-180"
                    )} />
                  </div>
                </CardHeader>
                {showOpeningExpanded && (
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center justify-between">
                        <label
                          htmlFor="opening-now"
                          className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary flex-1"
                        >
                          <Checkbox
                            id="opening-now"
                            checked={showOpenOnly}
                            onCheckedChange={(checked) => setShowOpenOnly(checked as boolean)}
                          />
                          <span>Open Now</span>
                        </label>
                        <span className="text-xs text-muted-foreground">
                          ({restaurants.filter(r => r.status === 'Open').length})
                        </span>
                      </li>
                    </ul>
                  </CardContent>
                )}
              </Card>
            </div>
          </aside>


          {/* Main Content - Restaurant Listings */}
          <main className="lg:col-span-6">
            {/* Search Bar and Results Count */}
            <div className="mb-4">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="pl-9 pr-8"
                  />
                  {searchLocation && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchLocation('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Input
                  type="text"
                  placeholder="Radius"
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  className="w-20"
                />
                <Button
                  variant="link"
                  className="text-primary text-sm"
                  onClick={handleResetFilters}
                >
                  Reset
                </Button>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {filteredAndSortedRestaurants.length} Restaurant{filteredAndSortedRestaurants.length !== 1 ? 's' : ''} Found
                {searchLocation && ` In ${searchLocation}`}
              </h2>
            </div>

            {/* Restaurant Cards */}
            {filteredAndSortedRestaurants.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No restaurants match your filters.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={handleResetFilters}
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAndSortedRestaurants.map((restaurant) => (
                  <Card key={restaurant.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* Restaurant Logo */}
                        <div className="relative w-24 h-24 flex-shrink-0">
                          <Image
                            src={restaurant.logoUrl}
                            alt={restaurant.name}
                            fill
                            className="object-cover rounded-md"
                          />
                          {restaurant.status === 'Open' && (
                            <Badge className="absolute -top-2 -left-2 bg-green-500 text-white text-xs">
                              OPEN
                            </Badge>
                          )}
                        </div>

                        {/* Restaurant Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <Link
                                href={`/restaurants/${restaurant.id}`}
                                className="hover:text-primary transition-colors"
                              >
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  {restaurant.name}
                                  {restaurant.isSponsored && (
                                    <span className="ml-2 text-xs text-red-500 font-normal">
                                      Sponsored
                                    </span>
                                  )}
                                </h3>
                              </Link>

                              {/* Rating */}
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      "h-4 w-4",
                                      star <= Math.round(restaurant.rating)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                    )}
                                  />
                                ))}
                                <span className="text-sm text-muted-foreground ml-1">
                                  ({restaurant.reviewCount})
                                </span>
                              </div>
                            </div>

                            {/* Favorite Button */}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 flex-shrink-0"
                            >
                              <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                            </Button>
                          </div>

                          {/* Type of Food */}
                          <p className="text-sm text-muted-foreground mb-2">
                            Type of food : {restaurant.cuisineTypes.join(', ')}
                          </p>

                          {/* Special Deals */}
                          {restaurant.specialDeals && (
                            <div className="flex items-center gap-1 mb-2">
                              <BadgePercent className="h-3 w-3 text-red-500" />
                              <span className="text-sm text-red-500 font-medium">
                                {restaurant.specialDeals}
                              </span>
                            </div>
                          )}

                          {/* Location and Status */}
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              <span>{restaurant.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className={cn(
                                restaurant.status === 'Open' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                              )}>
                                {restaurant.status}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* View Menu Button */}
                        <div className="flex-shrink-0">
                          <Link href={`/restaurants/${restaurant.id}`}>
                            <Button
                              variant="outline"
                              className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              VIEW MENU
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>

          {/* Right Sidebar - Sort Options */}
          <aside className="lg:col-span-3">
            <div className="space-y-4 sticky top-4">
              {/* Sort By Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sort By</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-3 text-sm">
                    <li>
                      <button
                        onClick={() => setSortBy('best-match')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'best-match' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <BadgePercent className="h-4 w-4 text-red-500" />
                        Best Match
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSortBy('alphabetical')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'alphabetical' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                        </svg>
                        Alphabetical
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSortBy('rating')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'rating' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <Star className="h-4 w-4" />
                        Ratings
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSortBy('min-order')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'min-order' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Minimum order value
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSortBy('delivery-fee')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'delivery-fee' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Delivery fee
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setSortBy('fastest-delivery')}
                        className={cn(
                          "flex items-center gap-2 w-full text-left hover:text-primary transition-colors",
                          sortBy === 'fastest-delivery' ? "text-primary font-medium" : "text-muted-foreground"
                        )}
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Fastest delivery
                      </button>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Call to Action Card */}
              <Card className="bg-orange-500 text-white border-none">
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-bold mb-3">
                    Can&apos;t find a Restaurant?
                  </h3>
                  <p className="text-sm mb-0">
                    If you can&apos;t find the Restaurant that you want to Order, request to add in our list
                  </p>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}


