
"use client";

import { useEffect, useState } from 'react';
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TourActivity } from '@/lib/tour-activities-data';

const formSchema = z.object({
  name: z.string().min(2, "Name cannot be empty."),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface TourActivityFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activity?: TourActivity | null; 
  onSuccess: () => void;
}

export function TourActivityFormDialog({ isOpen, onClose, activity, onSuccess }: TourActivityFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (isOpen) {
      if (activity) { 
        form.reset({
          name: activity.name,
          description: activity.description || "",
        });
      } else { 
        form.reset({ name: "", description: "" });
      }
    }
  }, [activity, form, isOpen]);

  const handleSubmit = async (values: FormValues) => {
    setIsSaving(true);
    const isEditing = !!activity;
    const apiUrl = isEditing ? `/api/tour-activities/${activity.id}` : '/api/tour-activities';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save activity`);
      }

      toast({ title: `Activity ${isEditing ? 'Updated' : 'Created'}!` });
      onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Tour Activity" : "Create New Tour Activity"}</DialogTitle>
          <DialogDescription>Fill in the details for the tour activity.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <Input placeholder="e.g., Hiking" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <Textarea
                    placeholder="Briefly describe the activity..."
                    {...field}
                    value={field.value ?? ''} 
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
