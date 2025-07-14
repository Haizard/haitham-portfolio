// src/components/restaurants/menu-category-form-dialog.tsx
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { MenuCategory } from '@/lib/restaurants-data';

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").max(50),
  order: z.coerce.number().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface MenuCategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: MenuCategory | null; 
  restaurantId: string;
  onSuccess: () => void;
}

export function MenuCategoryFormDialog({ isOpen, onClose, category, restaurantId, onSuccess }: MenuCategoryFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: "", order: undefined },
  });

  useEffect(() => {
    if (isOpen) {
      if (category) { 
        form.reset({ name: category.name, order: category.order });
      } else { 
        form.reset({ name: "", order: undefined });
      }
    }
  }, [category, form, isOpen]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSaving(true);
    const isEditing = !!category;
    const apiUrl = isEditing 
      ? `/api/restaurants/${restaurantId}/menu-categories/${category.id}` 
      : `/api/restaurants/${restaurantId}/menu-categories`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }
      toast({ title: `Category ${isEditing ? 'Updated' : 'Created'}!`, description: `The category "${values.name}" has been saved.` });
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
          <DialogTitle>{category ? "Edit Menu Category" : "Create New Menu Category"}</DialogTitle>
          <DialogDescription>Manage a category for your menu items.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Category Name</FormLabel><Input placeholder="e.g., Appetizers, Main Courses" {...field} /><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="order" render={({ field }) => (
              <FormItem><FormLabel>Display Order (Optional)</FormLabel><Input type="number" placeholder="e.g., 1" {...field} /><FormMessage /></FormItem>
            )}/>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/> Saving...</> : (category ? "Save Changes" : "Create Category")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
