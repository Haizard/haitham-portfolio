"use client";

import { MapPin, Star, Wifi, Car, Waves, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WishlistButton } from '@/components/wishlists/wishlist-button';
import { CompareButton } from '@/components/comparisons/compare-button';
import { useFormatPrice } from '@/contexts/currency-context';
import type { Property } from '@/lib/hotels-data';

interface PropertyCardProps {
  property: Property;
  searchParams?: URLSearchParams;
}

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
};

export function PropertyCard({ property, searchParams }: PropertyCardProps) {
  const format = useFormatPrice();
  const primaryImage = property.images.find((img) => img.order === 0) || property.images[0];

  // Build the detail page URL with search params
  const detailUrl = searchParams
    ? `/hotels/${property.slug}?${searchParams.toString()}`
    : `/hotels/${property.slug}`;

  // Get top 4 amenities to display
  const displayAmenities = property.amenities.slice(0, 4);

  // Get minimum room price (placeholder - would come from property.rooms in real app)
  const minPrice = 100; // This should be calculated from property.rooms

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <Link href={detailUrl}>
        <div className="relative h-48 w-full overflow-hidden bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={property.name}
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image available
            </div>
          )}
          
          {/* Property Type Badge */}
          <Badge className="absolute top-2 left-2 capitalize">
            {property.type}
          </Badge>

          {/* Star Rating */}
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-semibold">{property.starRating}</span>
          </div>

          {/* Wishlist Button */}
          <div className="absolute bottom-2 right-2">
            <WishlistButton
              itemType="property"
              itemId={property.id || ''}
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
            {property.name}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
          <MapPin className="h-4 w-4" />
          <span className="line-clamp-1">
            {property.location.city}, {property.location.country}
          </span>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {property.description}
        </p>

        {/* Amenities */}
        <div className="flex flex-wrap gap-2 mt-3">
          {displayAmenities.map((amenity) => {
            const Icon = amenityIcons[amenity];
            return (
              <div
                key={amenity}
                className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md"
              >
                {Icon && <Icon className="h-3 w-3" />}
                <span className="capitalize">{amenity}</span>
              </div>
            );
          })}
          {property.amenities.length > 4 && (
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              +{property.amenities.length - 4} more
            </div>
          )}
        </div>

        {/* Rating & Reviews */}
        {property.averageRating && property.reviewCount ? (
          <div className="flex items-center gap-2 mt-3">
            <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded-md">
              <span className="text-sm font-semibold">
                {property.averageRating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">
              {property.reviewCount} {property.reviewCount === 1 ? 'review' : 'reviews'}
            </span>
          </div>
        ) : null}
      </CardContent>

      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="w-full flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Starting from</p>
            <p className="text-2xl font-bold">
              {format(minPrice, 'USD')}
              <span className="text-sm font-normal text-muted-foreground">/night</span>
            </p>
          </div>
          <Button asChild>
            <Link href={detailUrl}>View Details</Link>
          </Button>
        </div>
        <div className="w-full">
          <CompareButton
            itemType="property"
            itemId={property.id || ''}
            className="w-full"
          />
        </div>
      </CardFooter>
    </Card>
  );
}

