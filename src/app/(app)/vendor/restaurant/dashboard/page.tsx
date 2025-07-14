// src/app/(app)/vendor/restaurant/dashboard/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils, ClipboardList, Settings, CircleHelp, ChefHat, BarChart2, MessageSquare, Star } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/hooks/use-user";

const dashboardLinks = [
    { href: "/vendor/restaurant/profile", icon: Utensils, title: "Manage Profile", description: "Update your restaurant's name, logo, and location." },
    { href: "/vendor/restaurant/menu-items", icon: ClipboardList, title: "Manage Menu", description: "Add, edit, and organize your menu items and categories." },
    { href: "/vendor/restaurant/orders", icon: ChefHat, title: "View Orders", description: "See incoming customer orders and manage fulfillment." },
    { href: "/vendor/restaurant/reviews", icon: Star, title: "Customer Reviews", description: "Read and respond to feedback from your diners." },
    { href: "/vendor/restaurant/analytics", icon: BarChart2, title: "Analytics", description: "Track your sales, popular items, and performance." },
    { href: "/vendor/restaurant/settings", icon: Settings, title: "Account Settings", description: "Manage your payout details and account preferences." },
];

export default function RestaurantDashboardPage() {
    const { user } = useUser();

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold tracking-tight font-headline">Restaurant Dashboard</h1>
                <p className="text-muted-foreground">Welcome, {user?.name}. Manage your restaurant and connect with customers.</p>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardLinks.map(link => (
                    <Link href={link.href} key={link.href} className="group">
                        <Card className="shadow-md hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                                <div className="p-3 bg-primary/10 text-primary rounded-lg">
                                    <link.icon className="h-6 w-6" />
                                </div>
                                <CardTitle>{link.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">{link.description}</p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
