
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, Send, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Job } from '@/lib/jobs-data';
import { ScrollArea } from '../ui/scroll-area';

const proposalSubmitSchema = z.object({
  coverLetter: z.string().min(20, "Cover letter must be at least 20 characters.").max(5000),
  proposedRate: z.coerce.number({invalid_type_error: "Proposed rate must be a number."}).min(0, "Proposed rate must be non-negative."),
});

type ProposalFormValues = z.infer<typeof proposalSubmitSchema>;

interface ProposalSubmitDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
  onSuccess: () => void;
}

export function ProposalSubmitDialog({ isOpen, onClose, job, onSuccess }: ProposalSubmitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProposalFormValues>({
    resolver: zodResolver(proposalSubmitSchema),
    defaultValues: {
      coverLetter: "",
      proposedRate: job.budgetAmount, // Pre-fill with job's budget amount if available
    },
  });

  const handleSubmit = async (values: ProposalFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/proposals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const responseData = await response.json();
      if (!response.ok) {
        throw new Error(responseData.message || "Failed to submit proposal.");
      }

      toast({
        title: "Proposal Submitted!",
        description: `Your application for "${job.title}" has been sent.`,
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline">Submit Proposal for: {job.title}</DialogTitle>
          <DialogDescription>
            Introduce yourself and explain why you're a great fit for this project.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
             <ScrollArea className="h-[calc(100vh-22rem)] pr-4">
              <div className="space-y-6 py-4">
                <FormField control={form.control} name="coverLetter" render={({ field }) => (
                  <FormItem><Label>Cover Letter</Label><Textarea placeholder="Explain your experience and approach..." className="min-h-[200px]" {...field} /><FormMessage /></FormItem>
                )}/>
                <FormField control={form.control} name="proposedRate" render={({ field }) => (
                  <FormItem>
                    <Label>Your Proposed Rate ({job.budgetType} rate)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input type="number" step="1" placeholder="e.g., 500 or 50" className="pl-8" {...field} />
                    </div>
                    <FormMessage />
                  </FormItem>
                )}/>
              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : <><Send className="mr-2 h-4 w-4"/>Submit Proposal</>}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
