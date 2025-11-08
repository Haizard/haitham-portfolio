"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useFormatPrice } from '@/contexts/currency-context';
import type { Vehicle } from '@/lib/cars-data';

const bookingSchema = z.object({
  pickupDate: z.date(),
  pickupTime: z.string(),
  returnDate: z.date(),
  returnTime: z.string(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  licenseNumber: z.string().min(5),
  licenseExpiry: z.date(),
  dateOfBirth: z.date(),
}).refine((data) => data.returnDate > data.pickupDate, {
  message: 'Return must be after pickup',
  path: ['returnDate'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface VehicleBookingCardProps {
  vehicle: Vehicle;
  pickupDate?: string;
  pickupTime?: string;
  returnDate?: string;
  returnTime?: string;
}

interface AvailabilityData {
  available: boolean;
  numberOfDays?: number;
  pricing?: {
    dailyRate: number;
    numberOfDays: number;
    subtotal: number;
    insuranceFee: number;
    deposit: number;
    totalPrice: number;
    currency: string;
  };
}

export function VehicleBookingCard({
  vehicle,
  pickupDate: initialPickupDate,
  pickupTime: initialPickupTime,
  returnDate: initialReturnDate,
  returnTime: initialReturnTime,
}: VehicleBookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const format = useFormatPrice();
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const [pickupDate, setPickupDate] = useState<Date | undefined>(
    initialPickupDate ? parseISO(initialPickupDate) : undefined
  );
  const [returnDate, setReturnDate] = useState<Date | undefined>(
    initialReturnDate ? parseISO(initialReturnDate) : undefined
  );

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      pickupTime: initialPickupTime || '10:00',
      returnTime: initialReturnTime || '10:00',
    },
  });

  useEffect(() => {
    if (pickupDate && returnDate) {
      checkAvailability();
    }
  }, [pickupDate, returnDate]);

  const checkAvailability = async () => {
    if (!pickupDate || !returnDate) return;

    setIsCheckingAvailability(true);
    try {
      const params = new URLSearchParams({
        pickupDate: format(pickupDate, 'yyyy-MM-dd'),
        returnDate: format(returnDate, 'yyyy-MM-dd'),
      });

      const response = await fetch(`/api/cars/vehicles/${vehicle.id}/availability?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to check availability');

      const data = await response.json();
      setAvailability(data);
    } catch (error) {
      console.error('Error checking availability:', error);
      toast({
        title: 'Error',
        description: 'Failed to check vehicle availability',
        variant: 'destructive',
      });
    } finally {
      setIsCheckingAvailability(false);
    }
  };

  const handleBookNow = async (data: BookingFormData) => {
    if (!availability?.available) {
      toast({
        title: 'Not Available',
        description: 'This vehicle is not available for the selected dates',
        variant: 'destructive',
      });
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch('/api/cars/rentals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: vehicle.id,
          driverInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            licenseNumber: data.licenseNumber,
            licenseExpiry: format(data.licenseExpiry, 'yyyy-MM-dd'),
            dateOfBirth: format(data.dateOfBirth, 'yyyy-MM-dd'),
          },
          pickupDate: format(data.pickupDate, 'yyyy-MM-dd'),
          pickupTime: data.pickupTime,
          returnDate: format(data.returnDate, 'yyyy-MM-dd'),
          returnTime: data.returnTime,
          pickupLocation: `${vehicle.location.address}, ${vehicle.location.city}`,
          returnLocation: `${vehicle.location.address}, ${vehicle.location.city}`,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create rental');
      }

      const responseData = await response.json();

      toast({
        title: 'Rental Created',
        description: 'Redirecting to payment...',
      });

      // In a real app, redirect to Stripe checkout or payment page
      router.push(`/rentals/${responseData.rental.id}`);
    } catch (error) {
      console.error('Error creating rental:', error);
      toast({
        title: 'Booking Failed',
        description: error instanceof Error ? error.message : 'Failed to create rental',
        variant: 'destructive',
      });
    } finally {
      setIsBooking(false);
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Book This Vehicle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Pickup Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !pickupDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {pickupDate ? format(pickupDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={pickupDate}
                onSelect={(date) => {
                  setPickupDate(date);
                  form.setValue('pickupDate', date!);
                }}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Pickup Time</Label>
          <Select
            value={form.watch('pickupTime')}
            onValueChange={(value) => form.setValue('pickupTime', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Return Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !returnDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {returnDate ? format(returnDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={returnDate}
                onSelect={(date) => {
                  setReturnDate(date);
                  form.setValue('returnDate', date!);
                }}
                disabled={(date) => {
                  const minDate = pickupDate || new Date();
                  return date <= minDate;
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Return Time</Label>
          <Select
            value={form.watch('returnTime')}
            onValueChange={(value) => form.setValue('returnTime', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Availability and Pricing */}
        {isCheckingAvailability ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : availability && pickupDate && returnDate ? (
          availability.available && availability.pricing ? (
            <div className="space-y-2 p-4 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Daily Rate × {availability.numberOfDays} days</span>
                <span>{format(availability.pricing.subtotal, 'USD')}</span>
              </div>
              {availability.pricing.insuranceFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Insurance</span>
                  <span>{format(availability.pricing.insuranceFee, 'USD')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>Security Deposit</span>
                <span>${availability.pricing.deposit.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{format(availability.pricing.totalPrice, 'USD')}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Deposit will be refunded after return
              </p>
            </div>
          ) : (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-center">
              Not available for selected dates
            </div>
          )
        ) : null}

        {/* Booking Form */}
        {showBookingForm && (
          <form onSubmit={form.handleSubmit(handleBookNow)} className="space-y-4">
            <Separator />
            <h3 className="font-semibold">Driver Information</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" {...form.register('firstName')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" {...form.register('lastName')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...form.register('phone')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="licenseNumber">License Number</Label>
              <Input id="licenseNumber" {...form.register('licenseNumber')} />
            </div>

            <Button type="submit" className="w-full" disabled={isBooking}>
              {isBooking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                'Confirm Booking'
              )}
            </Button>
          </form>
        )}
      </CardContent>

      {!showBookingForm && (
        <CardFooter>
          <Button
            className="w-full"
            onClick={() => setShowBookingForm(true)}
            disabled={!availability?.available || !pickupDate || !returnDate}
          >
            Continue to Book
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

