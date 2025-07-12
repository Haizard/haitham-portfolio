
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
import type { ProductCategoryNode } from '@/lib/product-categories-data';

const categoryFormSchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters.").max(50, "Category name must be 50 characters or less."),
  description: z.string().max(200, "Description must be 200 characters or less.").optional().default(""),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface ProductCategoryFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  categoryNode?: ProductCategoryNode | null; 
  parentId?: string | null;          
  parentName?: string | null;        
  onSuccess: () => void;
}

export function ProductCategoryFormDialog({ isOpen, onClose, categoryNode, parentId, parentName, onSuccess }: ProductCategoryFormDialogProps) {
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
    if (isOpen) {
      if (categoryNode) { 
        form.reset({
          name: categoryNode.name,
          description: categoryNode.description || "",
        });
      } else { 
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [categoryNode, form, isOpen]);

  const handleSubmit = async (values: CategoryFormValues) => {
    setIsSaving(true);
    const isEditing = !!categoryNode;
    const apiUrl = isEditing && categoryNode?.id ? `/api/product-categories/${categoryNode.id}` : '/api/product-categories';
    const method = isEditing ? 'PUT' : 'POST';

    const payload: any = { ...values };
    if (!isEditing && parentId) {
      payload.parentId = parentId;
    }

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} category`);
      }

      toast({
        title: `Category ${isEditing ? 'Updated' : 'Created'}!`,
        description: `The category "${values.name}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
      });
      onSuccess();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} category:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${isEditing ? 'update' : 'create'} category.`,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getDialogTitle = () => {
    if (categoryNode) return "Edit Product Category";
    if (parentName) return `Create New Category under "${parentName}"`;
    return "Create New Top-Level Product Category";
  };
  
  const getDialogDescription = () => {
    if (categoryNode) return "Update the details of this product category.";
    return "Fill in the details for your new product category.";
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>{getDialogDescription()}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Category Name</FormLabel>
                  <Input id="name" placeholder="e.g., Laptops & Computers" {...field} />
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
                  categoryNode ? "Save Changes" : "Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
