// src/app/(app)/vendor/restaurant/orders/page.tsx
"use client";

import { ChefHat } from "lucide-react";
import { RestaurantOrderManagement } from "@/components/restaurants/restaurant-order-management";

export default function RestaurantOrdersPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <ChefHat className="h-8 w-8 text-primary" />
          Manage Restaurant Orders
        </h1>
        <p className="text-muted-foreground mt-1">Review incoming customer orders and update their status.</p>
      </header>
      <RestaurantOrderManagement />
    </div>
  );
}
