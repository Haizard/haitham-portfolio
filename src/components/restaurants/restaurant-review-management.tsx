// src/components/restaurants/restaurant-review-management.tsx
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MessageSquare, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { RestaurantReview } from '@/lib/restaurants-data';
import { useUser } from '@/hooks/use-user';
import { formatDistanceToNow } from 'date-fns';
import { StarRating } from '@/components/reviews/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import type { Restaurant } from '@/lib/restaurants-data';

export function RestaurantReviewManagement() {
  const [reviews, setReviews] = useState<RestaurantReview[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchReviews = useCallback(async (restaurantId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`);
      if (!response.ok) throw new Error('Failed to fetch your reviews');
      const data: RestaurantReview[] = await response.json();
      setReviews(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (user?.id) {
      // First, get the restaurant ID for the current owner
      const fetchRestaurant = async () => {
        try {
          const res = await fetch(`/api/restaurants/by-owner/${user.id}`);
          if (res.ok) {
            const restaurantData: Restaurant = await res.json();
            setRestaurant(restaurantData);
            fetchReviews(restaurantData.id!); // Then fetch reviews for that restaurant
          } else {
            throw new Error("Could not find your restaurant profile.");
          }
        } catch (error: any) {
          toast({ title: "Error", description: error.message, variant: "destructive" });
          setIsLoading(false);
        }
      };
      fetchRestaurant();
    }
  }, [user, fetchReviews, toast]);

  if (isLoading) {
    return <Card><CardContent className="p-6 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></CardContent></Card>;
  }

  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>All Customer Reviews</CardTitle>
        <CardDescription>A list of all feedback received from customers.</CardDescription>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">You have not received any reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                      <AvatarFallback>{review.reviewerName.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                      </div>
                      <StarRating rating={review.rating} disabled size={16} />
                      <p className="text-sm mt-2">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
