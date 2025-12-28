"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Bed, Maximize, Loader2, User, Mail, Phone, Globe } from 'lucide-react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useFormatPrice } from '@/contexts/currency-context';
import type { Room } from '@/lib/hotels-data';

const guestInfoSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  country: z.string().min(2, 'Country is required'),
});

type GuestInfoValues = z.infer<typeof guestInfoSchema>;

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
    unit?: 'nightly' | 'monthly';
    breakdown?: {
      description: string;
      unitsCount: number;
    };
  };
}

export function RoomCard({ room, checkIn, checkOut, adults = 2, children = 0 }: RoomCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const format = useFormatPrice();
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<GuestInfoValues>({
    resolver: zodResolver(guestInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      country: '',
    },
  });

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
        checkInDate: checkIn!,
        checkOutDate: checkOut!,
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

  const handleBookNow = async (guestInfo: GuestInfoValues) => {
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
          checkInDate: checkIn,
          checkOutDate: checkOut,
          guests: {
            adults,
            children,
            infants: 0,
          },
          guestInfo,
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
      if (data.paymentIntent?.clientSecret) {
        // Handle payment...
      }
      router.push(`/bookings/${data.booking.id}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
      setIsDialogOpen(false);
    }
  };

  const onFormError = (errors: any) => {
    console.error('Guest info validation errors:', errors);
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
              className="object-contain bg-muted"
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
                    Up to {room.capacity.adults} adults, {room.capacity.children} children
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
                        {availability.pricing.breakdown?.description || `${availability.numberOfNights} night${availability.numberOfNights !== 1 ? 's' : ''}`}
                      </p>
                      <p className="text-2xl font-bold">
                        {format(availability.pricing.totalPrice, 'USD')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(availability.pricing.basePrice, 'USD')}/{availability.pricing.unit === 'monthly' ? 'month' : 'night'} + taxes & fees
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
                      <span className="text-sm font-normal text-muted-foreground">/{room.pricing.unit === 'monthly' ? 'month' : 'night'}</span>
                    </p>
                  </div>
                )}
              </div>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    disabled={
                      isBooking ||
                      isCheckingAvailability ||
                      !availability?.available ||
                      !checkIn ||
                      !checkOut
                    }
                  >
                    Book Now
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Guest Information</DialogTitle>
                    <DialogDescription>
                      Please provide guest details to complete your booking for {room.name}.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleBookNow, onFormError)} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input type="tel" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type="submit" disabled={isBooking} className="w-full">
                          {isBooking ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Creating Booking...
                            </>
                          ) : (
                            'Confirm & Pay'
                          )}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </div>
        </CardContent>
      </div >
    </Card >
  );
}

