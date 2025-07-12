
"use client";

import * as React from "react";
import Link from 'next/link';
import Image from 'next/image';
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import type { FreelancerProfile } from "@/lib/user-profile-data";
import { FeaturedVendorCard } from "./FeaturedVendorCard";

export function FeaturedVendorsCarousel() {
  const [featuredVendors, setFeaturedVendors] = React.useState<FreelancerProfile[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true })
  );

  React.useEffect(() => {
    async function fetchVendors() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/vendors');
        if (!response.ok) throw new Error("Failed to fetch vendors");
        const allVendors: FreelancerProfile[] = await response.json();
        // For now, we'll just take the first 6 as "featured"
        // In a real app, you'd filter by a `isFeatured` flag.
        setFeaturedVendors(allVendors.slice(0, 6));
      } catch (error) {
        console.error("Error fetching featured vendors:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchVendors();
  }, []);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full hidden sm:block" />
        </div>
    );
  }

  if (featuredVendors.length === 0) {
    return null; // Don't show the section if there are no featured vendors
  }

  return (
    <div className="bg-muted/30 p-6 rounded-lg border">
        <h2 className="text-2xl font-bold mb-4 text-center">Featured Stores</h2>
        <Carousel
            plugins={[plugin.current]}
            className="w-full"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
            opts={{
                align: "start",
                loop: true,
            }}
            >
            <CarouselContent className="-ml-4">
                {featuredVendors.map((vendor) => (
                    <CarouselItem key={vendor.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                        <FeaturedVendorCard vendor={vendor} />
                    </CarouselItem>
                ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex" />
            <CarouselNext className="hidden sm:flex" />
        </Carousel>
    </div>
  );
}
