"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransferVehicleCard } from '@/components/transfers/transfer-vehicle-card';
import { TransferSearchForm } from '@/components/transfers/transfer-search-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface TransferVehicle {
  id: string;
  category: string;
  make: string;
  model: string;
  year: number;
  capacity: {
    passengers: number;
    luggage: number;
  };
  features: string[];
  images: Array<{
    url: string;
    isPrimary: boolean;
  }>;
  location: {
    city: string;
    state: string;
    country: string;
  };
  pricing: {
    basePrice: number;
    currency: string;
  };
  averageRating?: number;
  reviewCount?: number;
  driverInfo?: {
    name: string;
    yearsOfExperience: number;
  };
}

function TransferSearchResults() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState<TransferVehicle[]>([]);
  const [filteredVehicles, setFilteredVehicles] = useState<TransferVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('price_low');

  const pickupLocation = searchParams.get('pickupLocation') || '';
  const dropoffLocation = searchParams.get('dropoffLocation') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const passengers = parseInt(searchParams.get('passengers') || '2');
  const luggage = parseInt(searchParams.get('luggage') || '2');
  const transferType = searchParams.get('transferType') || '';

  useEffect(() => {
    fetchVehicles();
  }, [searchParams]);

  useEffect(() => {
    applyFilters();
  }, [vehicles, selectedCategories, selectedFeatures, sortBy]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (pickupLocation) {
        // Extract city from pickup location (simple approach)
        const city = pickupLocation.split(',')[0].trim();
        params.append('city', city);
      }
      if (passengers) params.append('minPassengers', passengers.toString());
      if (luggage) params.append('minLuggage', luggage.toString());
      if (pickupDate) params.append('pickupDate', pickupDate);
      if (pickupTime) params.append('pickupTime', pickupTime);

      const response = await fetch(`/api/transfers/vehicles?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVehicles(data.vehicles);
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...vehicles];

    // Filter by category
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((v) => selectedCategories.includes(v.category));
    }

    // Filter by features
    if (selectedFeatures.length > 0) {
      filtered = filtered.filter((v) =>
        selectedFeatures.every((feature) => v.features.includes(feature))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.pricing.basePrice - b.pricing.basePrice;
        case 'price_high':
          return b.pricing.basePrice - a.pricing.basePrice;
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'capacity':
          return b.capacity.passengers - a.capacity.passengers;
        default:
          return 0;
      }
    });

    setFilteredVehicles(filtered);
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const allFeatures = Array.from(
    new Set(vehicles.flatMap((v) => v.features))
  ).slice(0, 10);

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Modify Search</CardTitle>
          </CardHeader>
          <CardContent>
            <TransferSearchForm />
          </CardContent>
        </Card>

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">
              {pickupLocation && dropoffLocation
                ? `${pickupLocation} → ${dropoffLocation}`
                : 'Available Transfers'}
            </h1>
            <p className="text-muted-foreground">
              {loading ? 'Searching...' : `${filteredVehicles.length} vehicles found`}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:hidden"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'}`}>
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Filters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sort By */}
                <div className="space-y-2">
                  <Label>Sort By</Label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_low">Price: Low to High</SelectItem>
                      <SelectItem value="price_high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="capacity">Largest Capacity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Vehicle Category */}
                <div className="space-y-2">
                  <Label>Vehicle Category</Label>
                  <div className="space-y-2">
                    {['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury'].map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label
                          htmlFor={category}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features */}
                {allFeatures.length > 0 && (
                  <div className="space-y-2">
                    <Label>Features</Label>
                    <div className="space-y-2">
                      {allFeatures.map((feature) => (
                        <div key={feature} className="flex items-center space-x-2">
                          <Checkbox
                            id={feature}
                            checked={selectedFeatures.includes(feature)}
                            onCheckedChange={() => toggleFeature(feature)}
                          />
                          <label
                            htmlFor={feature}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize cursor-pointer"
                          >
                            {feature.replace('_', ' ')}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredVehicles.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    No vehicles found matching your criteria. Try adjusting your filters.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredVehicles.map((vehicle) => (
                  <TransferVehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                    pickupDate={pickupDate}
                    pickupTime={pickupTime}
                    passengers={passengers}
                    luggage={luggage}
                    transferType={transferType}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransferSearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TransferSearchResults />
    </Suspense>
  );
}

