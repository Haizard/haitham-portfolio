"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFormatPrice } from '@/contexts/currency-context';
import { getStripe } from '@/lib/stripe-client';

interface TransferVehicle {
  id: string;
  category: string;
  make: string;
  model: string;
  capacity: {
    passengers: number;
    luggage: number;
  };
  pricing: {
    basePrice: number;
    pricePerKm: number;
    pricePerHour: number;
    currency: string;
    airportSurcharge?: number;
    nightSurcharge?: number;
  };
}

interface TransferBookingCardProps {
  vehicle: TransferVehicle;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  pickupTime?: string;
  passengers?: number;
  luggage?: number;
  transferType?: 'airport_to_city' | 'city_to_airport' | 'point_to_point' | 'hourly';
}

const bookingFormSchema = z.object({
  transferType: z.enum(['airport_to_city', 'city_to_airport', 'point_to_point', 'hourly']),
  pickupLocation: z.string().min(5, 'Pickup location is required'),
  pickupCity: z.string().min(2, 'City is required'),
  flightNumber: z.string().optional(),
  terminal: z.string().optional(),
  dropoffLocation: z.string().min(5, 'Dropoff location is required'),
  dropoffCity: z.string().min(2, 'City is required'),
  pickupDate: z.date({ required_error: 'Pickup date is required' }),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  estimatedDistance: z.number().min(1, 'Distance is required'),
  estimatedDuration: z.number().min(1, 'Duration is required'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Phone number is required'),
  numberOfPassengers: z.number().int().min(1),
  numberOfLuggage: z.number().int().min(0),
  childSeatsRequired: z.number().int().min(0).optional(),
  wheelchairAccessible: z.boolean().optional(),
  specialRequests: z.string().max(500).optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function TransferBookingCard({
  vehicle,
  pickupLocation = '',
  dropoffLocation = '',
  pickupDate = '',
  pickupTime = '',
  passengers = 2,
  luggage = 2,
  transferType = 'point_to_point',
}: TransferBookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const format = useFormatPrice();
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [availability, setAvailability] = useState<{ available: boolean } | null>(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      transferType,
      pickupLocation,
      pickupCity: pickupLocation.split(',')[0]?.trim() || '',
      dropoffLocation,
      dropoffCity: dropoffLocation.split(',')[0]?.trim() || '',
      pickupDate: pickupDate ? new Date(pickupDate) : undefined,
      pickupTime: pickupTime || '10:00',
      estimatedDistance: 10,
      estimatedDuration: 30,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      numberOfPassengers: passengers,
      numberOfLuggage: luggage,
      childSeatsRequired: 0,
      wheelchairAccessible: false,
      specialRequests: '',
    },
  });

  const watchedPickupDate = form.watch('pickupDate');
  const watchedPickupTime = form.watch('pickupTime');
  const watchedDistance = form.watch('estimatedDistance');
  const watchedTransferType = form.watch('transferType');

  useEffect(() => {
    if (watchedPickupDate && watchedPickupTime) {
      checkAvailability();
    }
  }, [watchedPickupDate, watchedPickupTime]);

  const checkAvailability = async () => {
    if (!watchedPickupDate || !watchedPickupTime) return;

    try {
      setCheckingAvailability(true);
      const formattedDate = format(watchedPickupDate, 'yyyy-MM-dd');

      const response = await fetch(
        `/api/transfers/vehicles/${vehicle.id}/availability?pickupDate=${formattedDate}&pickupTime=${watchedPickupTime}`
      );
      const data = await response.json();

      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const calculatePrice = () => {
    const basePrice = vehicle.pricing.basePrice;
    const distanceCharge = watchedDistance * vehicle.pricing.pricePerKm;

    let airportSurcharge = 0;
    if (
      (watchedTransferType === 'airport_to_city' || watchedTransferType === 'city_to_airport') &&
      vehicle.pricing.airportSurcharge
    ) {
      airportSurcharge = vehicle.pricing.airportSurcharge;
    }

    let nightSurcharge = 0;
    if (watchedPickupTime) {
      const hour = parseInt(watchedPickupTime.split(':')[0]);
      if ((hour >= 22 || hour < 6) && vehicle.pricing.nightSurcharge) {
        nightSurcharge = vehicle.pricing.nightSurcharge;
      }
    }

    return {
      basePrice,
      distanceCharge,
      airportSurcharge,
      nightSurcharge,
      total: basePrice + distanceCharge + airportSurcharge + nightSurcharge,
    };
  };

  const pricing = calculatePrice();

  const onSubmit = async (data: BookingFormValues) => {
    if (!availability?.available) {
      toast({
        title: 'Vehicle not available',
        description: 'Please select a different date or time',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsBooking(true);

      const bookingData = {
        vehicleId: vehicle.id,
        transferType: data.transferType,
        pickupLocation: {
          address: data.pickupLocation,
          city: data.pickupCity,
          ...(data.flightNumber && { flightNumber: data.flightNumber }),
          ...(data.terminal && { terminal: data.terminal }),
        },
        dropoffLocation: {
          address: data.dropoffLocation,
          city: data.dropoffCity,
        },
        pickupDate: format(data.pickupDate, 'yyyy-MM-dd'),
        pickupTime: data.pickupTime,
        estimatedDuration: data.estimatedDuration,
        estimatedDistance: data.estimatedDistance,
        passengerInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
          numberOfPassengers: data.numberOfPassengers,
          numberOfLuggage: data.numberOfLuggage,
        },
        specialRequests: data.specialRequests,
        childSeatsRequired: data.childSeatsRequired,
        wheelchairAccessible: data.wheelchairAccessible,
      };

      const response = await fetch('/api/transfers/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create booking');
      }

      // Redirect to Stripe checkout
      const stripe = await getStripe();
      if (!stripe) {
        console.warn('Stripe failed to load or key is missing. Simulation mode.');
      }

      toast({
        title: 'Booking created!',
        description: 'Redirecting to payment...',
      });

      // In a real app, you would redirect to Stripe checkout here
      // For now, just redirect to bookings page
      router.push('/account/bookings');

    } catch (error: any) {
      toast({
        title: 'Booking failed',
        description: error.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Book This Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showBookingForm ? (
          <>
            {/* Price Display */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Base Price</span>
                <span>{format(pricing.basePrice, vehicle.pricing.currency as any)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Distance ({watchedDistance} km)</span>
                <span>{format(pricing.distanceCharge, vehicle.pricing.currency as any)}</span>
              </div>
              {pricing.airportSurcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Airport Surcharge</span>
                  <span>{format(pricing.airportSurcharge, vehicle.pricing.currency as any)}</span>
                </div>
              )}
              {pricing.nightSurcharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Night Surcharge</span>
                  <span>{format(pricing.nightSurcharge, vehicle.pricing.currency as any)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{format(pricing.total, vehicle.pricing.currency as any)}</span>
              </div>
            </div>

            {/* Availability Status */}
            {checkingAvailability ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              </div>
            ) : availability ? (
              <div className={`p-3 rounded-md ${availability.available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                <p className="text-sm font-medium">
                  {availability.available ? '✓ Available' : '✗ Not Available'}
                </p>
              </div>
            ) : null}

            <Button
              onClick={() => setShowBookingForm(true)}
              className="w-full"
              size="lg"
              disabled={!availability?.available}
            >
              Continue to Booking
            </Button>
          </>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Transfer Details */}
              <div className="space-y-4">
                <h3 className="font-semibold">Transfer Details</h3>

                <FormField
                  control={form.control}
                  name="transferType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="airport_to_city">Airport to City</SelectItem>
                          <SelectItem value="city_to_airport">City to Airport</SelectItem>
                          <SelectItem value="point_to_point">Point to Point</SelectItem>
                          <SelectItem value="hourly">Hourly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pickupLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pickup Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dropoffLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dropoff Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="estimatedDistance"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Distance (km)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estimatedDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (min)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Passenger Information */}
              <div className="space-y-4">
                <h3 className="font-semibold">Passenger Information</h3>

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
              </div>

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowBookingForm(false)}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button type="submit" disabled={isBooking} className="flex-1">
                  {isBooking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

