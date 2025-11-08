"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Loader2, Plane, Calendar, Users, ArrowLeft } from 'lucide-react';
import { FlightResultsList } from '@/components/flights/flight-results-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FlightResult } from '@/lib/flights-data';

function FlightSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [flights, setFlights] = useState<FlightResult[]>([]);
  const [searchId, setSearchId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  // Extract search parameters
  const origin = searchParams.get('origin') || '';
  const destination = searchParams.get('destination') || '';
  const departureDate = searchParams.get('departureDate') || '';
  const returnDate = searchParams.get('returnDate');
  const adults = parseInt(searchParams.get('adults') || '1');
  const children = parseInt(searchParams.get('children') || '0');
  const infants = parseInt(searchParams.get('infants') || '0');
  const flightClass = searchParams.get('class') || 'economy';

  useEffect(() => {
    searchFlights();
  }, [searchParams]);

  const searchFlights = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        origin,
        destination,
        departureDate,
        adults: adults.toString(),
        children: children.toString(),
        infants: infants.toString(),
        class: flightClass,
      });

      if (returnDate) {
        params.append('returnDate', returnDate);
      }

      const response = await fetch(`/api/flights/search?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to search flights');
      }

      const data = await response.json();
      setFlights(data.results);
      setSearchId(data.searchId);
      setCached(data.cached);
    } catch (err: any) {
      setError(err.message || 'Failed to search flights');
    } finally {
      setIsLoading(false);
    }
  };

  const totalPassengers = adults + children + infants;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Searching for flights...</p>
          <p className="text-sm text-muted-foreground">
            This may take a few moments
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Plane className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Search Failed</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => router.push('/flights')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Search Summary Header */}
      <div className="bg-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/flights')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Modify Search
            </Button>
            {cached && (
              <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
                Cached Results
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-6">
            {/* Route */}
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {origin} → {destination}
              </span>
            </div>

            {/* Dates */}
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {format(new Date(departureDate), 'MMM dd, yyyy')}
                {returnDate && ` - ${format(new Date(returnDate), 'MMM dd, yyyy')}`}
              </span>
            </div>

            {/* Passengers */}
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span>
                {totalPassengers} passenger{totalPassengers !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Class */}
            <Badge variant="secondary" className="bg-primary-foreground/20 text-primary-foreground">
              {flightClass.replace('_', ' ')}
            </Badge>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {flights.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Flights Found</h2>
              <p className="text-muted-foreground mb-4">
                We couldn't find any flights matching your search criteria.
              </p>
              <Button onClick={() => router.push('/flights')}>
                Try Different Dates
              </Button>
            </CardContent>
          </Card>
        ) : (
          <FlightResultsList flights={flights} searchId={searchId} />
        )}
      </div>
    </div>
  );
}

export default function FlightSearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <FlightSearchContent />
    </Suspense>
  );
}

