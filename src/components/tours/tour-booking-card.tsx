"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock, Users, Loader2, DollarSign, User, Mail, Phone, MessageSquare, Utensils, Accessibility } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import { cn } from '@/lib/utils';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const bookingFormSchema = z.object({
  tourDate: z.date({ required_error: 'Please select a tour date' }),
  tourTime: z.string().optional(),
  adults: z.coerce.number().int().min(0, 'Cannot be negative').max(50, 'Maximum 50 adults'),
  children: z.coerce.number().int().min(0, 'Cannot be negative').max(50, 'Maximum 50 children'),
  seniors: z.coerce.number().int().min(0, 'Cannot be negative').max(50, 'Maximum 50 seniors'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

interface TourBookingCardProps {
  tourId: string;
  tourName: string;
  basePrice: number;
  duration: string;
}

export function TourBookingCard({ tourId, tourName, basePrice, duration }: TourBookingCardProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      adults: 1,
      children: 0,
      seniors: 0,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      specialRequests: '',
      dietaryRestrictions: '',
      accessibilityNeeds: '',
    },
  });

  const watchedValues = form.watch();
  const adults = watchedValues.adults || 0;
  const children = watchedValues.children || 0;
  const seniors = watchedValues.seniors || 0;

  // Calculate pricing
  const adultPrice = basePrice;
  const childPrice = basePrice * 0.7; // 30% discount
  const seniorPrice = basePrice * 0.85; // 15% discount

  const subtotal = (adults * adultPrice) + (children * childPrice) + (seniors * seniorPrice);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;
  const totalParticipants = adults + children + seniors;

  const onSubmit = async (values: BookingFormValues) => {
    if (totalParticipants === 0) {
      toast({
        title: 'Error',
        description: 'Please select at least one participant',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create booking
      const response = await fetch('/api/tours/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tourId,
          tourDate: format(values.tourDate, 'yyyy-MM-dd'),
          tourTime: values.tourTime,
          participants: {
            adults: values.adults,
            children: values.children,
            seniors: values.seniors,
          },
          contactInfo: {
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            phone: values.phone,
          },
          specialRequests: values.specialRequests,
          dietaryRestrictions: values.dietaryRestrictions,
          accessibilityNeeds: values.accessibilityNeeds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }

      const { booking, clientSecret } = await response.json();

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      // For now, we'll just show success and redirect to bookings
      // In production, you'd integrate Stripe Elements or Checkout
      toast({
        title: 'Booking Created!',
        description: 'Your tour booking has been created. Redirecting to payment...',
      });

      // Simulate payment success for demo
      setTimeout(() => {
        router.push('/account/bookings');
      }, 2000);

    } catch (error: any) {
      console.error('Booking error:', error);
      toast({
        title: 'Booking Failed',
        description: error.message || 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Book This Tour
        </CardTitle>
        <CardDescription>
          Fill in your details to reserve your spot
        </CardDescription>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Tour Date */}
            <FormField
              control={form.control}
              name="tourDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Tour Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tour Time (Optional) */}
            <FormField
              control={form.control}
              name="tourTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Time (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                      <SelectItem value="09:00">9:00 AM</SelectItem>
                      <SelectItem value="10:00">10:00 AM</SelectItem>
                      <SelectItem value="11:00">11:00 AM</SelectItem>
                      <SelectItem value="12:00">12:00 PM</SelectItem>
                      <SelectItem value="13:00">1:00 PM</SelectItem>
                      <SelectItem value="14:00">2:00 PM</SelectItem>
                      <SelectItem value="15:00">3:00 PM</SelectItem>
                      <SelectItem value="16:00">4:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Participants */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants
              </h4>

              <FormField
                control={form.control}
                name="adults"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adults (${adultPrice.toFixed(2)} each)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="children"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Children (${childPrice.toFixed(2)} each - 30% off)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Ages 3-12</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="seniors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Seniors (${seniorPrice.toFixed(2)} each - 15% off)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>Ages 65+</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Contact Information
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name *</FormLabel>
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
                      <FormLabel>Last Name *</FormLabel>
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
                    <FormLabel>Email *</FormLabel>
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
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input type="tel" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-semibold">Additional Information (Optional)</h4>

              <FormField
                control={form.control}
                name="specialRequests"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Special Requests
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any special requests or preferences..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Utensils className="h-4 w-4" />
                      Dietary Restrictions
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any dietary restrictions or allergies..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="accessibilityNeeds"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Accessibility className="h-4 w-4" />
                      Accessibility Needs
                    </FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any accessibility requirements..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Pricing Summary */}
            <div className="space-y-2 bg-muted p-4 rounded-lg">
              <div className="flex justify-between text-sm">
                <span>Subtotal ({totalParticipants} {totalParticipants === 1 ? 'person' : 'people'})</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax (10%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting || totalParticipants === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <DollarSign className="mr-2 h-4 w-4" />
                  Book Now - ${total.toFixed(2)}
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}

