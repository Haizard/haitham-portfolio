// src/app/(app)/vendor/restaurant/profile/page.tsx
import { Utensils } from "lucide-react";
import { RestaurantProfileForm } from "@/components/restaurants/restaurant-profile-form";

export default function RestaurantProfilePage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <Utensils className="h-8 w-8 text-primary" />
          Manage Restaurant Profile
        </h1>
        <p className="text-muted-foreground mt-1">Update your restaurant's public information, including name, location, and cuisine types.</p>
      </header>
      <RestaurantProfileForm />
    </div>
  );
}
