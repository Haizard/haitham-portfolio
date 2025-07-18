
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { StarRating } from '@/components/reviews/StarRating';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { GlobalNav } from '@/components/layout/global-nav';
import { cn } from '@/lib/utils';
import { useComparison } from '@/hooks/use-comparison';
import { ComparisonBar } from '@/components/restaurants/comparison-bar';
import { RestaurantList } from '@/components/restaurants/restaurant-list';
import { RestaurantListItem } from '@/components/restaurants/restaurant-list-item';


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

    return (
        <div className="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <main className="container mx-auto px-4 py-12">
                 <header className="text-center mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline">Find Your Next Meal</h1>
                    <p className="text-lg text-muted-foreground mt-2">Order food delivery from your favorite local restaurants.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <aside className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Cuisines</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {isLoading ? <Loader2 className="animate-spin" /> : cuisineFilters.map(filter => (
                                    <div key={filter.id} className="flex justify-between items-center text-sm">
                                        <label htmlFor={`cuisine-${filter.id}`} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                            <Checkbox id={`cuisine-${filter.id}`} />
                                            {filter.name}
                                        </label>
                                        <span className="text-muted-foreground">({filter.serviceCount})</span>
                                    </div>
                                ))}
                                <Link href="#" className="text-sm text-red-600 hover:underline">See more cuisines</Link>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Clock className="h-5 w-5"/> Opening Status</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                 <div className="flex justify-between items-center text-sm">
                                    <label htmlFor="status-open" className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                        <Checkbox id="status-open" /> Open
                                    </label>
                                </div>
                                 <div className="flex justify-between items-center text-sm">
                                    <label htmlFor="status-closed" className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                        <Checkbox id="status-closed" /> Closed
                                    </label>
                                </div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><DollarSign className="h-5 w-5"/> Min. Order</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {minOrderFilters.map(filter => (
                                    <div key={filter.id} className="flex justify-between items-center text-sm">
                                        <label htmlFor={`min-order-${filter.id}`} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                            <Checkbox id={`min-order-${filter.id}`} />
                                            {filter.label}
                                        </label>
                                        <span className="text-muted-foreground">({filter.count})</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Food Type</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {isLoading ? <Loader2 className="animate-spin" /> : foodTypeFilters.map(filter => (
                                    <div key={filter.id} className="flex justify-between items-center text-sm">
                                        <label htmlFor={`food-type-${filter.id}`} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                            <Checkbox id={`food-type-${filter.id}`} />
                                            {filter.name}
                                        </label>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </aside>

                    <div className="lg:col-span-9 space-y-6">
                        <div className="flex justify-between items-center">
                             <h2 className="text-xl font-bold">{restaurants.length} Restaurant's Found</h2>
                             <Button variant="outline" className="flex items-center gap-2"><Filter className="h-4 w-4"/>Filter</Button>
                        </div>
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
             <ComparisonBar />
        </div>
    );
}
