// src/app/restaurants/[restaurantId]/page.tsx
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import type { Restaurant, MenuItem, MenuCategory, FullMenu, RestaurantReview } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, Utensils, Leaf, Flame, WheatOff, Star, Clock, MessageSquare, Calendar as CalendarIconLucide, BadgePercent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalNav } from '@/components/layout/global-nav';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrderSummaryCard } from './order-summary-card';
import { MenuItemCard } from './menu-item-card';
import { MenuItemDialog } from './menu-item-dialog';
import type { CartItem } from '@/hooks/use-cart';
import { StarRating } from '@/components/reviews/StarRating';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RestaurantReviewSubmission } from '@/components/restaurants/restaurant-review-submission';
import { TableBookingForm } from '@/components/restaurants/table-booking-form';

const TABS = ["Menu", "Restaurant Info", "Reviews", "Book a table", "Restaurant deals"];

const DIETARY_ICONS: { [key: string]: React.ElementType } = {
  vegetarian: Leaf,
  spicy: Flame,
  'gluten-free': WheatOff,
};

export default function RestaurantDetailPage() {
    const params = useParams<{ restaurantId: string }>();
    const { restaurantId } = params;
    const { toast } = useToast();

    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<FullMenu | null>(null);
    const [reviews, setReviews] = useState<RestaurantReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Menu");
    
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchRestaurantData = useCallback(async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const [restaurantRes, menuRes, reviewsRes] = await Promise.all([
                fetch(`/api/restaurants/${restaurantId}`),
                fetch(`/api/restaurants/${restaurantId}/menu`),
                fetch(`/api/restaurants/${restaurantId}/reviews`),
            ]);

            if (!restaurantRes.ok) {
                if(restaurantRes.status === 404) notFound();
                throw new Error("Failed to fetch restaurant details");
            }
            if (!menuRes.ok) throw new Error("Failed to fetch menu");
            if (!reviewsRes.ok) throw new Error("Failed to fetch reviews");
            
            const restaurantData = await restaurantRes.json();
            const menuData = await menuRes.json();
            const reviewsData = await reviewsRes.json();
            
            setRestaurant(restaurantData);
            setMenu(menuData);
            setReviews(reviewsData);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, toast]);

    useEffect(() => {
        fetchRestaurantData();
    }, [fetchRestaurantData]);
    
    const handleOpenItemDialog = (item: MenuItem | CartItem) => {
        const fullMenuItem = menu?.items.find(menuItem => menuItem.id === item.id.split('-')[0]);
        if (fullMenuItem) {
            setSelectedItem(fullMenuItem);
            setIsDialogOpen(true);
        } else {
            toast({ title: "Error", description: "Could not find item details to edit.", variant: "destructive"});
        }
    };

    const handleCloseDialog = () => {
        setIsDialogOpen(false);
        setSelectedItem(null);
    };

    const menuItemsByCategory = useMemo(() => {
        if (!menu) return {};
        return menu.items.reduce((acc, item) => {
            (acc[item.categoryId] = acc[item.categoryId] || []).push(item);
            return acc;
        }, {} as Record<string, MenuItem[]>);
    }, [menu]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!restaurant || !menu) {
        return notFound();
    }

    const renderMenuTab = () => (
      <div className="space-y-8">
        {menu.categories.map(category => (
          <div key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
            <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
            <div className="space-y-4">
              {(menuItemsByCategory[category.id!] || []).map(item => (
                <MenuItemCard key={item.id} item={item} onOpenDialog={handleOpenItemDialog} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
    
    const renderReviewsTab = () => (
      <Card>
        <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2"><MessageSquare className="h-6 w-6"/>Customer Reviews</CardTitle>
            <CardDescription>See what others are saying about {restaurant.name}.</CardDescription>
        </CardHeader>
        <CardContent>
             {reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map(review => (
                    <Card key={review.id} className="bg-secondary/40 shadow-sm">
                        <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                            <Avatar className="h-10 w-10">
                            <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                            <AvatarFallback>{review.reviewerName.substring(0, 1)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm">{review.reviewerName}</p>
                                <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                            </div>
                            <StarRating rating={review.rating} disabled size={16} />
                            <p className="text-sm mt-2">{review.comment}</p>
                            </div>
                        </div>
                        </CardContent>
                    </Card>
                    ))}
                </div>
            ) : (
                <p className="text-center text-muted-foreground py-10">No reviews yet for this restaurant.</p>
            )}
             <RestaurantReviewSubmission restaurantId={restaurantId} onReviewSubmit={fetchRestaurantData} />
        </CardContent>
      </Card>
    );

    const renderInfoTab = () => (
        <Card>
            <CardHeader><CardTitle className="text-2xl">Restaurant Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                 <p><strong className="font-semibold">Cuisines:</strong> {restaurant.cuisineTypes.join(', ')}</p>
                 <p><strong className="font-semibold">Address:</strong> {restaurant.location}</p>
                 <p><strong className="font-semibold">Status:</strong> {restaurant.status}</p>
            </CardContent>
        </Card>
    );
    
    const renderBookTableTab = () => (
        <Card>
             <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><CalendarIconLucide className="h-6 w-6"/>Book a Table</CardTitle>
                <CardDescription>Request a reservation at {restaurant.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                <TableBookingForm restaurantId={restaurantId} />
            </CardContent>
        </Card>
    );

    const renderDealsTab = () => (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl flex items-center gap-2"><BadgePercent className="h-6 w-6"/>Current Deals & Offers</CardTitle>
                <CardDescription>Special promotions available at {restaurant.name}.</CardDescription>
            </CardHeader>
            <CardContent>
                {restaurant.specialDeals ? (
                    <div className="prose dark:prose-invert max-w-none whitespace-pre-line">
                        {restaurant.specialDeals}
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-10">There are no special deals available at the moment.</p>
                )}
            </CardContent>
        </Card>
    );


    return (
        <>
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            <GlobalNav />
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="container mx-auto px-4 flex items-center justify-between h-14">
                    <div className="flex items-center gap-4">
                        {TABS.map(tab => (
                            <Button
                                key={tab}
                                variant="ghost"
                                onClick={() => setActiveTab(tab)}
                                className={`text-sm font-medium h-14 border-b-2 ${activeTab === tab ? 'border-red-600 text-red-600' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-red-600 hover:border-red-600'}`}
                            >
                                {tab}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-12 gap-8">
                    <aside className="col-span-12 lg:col-span-2">
                        <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <ul className="space-y-2">
                                    {menu.categories.map(category => (
                                        <li key={category.id}>
                                            <a href={`#category-${category.id}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors" onClick={() => setActiveTab('Menu')}>
                                                {category.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </aside>
                    
                    <div className="col-span-12 lg:col-span-7">
                        {activeTab === 'Menu' && renderMenuTab()}
                        {activeTab === 'Reviews' && renderReviewsTab()}
                        {activeTab === 'Restaurant Info' && renderInfoTab()}
                        {activeTab === 'Book a table' && renderBookTableTab()}
                        {activeTab === 'Restaurant deals' && renderDealsTab()}
                    </div>
                    
                    <aside className="col-span-12 lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <OrderSummaryCard restaurantId={restaurantId} onEditItem={handleOpenItemDialog}/>
                            <Card>
                                <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                    <CardTitle className="text-base flex items-center gap-2"><Info className="h-5 w-5"/> Restaurant Info</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-sm space-y-2 text-gray-600 dark:text-gray-300">
                                    <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Cuisines:</strong> {restaurant.cuisineTypes.join(', ')}</p>
                                    <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Address:</strong> {restaurant.location}</p>
                                    <div className="flex items-center gap-1.5"><StarRating rating={restaurant.rating} disabled size={16}/> <span className="font-semibold text-gray-800 dark:text-gray-100">{restaurant.rating.toFixed(1)}/5</span> ({restaurant.reviewCount} reviews)</div>
                                    <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-green-500"/> Delivery in 20-30 min</div>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
        
        <MenuItemDialog 
            isOpen={isDialogOpen}
            onClose={handleCloseDialog}
            item={selectedItem}
        />
        </>
    );
}
