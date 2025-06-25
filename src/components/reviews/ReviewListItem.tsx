
"use client";

import type { Review } from '@/lib/reviews-data';
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReviewListItemProps {
  review: Review;
}

export function ReviewListItem({ review }: ReviewListItemProps) {
  return (
    <Card className="bg-secondary/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={review.reviewerAvatar || `https://placehold.co/100x100.png`} alt={review.reviewerName || 'Client'} data-ai-hint="client avatar" />
            <AvatarFallback>{review.reviewerName?.substring(0, 1) || 'C'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-sm">{review.reviewerName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
              </p>
            </div>
            <div className="flex items-center mb-2">
              {[...Array(5)].map((_, index) => (
                <Star
                  key={index}
                  size={16}
                  className={cn(
                    index < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground"
                  )}
                />
              ))}
            </div>
            <p className="text-sm text-foreground/90 whitespace-pre-wrap">{review.comment}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
