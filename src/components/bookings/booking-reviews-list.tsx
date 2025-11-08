// src/components/bookings/booking-reviews-list.tsx
"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, Star, ThumbsUp, MessageSquare } from "lucide-react";
import { StarRating } from '@/components/reviews/StarRating';
import { formatDistanceToNow } from 'date-fns';
import type { BookingReview } from '@/lib/booking-reviews-data';

interface ReviewStatistics {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  averageRatings: {
    overall: number;
    cleanliness?: number;
    service?: number;
    valueForMoney?: number;
    comfort?: number;
    location?: number;
    condition?: number;
    experience?: number;
  };
}

interface BookingReviewsListProps {
  reviewType: 'hotel' | 'car_rental' | 'tour' | 'transfer';
  targetId: string;
  limit?: number;
}

export function BookingReviewsList({
  reviewType,
  targetId,
  limit = 10,
}: BookingReviewsListProps) {
  const [reviews, setReviews] = useState<BookingReview[]>([]);
  const [statistics, setStatistics] = useState<ReviewStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (skipCount: number = 0) => {
    try {
      setIsLoading(true);
      
      // Determine the API endpoint based on review type
      let endpoint = '';
      switch (reviewType) {
        case 'hotel':
          endpoint = `/api/hotels/properties/${targetId}/reviews`;
          break;
        case 'car_rental':
          endpoint = `/api/cars/vehicles/${targetId}/reviews`;
          break;
        case 'transfer':
          endpoint = `/api/transfers/vehicles/${targetId}/reviews`;
          break;
        case 'tour':
          endpoint = `/api/tours/${targetId}/reviews`;
          break;
      }

      const response = await fetch(`${endpoint}?limit=${limit}&skip=${skipCount}`);
      if (!response.ok) throw new Error('Failed to fetch reviews');

      const data = await response.json();
      
      if (skipCount === 0) {
        setReviews(data.reviews);
        setStatistics(data.statistics);
      } else {
        setReviews(prev => [...prev, ...data.reviews]);
      }
      
      setHasMore(data.reviews.length === limit);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews(0);
  }, [reviewType, targetId]);

  const loadMore = () => {
    const newSkip = skip + limit;
    setSkip(newSkip);
    fetchReviews(newSkip);
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/bookings/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_helpful' }),
      });

      if (response.ok) {
        const updatedReview = await response.json();
        setReviews(prev =>
          prev.map(r => (r.id === reviewId ? updatedReview : r))
        );
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  if (isLoading && reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading reviews...</p>
        </CardContent>
      </Card>
    );
  }

  if (!statistics || statistics.totalReviews === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{statistics.averageRating.toFixed(1)}</div>
              <StarRating rating={statistics.averageRating} size={24} readonly />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {statistics.totalReviews} review{statistics.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => {
                const count = statistics.ratingDistribution[rating as keyof typeof statistics.ratingDistribution];
                const percentage = statistics.totalReviews > 0 ? (count / statistics.totalReviews) * 100 : 0;
                
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm w-8">{rating} <Star className="h-3 w-3 inline fill-current" /></span>
                    <Progress value={percentage} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Ratings */}
          {Object.keys(statistics.averageRatings).length > 1 && (
            <>
              <Separator className="my-6" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(statistics.averageRatings).map(([key, value]) => {
                  if (key === 'overall' || value === undefined) return null;
                  
                  const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold">{value.toFixed(1)}</div>
                      <p className="text-xs text-muted-foreground">{label}</p>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map(review => (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={review.userAvatar} />
                  <AvatarFallback>{review.userName.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>

                <div className="flex-1 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold">{review.userName}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <StarRating rating={review.ratings.overall} size={16} readonly />
                        {review.verified && (
                          <Badge variant="secondary" className="text-xs">Verified</Badge>
                        )}
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm">{review.comment}</p>

                  {/* Owner Response */}
                  {review.ownerResponse && (
                    <div className="bg-muted p-4 rounded-lg mt-4">
                      <div className="font-semibold text-sm mb-2">
                        Response from {review.ownerResponse.responderName}
                      </div>
                      <p className="text-sm">{review.ownerResponse.comment}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(review.ownerResponse.respondedAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}

                  {/* Helpful Button */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkHelpful(review.id!)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button
            variant="outline"
            onClick={loadMore}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Reviews'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

