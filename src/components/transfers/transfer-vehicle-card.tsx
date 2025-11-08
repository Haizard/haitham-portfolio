"use client";

import { useRouter } from 'next/navigation';
import { Car, Users, Luggage, Star, MapPin, DollarSign } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WishlistButton } from '@/components/wishlists/wishlist-button';
import { CompareButton } from '@/components/comparisons/compare-button';
import { useFormatPrice } from '@/contexts/currency-context';

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

interface TransferVehicleCardProps {
  vehicle: TransferVehicle;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  passengers?: number;
  luggage?: number;
  transferType?: string;
}

export function TransferVehicleCard({
  vehicle,
  pickupLocation,
  dropoffLocation,
  pickupDate,
  pickupTime,
  passengers,
  luggage,
  transferType,
}: TransferVehicleCardProps) {
  const router = useRouter();
  const format = useFormatPrice();

  const primaryImage = vehicle.images.find((img) => img.isPrimary) || vehicle.images[0];

  const handleBookNow = () => {
    const params = new URLSearchParams({
      ...(pickupLocation && { pickupLocation }),
      ...(dropoffLocation && { dropoffLocation }),
      ...(pickupDate && { pickupDate }),
      ...(pickupTime && { pickupTime }),
      ...(passengers && { passengers: passengers.toString() }),
      ...(luggage && { luggage: luggage.toString() }),
      ...(transferType && { transferType }),
    });

    router.push(`/transfers/${vehicle.id}?${params.toString()}`);
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      sedan: 'Sedan',
      suv: 'SUV',
      van: 'Van',
      minibus: 'Minibus',
      bus: 'Bus',
      luxury: 'Luxury',
    };
    return labels[category] || category;
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Vehicle Image */}
      <div className="relative h-48 bg-muted">
        {primaryImage ? (
          <img
            src={primaryImage.url}
            alt={`${vehicle.make} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Car className="h-16 w-16 text-muted-foreground" />
          </div>
        )}
        <Badge className="absolute top-2 left-2 capitalize">
          {getCategoryLabel(vehicle.category)}
        </Badge>

        {/* Wishlist Button */}
        <div className="absolute bottom-2 right-2">
          <WishlistButton
            itemType="transfer"
            itemId={vehicle.id}
            variant="ghost"
            size="icon"
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          />
        </div>
      </div>

      <CardHeader>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-1">
            {vehicle.make} {vehicle.model} {vehicle.year}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">
              {vehicle.location.city}, {vehicle.location.state}
            </span>
          </div>

          {vehicle.averageRating && (
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium">
                {vehicle.averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                ({vehicle.reviewCount} reviews)
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Capacity */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.capacity.passengers} passengers</span>
          </div>
          <div className="flex items-center gap-2">
            <Luggage className="h-4 w-4 text-muted-foreground" />
            <span>{vehicle.capacity.luggage} bags</span>
          </div>
        </div>

        {/* Features */}
        {vehicle.features.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vehicle.features.slice(0, 3).map((feature) => (
              <Badge key={feature} variant="secondary" className="text-xs capitalize">
                {feature.replace('_', ' ')}
              </Badge>
            ))}
            {vehicle.features.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{vehicle.features.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Driver Info */}
        {vehicle.driverInfo && (
          <div className="text-sm text-muted-foreground">
            <p>Driver: {vehicle.driverInfo.name}</p>
            <p>{vehicle.driverInfo.yearsOfExperience} years experience</p>
          </div>
        )}

        {/* Pricing */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">From</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold">
              {format(vehicle.pricing.basePrice, vehicle.pricing.currency as any)}
            </p>
            <p className="text-xs text-muted-foreground">Base price</p>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2">
        <Button onClick={handleBookNow} className="w-full">
          Book Now
        </Button>
        <CompareButton
          itemType="transfer"
          itemId={vehicle.id}
          className="w-full"
        />
      </CardFooter>
    </Card>
  );
}

