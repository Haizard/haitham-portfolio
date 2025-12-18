"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, MapPin, Clock, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

const searchSchema = z.object({
  location: z.string().min(2, 'Enter a location'),
  pickupDate: z.date({
    required_error: 'Pickup date is required',
  }),
  pickupTime: z.string().min(1, 'Pickup time is required'),
  returnDate: z.date({
    required_error: 'Return date is required',
  }),
  returnTime: z.string().min(1, 'Return time is required'),
  category: z.string().optional(),
}).refine((data) => data.returnDate > data.pickupDate, {
  message: 'Return must be after pickup',
  path: ['returnDate'],
});

type SearchFormData = z.infer<typeof searchSchema>;

interface CarSearchFormProps {
  className?: string;
  onSearch?: (params: URLSearchParams) => void;
}

export function CarSearchForm({ className, onSearch }: CarSearchFormProps) {
  const router = useRouter();
  const [pickupDate, setPickupDate] = useState<Date>();
  const [returnDate, setReturnDate] = useState<Date>();
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      location: '',
      pickupTime: '10:00',
      returnTime: '10:00',
      category: 'all',
    },
  });

  const handleSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();

    params.set('city', data.location);
    params.set('pickupDate', format(data.pickupDate, 'yyyy-MM-dd'));
    params.set('pickupTime', data.pickupTime);
    params.set('returnDate', format(data.returnDate, 'yyyy-MM-dd'));
    params.set('returnTime', data.returnTime);

    if (data.category && data.category !== 'all') {
      params.set('category', data.category);
    }

    if (onSearch) {
      onSearch(params);
    } else {
      router.push(`/cars/search?${params.toString()}`);
    }
  };

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    return `${hour}:00`;
  });

  return (
    <Card className={cn('shadow-lg', className)}>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            {/* Location */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('pickupLocation')}
              </Label>
              <Input
                id="location"
                placeholder={t('cityOrAirport')}
                {...form.register('location')}
                className="h-11"
              />
              {form.formState.errors.location && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.location.message}
                </p>
              )}
            </div>

            {/* Pickup Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('pickupDate')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal',
                      !pickupDate && 'text-muted-foreground'
                    )}
                  >
                    {pickupDate ? format(pickupDate, 'PPP') : t('selectDate')}
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
              {form.formState.errors.pickupDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.pickupDate.message}
                </p>
              )}
            </div>

            {/* Pickup Time */}
            <div className="space-y-2">
              <Label htmlFor="pickupTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {tCommon('time')}
              </Label>
              <Select
                value={form.watch('pickupTime')}
                onValueChange={(value) => form.setValue('pickupTime', value)}
              >
                <SelectTrigger id="pickupTime" className="h-11">
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

            {/* Return Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('returnDate')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal',
                      !returnDate && 'text-muted-foreground'
                    )}
                  >
                    {returnDate ? format(returnDate, 'PPP') : t('selectDate')}
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
              {form.formState.errors.returnDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.returnDate.message}
                </p>
              )}
            </div>

            {/* Return Time */}
            <div className="space-y-2">
              <Label htmlFor="returnTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {tCommon('time')}
              </Label>
              <Select
                value={form.watch('returnTime')}
                onValueChange={(value) => form.setValue('returnTime', value)}
              >
                <SelectTrigger id="returnTime" className="h-11">
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
          </div>

          {/* Category and Search Button */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="category">{t('vehicleCategory')} ({tCommon('optional')})</Label>
              <Select
                value={form.watch('category')}
                onValueChange={(value) => form.setValue('category', value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t('allCategories')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allCategories')}</SelectItem>
                  <SelectItem value="economy">{t('economy')}</SelectItem>
                  <SelectItem value="compact">{t('compact')}</SelectItem>
                  <SelectItem value="midsize">{t('midsize')}</SelectItem>
                  <SelectItem value="fullsize">{t('fullsize')}</SelectItem>
                  <SelectItem value="suv">{t('suv')}</SelectItem>
                  <SelectItem value="luxury">{t('luxury')}</SelectItem>
                  <SelectItem value="van">{t('van')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button type="submit" size="lg" className="w-full h-11">
                <Search className="h-4 w-4 mr-2" />
                {t('searchCars')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

