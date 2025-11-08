
"use client";

import { useEffect, useState } from 'react';
import type { TourPackage } from '@/lib/tours-data';
import { Loader2, Compass } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { MapPin, Clock, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { WishlistButton } from '@/components/wishlists/wishlist-button';
import { CompareButton } from '@/components/comparisons/compare-button';

const TourCard = ({ tour }: { tour: TourPackage }) => (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col overflow-hidden group">
        <div className="relative aspect-[4/3] overflow-hidden">
            <Link href={`/tours/${tour.slug}`}>
                <Image
                    src={tour.featuredImageUrl}
                    alt={tour.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    data-ai-hint="tour landscape"
                />
            </Link>
            <div className="absolute top-2 right-2">
                <WishlistButton
                    itemType="tour"
                    itemId={tour.id || ''}
                    variant="ghost"
                    size="icon"
                    className="bg-card/70 hover:bg-card rounded-full h-8 w-8"
                />
            </div>
        </div>
        <CardContent className="p-4 flex flex-col flex-grow">
            <h3 className="text-base font-bold font-headline group-hover:text-primary transition-colors line-clamp-2 h-12">
                <Link href={`/tours/${tour.slug}`}>{tour.name}</Link>
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><MapPin className="h-3 w-3"/>{tour.location}</p>

            <div className="border-t my-3"/>

            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-primary"/> Duration: <span className="font-semibold text-foreground">{tour.duration}</span></div>
            </div>

            <div className="mt-auto pt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <p className="text-lg font-bold text-primary">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(tour.price)}</p>
                    <Button asChild size="sm" variant="outline">
                        <Link href={`/tours/${tour.slug}`}>View Details</Link>
                    </Button>
                </div>
                <CompareButton
                    itemType="tour"
                    itemId={tour.id || ''}
                    className="w-full"
                    size="sm"
                />
            </div>
        </CardContent>
    </Card>
);

interface RelatedToursProps {
  currentTourSlug: string;
}

export function RelatedTours({ currentTourSlug }: RelatedToursProps) {
  const [relatedTours, setRelatedTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchRelated() {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tours?excludeSlug=${currentTourSlug}&limit=3`);
        if (!response.ok) {
          throw new Error('Failed to fetch related tours');
        }
        const data = await response.json();
        setRelatedTours(data.tours);
      } catch (error) {
        console.error("Error fetching related tours:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRelated();
  }, [currentTourSlug]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (relatedTours.length === 0) {
    return null; 
  }

  return (
    <section>
      <h2 className="text-3xl font-bold font-headline mb-6 flex items-center">
        <Compass className="mr-3 h-8 w-8 text-primary" /> Related Trips
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {relatedTours.map(tour => (
          <TourCard key={tour.id} tour={tour} />
        ))}
      </div>
    </section>
  );
}
