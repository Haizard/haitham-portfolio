
"use client";

import { useEffect, useState, useCallback } from 'react';
import type { Restaurant } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, MapPin, ThumbsUp, ChevronsUpDown, Star, DollarSign, Clock, Utensils, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { StarRating } from '@/components/reviews/StarRating';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

// Mock data for cuisines filter
const cuisineFilters = [
  { id: "apple_juice", label: "Apple juice", count: 1 },
  { id: "bbq", label: "BB-Q", count: 1 },
  { id: "beef_roast", label: "Beef Roast", count: 1 },
  { id: "carrot_juice", label: "Carrot Juice", count: 1 },
  { id: "cheese_burger", label: "Cheese Burger", count: 8 },
  { id: "cold_coffee", label: "Cold Coffee", count: 2 },
  { id: "cupcake", label: "Cupcake", count: 0 },
  { id: "doughnut", label: "Doughnut", count: 0 },
];

const sortOptions = [
    { id: "best_match", label: "Best Match", icon: ThumbsUp },
    { id: "alphabetical", label: "Alphabetical", icon: ChevronsUpDown },
    { id: "ratings", label: "Ratings", icon: Star },
    { id: "min_order", label: "Minimum order value", icon: DollarSign },
    { id: "delivery_fee", label: "Delivery fee", icon: DollarSign },
    { id: "fastest_delivery", label: "Fastest delivery", icon: Clock },
];

function RestaurantCard({ restaurant }: { restaurant: Restaurant }) {
    return (
        <Card className="flex flex-col sm:flex-row gap-4 p-4 shadow-md hover:shadow-lg transition-shadow relative">
            {restaurant.status === 'Closed' && (
                <Badge variant="destructive" className="absolute -top-2 -left-2 rotate-[-15deg] shadow-lg">CLOSED</Badge>
            )}
            <div className="flex-shrink-0">
                <Image src={restaurant.logoUrl} alt={`${restaurant.name} logo`} width={110} height={110} className="rounded-md object-contain border" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                           {restaurant.name}
                           {restaurant.isSponsored && <Badge className="text-xs bg-orange-500 text-white">sponsored</Badge>}
                        </h3>
                        <div className="flex items-center gap-1">
                            <StarRating rating={restaurant.rating} size={16} disabled />
                            <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
                        </div>
                    </div>
                     <Button variant="outline" asChild>
                        <Link href="#">VIEW MENU</Link>
                    </Button>
                </div>
                 <Separator className="my-2"/>
                 <p className="text-sm text-muted-foreground">Type of food: {restaurant.cuisineTypes.join(', ')}</p>
                 <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <button className="text-red-500 hover:text-red-600"><Heart className="h-5 w-5"/></button>
                    <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4"/> {restaurant.location}</span>
                </div>
            </div>
        </Card>
    );
}

export default function RestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRestaurants = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/restaurants');
            if (!response.ok) throw new Error("Failed to fetch restaurants");
            const data: Restaurant[] = await response.json();
            setRestaurants(data);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        fetchRestaurants();
    }, [fetchRestaurants]);

    return (
        <div className="bg-gray-100 dark:bg-gray-900">
            {/* Hero Section */}
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
            
            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Cuisines</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {cuisineFilters.map(filter => (
                                    <div key={filter.id} className="flex justify-between items-center text-sm">
                                        <label htmlFor={filter.id} className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                            <Checkbox id={filter.id} />
                                            {filter.label}
                                        </label>
                                        <span className="text-muted-foreground">({filter.count})</span>
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
                    </aside>

                    {/* Restaurant List */}
                    <div className="lg:col-span-6 space-y-6">
                        <h2 className="text-xl font-bold">{restaurants.length} Restaurant's Found</h2>
                        {isLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                            </div>
                        ) : (
                            restaurants.map(r => <RestaurantCard key={r.id} restaurant={r} />)
                        )}
                    </div>
                    
                     {/* Right Sidebar */}
                    <aside className="lg:col-span-3 space-y-6">
                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Sort By</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 space-y-3">
                                {sortOptions.map(opt => (
                                     <div key={opt.id} className="flex items-center text-sm text-muted-foreground hover:text-red-600 cursor-pointer">
                                        <opt.icon className="h-4 w-4 mr-2" /> {opt.label}
                                     </div>
                                ))}
                            </CardContent>
                        </Card>

                         <Card className="bg-orange-400 text-white p-6 text-center">
                            <h3 className="text-xl font-bold">Can't find a Restaurant?</h3>
                            <p className="text-sm mt-2 mb-4">If you can't find the Restaurant that you want to Order, request to add in our list</p>
                            <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-orange-500">
                                RESTAURANT REQUEST
                            </Button>
                        </Card>
                    </aside>
                </div>
            </main>
        </div>
    );
}
