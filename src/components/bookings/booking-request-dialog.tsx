
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
import { Loader2, CalendarCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"


const bookingRequestSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters.").max(100),
  clientEmail: z.string().email("Please enter a valid email address."),
  requestedDate: z.date({
    required_error: "A preferred date is required.",
  }),
  requestedTimeRaw: z.string().min(1, "Preferred time is required (e.g., 'Morning', '2 PM').").max(50),
  clientNotes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

type BookingRequestFormValues = z.infer<typeof bookingRequestSchema>;

interface BookingRequestDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceId: string;
  serviceName: string;
  onSuccess?: () => void; // Optional: callback on successful booking
}

export function BookingRequestDialog({ isOpen, onClose, serviceId, serviceName, onSuccess }: BookingRequestDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<BookingRequestFormValues>({
    resolver: zodResolver(bookingRequestSchema),
    defaultValues: {
      clientName: "",
      clientEmail: "",
      requestedDate: undefined,
      requestedTimeRaw: "",
      clientNotes: "",
    },
  });

  useEffect(() => {
    if (!isOpen) {
      form.reset(); // Reset form when dialog is closed
    }
  }, [isOpen, form]);

  const handleSubmit = async (values: BookingRequestFormValues) => {
    setIsSubmitting(true);
    
    const payload = {
      ...values,
      serviceId,
      serviceName,
      requestedDateRaw: format(values.requestedDate, "yyyy-MM-dd"), // Format date to string
    };
    // Remove requestedDate as API expects requestedDateRaw
    delete (payload as any).requestedDate;


    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit booking request.");
      }

      toast({
        title: "Booking Request Sent!",
        description: `Your request for "${serviceName}" has been submitted. We will contact you shortly.`,
      });
      form.reset();
      if (onSuccess) onSuccess();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not submit your booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarCheck className="h-6 w-6 text-primary" />
            Request Booking for: {serviceName}
          </DialogTitle>
          <DialogDescription>
            Please fill out the form below to request this service. We'll get back to you to confirm availability.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-2">
            <FormField control={form.control} name="clientName" render={({ field }) => (
              <FormItem><Label>Your Name</Label><Input placeholder="John Doe" {...field} /><FormMessage /></FormItem>
            )}/>
            <FormField control={form.control} name="clientEmail" render={({ field }) => (
              <FormItem><Label>Your Email</Label><Input type="email" placeholder="you@example.com" {...field} /><FormMessage /></FormItem>
            )}/>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="requestedDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <Label>Preferred Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date < new Date(new Date().setHours(0,0,0,0)) // Disable past dates
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField control={form.control} name="requestedTimeRaw" render={({ field }) => (
                <FormItem><Label>Preferred Time</Label><Input placeholder="e.g., Morning, 2 PM" {...field} /><FormMessage /></FormItem>
              )}/>
            </div>
            <FormField control={form.control} name="clientNotes" render={({ field }) => (
              <FormItem><Label>Additional Notes (Optional)</Label><Textarea placeholder="Any specific requirements or questions?" {...field} className="min-h-[80px]" /><FormMessage /></FormItem>
            )}/>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Request"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
