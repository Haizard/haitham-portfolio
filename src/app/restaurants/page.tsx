
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
            <GlobalNav />
            <section className="relative bg-black text-white">
                <Image 
                    src="https://placehold.co/1920x500.png"
                    alt="Delicious food background"
                    fill
                    className="object-cover opacity-40"
                    data-ai-hint="food background"
                />
                <div className="relative container mx-auto px-4 py-20 text-center">
                    <h1 className="text-5xl font-extrabold mb-2">25,00000 Restaurants Serving In World</h1>
                    <p className="text-lg text-gray-200">Order Food Delivery from Your Favorite Restaurants</p>
                    <div className="mt-8 max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow-2xl">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input placeholder="RESTAURANT NAME" className="pl-10 text-black h-12" />
                        </div>
                         <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input placeholder="ALL LOCATIONS" className="pl-10 text-black h-12" />
                        </div>
                    </div>
                </div>
            </section>
            
            <main className="container mx-auto px-4 py-12">
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
             <footer className="bg-gray-800 text-white mt-12">
                <div className="container mx-auto px-4 py-8">
                    <div className="text-center mb-8">
                        <h3 className="text-xl font-bold">SUBSCRIBE TO OUR NEWSLETTER</h3>
                        <p className="text-gray-400">Sign up for our weekly newsletter to get the latest news and updates.</p>
                        <form className="mt-4 max-w-lg mx-auto flex">
                            <Input type="email" placeholder="Enter your email address" className="bg-gray-700 border-gray-600 rounded-r-none text-white h-12"/>
                            <Button type="submit" className="bg-red-600 hover:bg-red-700 rounded-l-none h-12">Subscribe</Button>
                        </form>
                    </div>
                    <Separator className="bg-gray-700 my-8"/>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-sm">
                        <div>
                            <h4 className="font-bold mb-3">About Us</h4>
                            <p className="text-gray-400">Food Market is a leading global online food delivery marketplace, connecting consumers with their favorite local restaurants.</p>
                        </div>
                        <div>
                            <h4 className="font-bold mb-3">Popular Cities</h4>
                            <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-red-500">New York</Link></li>
                                <li><Link href="#" className="hover:text-red-500">London</Link></li>
                                <li><Link href="#" className="hover:text-red-500">Paris</Link></li>
                                <li><Link href="#" className="hover:text-red-500">Tokyo</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold mb-3">Popular Cuisines</h4>
                             <ul className="space-y-2 text-gray-400">
                                <li><Link href="#" className="hover:text-red-500">Pizza</Link></li>
                                <li><Link href="#" className="hover:text-red-500">Burger</Link></li>
                                <li><Link href="#" className="hover:text-red-500">Thai</Link></li>
                                <li><Link href="#" className="hover:text-red-500">Chinese</Link></li>
                            </ul>
                        </div>
                         <div>
                            <h4 className="font-bold mb-3">Contact</h4>
                             <ul className="space-y-2 text-gray-400">
                                <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-red-500"/> +1 234 567 8910</li>
                                <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-red-500"/> contact@foodmarket.com</li>
                                <li className="flex items-start gap-2"><MapPin className="h-4 w-4 text-red-500 mt-1"/> 2nd Floor, 123 Street, New York, USA</li>
                            </ul>
                        </div>
                    </div>
                     <Separator className="bg-gray-700 my-8"/>
                     <div className="text-center text-gray-500 text-xs">
                        <p>&copy; {new Date().getFullYear()} Food Market. All Rights Reserved.</p>
                     </div>
                </div>
            </footer>
             <ComparisonBar />
        </div>
    );
}
