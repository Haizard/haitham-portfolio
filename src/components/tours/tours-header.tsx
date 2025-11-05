
// src/components/tours/tours-header.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Loader2 } from 'lucide-react';
import type { TourPackage } from '@/lib/tours-data';
import type { TourActivity } from '@/lib/tour-activities-data';
import { Button } from '../ui/button';
import Link from 'next/link';

interface TourHeaderData {
    destinations: string[];
    activities: TourActivity[];
    tripTypes: string[];
}

export function ToursHeader() {
  const [headerData, setHeaderData] = useState<TourHeaderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHeaderData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [toursRes, activitiesRes] = await Promise.all([
        fetch('/api/tours'),
        fetch('/api/tour-activities'),
      ]);

      if (!toursRes.ok || !activitiesRes.ok) throw new Error("Failed to fetch header data");
      
      const toursData: { tours: TourPackage[], filterOptions: any } = await toursRes.json();
      const activitiesData: TourActivity[] = await activitiesRes.json();
      
      const uniqueDestinations = toursData.filterOptions.locations || [];
      const uniqueTripTypes = toursData.filterOptions.tourTypes || [];

      setHeaderData({
        destinations: uniqueDestinations,
        activities: activitiesData,
        tripTypes: uniqueTripTypes,
      });

    } catch (error) {
      console.error("Error fetching tours header data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHeaderData();
  }, [fetchHeaderData]);

  if (isLoading) {
    return (
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 h-16 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b bg-card sticky top-16 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
                <Button variant="ghost" asChild>
                    <Link href="/tours">All Trips</Link>
                </Button>
            </NavigationMenuItem>
             <NavigationMenuItem>
              <NavigationMenuTrigger>Destination</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  {headerData?.destinations.map((dest) => (
                    <li key={dest}><Link href={{ pathname: '/tours', query: { locations: dest } }} className="hover:text-primary">{dest}</Link></li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
             <NavigationMenuItem>
              <NavigationMenuTrigger>Activities</NavigationMenuTrigger>
               <NavigationMenuContent>
                <ul className="grid w-[200px] gap-3 p-4">
                  {headerData?.activities.map((act) => (
                    <li key={act.id}><Link href={{ pathname: '/tours', query: { activityIds: act.id } }} className="hover:text-primary">{act.name}</Link></li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
             <NavigationMenuItem>
              <NavigationMenuTrigger className="text-amber-600">Trip Types</NavigationMenuTrigger>
              <NavigationMenuContent>
                 <ul className="grid w-[200px] gap-3 p-4">
                  {headerData?.tripTypes.map((type) => (
                    <li key={type}><Link href={{ pathname: '/tours', query: { tourTypes: type } }} className="hover:text-primary">{type}</Link></li>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  );
}
