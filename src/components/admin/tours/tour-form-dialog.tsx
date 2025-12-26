
"use client";

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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Loader2, PlusCircle, Trash2, Tag, Star, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TourPackage, TourGuide } from '@/lib/tours-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import type { TourActivity } from '@/lib/tour-activities-data';

const highlightSchema = z.object({
  icon: z.string().optional().describe("e.g., Clock, Users. See lucide-react icons."),
  text: z.string().min(1, "Highlight text cannot be empty.")
});

const faqSchema = z.object({
  question: z.string().min(1, "Question cannot be empty."),
  answer: z.string().min(1, "Answer cannot be empty."),
});

const tourFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  duration: z.string().min(3, "Duration is required."),
  description: z.string().min(10, "Description is required."),
  location: z.string().min(3, "Location is required."),
  tourType: z.string().min(3, "Tour Type is required (e.g., Safari, Cultural)."),
  tags: z.string().min(3, "Please add at least one tag."),
  activityIds: z.array(z.string()).optional().default([]),
  price: z.coerce.number().positive("Price must be a positive number."),
  featuredImageUrl: z.string().url("A valid image URL is required."),
  isActive: z.boolean().default(false),
  itinerary: z.array(z.object({ value: z.string().min(1, "Itinerary item cannot be empty.") })).min(1),
  inclusions: z.array(z.object({ value: z.string().min(1, "Inclusion item cannot be empty.") })).min(1),
  exclusions: z.array(z.object({ value: z.string().min(1, "Exclusion item cannot be empty.") })).min(1),
  galleryImages: z.array(z.object({ url: z.string().url(), caption: z.string().optional() })).optional(),
  highlights: z.array(highlightSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  mapEmbedUrl: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
  // New fields
  guideId: z.string().optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  reviewCount: z.coerce.number().int().min(0).optional(),
});

type TourFormValues = z.infer<typeof tourFormSchema>;

interface TourFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tour?: TourPackage | null;
  onSuccess: () => void;
}

const ArrayField = ({ name, label, control, fields, append, remove, placeholder }: any) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    {fields.map((field: any, index: number) => (
      <FormField
        key={field.id}
        control={control}
        name={`${name}.${index}.value`}
        render={({ field: rhfField }) => (
          <FormItem className="flex items-center gap-2">
            <Input {...rhfField} placeholder={`${placeholder} #${index + 1}`} />
            <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            <FormMessage />
          </FormItem>
        )}
      />
    ))}
    <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add Item
    </Button>
  </div>
);

const GalleryImageField = ({ name, control, fields, append, remove }: any) => (
  <div className="space-y-2">
    <Label>Gallery Images</Label>
    {fields.map((field: any, index: number) => (
      <div key={field.id} className="flex items-end gap-2">
        <FormField
          control={control}
          name={`${name}.${index}.url`}
          render={({ field: rhfField }) => (
            <FormItem className="flex-grow">
              <FormLabel className={index === 0 ? "block" : "sr-only"}>Image URL</FormLabel>
              <Input {...rhfField} placeholder="https://example.com/image.jpg" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${name}.${index}.caption`}
          render={({ field: rhfField }) => (
            <FormItem className="flex-grow">
              <FormLabel className={index === 0 ? "block" : "sr-only"}>Caption (Optional)</FormLabel>
              <Input {...rhfField} placeholder="Image caption" />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    ))}
    <Button type="button" variant="outline" size="sm" onClick={() => append({ url: "", caption: "" })}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add Image
    </Button>
  </div>
);

const HighlightField = ({ name, control, fields, append, remove }: any) => (
  <div className="space-y-2">
    <Label>Highlights</Label>
    {fields.map((field: any, index: number) => (
      <div key={field.id} className="flex items-end gap-2">
        <FormField
          control={control}
          name={`${name}.${index}.icon`}
          render={({ field: rhfField }) => (
            <FormItem className="w-1/3">
              <FormLabel className={index === 0 ? "block" : "sr-only"}>Icon (Lucide)</FormLabel>
              <Input {...rhfField} placeholder="e.g., Star, Users" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${name}.${index}.text`}
          render={({ field: rhfField }) => (
            <FormItem className="flex-grow">
              <FormLabel className={index === 0 ? "block" : "sr-only"}>Text</FormLabel>
              <Input {...rhfField} placeholder="Highlight description" />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </div>
    ))}
    <Button type="button" variant="outline" size="sm" onClick={() => append({ icon: "Star", text: "" })}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add Highlight
    </Button>
  </div>
);

const FaqField = ({ name, control, fields, append, remove }: any) => (
  <div className="space-y-2">
    <Label>FAQs</Label>
    {fields.map((field: any, index: number) => (
      <div key={field.id} className="space-y-2 border p-3 rounded-md">
        <FormField
          control={control}
          name={`${name}.${index}.question`}
          render={({ field: rhfField }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <Input {...rhfField} placeholder="What is included?" />
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`${name}.${index}.answer`}
          render={({ field: rhfField }) => (
            <FormItem>
              <FormLabel>Answer</FormLabel>
              <Textarea {...rhfField} placeholder="Everything you need for a great trip!" />
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive">
          <Trash2 className="mr-2 h-4 w-4" /> Remove FAQ
        </Button>
      </div>
    ))}
    <Button type="button" variant="outline" size="sm" onClick={() => append({ question: "", answer: "" })}>
      <PlusCircle className="mr-2 h-4 w-4" /> Add FAQ
    </Button>
  </div>
);


export function TourFormDialog({ isOpen, onClose, tour, onSuccess }: TourFormDialogProps) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [activities, setActivities] = useState<TourActivity[]>([]);

  const form = useForm<TourFormValues>({
    resolver: zodResolver(tourFormSchema),
    defaultValues: {
      isActive: false,
      galleryImages: [],
      tags: '',
      highlights: [],
      faqs: [],
      activityIds: []
    },
  });

  // Fetch available guides
  useEffect(() => {
    async function fetchGuides() {
      try {
        const response = await fetch('/api/tour-guides');
        if (response.ok) {
          const data = await response.json();
          setGuides(Array.isArray(data) ? data : []);
        } else {
          setGuides([]);
        }
      } catch (error) {
        console.error('Failed to fetch guides:', error);
      }
    }
    fetchGuides();

    async function fetchActivities() {
      try {
        const response = await fetch('/api/tour-activities');
        if (response.ok) {
          const data = await response.json();
          setActivities(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Failed to fetch activities:', error);
      }
    }
    fetchActivities();
  }, []);

  const { fields: itineraryFields, append: appendItinerary, remove: removeItinerary } = useFieldArray({ control: form.control, name: "itinerary" });
  const { fields: inclusionsFields, append: appendInclusion, remove: removeInclusion } = useFieldArray({ control: form.control, name: "inclusions" });
  const { fields: exclusionsFields, append: appendExclusion, remove: removeExclusion } = useFieldArray({ control: form.control, name: "exclusions" });
  const { fields: galleryFields, append: appendGallery, remove: removeGallery } = useFieldArray({ control: form.control, name: "galleryImages" });
  const { fields: highlightFields, append: appendHighlight, remove: removeHighlight } = useFieldArray({ control: form.control, name: "highlights" });
  const { fields: faqFields, append: appendFaq, remove: removeFaq } = useFieldArray({ control: form.control, name: "faqs" });


  useEffect(() => {
    if (isOpen) {
      if (tour) {
        form.reset({
          name: tour.name,
          duration: tour.duration,
          description: tour.description,
          location: tour.location,
          tourType: tour.tourType,
          tags: Array.isArray(tour.tags) ? tour.tags.join(', ') : '',
          price: tour.price,
          featuredImageUrl: tour.featuredImageUrl,
          isActive: tour.isActive,
          itinerary: Array.isArray(tour.itinerary) ? tour.itinerary.map(value => ({ value })) : [],
          inclusions: Array.isArray(tour.inclusions) ? tour.inclusions.map(value => ({ value })) : [],
          exclusions: Array.isArray(tour.exclusions) ? tour.exclusions.map(value => ({ value })) : [],
          galleryImages: Array.isArray(tour.galleryImages) ? tour.galleryImages : [],
          highlights: Array.isArray(tour.highlights) ? tour.highlights : [],
          faqs: Array.isArray(tour.faqs) ? tour.faqs : [],
          mapEmbedUrl: tour.mapEmbedUrl || "",
          guideId: (tour.guideId && tour.guideId !== "none") ? tour.guideId : "none",
          rating: tour.rating || undefined,
          reviewCount: tour.reviewCount || undefined,
          activityIds: Array.isArray(tour.activityIds) ? tour.activityIds : [],
        });
      } else {
        form.reset({
          name: '',
          duration: '',
          description: '',
          location: '',
          tourType: '',
          tags: '',
          price: 0,
          featuredImageUrl: 'https://placehold.co/800x600.png',
          isActive: false,
          itinerary: [{ value: '' }],
          inclusions: [{ value: '' }],
          exclusions: [{ value: '' }],
          galleryImages: [],
          highlights: [],
          faqs: [],
          mapEmbedUrl: "",
        });
      }
    }
  }, [tour, form, isOpen]);

  const handleSubmit = async (values: TourFormValues) => {
    setIsSaving(true);
    const apiUrl = tour ? `/api/tours/${tour.id}` : '/api/tours';
    const method = tour ? 'PUT' : 'POST';

    const payload = {
      ...values,
      tags: values.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      itinerary: values.itinerary.map(item => item.value),
      inclusions: values.inclusions.map(item => item.value),
      exclusions: values.exclusions.map(item => item.value),
      guideId: (values.guideId === "none" || !values.guideId) ? null : values.guideId,
      mapEmbedUrl: values.mapEmbedUrl || null,
    };

    try {
      const response = await fetch(apiUrl, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to save tour package`);
      }
      toast({ title: `Tour Package ${tour ? 'Updated' : 'Created'}!` });
      onSuccess();
      onClose();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{tour ? "Edit Tour Package" : "Create New Tour Package"}</DialogTitle>
          <DialogDescription>Fill in the details for the tour package.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit, (errors) => console.log('Form Errors:', errors))}>
            <ScrollArea className="h-[calc(100vh-18rem)] pr-6">
              <div className="space-y-4 py-4">
                <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><Input {...field} /><FormMessage /></FormItem>)} />
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="duration" render={({ field }) => (<FormItem><FormLabel>Duration</FormLabel><Input placeholder="e.g., 3 Days, 2 Nights" {...field} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="price" render={({ field }) => (<FormItem><FormLabel>Price ($)</FormLabel><Input type="number" {...field} /><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabel>Location</FormLabel><Input placeholder="e.g., Arusha, Tanzania" {...field} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="tourType" render={({ field }) => (<FormItem><FormLabel>Tour Type</FormLabel><Input placeholder="e.g., Safari" {...field} /><FormMessage /></FormItem>)} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="guideId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tour Guide (Optional)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a guide" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {Array.isArray(guides) && guides.map((guide) => (
                              <SelectItem key={guide.id} value={guide.id}>
                                {guide.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="rating" render={({ field }) => (<FormItem><FormLabel>Rating (0-5)</FormLabel><Input type="number" step="0.1" min="0" max="5" placeholder="4.5" {...field} /><FormMessage /></FormItem>)} />
                  <FormField control={form.control} name="reviewCount" render={({ field }) => (<FormItem><FormLabel>Review Count</FormLabel><Input type="number" min="0" placeholder="127" {...field} /><FormMessage /></FormItem>)} />
                </div>
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-1.5"><Tag className="h-4 w-4" />Tags (comma-separated)</FormLabel>
                      <Input
                        placeholder="e.g., Budget Travel, Adventure, Family Friendly"
                        {...field}
                        value={Array.isArray(field.value) ? field.value.join(', ') : field.value}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><Textarea className="min-h-[100px]" {...field} /><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="featuredImageUrl" render={({ field }) => (<FormItem><FormLabel>Featured Image URL</FormLabel><Input {...field} /><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="mapEmbedUrl" render={({ field }) => (<FormItem><FormLabel>Google Maps Embed URL (Optional)</FormLabel><Input placeholder="https://www.google.com/maps/embed?..." {...field} /><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="isActive" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Active & Visible</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                )} />

                <ArrayField name="itinerary" label="Itinerary" control={form.control} fields={itineraryFields} append={appendItinerary} remove={removeItinerary} placeholder="Day" />
                <ArrayField name="inclusions" label="Inclusions" control={form.control} fields={inclusionsFields} append={appendInclusion} remove={removeInclusion} placeholder="Included item" />
                <ArrayField name="exclusions" label="Exclusions" control={form.control} fields={exclusionsFields} append={appendExclusion} remove={removeExclusion} placeholder="Excluded item" />

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><Star className="h-4 w-4" />Highlights</Label>
                  {highlightFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-2 p-2 border rounded-md">
                      <FormField control={form.control} name={`highlights.${index}.icon`} render={({ field: rhfField }) => <FormItem className="w-1/3"><FormLabel className="text-xs">Icon Name</FormLabel><Input placeholder="e.g., Clock" {...rhfField} /><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`highlights.${index}.text`} render={({ field: rhfField }) => <FormItem className="flex-1"><FormLabel className="text-xs">Text</FormLabel><Input placeholder="e.g., 8 hours" {...rhfField} /><FormMessage /></FormItem>} />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeHighlight(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendHighlight({ icon: "", text: "" })}><PlusCircle className="mr-2 h-4 w-4" />Add Highlight</Button>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1.5"><HelpCircle className="h-4 w-4" />FAQs</Label>
                  {faqFields.map((field, index) => (
                    <div key={field.id} className="space-y-2 p-2 border rounded-md">
                      <FormField control={form.control} name={`faqs.${index}.question`} render={({ field: rhfField }) => <FormItem><FormLabel className="text-xs">Question</FormLabel><Input {...rhfField} /><FormMessage /></FormItem>} />
                      <FormField control={form.control} name={`faqs.${index}.answer`} render={({ field: rhfField }) => <FormItem><FormLabel className="text-xs">Answer</FormLabel><Textarea className="min-h-[60px]" {...rhfField} /><FormMessage /></FormItem>} />
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(index)} className="text-destructive"><Trash2 className="h-4 w-4 mr-1" />Remove FAQ</Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={() => appendFaq({ question: "", answer: "" })}><PlusCircle className="mr-2 h-4 w-4" />Add FAQ</Button>
                </div>

                <div className="space-y-3">
                  <Label>Activities</Label>
                  <div className="grid grid-cols-2 gap-3 border rounded-md p-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`activity-${activity.id}`}
                          checked={form.watch("activityIds")?.includes(activity.id!)}
                          onCheckedChange={(checked) => {
                            const currentIds = form.getValues("activityIds") || [];
                            if (checked) {
                              form.setValue("activityIds", [...currentIds, activity.id!]);
                            } else {
                              form.setValue("activityIds", currentIds.filter(id => id !== activity.id));
                            }
                          }}
                        />
                        <label htmlFor={`activity-${activity.id}`} className="text-sm font-medium leading-none cursor-pointer">
                          {activity.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Gallery Images</Label>
                  <div className="space-y-3">
                    {galleryFields.map((field, index) => (
                      <div key={field.id} className="flex flex-col gap-2 p-3 border rounded-md bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Image URL"
                            {...form.register(`galleryImages.${index}.url` as const)}
                          />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeGallery(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Caption (Optional)"
                          {...form.register(`galleryImages.${index}.caption` as const)}
                        />
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" onClick={() => appendGallery({ url: "", caption: "" })}>
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Gallery Image
                    </Button>
                  </div>
                </div>


              </div>
            </ScrollArea>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : (tour ? "Save Changes" : "Create Tour")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  );
}
