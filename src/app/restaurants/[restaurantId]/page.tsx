
"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, notFound } from 'next/navigation';
import type { Restaurant, MenuItem, MenuCategory, FullMenu } from '@/lib/restaurants-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Info, Utensils, Leaf, Flame, WheatOff, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlobalNav } from '@/components/layout/global-nav';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { OrderSummaryCard } from './order-summary-card';
import { MenuItemCard } from './menu-item-card';
import { MenuItemDialog } from './menu-item-dialog';

const TABS = ["Menu", "Restaurant Info", "Book a table", "Restaurant deals"];

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
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Menu");
    
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fetchRestaurantData = useCallback(async () => {
        if (!restaurantId) return;
        setIsLoading(true);
        try {
            const [restaurantRes, menuRes] = await Promise.all([
                fetch(`/api/restaurants/${restaurantId}`),
                fetch(`/api/restaurants/${restaurantId}/menu`),
            ]);

            if (!restaurantRes.ok) {
                if(restaurantRes.status === 404) notFound();
                throw new Error("Failed to fetch restaurant details");
            }
            if (!menuRes.ok) throw new Error("Failed to fetch menu");
            
            const restaurantData = await restaurantRes.json();
            const menuData = await menuRes.json();
            
            setRestaurant(restaurantData);
            setMenu(menuData);

        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [restaurantId, toast]);

    useEffect(() => {
        fetchRestaurantData();
    }, [fetchRestaurantData]);
    
    const handleOpenItemDialog = (item: MenuItem) => {
        setSelectedItem(item);
        setIsDialogOpen(true);
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

    return (
        <>
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
            <GlobalNav />
            {/* Sub-navigation */}
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
                    {/* Left Sidebar */}
                    <aside className="col-span-12 lg:col-span-2">
                        <Card>
                            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                <CardTitle className="text-base flex items-center gap-2"><Utensils className="h-5 w-5"/> Categories</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <ul className="space-y-2">
                                    {menu.categories.map(category => (
                                        <li key={category.id}>
                                            <a href={`#category-${category.id}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 transition-colors">
                                                {category.name}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </aside>
                    
                    {/* Center Content */}
                    <div className="col-span-12 lg:col-span-7 space-y-8">
                         {menu.categories.map(category => (
                            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-20">
                               <h2 className="text-2xl font-bold mb-4">{category.name}</h2>
                               <div className="space-y-4">
                                {menuItemsByCategory[category.id!]?.map(item => (
                                    <MenuItemCard key={item.id} item={item} onOpenDialog={handleOpenItemDialog} />
                                 ))}
                               </div>
                            </div>
                         ))}
                    </div>
                    
                    {/* Right Sidebar */}
                    <aside className="col-span-12 lg:col-span-3">
                        <div className="sticky top-24 space-y-6">
                            <OrderSummaryCard restaurantId={restaurantId}/>
                            <Card>
                                <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                                    <CardTitle className="text-base flex items-center gap-2"><Info className="h-5 w-5"/> Restaurant Info</CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 text-sm space-y-2 text-gray-600 dark:text-gray-300">
                                    <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Cuisines:</strong> {restaurant.cuisineTypes.join(', ')}</p>
                                    <p><strong className="font-semibold text-gray-800 dark:text-gray-100">Address:</strong> {restaurant.location}</p>
                                    <div className="flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500"/> <span className="font-semibold text-gray-800 dark:text-gray-100">{restaurant.rating}/5</span> ({restaurant.reviewCount} reviews)</div>
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
