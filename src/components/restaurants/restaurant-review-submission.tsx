// src/components/restaurants/restaurant-review-submission.tsx
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send, Star, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from '@/components/reviews/StarRating';
import { useUser } from '@/hooks/use-user';

const reviewFormSchema = z.object({
  rating: z.coerce.number().min(1, "Please select a rating.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(2000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface RestaurantReviewSubmissionProps {
  restaurantId: string;
  onReviewSubmit: () => void; // Callback to refresh the reviews list
}

export function RestaurantReviewSubmission({ restaurantId, onReviewSubmit }: RestaurantReviewSubmissionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useUser();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const handleReviewSubmit = async (values: ReviewFormValues) => {
     if (!user) {
        toast({ title: "Login Required", description: "You must be logged in to leave a review.", variant: "destructive" });
        return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        reviewerId: user.id,
        reviewerName: user.name,
        reviewerAvatar: `https://placehold.co/100x100.png?text=${user.name.substring(0,2)}`,
      };
      const response = await fetch(`/api/restaurants/${restaurantId}/reviews`, {
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
      onReviewSubmit();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="shadow-lg mt-8">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>Share your experience with this restaurant.</CardDescription>
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
            <Button type="submit" disabled={isSubmitting || !user} className="w-full">
              {!user ? "Login to Review" : (isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</> : <><Send className="mr-2 h-4 w-4" />Submit Review</>)}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
