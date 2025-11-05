// src/components/restaurants/restaurants-header.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { href: "/restaurants", label: "All Restaurants" },
    { href: "/restaurants/offers", label: "Special Offers" },
];

export function RestaurantsHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card sticky top-16 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center gap-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 mr-4">
            <Utensils className="h-5 w-5 text-primary"/>
            Restaurants
        </h2>
        <nav className="flex items-center gap-2">
           {navItems.map(item => (
                <Button key={item.href} variant={pathname === item.href ? "secondary" : "ghost"} size="sm" asChild>
                    <Link href={item.href}>{item.label}</Link>
                </Button>
           ))}
        </nav>
      </div>
    </header>
  );
}
