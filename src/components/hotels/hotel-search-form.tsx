"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, MapPin, Users, Search } from 'lucide-react';
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
  destination: z.string().min(2, 'Enter a destination'),
  checkInDate: z.date({
    required_error: 'Check-in date is required',
  }),
  checkOutDate: z.date({
    required_error: 'Check-out date is required',
  }),
  guests: z.number().int().min(1).max(20),
  propertyType: z.string().optional(),
}).refine((data) => data.checkOutDate > data.checkInDate, {
  message: 'Check-out must be after check-in',
  path: ['checkOutDate'],
});

type SearchFormData = z.infer<typeof searchSchema>;

interface HotelSearchFormProps {
  className?: string;
  onSearch?: (params: URLSearchParams) => void;
}

export function HotelSearchForm({ className, onSearch }: HotelSearchFormProps) {
  const router = useRouter();
  const [checkInDate, setCheckInDate] = useState<Date>();
  const [checkOutDate, setCheckOutDate] = useState<Date>();
  const t = useTranslations('search');
  const tCommon = useTranslations('common');

  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      destination: '',
      guests: 2,
      propertyType: '',
    },
  });

  const handleSubmit = (data: SearchFormData) => {
    const params = new URLSearchParams();
    
    // Extract city from destination (simple implementation)
    params.set('city', data.destination);
    params.set('checkInDate', format(data.checkInDate, 'yyyy-MM-dd'));
    params.set('checkOutDate', format(data.checkOutDate, 'yyyy-MM-dd'));
    params.set('guests', data.guests.toString());
    
    if (data.propertyType) {
      params.set('propertyType', data.propertyType);
    }

    if (onSearch) {
      onSearch(params);
    } else {
      router.push(`/hotels/search?${params.toString()}`);
    }
  };

  return (
    <Card className={cn('shadow-lg', className)}>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            {/* Destination */}
            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="destination" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {t('destination')}
              </Label>
              <Input
                id="destination"
                placeholder={t('cityOrHotelName')}
                {...form.register('destination')}
                className="h-11"
              />
              {form.formState.errors.destination && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.destination.message}
                </p>
              )}
            </div>

            {/* Check-in Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('checkIn')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal',
                      !checkInDate && 'text-muted-foreground'
                    )}
                  >
                    {checkInDate ? format(checkInDate, 'PPP') : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkInDate}
                    onSelect={(date) => {
                      setCheckInDate(date);
                      form.setValue('checkInDate', date!);
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.checkInDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.checkInDate.message}
                </p>
              )}
            </div>

            {/* Check-out Date */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                {t('checkOut')}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-11 justify-start text-left font-normal',
                      !checkOutDate && 'text-muted-foreground'
                    )}
                  >
                    {checkOutDate ? format(checkOutDate, 'PPP') : t('selectDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOutDate}
                    onSelect={(date) => {
                      setCheckOutDate(date);
                      form.setValue('checkOutDate', date!);
                    }}
                    disabled={(date) => {
                      const minDate = checkInDate || new Date();
                      return date <= minDate;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {form.formState.errors.checkOutDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.checkOutDate.message}
                </p>
              )}
            </div>

            {/* Guests */}
            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                {t('guests')}
              </Label>
              <Select
                value={form.watch('guests')?.toString()}
                onValueChange={(value) => form.setValue('guests', parseInt(value))}
              >
                <SelectTrigger id="guests" className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? t('guest') : t('guests')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Property Type (Optional) */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="propertyType">{t('propertyType')} ({tCommon('optional')})</Label>
              <Select
                value={form.watch('propertyType')}
                onValueChange={(value) => form.setValue('propertyType', value)}
              >
                <SelectTrigger id="propertyType">
                  <SelectValue placeholder={t('allTypes')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">{t('allTypes')}</SelectItem>
                  <SelectItem value="hotel">{t('hotel')}</SelectItem>
                  <SelectItem value="apartment">{t('apartment')}</SelectItem>
                  <SelectItem value="resort">{t('resort')}</SelectItem>
                  <SelectItem value="villa">{t('villa')}</SelectItem>
                  <SelectItem value="hostel">{t('hostel')}</SelectItem>
                  <SelectItem value="guesthouse">{t('guesthouse')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <div className="flex items-end">
              <Button type="submit" size="lg" className="w-full h-11">
                <Search className="h-4 w-4 mr-2" />
                {t('searchHotels')}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

