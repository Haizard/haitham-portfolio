"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Users, ArrowLeftRight, Search } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AirportAutocomplete } from './airport-autocomplete';
import { Label } from '@/components/ui/label';

const flightSearchSchema = z.object({
  tripType: z.enum(['one-way', 'round-trip']),
  origin: z.string().length(3, 'Select origin airport'),
  destination: z.string().length(3, 'Select destination airport'),
  departureDate: z.date({ required_error: 'Departure date is required' }),
  returnDate: z.date().optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9),
  infants: z.number().int().min(0).max(9),
  class: z.enum(['economy', 'premium_economy', 'business', 'first']),
  useAmadeus: z.boolean().default(false),
}).refine((data) => {
  if (data.tripType === 'round-trip' && !data.returnDate) {
    return false;
  }
  return true;
}, {
  message: 'Return date is required for round-trip flights',
  path: ['returnDate'],
});

type FlightSearchFormData = z.infer<typeof flightSearchSchema>;

interface FlightSearchFormEnhancedProps {
  defaultValues?: Partial<FlightSearchFormData>;
  useAmadeus?: boolean;
}

export function FlightSearchFormEnhanced({
  defaultValues,
  useAmadeus = false,
}: FlightSearchFormEnhancedProps) {
  const router = useRouter();
  const [showPassengers, setShowPassengers] = useState(false);

  const form = useForm<FlightSearchFormData>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      tripType: 'round-trip',
      adults: 1,
      children: 0,
      infants: 0,
      class: 'economy',
      useAmadeus,
      ...defaultValues,
    },
  });

  const onSubmit = (data: FlightSearchFormData) => {
    const params = new URLSearchParams({
      origin: data.origin,
      destination: data.destination,
      departureDate: format(data.departureDate, 'yyyy-MM-dd'),
      adults: data.adults.toString(),
      children: data.children.toString(),
      infants: data.infants.toString(),
      class: data.class,
      useAmadeus: data.useAmadeus.toString(),
    });

    if (data.returnDate) {
      params.append('returnDate', format(data.returnDate, 'yyyy-MM-dd'));
    }

    router.push(`/flights/search?${params.toString()}`);
  };

  const swapAirports = () => {
    const origin = form.getValues('origin');
    const destination = form.getValues('destination');
    form.setValue('origin', destination);
    form.setValue('destination', origin);
  };

  const totalPassengers = form.watch('adults') + form.watch('children') + form.watch('infants');

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Trip Type Selector */}
            <FormField
              control={form.control}
              name="tripType"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Tabs value={field.value} onValueChange={field.onChange}>
                      <TabsList className="grid w-full max-w-md grid-cols-2">
                        <TabsTrigger value="round-trip">Round Trip</TabsTrigger>
                        <TabsTrigger value="one-way">One Way</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Origin and Destination with Autocomplete */}
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>From</FormLabel>
                    <FormControl>
                      <AirportAutocomplete
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select origin airport"
                        useAmadeus={useAmadeus}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={swapAirports}
                className="mb-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>To</FormLabel>
                    <FormControl>
                      <AirportAutocomplete
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Select destination airport"
                        useAmadeus={useAmadeus}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="departureDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Departure</FormLabel>
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

              <FormField
                control={form.control}
                name="returnDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Return</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={form.watch('tripType') === 'one-way'}
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
                          disabled={(date) => {
                            const departureDate = form.getValues('departureDate');
                            return date < (departureDate || new Date());
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passengers and Class */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Passengers Selector */}
              <div className="space-y-2">
                <Label>Passengers</Label>
                <Popover open={showPassengers} onOpenChange={setShowPassengers}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <Users className="mr-2 h-4 w-4" />
                      {totalPassengers} {totalPassengers === 1 ? 'Passenger' : 'Passengers'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="adults"
                        render={({ field }) => (
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">Adults</div>
                              <div className="text-sm text-muted-foreground">12+ years</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => field.onChange(Math.max(1, field.value - 1))}
                              >
                                -
                              </Button>
                              <span className="w-8 text-center">{field.value}</span>
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={() => field.onChange(Math.min(9, field.value + 1))}
                              >
                                +
                              </Button>
                            </div>
                          </div>
                        )}
                      />
                      {/* Similar for children and infants - truncated for brevity */}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Class Selector */}
              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="economy">Economy</SelectItem>
                        <SelectItem value="premium_economy">Premium Economy</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                        <SelectItem value="first">First Class</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" size="lg">
              <Search className="mr-2 h-5 w-5" />
              Search Flights
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

