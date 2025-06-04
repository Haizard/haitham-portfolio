
"use client";

import * as React from "react"; // Added this line
import { useEffect } from 'react';
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Service } from '@/lib/services-data';

const serviceFormSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters."),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "Price must be a valid non-negative number.",
  }),
  duration: z.string().min(3, "Duration must be at least 3 characters (e.g., '30 min', '1 hour')."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(200, "Description must be 200 characters or less."),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess: () => void; // Callback to refresh the services list
}

export function ServiceFormDialog({ isOpen, onClose, service, onSuccess }: ServiceFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = React.useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      description: "",
    },
  });

  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        price: service.price.toString(), // Ensure price is a string for the form
        duration: service.duration,
        description: service.description,
      });
    } else {
      form.reset({
        name: "",
        price: "",
        duration: "",
        description: "",
      });
    }
  }, [service, form, isOpen]); // Reset form when service or isOpen changes

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSaving(true);
    const apiUrl = service ? `/api/services/${service.id}` : '/api/services';
    const method = service ? 'PUT' : 'POST';

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${service ? 'update' : 'create'} service`);
      }

      toast({
        title: `Service ${service ? 'Updated' : 'Created'}!`,
        description: `The service "${values.name}" has been successfully ${service ? 'updated' : 'created'}.`,
      });
      onSuccess(); // Call the success callback to refresh data
      onClose(); // Close the dialog
    } catch (error: any) {
      console.error(`Error ${service ? 'updating' : 'creating'} service:`, error);
      toast({
        title: "Error",
        description: error.message || `Could not ${service ? 'update' : 'create'} service.`,
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
          <DialogTitle>{service ? "Edit Service" : "Create New Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update the details of your service." : "Fill in the details for your new service offering."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="name">Service Name</Label>
                  <Input id="name" placeholder="e.g., 1-on-1 Coaching" {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input id="price" type="text" placeholder="e.g., 150" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <Label htmlFor="duration">Duration</Label>
                    <Input id="duration" placeholder="e.g., 60 min, 1 Project" {...field} />
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Briefly describe the service..."
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
                  service ? "Save Changes" : "Create Service"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
