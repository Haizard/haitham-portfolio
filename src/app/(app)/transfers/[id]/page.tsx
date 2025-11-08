"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, Car, Users, Luggage, MapPin, Star, ChevronLeft, ChevronRight, Shield, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TransferBookingCard } from '@/components/transfers/transfer-booking-card';

interface TransferVehicle {
  id: string;
  category: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: {
    passengers: number;
    luggage: number;
  };
  features: string[];
  images: Array<{
    url: string;
    caption?: string;
    isPrimary: boolean;
  }>;
  location: {
    city: string;
    state: string;
    country: string;
    airport?: string;
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
    pricePerHour: number;
    currency: string;
    airportSurcharge?: number;
    nightSurcharge?: number;
    waitingTimeFee?: number;
  };
  driverInfo?: {
    name: string;
    phone: string;
    yearsOfExperience: number;
    languages: string[];
  };
  averageRating?: number;
  reviewCount?: number;
  totalTransfers: number;
  status: string;
}

function TransferVehicleDetail() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [vehicle, setVehicle] = useState<TransferVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const pickupLocation = searchParams.get('pickupLocation') || '';
  const dropoffLocation = searchParams.get('dropoffLocation') || '';
  const pickupDate = searchParams.get('pickupDate') || '';
  const pickupTime = searchParams.get('pickupTime') || '';
  const passengers = parseInt(searchParams.get('passengers') || '2');
  const luggage = parseInt(searchParams.get('luggage') || '2');
  const transferType = searchParams.get('transferType') || 'point_to_point';

  useEffect(() => {
    fetchVehicle();
  }, [params.id]);

  const fetchVehicle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/transfers/vehicles/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setVehicle(data.vehicle);
      }
    } catch (error) {
      console.error('Error fetching vehicle:', error);
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) =>
        prev === vehicle.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (vehicle) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? vehicle.images.length - 1 : prev - 1
      );
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Vehicle not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative h-96 bg-muted">
                  {vehicle.images.length > 0 ? (
                    <>
                      <img
                        src={vehicle.images[currentImageIndex].url}
                        alt={vehicle.images[currentImageIndex].caption || `${vehicle.make} ${vehicle.model}`}
                        className="w-full h-full object-cover"
                      />
                      {vehicle.images.length > 1 && (
                        <>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute left-4 top-1/2 -translate-y-1/2"
                            onClick={prevImage}
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                            onClick={nextImage}
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                            {currentImageIndex + 1} / {vehicle.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Car className="h-24 w-24 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                {vehicle.images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2 p-4">
                    {vehicle.images.slice(0, 6).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`relative h-16 rounded-md overflow-hidden border-2 ${
                          currentImageIndex === index
                            ? 'border-primary'
                            : 'border-transparent'
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vehicle Information */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="capitalize">{getCategoryLabel(vehicle.category)}</Badge>
                      <Badge variant="outline">{vehicle.year}</Badge>
                    </div>
                    <CardTitle className="text-3xl">
                      {vehicle.make} {vehicle.model}
                    </CardTitle>
                  </div>
                  {vehicle.averageRating && (
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-lg font-semibold">
                        {vehicle.averageRating.toFixed(1)}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        ({vehicle.reviewCount} reviews)
                      </span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location */}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-5 w-5" />
                  <span>
                    {vehicle.location.city}, {vehicle.location.state}, {vehicle.location.country}
                    {vehicle.location.airport && ` • ${vehicle.location.airport}`}
                  </span>
                </div>

                {/* Specifications */}
                <div>
                  <h3 className="font-semibold mb-4">Vehicle Specifications</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Passengers</p>
                        <p className="font-medium">{vehicle.capacity.passengers}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Luggage className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Luggage</p>
                        <p className="font-medium">{vehicle.capacity.luggage} bags</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Color</p>
                      <p className="font-medium capitalize">{vehicle.color}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Transfers</p>
                      <p className="font-medium">{vehicle.totalTransfers}</p>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {vehicle.features.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-4">Features & Amenities</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {vehicle.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          <span className="text-sm capitalize">{feature.replace('_', ' ')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Driver Information */}
                {vehicle.driverInfo && (
                  <div>
                    <h3 className="font-semibold mb-4">Driver Information</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" />
                        <span>{vehicle.driverInfo.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <span>{vehicle.driverInfo.yearsOfExperience} years of experience</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Languages: {vehicle.driverInfo.languages.join(', ')}
                      </div>
                    </div>
                  </div>
                )}

                {/* Pricing Details */}
                <div>
                  <h3 className="font-semibold mb-4">Pricing</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Base Price</span>
                      <span className="font-medium">
                        {vehicle.pricing.currency} {vehicle.pricing.basePrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Kilometer</span>
                      <span className="font-medium">
                        {vehicle.pricing.currency} {vehicle.pricing.pricePerKm}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Per Hour</span>
                      <span className="font-medium">
                        {vehicle.pricing.currency} {vehicle.pricing.pricePerHour}
                      </span>
                    </div>
                    {vehicle.pricing.airportSurcharge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Airport Surcharge</span>
                        <span className="font-medium">
                          {vehicle.pricing.currency} {vehicle.pricing.airportSurcharge}
                        </span>
                      </div>
                    )}
                    {vehicle.pricing.nightSurcharge && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Night Surcharge (10pm-6am)</span>
                        <span className="font-medium">
                          {vehicle.pricing.currency} {vehicle.pricing.nightSurcharge}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <TransferBookingCard
                vehicle={vehicle}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                pickupDate={pickupDate}
                pickupTime={pickupTime}
                passengers={passengers}
                luggage={luggage}
                transferType={transferType as any}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TransferVehiclePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <TransferVehicleDetail />
    </Suspense>
  );
}

