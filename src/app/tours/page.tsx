
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { TourPackage } from '@/lib/tours-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, MapPin, Compass, Clock, DollarSign, Filter, Grid, List, Search, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useDebouncedCallback } from 'use-debounce';
import { WishlistButton } from '@/components/wishlists/wishlist-button';
import { CompareButton } from '@/components/comparisons/compare-button';
import { useFormatPrice } from '@/contexts/currency-context';

interface TourFilters {
    locations: string[];
    tourTypes: string[];
    durations: string[];
    priceRange: [number, number];
}

interface FilterOptions {
    locations: string[];
    tourTypes: string[];
    durations: string[];
    maxPrice: number;
}

const TourCard = ({ tour }: { tour: TourPackage }) => {
    const format = useFormatPrice();
    return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
            <div className="relative aspect-[4/3] overflow-hidden">
                <Link href={`/tours/${tour.slug}`}>
                    <Image
                        src={tour.featuredImageUrl}
                        alt={tour.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </Link>
                <div className="absolute top-2 right-2">
                    <WishlistButton
                        itemType="tour"
                        itemId={tour.id || ''}
                        variant="ghost"
                        size="icon"
                        className="bg-card/70 hover:bg-card rounded-full h-8 w-8"
                    />
                </div>
            </div>
            <CardContent className="p-4 flex flex-col flex-grow">
                <h3 className="text-base font-bold font-headline group-hover:text-primary transition-colors line-clamp-2 h-12">
                    <Link href={`/tours/${tour.slug}`}>{tour.name}</Link>
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><MapPin className="h-3 w-3" />{tour.location}</p>

                <div className="border-t my-3" />

                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary" /> Duration: <span className="font-semibold text-foreground">{tour.duration}</span></div>
                    <div className="flex items-center gap-1.5"><Compass className="h-4 w-4 text-primary" /> Type: <span className="font-semibold text-foreground">{tour.tourType}</span></div>
                </div>

                <div className="mt-auto pt-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <p className="text-lg font-bold text-primary">{format(tour.price, 'USD')}</p>
                        <Button asChild size="sm" variant="outline">
                            <Link href={`/tours/${tour.slug}`}>View Details</Link>
                        </Button>
                    </div>
                    <CompareButton
                        itemType="tour"
                        itemId={tour.id || ''}
                        className="w-full"
                        size="sm"
                    />
                </div>
            </CardContent>
        </Card>
    );
};

export default function ToursPage() {
    const [tours, setTours] = useState<TourPackage[]>([]);
    const [filterOptions, setFilterOptions] = useState<FilterOptions>({ locations: [], tourTypes: [], durations: [], maxPrice: 1000 });
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const format = useFormatPrice();

    const [filters, setFilters] = useState<TourFilters>({
        locations: [],
        tourTypes: [],
        durations: [],
        priceRange: [0, 1000],
    });

    const fetchTours = useCallback(async (currentFilters: TourFilters) => {
        setIsLoading(true);
        try {
            const query = new URLSearchParams();
            if (currentFilters.locations.length > 0) query.append('locations', currentFilters.locations.join(','));
            if (currentFilters.tourTypes.length > 0) query.append('tourTypes', currentFilters.tourTypes.join(','));
            if (currentFilters.durations.length > 0) query.append('durations', currentFilters.durations.join(','));
            query.append('minPrice', currentFilters.priceRange[0].toString());
            query.append('maxPrice', currentFilters.priceRange[1].toString());

            const response = await fetch(`/api/tours?${query.toString()}`);
            if (!response.ok) throw new Error("Failed to fetch tour packages");
            const data: { tours: TourPackage[], filterOptions: FilterOptions } = await response.json();

            setTours(data.tours);
            // Only set initial filter options once
            if (isLoading) {
                setFilterOptions(data.filterOptions);
                setFilters(prev => ({ ...prev, priceRange: [0, data.filterOptions.maxPrice] }));
            }

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast, isLoading]);

    const debouncedFetchTours = useDebouncedCallback((f) => fetchTours(f), 500);

    useEffect(() => {
        debouncedFetchTours(filters);
    }, [filters, debouncedFetchTours]);

    const handleFilterChange = (type: keyof Omit<TourFilters, 'priceRange'>, value: string) => {
        setFilters(prev => {
            const currentValues = prev[type] as string[];
            const newValues = currentValues.includes(value)
                ? currentValues.filter(v => v !== value)
                : [...currentValues, value];
            return { ...prev, [type]: newValues };
        });
    };

    const handlePriceChange = (newRange: number[]) => {
        setFilters(prev => ({ ...prev, priceRange: [newRange[0], newRange[1]] }));
    };

    const FilterContent = () => (
        <div className="space-y-6">
            <Accordion type="multiple" defaultValue={['destination', 'price', 'duration', 'type']} className="w-full">
                <AccordionItem value="destination" className="border-b-0">
                    <AccordionTrigger className="font-bold text-sm uppercase tracking-wider py-4 hover:no-underline">Destination</AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                        {filterOptions.locations.map(loc => (
                            <div key={loc} className="flex items-center space-x-3">
                                <Checkbox id={`loc-${loc}`} onCheckedChange={() => handleFilterChange('locations', loc)} className="rounded-md h-5 w-5" />
                                <label htmlFor={`loc-${loc}`} className="text-sm font-semibold">{loc}</label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="price" className="border-b-0">
                    <AccordionTrigger className="font-bold text-sm uppercase tracking-wider py-4 hover:no-underline">Price</AccordionTrigger>
                    <AccordionContent className="px-1 pb-4">
                        <Slider defaultValue={[0, filterOptions.maxPrice]} max={filterOptions.maxPrice} step={10} value={filters.priceRange} onValueChange={handlePriceChange} className="py-4" />
                        <div className="flex justify-between text-xs font-black uppercase tracking-widest mt-2 text-muted-foreground">
                            <span>{format(filters.priceRange[0], 'USD')}</span>
                            <span>{format(filters.priceRange[1], 'USD')}</span>
                        </div>
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="duration" className="border-b-0">
                    <AccordionTrigger className="font-bold text-sm uppercase tracking-wider py-4 hover:no-underline">Duration</AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                        {filterOptions.durations.map(dur => (
                            <div key={dur} className="flex items-center space-x-3">
                                <Checkbox id={`dur-${dur}`} onCheckedChange={() => handleFilterChange('durations', dur)} className="rounded-md h-5 w-5" />
                                <label htmlFor={`dur-${dur}`} className="text-sm font-semibold">{dur}</label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="type" className="border-b-0">
                    <AccordionTrigger className="font-bold text-sm uppercase tracking-wider py-4 hover:no-underline">Tour Type</AccordionTrigger>
                    <AccordionContent className="space-y-3 pb-4">
                        {filterOptions.tourTypes.map(type => (
                            <div key={type} className="flex items-center space-x-3">
                                <Checkbox id={`type-${type}`} onCheckedChange={() => handleFilterChange('tourTypes', type)} className="rounded-md h-5 w-5" />
                                <label htmlFor={`type-${type}`} className="text-sm font-semibold">{type}</label>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Filters Sidebar (Desktop) */}
                <aside className="hidden lg:block space-y-8">
                    <div className="sticky top-28 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-10 shadow-2xl shadow-slate-100">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center">
                            <Filter className="h-4 w-4 mr-3" /> Filters
                        </h2>
                        <FilterContent />
                    </div>
                </aside>

                {/* Tours Grid */}
                <main className="lg:col-span-3">
                    {/* Mobile Filters Header */}
                    <div className="lg:hidden flex items-center justify-between mb-8 gap-4">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="outline" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-widest bg-white shadow-xl border-slate-100">
                                    <Filter className="h-4 w-4 mr-3 text-primary" /> Filters
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="bottom" className="h-[85vh] rounded-t-[3rem] px-8 pt-12 pb-10 overflow-y-auto">
                                <SheetHeader className="mb-8 ">
                                    <SheetTitle className="text-3xl font-black text-center">Filter Tours</SheetTitle>
                                    <div className="w-12 h-1.5 bg-primary/20 rounded-full mx-auto mt-4" />
                                </SheetHeader>
                                <FilterContent />
                            </SheetContent>
                        </Sheet>
                        <div className="bg-primary/10 px-6 h-14 rounded-2xl flex items-center justify-center">
                            <span className="text-[10px] font-black text-primary uppercase tracking-widest">{tours.length} results</span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-muted-foreground">{isLoading ? "Loading..." : `${tours.length} tours found`}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon"><Grid className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" disabled><List className="h-5 w-5" /></Button>
                        </div>
                    </div>
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <Card key={i} className="h-[400px] animate-pulse bg-muted" />)}
                        </div>
                    ) : tours.length === 0 ? (
                        <div className="text-center py-20">
                            <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-xl font-semibold">No Tours Found</h3>
                            <p className="text-muted-foreground mt-2">Try adjusting your filters to find the perfect tour.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
                        </div>
                    )}
                    {/* Pagination would go here */}
                </main>
            </div>
        </div>
    );
}
