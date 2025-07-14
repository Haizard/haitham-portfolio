// src/components/restaurants/table-booking-form.tsx
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const bookingFormSchema = z.object({
  customerName: z.string().min(2, "Name is required."),
  customerEmail: z.string().email("A valid email is required."),
  bookingDate: z.date({ required_error: "Please select a date." }),
  bookingTime: z.string().min(1, "Please specify a time."),
  guestCount: z.coerce.number().int().min(1, "At least one guest is required."),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export function TableBookingForm({ restaurantId }: { restaurantId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: { customerName: "", customerEmail: "", guestCount: 1 },
  });

  const handleSubmit = async (values: BookingFormValues) => {
    setIsSubmitting(true);
    try {
        const payload = {
            ...values,
            bookingDate: format(values.bookingDate, "yyyy-MM-dd"), // Format for API
        };

        const response = await fetch(`/api/restaurants/${restaurantId}/bookings`, {
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
            description: "The restaurant has received your request and will confirm shortly.",
        });
        form.reset();
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField control={form.control} name="customerName" render={({ field }) => (
                <FormItem><FormLabel>Your Name</FormLabel><Input placeholder="John Doe" {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="customerEmail" render={({ field }) => (
                <FormItem><FormLabel>Your Email</FormLabel><Input type="email" placeholder="you@example.com" {...field} /></FormItem>
            )}/>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField control={form.control} name="bookingDate" render={({ field }) => (
            <FormItem className="flex flex-col"><FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus/></PopoverContent>
              </Popover><FormMessage/>
            </FormItem>
          )}/>
           <FormField control={form.control} name="bookingTime" render={({ field }) => (
                <FormItem><FormLabel>Time</FormLabel><Input placeholder="e.g., 7:00 PM" {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="guestCount" render={({ field }) => (
                <FormItem><FormLabel>Guests</FormLabel><Input type="number" min="1" {...field} value={field.value ?? ''} /></FormItem>
            )}/>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
            {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Sending Request...</> : <><Send className="mr-2 h-4 w-4"/>Request to Book</>}
        </Button>
      </form>
    </Form>
  );
}
