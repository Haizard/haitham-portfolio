// src/app/(app)/vendor/restaurant/analytics/page.tsx
"use client";

import { BarChart2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

export default function RestaurantAnalyticsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <BarChart2 className="h-8 w-8 text-primary" />
          Restaurant Analytics
        </h1>
        <p className="text-muted-foreground mt-1">Track your sales, popular items, and performance over time.</p>
      </header>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
          <CardDescription>Detailed metrics and charts will be available here soon.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center text-center p-8">
            <Image src="https://placehold.co/600x300.png" alt="Analytics Illustration" width={600} height={300} className="rounded-lg mb-6" data-ai-hint="analytics chart data" />
            <h3 className="text-xl font-semibold mb-2">Coming Soon!</h3>
            <p className="text-muted-foreground max-w-md">
                We're building a powerful analytics suite to give you deep insights into your restaurant's performance.
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
