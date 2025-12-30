"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { PropertyCard } from '@/components/hotels/property-card';
import { HotelSearchForm } from '@/components/hotels/hotel-search-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import type { Property } from '@/lib/hotels-data';

export default function HotelSearchPage() {
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    searchProperties();
  }, [searchParams]);

  const searchProperties = async () => {
    setIsLoading(true);
    try {
      // Build query string from search params
      const params = new URLSearchParams(searchParams.toString());

      // Add filter params
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < 1000) params.set('maxPrice', priceRange[1].toString());
      if (selectedAmenities.length > 0) params.set('amenities', selectedAmenities.join(','));
      if (minRating > 0) params.set('minRating', minRating.toString());

      const response = await fetch(`/api/hotels/properties?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search properties');

      const data = await response.json();
      setProperties(data.properties || []);
    } catch (error) {
      console.error('Error searching properties:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    searchProperties();
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const commonAmenities = ['wifi', 'parking', 'pool', 'gym', 'restaurant', 'spa', 'bar', 'airport_shuttle'];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range (per night)</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={1000}
          step={10}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Star Rating */}
      <div className="space-y-3">
        <Label>Minimum Star Rating</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant={minRating === rating ? 'default' : 'outline'}
              size="sm"
              onClick={() => setMinRating(rating === minRating ? 0 : rating)}
            >
              {rating}★
            </Button>
          ))}
        </div>
      </div>

      {/* Amenities */}
      <div className="space-y-3">
        <Label>Amenities</Label>
        <div className="space-y-2">
          {commonAmenities.map((amenity) => (
            <div key={amenity} className="flex items-center space-x-2">
              <Checkbox
                id={amenity}
                checked={selectedAmenities.includes(amenity)}
                onCheckedChange={() => toggleAmenity(amenity)}
              />
              <label
                htmlFor={amenity}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {amenity.replace('_', ' ')}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Apply Filters Button */}
      <Button onClick={handleFilterChange} className="w-full">
        Apply Filters
      </Button>
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Search Form */}
      <div className="mb-8">
        <HotelSearchForm mode="compact" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Desktop Filters */}
        <aside className="hidden lg:block">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FilterPanel />
            </CardContent>
          </Card>
        </aside>

        {/* Results */}
        <main className="lg:col-span-3">
          {/* Mobile Filters */}
          <div className="lg:hidden mb-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterPanel />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Results Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {searchParams.get('city') || 'All'} Hotels
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `${properties.length} properties found`}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* No Results */}
          {!isLoading && properties.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No properties found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search for a different destination.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!isLoading && properties.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={property}
                  searchParams={searchParams}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

