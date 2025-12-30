"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, MapPin, Users, Luggage, Search } from 'lucide-react';
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
import { useTranslations } from 'next-intl';

import { Card, CardContent } from '@/components/ui/card';
import { MobileSearchTrigger } from '../shared/mobile-search-trigger';
import { useIsMobile } from '@/hooks/use-mobile';

const searchFormSchema = z.object({
  pickupLocation: z.string().min(2, 'Pickup location is required'),
  dropoffLocation: z.string().min(2, 'Dropoff location is required'),
  pickupDate: z.date({
    required_error: 'Pickup date is required',
  }),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  passengers: z.number().int().min(1).max(50),
  luggage: z.number().int().min(0).max(50),
  transferType: z.enum(['airport_to_city', 'city_to_airport', 'point_to_point', 'hourly']),
});

type SearchFormValues = z.infer<typeof searchFormSchema>;

interface TransferSearchFormProps {
  className?: string;
  mode?: 'full' | 'compact';
}

export function TransferSearchForm({ className, mode = 'full' }: TransferSearchFormProps) {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      pickupLocation: '',
      dropoffLocation: '',
      pickupTime: '10:00',
      passengers: 2,
      luggage: 2,
      transferType: 'point_to_point',
    },
  });

  const onSubmit = async (data: SearchFormValues) => {
    setIsSearching(true);

    const params = new URLSearchParams({
      pickupLocation: data.pickupLocation,
      dropoffLocation: data.dropoffLocation,
      pickupDate: format(data.pickupDate, 'yyyy-MM-dd'),
      pickupTime: data.pickupTime,
      passengers: data.passengers.toString(),
      luggage: data.luggage.toString(),
      transferType: data.transferType,
    });

    router.push(`/transfers/search?${params.toString()}`);
  };

  const pickupLocation = form.watch('pickupLocation');
  const summary = [
    pickupLocation || 'Anywhere',
    form.watch('pickupDate') ? format(form.watch('pickupDate') as Date, 'MMM d') : ''
  ].filter(Boolean).join(' • ');

  const formContent = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          {/* Transfer Type */}
          <FormField
            control={form.control}
            name="transferType"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>{t('transferType')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-12 rounded-xl bg-slate-50/50">
                      <SelectValue placeholder={t('selectTransferType')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="airport_to_city">{t('airportToCity')}</SelectItem>
                    <SelectItem value="city_to_airport">{t('cityToAirport')}</SelectItem>
                    <SelectItem value="point_to_point">{t('pointToPoint')}</SelectItem>
                    <SelectItem value="hourly">{t('hourlyRental')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pickup Location */}
          <FormField
            control={form.control}
            name="pickupLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pickupLocation')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('enterPickupAddress')}
                      className="pl-10 h-12 rounded-xl bg-slate-50/50"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Dropoff Location */}
          <FormField
            control={form.control}
            name="dropoffLocation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('dropoffLocation')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('enterDropoffAddress')}
                      className="pl-10 h-12 rounded-xl bg-slate-50/50"
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pickup Date */}
          <FormField
            control={form.control}
            name="pickupDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pickupDate')}</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full h-12 pl-3 text-left font-normal rounded-xl bg-slate-50/50',
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
                      disabled={(date) =>
                        date < new Date(new Date().setHours(0, 0, 0, 0))
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Pickup Time */}
          <FormField
            control={form.control}
            name="pickupTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('pickupTime')}</FormLabel>
                <FormControl>
                  <Input type="time" {...field} className="h-12 rounded-xl bg-slate-50/50" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Passengers */}
          <FormField
            control={form.control}
            name="passengers"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('passengers')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Users className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      className="pl-10 h-12 rounded-xl bg-slate-50/50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Luggage */}
          <FormField
            control={form.control}
            name="luggage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('luggagePieces')}</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Luggage className="absolute left-3 top-4 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      min="0"
                      max="50"
                      className="pl-10 h-12 rounded-xl bg-slate-50/50"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full h-12 rounded-xl font-bold uppercase tracking-wider" size="lg" disabled={isSearching}>
          <Search className="mr-2 h-5 w-5" />
          {isSearching ? tCommon('searching') : t('searchTransfers')}
        </Button>
      </form>
    </Form>
  );

  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <MobileSearchTrigger
        title="Book a Transfer"
        summary={summary}
        className={cn(mode === 'full' ? '' : 'block')}
      >
        {formContent}
      </MobileSearchTrigger>
    );
  }

  return (
    <Card className={cn('shadow-xl border-t-4 border-t-primary rounded-2xl overflow-hidden', mode === 'full' ? 'block' : 'hidden', className)}>
      <CardContent className="pt-8">
        {formContent}
      </CardContent>
    </Card>
  );
}
