
"use client";

import type { Restaurant } from '@/lib/restaurants-data';
import { Button } from '@/components/ui/button';
import { MapPin, Star, Utensils, Heart, GitCompareArrows } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { StarRating } from '../reviews/StarRating';
import { useComparison } from '@/hooks/use-comparison';
import { cn } from '@/lib/utils';

export function RestaurantListItem({ restaurant }: { restaurant: Restaurant }) {
  const { addToCompare, removeFromCompare, isComparing } = useComparison();
  const isSelectedForCompare = isComparing(restaurant.id!);

  const handleCompareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelectedForCompare) {
      removeFromCompare(restaurant.id!);
    } else {
      addToCompare(restaurant);
    }
  };

  return (
    <div className="bg-card rounded-lg border shadow-sm hover:shadow-lg transition-shadow duration-300 flex flex-col sm:flex-row items-center p-4 gap-4 group">
      {/* Closed Badge */}
      {restaurant.status === 'Closed' && (
        <div className="absolute top-0 left-0 bg-destructive text-destructive-foreground text-xs font-bold uppercase px-3 py-1 rounded-tl-lg rounded-br-lg z-10">
          Closed
        </div>
      )}

      {/* Restaurant Logo */}
      <div className="flex-shrink-0 w-full sm:w-32 h-32 sm:h-auto sm:aspect-square relative">
        <Image 
          src={restaurant.logoUrl} 
          alt={`${restaurant.name} logo`}
          fill
          className="rounded-md object-contain"
          data-ai-hint="restaurant logo"
        />
      </div>

      {/* Restaurant Details */}
      <div className="flex-1 text-center sm:text-left">
        {restaurant.isSponsored && <Badge variant="secondary" className="text-xs mb-1">Sponsored</Badge>}
        <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
          <Link href={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
        </h3>
        <div className="flex items-center justify-center sm:justify-start gap-1 mt-1">
          <StarRating rating={restaurant.rating} size={16} disabled />
          <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center sm:justify-start gap-1.5">
          <Utensils className="h-3 w-3"/> {restaurant.cuisineTypes.join(', ')}
        </p>
        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center sm:justify-start gap-1.5">
          <MapPin className="h-3 w-3"/> {restaurant.location}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center justify-center gap-2 w-full sm:w-auto">
        <Button asChild className="w-full sm:w-auto bg-primary hover:bg-primary/90">
          <Link href={`/restaurants/${restaurant.id}`}>View Menu</Link>
        </Button>
        <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" aria-label="Add to favorites">
                <Heart className="h-4 w-4 text-muted-foreground hover:text-destructive"/>
            </Button>
             <Button variant="ghost" size="sm" className={cn("h-8 w-8 p-0 text-muted-foreground", isSelectedForCompare && "text-primary bg-primary/10")} onClick={handleCompareClick} aria-label="Compare restaurant">
                <GitCompareArrows className="h-4 w-4"/>
            </Button>
        </div>
      </div>
    </div>
  );
}
