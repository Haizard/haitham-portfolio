"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Bed, Maximize, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useFormatPrice } from '@/contexts/currency-context';
import type { Room } from '@/lib/hotels-data';

interface RoomCardProps {
  room: Room;
  checkIn?: string;
  checkOut?: string;
  adults?: number;
  children?: number;
}

interface AvailabilityData {
  available: boolean;
  numberOfNights?: number;
  pricing?: {
    basePrice: number;
    numberOfNights: number;
    subtotal: number;
    tax: number;
    cleaningFee: number;
    extraGuestFee: number;
    totalPrice: number;
    currency: string;
  };
}

export function RoomCard({ room, checkIn, checkOut, adults = 2, children = 0 }: RoomCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const format = useFormatPrice();
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const primaryImage = room.images.find((img) => img.isPrimary) || room.images[0];

  useEffect(() => {
    if (checkIn && checkOut) {
      checkAvailability();
    }
  }, [checkIn, checkOut, adults, children]);

  const checkAvailability = async () => {
    setIsCheckingAvailability(true);
    try {
      const params = new URLSearchParams({
        checkIn: checkIn!,
        checkOut: checkOut!,
        adults: adults.toString(),
        children: children.toString(),
      });

      const response = await fetch(`/api/hotels/rooms/${room.id}/availability?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to check availability');

      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to check room availability',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBookNow = async () => {
    if (!checkIn || !checkOut) {
      toast({
        title: 'Missing Dates',
        description: 'Please select check-in and check-out dates',
        variant: 'destructive',
      });
      return;
    }

    if (!availability?.available) {
      toast({
        title: 'Not Available',
        description: 'This room is not available for the selected dates',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch('/api/hotels/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: room.propertyId,
          roomId: room.id,
          checkIn,
          checkOut,
          guests: {
            adults,
            children,
            infants: 0,
          },
          guestInfo: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create booking');
      }

      const data = await response.json();

      // Redirect to payment page or show success
      toast({
        title: 'Booking Created',
        description: 'Redirecting to payment...',
      });

      // In a real app, redirect to Stripe checkout or payment page
      router.push(`/bookings/${data.booking.id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Room Image */}
        <div className="relative h-48 md:h-full min-h-[200px] bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.caption || room.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No image
            </div>
          )}
          <Badge className="absolute top-2 left-2 capitalize">{room.type}</Badge>
        </div>

        {/* Room Details */}
        <CardContent className="md:col-span-2 p-4 md:p-6">
          <div className="flex flex-col h-full">
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {room.description}
              </p>

              {/* Room Specs */}
              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Up to {room.maxOccupancy.adults} adults, {room.maxOccupancy.children} children
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Bed className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {room.bedConfiguration.map((bed) => `${bed.count} ${bed.type}`).join(', ')}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Maximize className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {room.size} {room.sizeUnit}
                  </span>
                </div>
              </div>

              {/* Amenities */}
              {room.amenities.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {room.amenities.slice(0, 5).map((amenity) => (
                    <div
                      key={amenity}
                      className="text-xs bg-muted px-2 py-1 rounded-md capitalize"
                    >
                      {amenity.replace('_', ' ')}
                    </div>
                  ))}
                  {room.amenities.length > 5 && (
                    <div className="text-xs bg-muted px-2 py-1 rounded-md">
                      +{room.amenities.length - 5} more
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pricing and Booking */}
            <CardFooter className="p-0 pt-4 border-t flex items-center justify-between">
              <div>
                {isCheckingAvailability ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Checking availability...
                  </div>
                ) : availability ? (
                  availability.available && availability.pricing ? (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {availability.numberOfNights} night{availability.numberOfNights !== 1 ? 's' : ''}
                      </p>
                      <p className="text-2xl font-bold">
                        {format(availability.pricing.totalPrice, 'USD')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(availability.pricing.basePrice, 'USD')}/night + taxes & fees
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-destructive">Not available</p>
                  )
                ) : (
                  <div>
                    <p className="text-xs text-muted-foreground">From</p>
                    <p className="text-2xl font-bold">
                      {format(room.pricing.basePrice, 'USD')}
                      <span className="text-sm font-normal text-muted-foreground">/night</span>
                    </p>
                  </div>
                )}
              </div>

              <Button
                onClick={handleBookNow}
                disabled={
                  isBooking ||
                  isCheckingAvailability ||
                  !availability?.available ||
                  !checkIn ||
                  !checkOut
                }
              >
                {isBooking ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Booking...
                  </>
                ) : (
                  'Book Now'
                )}
              </Button>
            </CardFooter>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}

