
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
import type { FoodType } from '@/lib/food-types-data';

const foodTypeFormSchema = z.object({
  name: z.string().min(1, "Food type name cannot be empty.").max(50, "Name must be 50 characters or less."),
  description: z.string().max(200, "Description must be 200 characters or less.").optional(),
});

type FoodTypeFormValues = z.infer<typeof foodTypeFormSchema>;

interface FoodTypeFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  foodType?: FoodType | null; 
  onSuccess: () => void;
}

export function FoodTypeFormDialog({ isOpen, onClose, foodType, onSuccess }: FoodTypeFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<FoodTypeFormValues>({
    resolver: zodResolver(foodTypeFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (foodType) { 
        form.reset({
          name: foodType.name,
          description: foodType.description || "",
        });
      } else { 
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [foodType, form, isOpen]);

  const handleSubmit = async (values: FoodTypeFormValues) => {
    setIsSaving(true);
    const isEditing = !!foodType;
    const apiUrl = isEditing && foodType?.id ? `/api/food-types/${foodType.id}` : '/api/food-types';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} food type`);
      }

      toast({
        title: `Food Type ${isEditing ? 'Updated' : 'Created'}!`,
        description: `The food type "${values.name}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} food type:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${isEditing ? 'update' : 'create'} food type.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{foodType ? "Edit Food Type" : "Create New Food Type"}</DialogTitle>
          <DialogDescription>{foodType ? "Update the details of this food type." : "Fill in the details for your new food type."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Name</FormLabel>
                  <Input id="name" placeholder="e.g., Vegetarian" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="description">Description (Optional)</FormLabel>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe the food type..."
                    className="min-h-[100px]"
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
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  foodType ? "Save Changes" : "Create Food Type"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
