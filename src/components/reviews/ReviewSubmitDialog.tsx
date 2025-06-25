"use client";

import { useState } from 'react';
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Send, Star, UserCircle, Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StarRating } from './StarRating';

const reviewSubmitSchema = z.object({
  rating: z.coerce.number().min(1, "Rating is required.").max(5),
  comment: z.string().min(10, "Comment must be at least 10 characters.").max(2000),
});

type ReviewFormValues = z.infer<typeof reviewSubmitSchema>;

interface ReviewSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  revieweeId: string; // The freelancer being reviewed
  jobTitle: string;
  freelancerName: string;
  onSuccess: () => void;
}

export function ReviewSubmitDialog({ isOpen, onClose, jobId, revieweeId, jobTitle, freelancerName, onSuccess }: ReviewSubmitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSubmitSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  });

  const handleSubmit = async (values: ReviewFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, jobId, revieweeId }),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit review.");
      }

      toast({
        title: "Review Submitted!",
        description: `Your feedback for ${freelancerName} has been recorded.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if(!open) onClose() }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-headline">Leave a Review</DialogTitle>
          <div className="space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Briefcase className="h-4 w-4"/><span>{jobTitle}</span></div>
            <div className="flex items-center gap-1.5"><UserCircle className="h-4 w-4"/><span>For: {freelancerName}</span></div>
          </div>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-2">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Overall Rating</FormLabel>
                  <FormControl>
                    <StarRating rating={field.value} onRatingChange={field.onChange} size={32} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Feedback</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Share your experience working with this freelancer..." className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4"/>Submit Review</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
