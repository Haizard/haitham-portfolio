
"use client";

import { useEffect, useState } from 'react'; // Make sure useState is imported
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
import type { Subcategory, Category } from '@/lib/categories-data';

const subcategoryFormSchema = z.object({
  name: z.string().min(2, "Subcategory name must be at least 2 characters.").max(50, "Subcategory name must be 50 characters or less."),
  description: z.string().max(200, "Description must be 200 characters or less.").optional(),
});

type SubcategoryFormValues = z.infer<typeof subcategoryFormSchema>;

interface SubcategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: Subcategory | null;
  parentCategory: Category | null;
  onSuccess: () => void;
}

export function SubcategoryFormDialog({ isOpen, onClose, subcategory, parentCategory, onSuccess }: SubcategoryFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<SubcategoryFormValues>({
    resolver: zodResolver(subcategoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if(isOpen) {
        if (subcategory) {
          form.reset({
            name: subcategory.name,
            description: subcategory.description || "",
          });
        } else {
          form.reset({
            name: "",
            description: "",
          });
        }
    }
  }, [subcategory, form, isOpen]);

  const handleSubmit = async (values: SubcategoryFormValues) => {
    if (!parentCategory) {
      toast({ title: "Error", description: "Parent category is missing.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const apiUrl = subcategory 
      ? `/api/categories/${parentCategory.id}/subcategories/${subcategory.id}` 
      : `/api/categories/${parentCategory.id}/subcategories`;
    const method = subcategory ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${subcategory ? 'update' : 'create'} subcategory`);
      }

      toast({
        title: `Subcategory ${subcategory ? 'Updated' : 'Created'}!`,
        description: `The subcategory "${values.name}" has been successfully ${subcategory ? 'updated' : 'created'}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${subcategory ? 'updating' : 'creating'} subcategory:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${subcategory ? 'update' : 'create'} subcategory.`,
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
          <DialogTitle>{subcategory ? "Edit Subcategory" : `Create New Subcategory for "${parentCategory?.name}"`}</DialogTitle>
          <DialogDescription>
            {subcategory ? "Update the details of this subcategory." : "Fill in the details for your new subcategory."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Subcategory Name</FormLabel>
                  <Input id="name" placeholder="e.g., AI Tools" {...field} />
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
                    placeholder="Briefly describe the subcategory..."
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
              <Button type="submit" disabled={isSaving || !parentCategory} className="bg-primary hover:bg-primary/90">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  subcategory ? "Save Changes" : "Create Subcategory"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
