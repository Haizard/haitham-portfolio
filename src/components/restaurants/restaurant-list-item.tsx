
"use client";

import type { Restaurant } from '@/lib/restaurants-data';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Utensils } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '../reviews/StarRating';

export function RestaurantListItem({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="block group">
      <Card className="overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform-gpu group-hover:-translate-y-1">
        <div className="aspect-[16/10] overflow-hidden">
          <Image 
            src={`https://placehold.co/600x400.png?text=${encodeURIComponent(restaurant.name)}`} 
            alt={restaurant.name}
            width={600}
            height={400}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
            data-ai-hint="restaurant food"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
             <Image src={restaurant.logoUrl} alt={`${restaurant.name} logo`} width={48} height={48} className="rounded-md object-contain border -mt-8 bg-background shadow-md" data-ai-hint="restaurant logo" />
             <div className="flex-1">
                <h3 className="font-bold text-base group-hover:text-primary transition-colors">{restaurant.name}</h3>
                 <div className="flex items-center gap-1 mt-1">
                    <StarRating rating={restaurant.rating} size={14} disabled />
                    <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
                </div>
             </div>
             {restaurant.status === 'Open' && <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Open</Badge>}
             {restaurant.status === 'Closed' && <Badge variant="destructive">Closed</Badge>}
          </div>
          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1.5"><Utensils className="h-3 w-3"/> {restaurant.cuisineTypes.join(', ')}</p>
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5"><MapPin className="h-3 w-3"/> {restaurant.location}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
