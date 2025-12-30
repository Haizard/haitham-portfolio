"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { CalendarIcon, MapPin, Users, Search, Compass } from 'lucide-react';
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
import { MobileSearchTrigger } from '../shared/mobile-search-trigger';
import { useIsMobile } from '@/hooks/use-mobile';

const searchSchema = z.object({
    location: z.string().min(2, 'Enter a destination'),
    date: z.date({
        required_error: 'Date is required',
    }),
    guests: z.number().int().min(1).max(50),
    tourType: z.string().optional(),
});

type SearchFormData = z.infer<typeof searchSchema>;

interface TourSearchFormProps {
    className?: string;
    onSearch?: (params: URLSearchParams) => void;
    mode?: 'full' | 'compact';
    filterOptions?: {
        locations: string[];
        tourTypes: string[];
    };
}

export function TourSearchForm({ className, onSearch, mode = 'full', filterOptions }: TourSearchFormProps) {
    const router = useRouter();
    const [date, setDate] = useState<Date>();
    const t = useTranslations('search');
    const tCommon = useTranslations('common');

    const form = useForm<SearchFormData>({
        resolver: zodResolver(searchSchema),
        defaultValues: {
            location: '',
            guests: 2,
            tourType: 'all',
        },
    });

    const handleSubmit = (data: SearchFormData) => {
        const params = new URLSearchParams();

        params.set('locations', data.location);
        params.set('date', format(data.date, 'yyyy-MM-dd'));
        params.set('guests', data.guests.toString());

        if (data.tourType && data.tourType !== 'all') {
            params.set('tourTypes', data.tourType);
        }

        if (onSearch) {
            onSearch(params);
        } else {
            router.push(`/tours?${params.toString()}`);
        }
    };

    const watchedLocation = form.watch('location');
    const watchedGuests = form.watch('guests');

    const summary = [
        watchedLocation || 'Anywhere',
        date ? format(date, 'MMM d') : '',
        `${watchedGuests} ${watchedGuests === 1 ? 'Person' : 'People'}`
    ].filter(Boolean).join(' • ');

    const formContent = (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Destination */}
                <div className="space-y-2 lg:col-span-1">
                    <Label htmlFor="location" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {t('destination')}
                    </Label>
                    <Input
                        id="location"
                        placeholder={t('cityOrHotelName')}
                        {...form.register('location')}
                        className="h-12 bg-slate-50/50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    />
                    {form.formState.errors.location && (
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
                            {form.formState.errors.location.message}
                        </p>
                    )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                    <Label className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        {t('date')}
                    </Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    'w-full h-12 justify-start text-left font-semibold rounded-xl bg-slate-50/50 border-slate-200',
                                    !date && 'text-muted-foreground'
                                )}
                            >
                                {date ? format(date, 'PPP') : t('selectDate')}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(selectedDate) => {
                                    setDate(selectedDate);
                                    if (selectedDate) form.setValue('date', selectedDate);
                                }}
                                disabled={(selectedDate) => selectedDate < new Date()}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                    {form.formState.errors.date && (
                        <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mt-1">
                            {form.formState.errors.date.message}
                        </p>
                    )}
                </div>

                {/* Guests */}
                <div className="space-y-2">
                    <Label htmlFor="guests" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {t('participants')}
                    </Label>
                    <Select
                        value={form.watch('guests')?.toString()}
                        onValueChange={(value) => form.setValue('guests', parseInt(value))}
                    >
                        <SelectTrigger id="guests" className="h-12 rounded-xl bg-slate-50/50 border-slate-200 font-semibold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map((num) => (
                                <SelectItem key={num} value={num.toString()} className="font-semibold">
                                    {num} {num === 1 ? 'Person' : 'People'}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tour Type */}
                <div className="space-y-2">
                    <Label htmlFor="tourType" className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-muted-foreground">
                        <Compass className="h-3 w-3" />
                        {t('tourType')}
                    </Label>
                    <Select
                        value={form.watch('tourType')}
                        onValueChange={(value) => form.setValue('tourType', value)}
                    >
                        <SelectTrigger id="tourType" className="h-12 rounded-xl bg-slate-50/50 border-slate-200 font-semibold">
                            <SelectValue placeholder={t('allTypes')} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all" className="font-semibold">{t('allTypes')}</SelectItem>
                            {filterOptions?.tourTypes.map(type => (
                                <SelectItem key={type} value={type} className="font-semibold">{type}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex items-end">
                <Button type="submit" size="lg" className="w-full h-12 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all hover:shadow-xl hover:shadow-primary/30">
                    <Search className="h-4 w-4 mr-2" />
                    {t('searchTours')}
                </Button>
            </div>
        </form>
    );

    const isMobile = useIsMobile();

    if (isMobile) {
        return (
            <MobileSearchTrigger
                title="Find a Tour"
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
