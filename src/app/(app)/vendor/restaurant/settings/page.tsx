
// src/app/(app)/vendor/restaurant/settings/page.tsx
"use client";

import { Settings } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RestaurantSettingsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your payout details and account preferences.</p>
      </header>

       <Card>
        <CardHeader>
            <CardTitle>Payout Details</CardTitle>
            <CardDescription>Configure where your earnings should be sent.</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Payout settings are coming soon.</p>
        </CardContent>
      </Card>
    </div>
  );
}
