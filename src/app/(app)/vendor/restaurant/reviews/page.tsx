// src/app/(app)/vendor/restaurant/reviews/page.tsx
"use client";

import { Star } from "lucide-react";
import { RestaurantReviewManagement } from "@/components/restaurants/restaurant-review-management";

export default function RestaurantReviewsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <Star className="h-8 w-8 text-primary" />
          Customer Reviews
        </h1>
        <p className="text-muted-foreground mt-1">See what your customers are saying about their experience.</p>
      </header>
      <RestaurantReviewManagement />
    </div>
  );
}
