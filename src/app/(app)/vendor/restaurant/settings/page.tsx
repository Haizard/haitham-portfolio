// src/app/(app)/vendor/restaurant/settings/page.tsx
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Settings, Landmark, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const payoutFormSchema = z.object({
  accountHolder: z.string().min(2, "Account holder name is required."),
  routingNumber: z.string().regex(/^\d{9}$/, "Must be a 9-digit routing number."),
  accountNumber: z.string().min(4, "Account number is required.").max(17),
});

type PayoutFormValues = z.infer<typeof payoutFormSchema>;

export default function RestaurantSettingsPage() {
    const { toast } = useToast();
    const [isSaving, setIsSaving] = useState(false);

    const form = useForm<PayoutFormValues>({
        resolver: zodResolver(payoutFormSchema),
        defaultValues: {
            accountHolder: "",
            routingNumber: "",
            accountNumber: "",
        },
    });

    const handleSaveChanges = async (values: PayoutFormValues) => {
        setIsSaving(true);
        // In a real app, you would send this to a secure backend endpoint
        // that integrates with a payment processor like Stripe Connect.
        console.log("Simulating saving payout details:", values);
        
        await new Promise(resolve => setTimeout(resolve, 1000));

        toast({
            title: "Settings Saved!",
            description: "Your payout details have been updated.",
        });
        setIsSaving(false);
    };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight font-headline flex items-center gap-3">
          <Settings className="h-8 w-8 text-primary" />
          Account Settings
        </h1>
        <p className="text-muted-foreground mt-1">Manage your payout details and account preferences.</p>
      </header>

       <Card className="shadow-xl">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSaveChanges)}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Landmark className="h-5 w-5 text-primary"/>Payout Details</CardTitle>
                <CardDescription>Configure where your earnings should be sent. This is a mock form and does not save real data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert variant="destructive">
                    <Landmark className="h-4 w-4" />
                    <AlertTitle>Demonstration Only</AlertTitle>
                    <AlertDescription>
                        Do not enter real bank account information. This form is for demonstration purposes and data is not saved.
                    </AlertDescription>
                </Alert>
                <FormField
                    control={form.control}
                    name="accountHolder"
                    render={({ field }) => (
                        <FormItem><FormLabel>Account Holder Name</FormLabel><Input placeholder="John M. Doe" {...field} /><FormMessage/></FormItem>
                    )}
                />
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="routingNumber"
                        render={({ field }) => (
                            <FormItem><FormLabel>Routing Number</FormLabel><Input placeholder="e.g., 123456789" {...field} /><FormMessage/></FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="accountNumber"
                        render={({ field }) => (
                            <FormItem><FormLabel>Account Number</FormLabel><Input placeholder="e.g., 000123456789" {...field} /><FormMessage/></FormItem>
                        )}
                    />
                </div>
            </CardContent>
            <CardFooter>
                 <Button type="submit" disabled={isSaving}>
                    {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4"/> Save Payout Details</>}
                </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
