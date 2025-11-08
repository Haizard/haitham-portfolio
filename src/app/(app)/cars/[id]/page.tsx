"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, MapPin, Star, Users, Briefcase, Cog, Fuel, ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VehicleBookingCard } from '@/components/cars/vehicle-booking-card';
import { PriceAlertButton } from '@/components/price-alerts/price-alert-button';
import type { Vehicle } from '@/lib/cars-data';

export default function VehicleDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '10:00';
  const returnDate = searchParams.get('returnDate') || '';
  const returnTime = searchParams.get('returnTime') || '10:00';

  useEffect(() => {
    fetchVehicleDetails();
  }, [params.id]);

  const fetchVehicleDetails = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/cars/vehicles/${params.id}`);
      if (!response.ok) throw new Error('Vehicle not found');
      const data = await response.json();
      setVehicle(data.vehicle);
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
    }
  };

  const prevImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Vehicle Not Found</h1>
        <p className="text-muted-foreground">The vehicle you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Image Gallery */}
      <div className="relative h-[400px] md:h-[500px] bg-muted">
        {vehicle.images.length > 0 ? (
          <>
            <Image
              src={vehicle.images[currentImageIndex].url}
              alt={vehicle.images[currentImageIndex].caption || `${vehicle.make} ${vehicle.model}`}
              fill
              className="object-cover"
              priority
            />
            
            {/* Navigation Arrows */}
            {vehicle.images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </>
            )}

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentImageIndex + 1} / {vehicle.images.length}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No images available
          </div>
        )}
      </div>

      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="capitalize">{vehicle.category}</Badge>
                <Badge variant="outline" className="capitalize">{vehicle.status}</Badge>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                {vehicle.make} {vehicle.model} {vehicle.year}
              </h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {vehicle.location.city}, {vehicle.location.state}, {vehicle.location.country}
                </span>
              </div>

              {vehicle.averageRating && vehicle.reviewCount ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{vehicle.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({vehicle.reviewCount} reviews · {vehicle.totalRentals} rentals)
                  </span>
                </div>
              ) : null}

              {/* Price Alert Button */}
              {searchParams.get('pickupDate') && searchParams.get('returnDate') && (
                <div className="mt-4">
                  <PriceAlertButton
                    alertType="vehicle"
                    targetId={vehicle.id || ''}
                    targetName={`${vehicle.make} ${vehicle.model}`}
                    currentPrice={vehicle.pricing.dailyRate || 0}
                    searchCriteria={{
                      pickupDate: searchParams.get('pickupDate') || '',
                      returnDate: searchParams.get('returnDate') || '',
                    }}
                    variant="outline"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Vehicle Specifications */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Vehicle Specifications</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Users className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-muted-foreground">Seats</span>
                  <span className="font-semibold">{vehicle.seats}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Briefcase className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-muted-foreground">Luggage</span>
                  <span className="font-semibold">{vehicle.luggage} bags</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Cog className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-muted-foreground">Transmission</span>
                  <span className="font-semibold capitalize">{vehicle.transmission}</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
                  <Fuel className="h-6 w-6 text-primary mb-2" />
                  <span className="text-sm text-muted-foreground">Fuel</span>
                  <span className="font-semibold capitalize">{vehicle.fuelType}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Color</span>
                  <p className="font-semibold">{vehicle.color}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <span className="text-sm text-muted-foreground">Doors</span>
                  <p className="font-semibold">{vehicle.doors}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Features */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {vehicle.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg"
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="capitalize text-sm">{feature.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Pricing Details */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pricing</h2>
              <div className="grid gap-3">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Daily Rate</span>
                  <span className="font-semibold">
                    ${vehicle.pricing.dailyRate} {vehicle.pricing.currency}
                  </span>
                </div>
                {vehicle.pricing.weeklyRate && (
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Weekly Rate</span>
                    <span className="font-semibold">
                      ${vehicle.pricing.weeklyRate} {vehicle.pricing.currency}
                    </span>
                  </div>
                )}
                {vehicle.pricing.monthlyRate && (
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Monthly Rate</span>
                    <span className="font-semibold">
                      ${vehicle.pricing.monthlyRate} {vehicle.pricing.currency}
                    </span>
                  </div>
                )}
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-semibold">
                    ${vehicle.pricing.deposit} {vehicle.pricing.currency}
                  </span>
                </div>
                {vehicle.pricing.insuranceFee && (
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Insurance (per day)</span>
                    <span className="font-semibold">
                      ${vehicle.pricing.insuranceFee} {vehicle.pricing.currency}
                    </span>
                  </div>
                )}
                {vehicle.pricing.mileageLimit && (
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Mileage Limit (per day)</span>
                    <span className="font-semibold">{vehicle.pricing.mileageLimit} km</span>
                  </div>
                )}
                {vehicle.pricing.extraMileageFee && (
                  <div className="flex justify-between p-3 bg-muted rounded-lg">
                    <span className="text-muted-foreground">Extra Mileage Fee</span>
                    <span className="font-semibold">
                      ${vehicle.pricing.extraMileageFee}/km
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Pickup Location */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Pickup Location</h2>
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{vehicle.location.address}</p>
                <p className="text-sm text-muted-foreground">
                  {vehicle.location.city}, {vehicle.location.state} {vehicle.location.zipCode}
                </p>
                {vehicle.location.pickupInstructions && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Instructions:</strong> {vehicle.location.pickupInstructions}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <VehicleBookingCard
              vehicle={vehicle}
              pickupDate={pickupDate}
              pickupTime={pickupTime}
              returnDate={returnDate}
              returnTime={returnTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

