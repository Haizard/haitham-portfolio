
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
import type { ProductTag } from '@/lib/product-tags-data';

const tagFormSchema = z.object({
  name: z.string().min(1, "Tag name cannot be empty.").max(50, "Tag name must be 50 characters or less."),
  description: z.string().max(200, "Description must be 200 characters or less.").optional(),
});

type TagFormValues = z.infer<typeof tagFormSchema>;

interface ProductTagFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tag?: ProductTag | null; 
  onSuccess: () => void;
}

export function ProductTagFormDialog({ isOpen, onClose, tag, onSuccess }: ProductTagFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const form = useForm<TagFormValues>({
    resolver: zodResolver(tagFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (tag) { 
        form.reset({
          name: tag.name,
          description: tag.description || "",
        });
      } else { 
        form.reset({
          name: "",
          description: "",
        });
      }
    }
  }, [tag, form, isOpen]);

  const handleSubmit = async (values: TagFormValues) => {
    setIsSaving(true);
    const isEditing = !!tag;
    const apiUrl = isEditing && tag?.id ? `/api/product-tags/${tag.id}` : '/api/product-tags';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} tag`);
      }

      toast({
        title: `Tag ${isEditing ? 'Updated' : 'Created'}!`,
        description: `The tag "${values.name}" has been successfully ${isEditing ? 'updated' : 'created'}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} tag:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${isEditing ? 'update' : 'create'} tag.`,
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
          <DialogTitle>{tag ? "Edit Product Tag" : "Create New Product Tag"}</DialogTitle>
          <DialogDescription>{tag ? "Update the details of this tag." : "Fill in the details for your new tag."}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">Tag Name</FormLabel>
                  <Input id="name" placeholder="e.g., Digital Download" {...field} />
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
                    placeholder="Briefly describe the tag..."
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
                  tag ? "Save Changes" : "Create Tag"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
