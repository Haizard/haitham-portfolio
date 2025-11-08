"use client";

import { format } from 'date-fns';
import { Plane, Clock, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { FlightResult } from '@/lib/flights-data';

interface FlightCardProps {
  flight: FlightResult;
  onBookNow: (flight: FlightResult) => void;
  isLoading?: boolean;
}

export function FlightCard({ flight, onBookNow, isLoading }: FlightCardProps) {
  const departureTime = new Date(flight.departureTime);
  const arrivalTime = new Date(flight.arrivalTime);
  const durationHours = Math.floor(flight.duration / 60);
  const durationMinutes = flight.duration % 60;

  const getStopsText = (stops: number) => {
    if (stops === 0) return 'Direct';
    if (stops === 1) return '1 Stop';
    return `${stops} Stops`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Flight Info */}
          <div className="flex-1 space-y-4">
            {/* Airline */}
            <div className="flex items-center gap-2">
              <Plane className="h-5 w-5 text-primary" />
              <span className="font-semibold">{flight.airline}</span>
              <Badge variant="outline">{flight.airlineCode}</Badge>
            </div>

            {/* Times and Route */}
            <div className="flex items-center gap-4">
              {/* Departure */}
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {format(departureTime, 'HH:mm')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {flight.departureAirport}
                </div>
              </div>

              {/* Duration and Stops */}
              <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {durationHours}h {durationMinutes}m
                  </span>
                </div>
                <div className="w-full flex items-center gap-2">
                  <div className="flex-1 h-px bg-border" />
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 h-px bg-border" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getStopsText(flight.stops)}
                </div>
              </div>

              {/* Arrival */}
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {format(arrivalTime, 'HH:mm')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {flight.arrivalAirport}
                </div>
              </div>
            </div>
          </div>

          {/* Price and CTA */}
          <div className="flex flex-col items-center md:items-end gap-3 md:min-w-[180px]">
            <div className="text-center md:text-right">
              <div className="text-3xl font-bold">
                ${flight.price.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {flight.currency}
              </div>
            </div>
            <Button
              onClick={() => onBookNow(flight)}
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Processing...' : 'Book Now'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

