
"use client";

import * as React from "react";
import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, PlusCircle, Trash2, Image as ImageIcon, Shield, ListChecks, Gift, CheckSquare, Info, PackageCheck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Service, Testimonial } from '@/lib/services-data';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const testimonialSchemaDialog = z.object({
  customerName: z.string().min(1, "Customer name is required."),
  customerAvatar: z.string().url("Avatar URL must be valid.").optional().or(z.literal('')),
  comment: z.string().min(5, "Comment must be at least 5 characters."),
  rating: z.coerce.number().min(1).max(5).optional(),
});

const serviceFormSchema = z.object({
  name: z.string().min(3, "Service name must be at least 3 characters."),
  price: z.string().refine(value => !isNaN(parseFloat(value)) && parseFloat(value) >= 0, {
    message: "Price must be a valid non-negative number.",
  }),
  duration: z.string().min(3, "Duration must be at least 3 characters (e.g., '30 min', '1 hour')."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Short description max 500 chars."),
  
  imageUrl: z.string().url("Image URL must be a valid URL.").optional().or(z.literal('')),
  imageHint: z.string().max(50, "Hint should be max 50 chars.").optional().or(z.literal('')),
  detailedDescription: z.string().optional().default(""),
  howItWorks: z.array(z.object({ value: z.string().min(1, "Step cannot be empty.") })).optional().default([]),
  benefits: z.array(z.object({ value: z.string().min(1, "Benefit cannot be empty.") })).optional().default([]),
  offers: z.array(z.object({ value: z.string().min(1, "Offer cannot be empty.") })).optional().default([]),
  securityInfo: z.string().optional().default(""),
  testimonials: z.array(testimonialSchemaDialog).optional().default([]),
  deliveryTime: z.string().max(50, "Delivery time max 50 chars.").optional().or(z.literal('')),
  revisionsIncluded: z.string().max(50, "Revisions info max 50 chars.").optional().or(z.literal('')),
});

type ServiceFormValues = z.infer<typeof serviceFormSchema>;

interface ServiceFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSuccess: () => void;
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
      imageUrl: "",
      imageHint: "",
      detailedDescription: "",
      howItWorks: [],
      benefits: [],
      offers: [],
      securityInfo: "",
      testimonials: [],
      deliveryTime: "",
      revisionsIncluded: "",
    },
  });

  const { fields: hwFields, append: appendHw, remove: removeHw } = useFieldArray({ control: form.control, name: "howItWorks" });
  const { fields: benefitFields, append: appendBenefit, remove: removeBenefit } = useFieldArray({ control: form.control, name: "benefits" });
  const { fields: offerFields, append: appendOffer, remove: removeOffer } = useFieldArray({ control: form.control, name: "offers" });
  const { fields: testimonialFields, append: appendTestimonial, remove: removeTestimonial } = useFieldArray({ control: form.control, name: "testimonials" });

  useEffect(() => {
    if (isOpen) {
      if (service) {
        form.reset({
          name: service.name,
          price: service.price.toString(),
          duration: service.duration,
          description: service.description,
          imageUrl: service.imageUrl || "",
          imageHint: service.imageHint || "",
          detailedDescription: service.detailedDescription || "",
          howItWorks: service.howItWorks?.map(s => ({ value: s })) || [],
          benefits: service.benefits?.map(s => ({ value: s })) || [],
          offers: service.offers?.map(s => ({ value: s })) || [],
          securityInfo: service.securityInfo || "",
          testimonials: service.testimonials?.map(t => ({
              customerName: t.customerName,
              customerAvatar: t.customerAvatar || "",
              comment: t.comment,
              rating: t.rating
          })) || [],
          deliveryTime: service.deliveryTime || "",
          revisionsIncluded: service.revisionsIncluded || "",
        });
      } else {
        form.reset({
          name: "", price: "", duration: "", description: "",
          imageUrl: "", imageHint: "", detailedDescription: "",
          howItWorks: [], benefits: [], offers: [], securityInfo: "",
          testimonials: [],
          deliveryTime: "", revisionsIncluded: "",
        });
      }
    }
  }, [service, form, isOpen]);

  const handleSubmit = async (values: ServiceFormValues) => {
    setIsSaving(true);
    const apiUrl = service && service.id ? `/api/services/${service.id}` : '/api/services';
    const method = service ? 'PUT' : 'POST';

    const payload = {
        ...values,
        howItWorks: values.howItWorks?.map(item => item.value),
        benefits: values.benefits?.map(item => item.value),
        offers: values.offers?.map(item => item.value),
    };

    try {
      const response = await fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${service ? 'update' : 'create'} service`);
      }

      toast({
        title: `Service ${service ? 'Updated' : 'Created'}!`,
        description: `The service "${values.name}" has been successfully ${service ? 'updated' : 'created'}.`,
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(`Error ${service ? 'updating' : 'creating'} service:`, error);
      toast({ title: "Error", description: error.message || `Could not ${service ? 'update' : 'create'} service.`, variant: "destructive"});
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{service ? "Edit Service" : "Create New Service"}</DialogTitle>
          <DialogDescription>
            {service ? "Update the details of your service." : "Fill in the details for your new service offering."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <ScrollArea className="h-[calc(100vh-18rem)] pr-6">
              <div className="space-y-6 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><Label>Service Name</Label><Input placeholder="e.g., 1-on-1 Coaching" {...field} /><FormMessage /></FormItem>
                )}/>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="price" render={({ field }) => (
                        <FormItem><Label>Price ($)</Label><Input type="text" placeholder="e.g., 150" {...field} /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="duration" render={({ field }) => (
                        <FormItem><Label>Duration</Label><Input placeholder="e.g., 60 min, 1 Project" {...field} /><FormMessage /></FormItem>
                    )}/>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="deliveryTime" render={({ field }) => (
                        <FormItem><Label>Delivery Time (Optional)</Label><Input placeholder="e.g., 3 days, 1 week" {...field} /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="revisionsIncluded" render={({ field }) => (
                        <FormItem><Label>Revisions Included (Optional)</Label><Input placeholder="e.g., 2 revisions, Unlimited" {...field} /><FormMessage /></FormItem>
                    )}/>
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><Label>Short Description (Max 200 chars)</Label><Textarea placeholder="Briefly describe the service..." className="min-h-[80px]" {...field} /><FormMessage /></FormItem>
                )}/>
                
                <Separator className="my-6" />
                <h3 className="text-lg font-semibold flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Media</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="imageUrl" render={({ field }) => (
                        <FormItem><Label>Featured Image URL</Label><Input placeholder="https://example.com/service-image.jpg" {...field} /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="imageHint" render={({ field }) => (
                        <FormItem><Label>Image Hint (for AI)</Label><Input placeholder="e.g., business consultation" {...field} /><FormMessage /></FormItem>
                    )}/>
                </div>

                <Separator className="my-6" />
                <h3 className="text-lg font-semibold flex items-center gap-2"><Info className="h-5 w-5 text-primary" /> Detailed Information</h3>
                <FormField control={form.control} name="detailedDescription" render={({ field }) => (
                    <FormItem><Label>Detailed Description</Label><Textarea placeholder="Provide a comprehensive description of the service..." className="min-h-[150px]" {...field} /><FormMessage /></FormItem>
                )}/>

                <ArrayFieldInputSection title="How It Works" titleIcon={ListChecks} fieldName="howItWorks" fields={hwFields} append={appendHw} remove={removeHw} placeholder="Describe a step in the process" control={form.control} />
                <ArrayFieldInputSection title="Key Benefits" titleIcon={CheckSquare} fieldName="benefits" fields={benefitFields} append={appendBenefit} remove={removeBenefit} placeholder="List a key benefit" control={form.control} />
                <ArrayFieldInputSection title="Special Offers / Inclusions" titleIcon={Gift} fieldName="offers" fields={offerFields} append={appendOffer} remove={removeOffer} placeholder="Detail an offer or what's included" control={form.control} />
                
                <FormField control={form.control} name="securityInfo" render={({ field }) => (
                    <FormItem><Label className="flex items-center gap-1"><Shield className="h-4 w-4"/>Security & Confidentiality (Optional)</Label><Textarea placeholder="Information about data security, NDAs, etc." className="min-h-[100px]" {...field} /><FormMessage /></FormItem>
                )}/>

                <Separator className="my-6" />
                 <Card>
                    <CardHeader><CardTitle className="text-lg font-semibold">Customer Testimonials (Optional)</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                    {testimonialFields.map((item, index) => (
                        <div key={item.id} className="p-3 border rounded-md space-y-2 bg-background shadow-sm">
                        <FormField control={form.control} name={`testimonials.${index}.customerName`} render={({ field }) => (
                            <FormItem><Label>Customer Name</Label><Input placeholder="John Doe" {...field} /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`testimonials.${index}.customerAvatar`} render={({ field }) => (
                            <FormItem><Label>Avatar URL (Optional)</Label><Input placeholder="https://example.com/avatar.png" {...field} /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`testimonials.${index}.comment`} render={({ field }) => (
                            <FormItem><Label>Comment</Label><Textarea placeholder="Their feedback..." className="min-h-[80px]" {...field} /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`testimonials.${index}.rating`} render={({ field }) => (
                             <FormItem><Label>Rating (1-5, Optional)</Label><Input type="number" min="1" max="5" placeholder="5" {...field} /><FormMessage /></FormItem>
                        )}/>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeTestimonial(index)} className="text-destructive hover:text-destructive/90 mt-1">
                            <Trash2 className="mr-1 h-4 w-4"/>Remove Testimonial
                        </Button>
                        </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendTestimonial({ customerName: "", customerAvatar: "", comment: "" , rating: 5})} className="mt-2">
                        <PlusCircle className="mr-2 h-4 w-4"/>Add Testimonial
                    </Button>
                    </CardContent>
                </Card>

              </div>
            </ScrollArea>
            <DialogFooter className="pt-6">
              <DialogClose asChild><Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primary/90">
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (service ? "Save Changes" : "Create Service")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}


interface ArrayFieldInputSectionProps {
    title: string;
    titleIcon?: React.ElementType;
    fieldName: `howItWorks` | `benefits` | `offers`; 
    fields: any[]; 
    append: (value: { value: string }) => void;
    remove: (index: number) => void;
    placeholder: string;
    control: any; 
}

function ArrayFieldInputSection({ title, titleIcon: Icon, fieldName, fields, append, remove, placeholder, control }: ArrayFieldInputSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    {Icon && <Icon className="h-5 w-5 text-primary" />} {title} (Optional)
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
            {fields.map((item, index) => (
                <div key={item.id} className="flex items-center gap-2">
                <FormField
                    control={control}
                    name={`${fieldName}.${index}.value`}
                    render={({ field }) => (
                    <FormItem className="flex-grow">
                        <Input placeholder={`${placeholder} #${index + 1}`} {...field} />
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-destructive hover:text-destructive/90">
                    <Trash2 className="h-4 w-4" />
                </Button>
                </div>
            ))}
            <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4"/>Add Item
            </Button>
            </CardContent>
        </Card>
    );
}
