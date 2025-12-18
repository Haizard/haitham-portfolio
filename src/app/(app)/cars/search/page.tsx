"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { VehicleCard } from '@/components/cars/vehicle-card';
import { CarSearchForm } from '@/components/cars/car-search-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Vehicle } from '@/lib/cars-data';

export default function CarSearchPage() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [transmission, setTransmission] = useState('all');
  const [fuelType, setFuelType] = useState('all');

  useEffect(() => {
    searchVehicles();
  }, [searchParams]);

  const searchVehicles = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(searchParams.toString());

      // Add filter params
      if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
      if (priceRange[1] < 500) params.set('maxPrice', priceRange[1].toString());
      if (selectedFeatures.length > 0) params.set('features', selectedFeatures.join(','));
      if (transmission && transmission !== 'all') params.set('transmission', transmission);
      if (fuelType && fuelType !== 'all') params.set('fuelType', fuelType);

      const response = await fetch(`/api/cars/vehicles?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to search vehicles');

      const data = await response.json();
      setVehicles(data.vehicles || []);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = () => {
    searchVehicles();
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const commonFeatures = ['gps', 'bluetooth', 'backup_camera', 'sunroof', 'child_seat', 'usb_port', 'cruise_control'];

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Price Range */}
      <div className="space-y-3">
        <Label>Price Range (per day)</Label>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={10}
          className="w-full"
        />
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      {/* Transmission */}
      <div className="space-y-3">
        <Label>Transmission</Label>
        <Select value={transmission} onValueChange={setTransmission}>
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="automatic">Automatic</SelectItem>
            <SelectItem value="manual">Manual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Fuel Type */}
      <div className="space-y-3">
        <Label>Fuel Type</Label>
        <Select value={fuelType} onValueChange={setFuelType}>
          <SelectTrigger>
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="petrol">Petrol</SelectItem>
            <SelectItem value="diesel">Diesel</SelectItem>
            <SelectItem value="electric">Electric</SelectItem>
            <SelectItem value="hybrid">Hybrid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Features */}
      <div className="space-y-3">
        <Label>Features</Label>
        <div className="space-y-2">
          {commonFeatures.map((feature) => (
            <div key={feature} className="flex items-center space-x-2">
              <Checkbox
                id={feature}
                checked={selectedFeatures.includes(feature)}
                onCheckedChange={() => toggleFeature(feature)}
              />
              <label
                htmlFor={feature}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
              >
                {feature.replace('_', ' ')}
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
        <CarSearchForm />
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
              {searchParams.get('city') || 'All'} Car Rentals
            </h1>
            <p className="text-muted-foreground">
              {isLoading ? 'Searching...' : `${vehicles.length} vehicles found`}
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {/* No Results */}
          {!isLoading && vehicles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No vehicles found matching your criteria.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters or search for a different location.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results Grid */}
          {!isLoading && vehicles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
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

