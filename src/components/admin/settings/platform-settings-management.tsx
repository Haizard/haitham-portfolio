
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Percent, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { PlatformSettings } from '@/lib/settings-data';
import { Skeleton } from '@/components/ui/skeleton';

const settingsFormSchema = z.object({
  commissionRate: z.coerce.number().min(0, "Rate must be non-negative.").max(100, "Rate cannot exceed 100."),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

export function PlatformSettingsManagement() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: { commissionRate: 0 },
  });

  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) throw new Error('Failed to fetch platform settings');
      const data: PlatformSettings = await response.json();
      setSettings(data);
      form.reset({ commissionRate: data.commissionRate * 100 }); // Convert to percentage for display
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast, form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);
  
  const handleSaveChanges = async (values: SettingsFormValues) => {
    setIsSaving(true);
    try {
        const payload = {
            commissionRate: values.commissionRate / 100, // Convert back to decimal for storage
        };
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update settings.');
        }
        toast({ title: "Settings Saved!", description: "Platform settings have been updated successfully." });
        fetchSettings(); // Refresh data
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
        <CardContent><Skeleton className="h-24 w-full" /></CardContent>
        <CardFooter><Skeleton className="h-10 w-24" /></CardFooter>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveChanges)}>
          <CardHeader>
            <CardTitle>Marketplace Settings</CardTitle>
            <CardDescription>Adjust financial settings for the e-commerce marketplace.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="commissionRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Platform Commission Rate</FormLabel>
                  <div className="relative">
                    <Input type="number" step="0.1" placeholder="15" {...field} className="pr-8" />
                    <Percent className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  <FormMessage />
                  <p className="text-xs text-muted-foreground pt-1">The percentage fee CreatorOS takes on each product sale.</p>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Saving...</> : <><Save className="mr-2 h-4 w-4"/>Save Settings</>}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
