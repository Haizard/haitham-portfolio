"use client";

import { Users, Briefcase, Cog, Fuel, MapPin } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WishlistButton } from '@/components/wishlists/wishlist-button';
import { CompareButton } from '@/components/comparisons/compare-button';
import type { Vehicle } from '@/lib/cars-data';

interface VehicleCardProps {
  vehicle: Vehicle;
  searchParams?: URLSearchParams;
}

const fuelTypeIcons: Record<string, string> = {
  petrol: '⛽',
  diesel: '🛢️',
  electric: '⚡',
  hybrid: '🔋',
};

export function VehicleCard({ vehicle, searchParams }: VehicleCardProps) {
  const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];
  
  // Build the detail page URL with search params
  const detailUrl = searchParams
    ? `/cars/${vehicle.id}?${searchParams.toString()}`
    : `/cars/${vehicle.id}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={detailUrl}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
          
          {/* Category Badge */}
          <Badge className="absolute top-2 left-2 capitalize">
            {vehicle.category}
          </Badge>

          {/* Rating */}
          {vehicle.averageRating && vehicle.reviewCount ? (
            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
              <span className="text-sm font-semibold">{vehicle.averageRating.toFixed(1)}</span>
              <span className="text-xs text-muted-foreground">({vehicle.reviewCount})</span>
            </div>
          ) : null}

          {/* Wishlist Button */}
          <div className="absolute bottom-2 right-2">
            <WishlistButton
              itemType="vehicle"
              itemId={vehicle.id || ''}
              variant="ghost"
              size="icon"
              className="bg-white/90 backdrop-blur-sm hover:bg-white"
            />
          </div>
        </div>
      </Link>

      <CardContent className="p-4">
        <Link href={detailUrl}>
          <h3 className="text-lg font-semibold hover:text-primary transition-colors line-clamp-1">
            {vehicle.make} {vehicle.model}
          </h3>
        </Link>

        <p className="text-sm text-muted-foreground">{vehicle.year}</p>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">
            {vehicle.location.city}, {vehicle.location.country}
          </span>
        </div>

        {/* Vehicle Specs */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.seats} Seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Briefcase className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.luggage} Bags</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Cog className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{vehicle.transmission}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Fuel className="h-4 w-4 text-muted-foreground" />
            <span className="capitalize">{vehicle.fuelType}</span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {vehicle.features.slice(0, 3).map((feature) => (
              <div
                key={feature}
                className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md capitalize"
              >
                {feature.replace('_', ' ')}
              </div>
            ))}
            {vehicle.features.length > 3 && (
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
                +{vehicle.features.length - 3} more
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3 border-t">
        <div className="w-full flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">From</p>
            <p className="text-2xl font-bold">
              ${vehicle.pricing.dailyRate}
              <span className="text-sm font-normal text-muted-foreground">/day</span>
            </p>
            {vehicle.pricing.deposit > 0 && (
              <p className="text-xs text-muted-foreground">
                + ${vehicle.pricing.deposit} deposit
              </p>
            )}
          </div>
          <Button asChild>
            <Link href={detailUrl}>View Details</Link>
          </Button>
        </div>
        <div className="w-full">
          <CompareButton
            itemType="vehicle"
            itemId={vehicle.id || ''}
            className="w-full"
          />
        </div>
      </CardFooter>
    </Card>
  );
}

