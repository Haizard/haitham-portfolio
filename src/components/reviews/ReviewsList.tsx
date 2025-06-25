
"use client";

import { useEffect, useState } from 'react';
import { Loader2, MessageSquareOff } from 'lucide-react';
import type { Review } from '@/lib/reviews-data';
import { ReviewListItem } from './ReviewListItem';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface ReviewsListProps {
  freelancerId: string;
}

export function ReviewsList({ freelancerId }: ReviewsListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchReviews() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/reviews?freelancerId=${freelancerId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data: Review[] = await response.json();
        setReviews(data);
      } catch (err: any) {
        setError(err.message || 'Could not load reviews.');
      } finally {
        setIsLoading(false);
      }
    }

    if (freelancerId) {
      fetchReviews();
    }
  }, [freelancerId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-muted-foreground">Loading reviews...</p>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-center text-destructive">{error}</p>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.length > 0 ? (
        reviews.map(review => (
          <ReviewListItem key={review.id} review={review} />
        ))
      ) : (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
            <MessageSquareOff className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Reviews Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
                This freelancer hasn't received any feedback from clients.
            </p>
        </div>
      )}
    </div>
  );
}
