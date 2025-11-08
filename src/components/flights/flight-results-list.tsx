"use client";

import { useState } from 'react';
import { FlightCard } from './flight-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Plane } from 'lucide-react';
import type { FlightResult } from '@/lib/flights-data';
import { useToast } from '@/hooks/use-toast';

interface FlightResultsListProps {
  flights: FlightResult[];
  searchId: string;
}

type SortOption = 'price-asc' | 'price-desc' | 'duration-asc' | 'departure-asc';

export function FlightResultsList({ flights, searchId }: FlightResultsListProps) {
  const { toast } = useToast();
  const [sortBy, setSortBy] = useState<SortOption>('price-asc');
  const [filterStops, setFilterStops] = useState<number[]>([]);
  const [filterAirlines, setFilterAirlines] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(Math.max(...flights.map(f => f.price)));
  const [bookingFlightId, setBookingFlightId] = useState<string | null>(null);

  // Get unique airlines
  const airlines = Array.from(new Set(flights.map(f => f.airline)));

  // Filter flights
  let filteredFlights = flights.filter(flight => {
    if (filterStops.length > 0 && !filterStops.includes(flight.stops)) {
      return false;
    }
    if (filterAirlines.length > 0 && !filterAirlines.includes(flight.airline)) {
      return false;
    }
    if (flight.price > maxPrice) {
      return false;
    }
    return true;
  });

  // Sort flights
  filteredFlights = [...filteredFlights].sort((a, b) => {
    switch (sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'duration-asc':
        return a.duration - b.duration;
      case 'departure-asc':
        return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
      default:
        return 0;
    }
  });

  const handleBookNow = async (flight: FlightResult) => {
    setBookingFlightId(flight.flightId);

    try {
      // Track referral
      const response = await fetch('/api/flights/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          searchId,
          flightId: flight.flightId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to track referral');
      }

      const data = await response.json();

      // Redirect to booking URL
      window.open(data.referralUrl, '_blank');

      toast({
        title: 'Redirecting to booking...',
        description: 'You will be redirected to complete your booking.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process booking',
        variant: 'destructive',
      });
    } finally {
      setBookingFlightId(null);
    }
  };

  const toggleStopFilter = (stops: number) => {
    setFilterStops(prev =>
      prev.includes(stops)
        ? prev.filter(s => s !== stops)
        : [...prev, stops]
    );
  };

  const toggleAirlineFilter = (airline: string) => {
    setFilterAirlines(prev =>
      prev.includes(airline)
        ? prev.filter(a => a !== airline)
        : [...prev, airline]
    );
  };

  return (
    <div className="grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Filters Sidebar */}
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Stops Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Stops</Label>
              <div className="space-y-2">
                {[0, 1, 2].map((stops) => (
                  <div key={stops} className="flex items-center space-x-2">
                    <Checkbox
                      id={`stops-${stops}`}
                      checked={filterStops.includes(stops)}
                      onCheckedChange={() => toggleStopFilter(stops)}
                    />
                    <label
                      htmlFor={`stops-${stops}`}
                      className="text-sm cursor-pointer"
                    >
                      {stops === 0 ? 'Direct' : `${stops} Stop${stops > 1 ? 's' : ''}`}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Airlines Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Airlines</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {airlines.map((airline) => (
                  <div key={airline} className="flex items-center space-x-2">
                    <Checkbox
                      id={`airline-${airline}`}
                      checked={filterAirlines.includes(airline)}
                      onCheckedChange={() => toggleAirlineFilter(airline)}
                    />
                    <label
                      htmlFor={`airline-${airline}`}
                      className="text-sm cursor-pointer"
                    >
                      {airline}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                Max Price: ${maxPrice.toLocaleString()}
              </Label>
              <Slider
                value={[maxPrice]}
                onValueChange={([value]) => setMaxPrice(value)}
                max={Math.max(...flights.map(f => f.price))}
                min={Math.min(...flights.map(f => f.price))}
                step={50}
              />
            </div>

            {/* Reset Filters */}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFilterStops([]);
                setFilterAirlines([]);
                setMaxPrice(Math.max(...flights.map(f => f.price)));
              }}
            >
              Reset Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {/* Sort and Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredFlights.length} flight{filteredFlights.length !== 1 ? 's' : ''} found
          </p>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="duration-asc">Duration: Shortest</SelectItem>
              <SelectItem value="departure-asc">Departure: Earliest</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Flight Cards */}
        {filteredFlights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No flights found matching your filters
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setFilterStops([]);
                  setFilterAirlines([]);
                  setMaxPrice(Math.max(...flights.map(f => f.price)));
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredFlights.map((flight) => (
              <FlightCard
                key={flight.flightId}
                flight={flight}
                onBookNow={handleBookNow}
                isLoading={bookingFlightId === flight.flightId}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

