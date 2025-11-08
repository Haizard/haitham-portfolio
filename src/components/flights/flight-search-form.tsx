"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plane, Users, ArrowLeftRight } from 'lucide-react';
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
import { useTranslations } from 'next-intl';

const flightSearchSchema = z.object({
  tripType: z.enum(['one-way', 'round-trip']),
  origin: z.string().length(3, 'Enter 3-letter airport code'),
  destination: z.string().length(3, 'Enter 3-letter airport code'),
  departureDate: z.date({ required_error: 'Departure date is required' }),
  returnDate: z.date().optional(),
  adults: z.number().int().min(1).max(9),
  children: z.number().int().min(0).max(9),
  infants: z.number().int().min(0).max(9),
  class: z.enum(['economy', 'premium_economy', 'business', 'first']),
}).refine((data) => {
  if (data.tripType === 'round-trip' && !data.returnDate) {
    return false;
  }
  return true;
}, {
  message: 'Return date is required for round-trip flights',
  path: ['returnDate'],
}).refine((data) => {
  if (data.returnDate && data.returnDate < data.departureDate) {
    return false;
  }
  return true;
}, {
  message: 'Return date must be after departure date',
  path: ['returnDate'],
});

type FlightSearchFormValues = z.infer<typeof flightSearchSchema>;

export function FlightSearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  const form = useForm<FlightSearchFormValues>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      tripType: 'round-trip',
      origin: '',
      destination: '',
      adults: 1,
      children: 0,
      infants: 0,
      class: 'economy',
    },
  });

  const tripType = form.watch('tripType');

  const onSubmit = async (data: FlightSearchFormValues) => {
    setIsLoading(true);

    // Build search URL
    const params = new URLSearchParams({
      origin: data.origin.toUpperCase(),
      destination: data.destination.toUpperCase(),
      departureDate: format(data.departureDate, 'yyyy-MM-dd'),
      adults: data.adults.toString(),
      children: data.children.toString(),
      infants: data.infants.toString(),
      class: data.class,
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
                        <TabsTrigger value="round-trip">{t('roundTrip')}</TabsTrigger>
                        <TabsTrigger value="one-way">{t('oneWay')}</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </FormControl>
                </FormItem>
              )}
            />

            {/* Origin and Destination */}
            <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 items-end">
              <FormField
                control={form.control}
                name="origin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tCommon('from')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="JFK"
                          className="pl-10 uppercase"
                          maxLength={3}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </div>
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
                    <FormLabel>{tCommon('to')}</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Plane className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rotate-90" />
                        <Input
                          placeholder="LAX"
                          className="pl-10 uppercase"
                          maxLength={3}
                          {...field}
                          onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                        />
                      </div>
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
                    <FormLabel>{t('departureDate')}</FormLabel>
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
                              <span>{t('pickADate')}</span>
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

              {tripType === 'round-trip' && (
                <FormField
                  control={form.control}
                  name="returnDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{t('returnDateFlight')}</FormLabel>
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
                                <span>{t('pickADate')}</span>
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
                            disabled={(date) => date < (form.getValues('departureDate') || new Date())}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Passengers and Class */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <FormLabel>{t('passengers')}</FormLabel>
                <div className="grid grid-cols-3 gap-2">
                  <FormField
                    control={form.control}
                    name="adults"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('adults')}</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="children"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('children')}</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="infants"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">{t('infants')}</FormLabel>
                        <Select
                          value={field.value.toString()}
                          onValueChange={(value) => field.onChange(parseInt(value))}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="class"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('class')}</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="economy">{t('economy')}</SelectItem>
                        <SelectItem value="premium_economy">{t('premiumEconomy')}</SelectItem>
                        <SelectItem value="business">{t('business')}</SelectItem>
                        <SelectItem value="first">{t('firstClass')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
              {isLoading ? tCommon('searching') : t('searchFlights')}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

