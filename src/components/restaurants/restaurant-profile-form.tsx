// src/components/restaurants/restaurant-profile-form.tsx
"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, Utensils } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/hooks/use-user';
import type { Restaurant } from '@/lib/restaurants-data';
import { Separator } from '../ui/separator';

const profileFormSchema = z.object({
  name: z.string().min(2, "Restaurant name is required."),
  logoUrl: z.string().url("A valid logo URL is required."),
  location: z.string().min(5, "Location is required."),
  cuisineTypes: z.string().min(3, "Please enter at least one cuisine type."),
  status: z.enum(["Open", "Closed"]),
  specialDeals: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function RestaurantProfileForm() {
  const { user } = useUser();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      logoUrl: "",
      location: "",
      cuisineTypes: "",
      status: "Open",
      specialDeals: "",
    },
  });

  const fetchRestaurantData = useCallback(async (ownerId: string) => {
    setIsLoading(true);
    try {
      // This is a new API route pattern we need to create
      const response = await fetch(`/api/restaurants/by-owner/${ownerId}`);
      if (response.ok) {
        const data = await response.json();
        setRestaurant(data);
        form.reset({
          name: data.name,
          logoUrl: data.logoUrl,
          location: data.location,
          cuisineTypes: data.cuisineTypes.join(', '),
          status: data.status,
          specialDeals: data.specialDeals || "",
        });
      } else if (response.status === 404) {
        toast({ title: "No Restaurant Found", description: "You don't have a restaurant profile yet. One will be created when you save.", variant: "default"});
      } else {
        throw new Error("Failed to fetch restaurant data.");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, form]);

  useEffect(() => {
    if (user?.id) {
      fetchRestaurantData(user.id);
    }
  }, [user, fetchRestaurantData]);

  const handleSubmit = async (values: ProfileFormValues) => {
    if (!restaurant?.id) {
        toast({ title: "Error", description: "No restaurant profile to update.", variant: "destructive" });
        return;
    }
    setIsSaving(true);
    try {
        const payload = {
            ...values,
            cuisineTypes: values.cuisineTypes.split(',').map(c => c.trim()).filter(Boolean),
        };
        const response = await fetch(`/api/restaurants/${restaurant.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to update profile.");
        }

        const updatedData = await response.json();
        setRestaurant(updatedData);
        toast({ title: "Profile Updated", description: "Your restaurant information has been saved." });

    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return <Card><CardContent className="p-6 flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary"/></CardContent></Card>;
  }

  return (
    <Card className="shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>This information will be displayed on your public restaurant page.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Restaurant Name</FormLabel><Input {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="logoUrl" render={({ field }) => (
                <FormItem><FormLabel>Logo URL</FormLabel><Input {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="location" render={({ field }) => (
                <FormItem><FormLabel>Address / Location</FormLabel><Input {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="cuisineTypes" render={({ field }) => (
                <FormItem><FormLabel>Cuisine Types (comma-separated)</FormLabel><Input placeholder="e.g., Pizza, Italian, Pasta" {...field} /></FormItem>
            )}/>
            <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem><FormLabel>Operating Status</FormLabel>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex gap-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="Open" id="status-open"/><Label htmlFor="status-open">Open</Label></FormItem>
                    <FormItem className="flex items-center space-x-2"><RadioGroupItem value="Closed" id="status-closed"/><Label htmlFor="status-closed">Closed</Label></FormItem>
                </RadioGroup>
                </FormItem>
            )}/>
            <Separator />
            <FormField control={form.control} name="specialDeals" render={({ field }) => (
                <FormItem>
                    <FormLabel>Special Deals & Offers</FormLabel>
                    <FormControl>
                        <Textarea
                            placeholder="Describe your current deals, e.g., 'Happy Hour: 5-7 PM, 50% off appetizers!'"
                            className="min-h-[120px]"
                            {...field}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}/>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : <><Save className="mr-2 h-4 w-4"/> Save Changes</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
