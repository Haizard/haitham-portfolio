
"use client";

import { useEffect, useState } from 'react'; // Added useState here
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
import type { Category } from '@/lib/categories-data';

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").max(50, "Category name must be 50 characters or less."),
  description: z.string().max(200, "Description must be 200 characters or less.").optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  category?: Category | null;
  onSuccess: () => void;
}

export function CategoryFormDialog({ isOpen, onClose, category, onSuccess }: CategoryFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) { // Reset form only when dialog opens
      if (category) {
        form.reset({
          name: category.name,
          description: category.description || "",
        });
      } else {
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [category, form, isOpen]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSaving(true);
    const apiUrl = category ? `/api/categories/${category.id}` : '/api/categories';
    const method = category ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${category ? 'update' : 'create'} category`);
      }

      toast({
        title: `Category ${category ? 'Updated' : 'Created'}!`,
        description: `The category "${values.name}" has been successfully ${category ? 'updated' : 'created'}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${category ? 'updating' : 'creating'} category:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${category ? 'update' : 'create'} category.`,
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
          <DialogTitle>{category ? "Edit Category" : "Create New Category"}</DialogTitle>
          <DialogDescription>
            {category ? "Update the details of this category." : "Fill in the details for your new category."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Category Name</FormLabel>
                  <Input id="name" placeholder="e.g., Technology" {...field} />
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
                    placeholder="Briefly describe the category..."
                    className="min-h-[100px]"
                    {...field}
                    value={field.value ?? ''} // Ensure value is not undefined
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
                  category ? "Save Changes" : "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
