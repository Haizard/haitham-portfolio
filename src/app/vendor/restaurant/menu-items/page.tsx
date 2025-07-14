// src/app/(app)/vendor/restaurant/menu-items/page.tsx
"use client";

import { ClipboardList, Loader2 } from "lucide-react";
import { MenuItemManagement } from "@/components/restaurants/menu-item-management";
import { useUser } from "@/hooks/use-user";
import { useState, useEffect } from "react";
import type { Restaurant } from "@/lib/restaurants-data";

export default function RestaurantMenuItemsPage() {
  const { user } = useUser();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      async function fetchRestaurant() {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/restaurants/by-owner/${user.id}`);
          if (res.ok) {
            const data: Restaurant = await res.json();
            setRestaurant(data);
          }
        } catch (error) {
          console.error("Failed to fetch restaurant for menu management:", error);
        } finally {
          setIsLoading(false);
        }
      }
      fetchRestaurant();
    }
  }, [user]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <ClipboardList className="h-8 w-8 text-primary" />
          Manage Menu Items
        </h1>
        <p className="text-muted-foreground mt-1">Add, edit, and organize your menu items and categories.</p>
      </header>
      {isLoading ? (
        <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary"/></div>
      ) : restaurant ? (
        <MenuItemManagement restaurantId={restaurant.id!} />
      ) : (
        <p className="text-center text-destructive">Could not load your restaurant profile to manage the menu.</p>
      )}
    </div>
  );
}
