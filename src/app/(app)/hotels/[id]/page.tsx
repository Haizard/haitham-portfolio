"use client";

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Loader2, MapPin, Star, Wifi, Car, Waves, Dumbbell, UtensilsCrossed, Wine, Sparkles, Phone, Mail, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RoomCard } from '@/components/hotels/room-card';
import { PriceAlertButton } from '@/components/price-alerts/price-alert-button';
import type { Property, Room } from '@/lib/hotels-data';

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  parking: Car,
  pool: Waves,
  gym: Dumbbell,
  restaurant: UtensilsCrossed,
  bar: Wine,
  spa: Sparkles,
};

export default function PropertyDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';
  const adults = parseInt(searchParams.get('adults') || '2');
  const children = parseInt(searchParams.get('children') || '0');

  useEffect(() => {
    fetchPropertyDetails();
  }, [params.id]);

  const fetchPropertyDetails = async () => {
    setIsLoading(true);
    try {
      // Fetch property
      const propertyResponse = await fetch(`/api/hotels/properties/${params.id}`);
      if (!propertyResponse.ok) throw new Error('Property not found');
      const propertyData = await propertyResponse.json();
      setProperty(propertyData.property);

      // Fetch rooms
      const roomsResponse = await fetch(`/api/hotels/rooms?propertyId=${params.id}`);
      if (roomsResponse.ok) {
        const roomsData = await roomsResponse.json();
        setRooms(roomsData.rooms || []);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property) {
      setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
        <p className="text-muted-foreground">The property you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Image Gallery */}
      <div className="relative h-[400px] md:h-[500px] bg-muted">
        {property.images.length > 0 ? (
          <>
            <Image
              src={property.images[currentImageIndex].url}
              alt={property.images[currentImageIndex].caption || property.name}
              fill
              className="object-cover"
              priority
            />
            
            {/* Navigation Arrows */}
            {property.images.length > 1 && (
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
              {currentImageIndex + 1} / {property.images.length}
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
                <Badge className="capitalize">{property.type}</Badge>
                {property.starRating && (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: property.starRating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                )}
              </div>
              
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.name}</h1>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {property.address}, {property.city}, {property.state}, {property.country}
                </span>
              </div>

              {property.averageRating && property.reviewCount ? (
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 bg-primary text-primary-foreground px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-current" />
                    <span className="font-semibold">{property.averageRating.toFixed(1)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    ({property.reviewCount} reviews)
                  </span>
                </div>
              ) : null}

              {/* Price Alert Button */}
              {searchParams.get('checkIn') && searchParams.get('checkOut') && (
                <div className="mt-4">
                  <PriceAlertButton
                    alertType="property"
                    targetId={property.id || ''}
                    targetName={property.name}
                    currentPrice={property.basePrice || 0}
                    searchCriteria={{
                      checkIn: searchParams.get('checkIn') || '',
                      checkOut: searchParams.get('checkOut') || '',
                      guests: parseInt(searchParams.get('guests') || '1'),
                    }}
                    variant="outline"
                  />
                </div>
              )}
            </div>

            <Separator />

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-3">About this property</h2>
              <p className="text-muted-foreground leading-relaxed">{property.description}</p>
            </div>

            <Separator />

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {property.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Sparkles;
                  return (
                    <div key={amenity} className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      <span className="capitalize">{amenity.replace('_', ' ')}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Policies */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Policies</h2>
              <div className="grid gap-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-medium">{property.policies.checkInTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-medium">{property.policies.checkOutTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cancellation:</span>
                  <span className="font-medium capitalize">
                    {property.policies.cancellationPolicy.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pets:</span>
                  <span className="font-medium capitalize">
                    {property.policies.petPolicy.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Smoking:</span>
                  <span className="font-medium capitalize">
                    {property.policies.smokingPolicy.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Available Rooms */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Available Rooms</h2>
              {rooms.length > 0 ? (
                <div className="space-y-4">
                  {rooms.map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      checkIn={checkIn}
                      checkOut={checkOut}
                      adults={adults}
                      children={children}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No rooms available at this property.</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {property.contactInfo.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${property.contactInfo.phone}`} className="hover:underline">
                      {property.contactInfo.phone}
                    </a>
                  </div>
                )}
                {property.contactInfo.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${property.contactInfo.email}`} className="hover:underline">
                      {property.contactInfo.email}
                    </a>
                  </div>
                )}
                {property.contactInfo.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={property.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

