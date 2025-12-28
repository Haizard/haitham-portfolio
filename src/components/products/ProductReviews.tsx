
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send, Star, UserCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { ProductReview } from '@/lib/product-reviews-data';
import { StarRating } from '@/components/reviews/StarRating';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { Separator } from '../ui/separator';
import { useUser } from '@/hooks/use-user';

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(2000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  // ... (fetchReviews remains same)

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (!response.ok) throw new Error("Failed to fetch reviews.");
      const data = await response.json();
      setReviews(data);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [productId, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const handleReviewSubmit = async (values: ReviewFormValues) => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in to review.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        reviewerId: user.id,
        reviewerName: user.name || "Anonymous",
        reviewerAvatar: user.avatar || `https://placehold.co/100x100.png?text=${user.name?.charAt(0) || 'U'}`,
      };
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit review.");
      }
      toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
      form.reset();
      fetchReviews(); // Re-fetch reviews to show the new one
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" /> Customer Reviews
        </h2>
        {isLoading ? (
          <div className="flex justify-center items-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <Card key={review.id} className="bg-secondary/40 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} data-ai-hint="reviewer avatar" />
                      <AvatarFallback>{review.reviewerName.substring(0, 1)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{review.reviewerName}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}</p>
                      </div>
                      <div className="my-1"><StarRating rating={review.rating} disabled size={16} /></div>
                      <p className="text-sm text-foreground/90">{review.comment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground py-10">No reviews yet for this product.</p>
        )}
      </div>

      <div>
        <Card className="sticky top-24 shadow-lg">
          <CardHeader>
            <CardTitle>Leave a Review</CardTitle>
            <CardDescription>Share your thoughts about this product.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="rating"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Rating</FormLabel>
                      <FormControl><StarRating rating={field.value} onRatingChange={field.onChange} size={28} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Comment</FormLabel>
                      <FormControl><Textarea placeholder="Tell others what you think..." {...field} className="min-h-[120px]" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : <><Send className="mr-2 h-4 w-4" />Submit Review</>}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
