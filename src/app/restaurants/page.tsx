
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Restaurant } from '@/lib/restaurants-data';
import type { ServiceCategoryNode } from '@/lib/service-categories-data';
import type { FoodType } from '@/lib/food-types-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, MapPin, ThumbsUp, ChevronsUpDown, Star, DollarSign, Clock, Utensils, Heart, Check, Phone, Mail, Send, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { RestaurantList } from '@/components/restaurants/restaurant-list';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

const minOrderFilters = [
    { id: "5", label: "$5", count: 3 },
    { id: "10", label: "$10", count: 8 },
    { id: "15", label: "$15", count: 4 },
    { id: "20", label: "$20", count: 2 },
];

const sortOptions = [
    { id: "best_match", label: "Best Match", icon: ThumbsUp },
    { id: "alphabetical", label: "Alphabetical", icon: ChevronsUpDown },
    { id: "ratings", label: "Ratings", icon: Star },
    { id: "min_order", label: "Minimum order value", icon: DollarSign },
    { id: "delivery_fee", label: "Delivery fee", icon: DollarSign },
    { id: "fastest_delivery", label: "Fastest delivery", icon: Clock },
];

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [cuisineFilters, setCuisineFilters] = useState<ServiceCategoryNode[]>([]);
    const [foodTypeFilters, setFoodTypeFilters] = useState<FoodType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [restaurantsRes, cuisinesRes, foodTypesRes] = await Promise.all([
                fetch('/api/restaurants'),
                fetch('/api/service-categories'),
                fetch('/api/food-types')
            ]);

            if (!restaurantsRes.ok) throw new Error("Failed to fetch restaurants");
            const restaurantsData: Restaurant[] = await restaurantsRes.json();
            setRestaurants(restaurantsData);
            
            if (!cuisinesRes.ok) throw new Error("Failed to fetch cuisine categories");
            const cuisinesData: ServiceCategoryNode[] = await cuisinesRes.json();
            setCuisineFilters(cuisinesData);

            if (!foodTypesRes.ok) throw new Error("Failed to fetch food types");
            const foodTypesData: FoodType[] = await foodTypesRes.json();
            setFoodTypeFilters(foodTypesData);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const SidebarContent = () => (
        <aside className="space-y-6">
            <Card>
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Cuisines</CardTitle></CardHeader>
                <CardContent className="p-4 space-y-3">
                    {isLoading ? <Loader2 className="animate-spin" /> : cuisineFilters.slice(0, 8).map(filter => (
                        <div key={filter.id} className="flex justify-between items-center text-sm">
                            <label htmlFor={`cuisine-${filter.id}`} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                <Checkbox id={`cuisine-${filter.id}`} />
                                {filter.name}
                            </label>
                            <span className="text-muted-foreground">({filter.serviceCount})</span>
                        </div>
                    ))}
                    {cuisineFilters.length > 8 && <Link href="#" className="text-sm text-primary hover:underline">See more cuisines</Link>}
                </CardContent>
            </Card>
            <Card>
                 <CardHeader><CardTitle className="text-base">Sort By</CardTitle></CardHeader>
                 <CardContent className="space-y-3">
                    {sortOptions.map(opt => (
                        <div key={opt.id} className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary">
                            <opt.icon className="h-4 w-4"/>
                            <span>{opt.label}</span>
                        </div>
                    ))}
                 </CardContent>
            </Card>
            <Card className="bg-accent/20 border-accent">
                <CardHeader><CardTitle className="text-base">Can't find a Restaurant?</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-center">
                    <p className="text-sm text-muted-foreground">If you can't find the Restaurant that you want to Order, request to add in our list</p>
                    <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">Restaurant Request</Button>
                </CardContent>
            </Card>
        </aside>
    );

    return (
        <div className="bg-background text-foreground">
             {/* Hero Section */}
            <section className="relative py-20 md:py-24 text-center overflow-hidden bg-muted/30">
                <div className="absolute inset-0">
                    <Image src="https://placehold.co/1920x600.png" alt="Food background" fill className="object-cover opacity-20" data-ai-hint="food background" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline mb-4">25,00000 Restaurants Serving In World</h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">Order Food Delivery from Your Favorite Restaurants</p>
                    <div className="max-w-3xl mx-auto bg-card p-4 rounded-lg shadow-lg flex flex-col md:flex-row gap-2">
                        <Input placeholder="Restaurant Name" className="flex-grow text-base"/>
                        <Input placeholder="All Locations" className="flex-grow text-base"/>
                        <Button size="lg" className="bg-primary hover:bg-primary/90"><Search className="mr-2 h-5 w-5"/> Search</Button>
                    </div>
                </div>
            </section>
            
            <main className="container mx-auto px-4 py-12">
                <div className="lg:hidden mb-4">
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Filter className="mr-2 h-4 w-4" />
                        Show Filters & Sort Options
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full max-w-sm overflow-y-auto">
                        <SheetHeader className="pb-4">
                            <SheetTitle>Filter & Sort</SheetTitle>
                        </SheetHeader>
                       <SidebarContent />
                    </SheetContent>
                  </Sheet>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block lg:col-span-3">
                      <SidebarContent />
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-9 space-y-6">
                        <h2 className="text-xl font-bold">{restaurants.length} Restaurant's Found</h2>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                            </div>
                        ) : (
                            <RestaurantList restaurants={restaurants} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
