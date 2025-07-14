
"use client";

import { createContext, useContext, useState, useCallback } from 'react';
import type { Restaurant } from '@/lib/restaurants-data';
import { useToast } from './use-toast';

const MAX_COMPARE_ITEMS = 3;

interface ComparisonContextType {
  selectedRestaurants: Restaurant[];
  addToCompare: (restaurant: Restaurant) => void;
  removeFromCompare: (restaurantId: string) => void;
  isComparing: (restaurantId: string) => boolean;
  clearComparison: () => void;
  comparisonCount: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedRestaurants, setSelectedRestaurants] = useState<Restaurant[]>([]);
  const { toast } = useToast();

  const addToCompare = useCallback((restaurant: Restaurant) => {
    setSelectedRestaurants(prev => {
      if (prev.find(r => r.id === restaurant.id)) {
        return prev; // Already exists
      }
      if (prev.length >= MAX_COMPARE_ITEMS) {
        toast({
          title: "Comparison Limit Reached",
          description: `You can only compare up to ${MAX_COMPARE_ITEMS} restaurants at a time.`,
          variant: "destructive",
        });
        return prev;
      }
      return [...prev, restaurant];
    });
  }, [toast]);

  const removeFromCompare = useCallback((restaurantId: string) => {
    setSelectedRestaurants(prev => prev.filter(r => r.id !== restaurantId));
  }, []);

  const clearComparison = useCallback(() => {
    setSelectedRestaurants([]);
  }, []);

  const isComparing = useCallback((restaurantId: string) => {
    return selectedRestaurants.some(r => r.id === restaurantId);
  }, [selectedRestaurants]);

  const comparisonCount = selectedRestaurants.length;

  return (
    <ComparisonContext.Provider value={{
      selectedRestaurants,
      addToCompare,
      removeFromCompare,
      isComparing,
      clearComparison,
      comparisonCount
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}
