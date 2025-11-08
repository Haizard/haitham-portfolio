// src/components/bookings/booking-review-card.tsx
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from '@/components/reviews/StarRating';

const reviewFormSchema = z.object({
  overall: z.number().min(1, "Please select an overall rating").max(5),
  cleanliness: z.number().min(0).max(5).optional(),
  service: z.number().min(0).max(5).optional(),
  valueForMoney: z.number().min(0).max(5).optional(),
  comfort: z.number().min(0).max(5).optional(),
  location: z.number().min(0).max(5).optional(),
  condition: z.number().min(0).max(5).optional(),
  experience: z.number().min(0).max(5).optional(),
  comment: z.string().min(10, "Comment must be at least 10 characters").max(2000),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface BookingReviewCardProps {
  bookingId: string;
  reviewType: 'hotel' | 'car_rental' | 'tour' | 'transfer';
  targetId: string;
  targetName: string;
  onReviewSubmit?: () => void;
}

export function BookingReviewCard({
  bookingId,
  reviewType,
  targetId,
  targetName,
  onReviewSubmit,
}: BookingReviewCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      overall: 0,
      cleanliness: 0,
      service: 0,
      valueForMoney: 0,
      comfort: 0,
      location: 0,
      condition: 0,
      experience: 0,
      comment: "",
    },
  });

  const handleReviewSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      // Prepare ratings object (only include non-zero ratings)
      const ratings: any = { overall: values.overall };
      if (values.cleanliness && values.cleanliness > 0) ratings.cleanliness = values.cleanliness;
      if (values.service && values.service > 0) ratings.service = values.service;
      if (values.valueForMoney && values.valueForMoney > 0) ratings.valueForMoney = values.valueForMoney;
      if (values.comfort && values.comfort > 0) ratings.comfort = values.comfort;
      if (values.location && values.location > 0) ratings.location = values.location;
      if (values.condition && values.condition > 0) ratings.condition = values.condition;
      if (values.experience && values.experience > 0) ratings.experience = values.experience;

      const response = await fetch('/api/bookings/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          reviewType,
          targetId,
          ratings,
          comment: values.comment,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      toast({
        title: 'Review submitted!',
        description: 'Thank you for sharing your experience.',
      });

      form.reset();
      if (onReviewSubmit) onReviewSubmit();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit review',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Determine which rating categories to show based on review type
  const showCleanliness = reviewType === 'hotel';
  const showLocation = reviewType === 'hotel';
  const showComfort = reviewType === 'hotel' || reviewType === 'car_rental';
  const showCondition = reviewType === 'car_rental' || reviewType === 'transfer';
  const showExperience = reviewType === 'tour';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
        <CardDescription>
          Share your experience with {targetName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleReviewSubmit)} className="space-y-6">
            {/* Overall Rating */}
            <FormField
              control={form.control}
              name="overall"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-semibold">Overall Rating *</FormLabel>
                  <FormControl>
                    <StarRating
                      rating={field.value}
                      onRatingChange={field.onChange}
                      size={32}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Ratings */}
            <div className="grid md:grid-cols-2 gap-4">
              {showCleanliness && (
                <FormField
                  control={form.control}
                  name="cleanliness"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cleanliness</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                          size={24}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="service"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service</FormLabel>
                    <FormControl>
                      <StarRating
                        rating={field.value || 0}
                        onRatingChange={field.onChange}
                        size={24}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="valueForMoney"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Value for Money</FormLabel>
                    <FormControl>
                      <StarRating
                        rating={field.value || 0}
                        onRatingChange={field.onChange}
                        size={24}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {showComfort && (
                <FormField
                  control={form.control}
                  name="comfort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comfort</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                          size={24}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {showLocation && (
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                          size={24}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {showCondition && (
                <FormField
                  control={form.control}
                  name="condition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                          size={24}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {showExperience && (
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience</FormLabel>
                      <FormControl>
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                          size={24}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
            </div>

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your experience..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

