
"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import type { RestaurantFilterData } from '@/lib/restaurants-data';
import { Skeleton } from '../ui/skeleton';

export type RestaurantFilterValues = {
    cuisines?: string[];
    foodTypes?: string[];
    minOrder?: number;
};

interface RestaurantFiltersProps {
  onFilterChange: (filters: RestaurantFilterValues) => void;
}

export function RestaurantFilters({ onFilterChange }: RestaurantFiltersProps) {
  const [filterData, setFilterData] = useState<RestaurantFilterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFilterData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/restaurants/filters');
      if (!response.ok) throw new Error("Failed to load filter options.");
      const data: RestaurantFilterData = await response.json();
      setFilterData(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFilterData();
  }, [fetchFilterData]);

  const FilterSection = ({ title, items, onSelect }: { title: string; items: { id: string; name: string; count: number }[]; onSelect: (id: string) => void }) => (
    <AccordionItem value={title.toLowerCase()}>
        <AccordionTrigger className="font-semibold text-base">{title}</AccordionTrigger>
        <AccordionContent>
            <ul className="space-y-2 text-sm">
                {items.map(item => (
                    <li key={item.id} className="flex items-center justify-between">
                        <label htmlFor={item.id} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                            <Checkbox id={item.id} onCheckedChange={() => onSelect(item.id)} /> {item.name}
                        </label>
                        <span className="text-xs">({item.count})</span>
                    </li>
                ))}
            </ul>
        </AccordionContent>
    </AccordionItem>
  );

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Filter Results</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ) : filterData ? (
             <Accordion type="multiple" defaultValue={['cuisine', 'food-type', 'min-order']}>
                <FilterSection title="Cuisine" items={filterData.cuisineFilters} onSelect={(id) => console.log(id)} />
                <FilterSection title="Food Type" items={filterData.foodTypeFilters} onSelect={(id) => console.log(id)} />
                <AccordionItem value="min-order">
                    <AccordionTrigger className="font-semibold text-base">Minimum Order</AccordionTrigger>
                    <AccordionContent>
                        <ul className="space-y-2 text-sm">
                        {filterData.minOrderFilters.map(item => (
                            <li key={item.id} className="flex items-center justify-between">
                                <label htmlFor={item.id} className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary">
                                    <Checkbox id={item.id} onCheckedChange={() => console.log(item.id)} /> {item.label}
                                </label>
                                <span className="text-xs">({item.count})</span>
                            </li>
                        ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        ) : (
            <p className="text-sm text-muted-foreground">Could not load filter options.</p>
        )}
      </CardContent>
    </Card>
  );
}
