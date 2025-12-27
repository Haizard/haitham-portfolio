"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Upload, X, Bed, Users, Banknote, List, Image as ImageIcon } from 'lucide-react';

const roomFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    type: z.enum(['single', 'double', 'twin', 'suite', 'deluxe', 'family']),
    description: z.string().min(50, "Description must be at least 50 characters"),
    size: z.coerce.number().min(1, "Size is required"),

    // Capacity
    capacity: z.object({
        adults: z.coerce.number().min(1),
        children: z.coerce.number().min(0),
        infants: z.coerce.number().min(0),
    }),

    // Pricing
    pricing: z.object({
        basePrice: z.coerce.number().min(0),
        currency: z.string().default('USD'),
        unit: z.enum(['nightly', 'monthly']).default('nightly'),
        taxRate: z.coerce.number().min(0).max(100).default(0),
        cleaningFee: z.coerce.number().min(0).optional(),
        extraGuestFee: z.coerce.number().min(0).optional(),
    }),

    // Availability
    availability: z.object({
        totalRooms: z.coerce.number().min(1),
        minimumStay: z.coerce.number().min(1).default(1),
        maximumStay: z.coerce.number().optional(),
    }),

    isActive: z.boolean().default(true),

    // Added fields for validation
    images: z.array(z.object({
        url: z.string().url(),
        order: z.number(),
        caption: z.string().default('')
    })).min(1, "At least one image is required"),
    amenities: z.array(z.string()).min(1, "At least one amenity must be selected"),
    bedConfiguration: z.array(z.object({
        type: z.enum(['single', 'double', 'queen', 'king', 'sofa_bed']),
        count: z.number().min(1)
    })).min(1, "At least one bed is required"),
});

const ROOM_TYPES = ['single', 'double', 'twin', 'suite', 'deluxe', 'family'];
const AMENITIES_LIST = ['WiFi', 'TV', 'Minibar', 'Safe', 'Balcony', 'Sea View', 'Bathtub', 'AC', 'Coffee Maker', 'Desk'];

export type RoomFormValues = z.infer<typeof roomFormSchema>;

interface RoomFormProps {
    defaultValues?: Partial<RoomFormValues>;
    onSubmit: (values: RoomFormValues) => Promise<void>;
    isLoading?: boolean;
    propertyId: string;
}

export function RoomForm({ defaultValues, onSubmit, isLoading, propertyId }: RoomFormProps) {
    const [imageInput, setImageInput] = useState("");

    const form = useForm<z.infer<typeof roomFormSchema>>({
        resolver: zodResolver(roomFormSchema),
        defaultValues: {
            name: defaultValues?.name || "",
            type: (defaultValues?.type || "double") as any,
            description: defaultValues?.description || "",
            size: defaultValues?.size || 25,
            capacity: {
                adults: defaultValues?.capacity?.adults || 2,
                children: defaultValues?.capacity?.children || 0,
                infants: defaultValues?.capacity?.infants || 0,
            },
            pricing: {
                basePrice: defaultValues?.pricing?.basePrice || 100,
                currency: defaultValues?.pricing?.currency || 'USD',
                taxRate: defaultValues?.pricing?.taxRate || 0,
                cleaningFee: defaultValues?.pricing?.cleaningFee || 0,
                extraGuestFee: defaultValues?.pricing?.extraGuestFee || 0,
            },
            availability: {
                totalRooms: defaultValues?.availability?.totalRooms || 1,
                minimumStay: defaultValues?.availability?.minimumStay || 1,
                maximumStay: defaultValues?.availability?.maximumStay,
            },
            isActive: defaultValues?.isActive ?? true,
            images: defaultValues?.images || [],
            amenities: defaultValues?.amenities || [],
            bedConfiguration: defaultValues?.bedConfiguration || [{ type: 'queen', count: 1 }],
        },
    });

    const images = form.watch('images') || [];
    const selectedAmenities = form.watch('amenities') || [];
    const bedConfig = form.watch('bedConfiguration') || [];

    const handleAddImage = () => {
        if (imageInput) {
            const newImages = [...images, { url: imageInput, order: images.length, caption: "" }];
            form.setValue('images', newImages, { shouldValidate: true });
            setImageInput("");
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, idx) => idx !== index);
        form.setValue('images', newImages, { shouldValidate: true });
    };

    const toggleAmenity = (amenity: string) => {
        const normalizedAmenity = amenity.toLowerCase().replace(' ', '_');
        let newAmenities;
        if (selectedAmenities.includes(normalizedAmenity)) {
            newAmenities = selectedAmenities.filter(a => a !== normalizedAmenity);
        } else {
            newAmenities = [...selectedAmenities, normalizedAmenity];
        }
        form.setValue('amenities', newAmenities, { shouldValidate: true });
    };

    const addBed = () => {
        const newConfig = [...bedConfig, { type: 'single', count: 1 }];
        // @ts-ignore
        form.setValue('bedConfiguration', newConfig, { shouldValidate: true });
    };

    const removeBed = (index: number) => {
        const newConfig = bedConfig.filter((_, i) => i !== index);
        form.setValue('bedConfiguration', newConfig, { shouldValidate: true });
    };

    const updateBed = (index: number, field: string, value: any) => {
        const newConfig = [...bedConfig];
        // @ts-ignore
        (newConfig[index] as any)[field] = value;
        form.setValue('bedConfiguration', newConfig, { shouldValidate: true });
    };

    const handleSubmit = async (values: z.infer<typeof roomFormSchema>) => {
        await onSubmit(values);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

                {/* Basic Details */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><List className="h-5 w-5" /> Basic Info</CardTitle></CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Room Name</FormLabel>
                                <FormControl><Input placeholder="Deluxe Ocean View" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="type" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Room Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {ROOM_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="size" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Size (m²)</FormLabel>
                                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem className="col-span-2">
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea className="h-24" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="isActive" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 col-span-2">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-base">Active Status</FormLabel>
                                    <FormDescription>Room can be booked when active.</FormDescription>
                                </div>
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Capacity & Beds */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Capacity & Beds</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-3 gap-4">
                            <FormField control={form.control} name="capacity.adults" render={({ field }) => (
                                <FormItem><FormLabel>Adults</FormLabel><FormControl><Input type="number" min="1" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="capacity.children" render={({ field }) => (
                                <FormItem><FormLabel>Children</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="capacity.infants" render={({ field }) => (
                                <FormItem><FormLabel>Infants</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">Bed Configuration</h3>
                                <Button type="button" variant="outline" size="sm" onClick={addBed}>Add Bed</Button>
                            </div>
                            {form.formState.errors.bedConfiguration && (
                                <p className="text-sm font-medium text-destructive">{form.formState.errors.bedConfiguration.message}</p>
                            )}
                            {bedConfig.map((bed, index) => (
                                <div key={index} className="flex items-end gap-3">
                                    <div className="flex-1">
                                        <FormLabel className="text-xs">Type</FormLabel>
                                        <Select value={bed.type} onValueChange={(val) => updateBed(index, 'type', val)}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['single', 'double', 'queen', 'king', 'sofa_bed'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('_', ' ')}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-24">
                                        <FormLabel className="text-xs">Count</FormLabel>
                                        <Input type="number" min="1" value={bed.count} onChange={(e) => updateBed(index, 'count', parseInt(e.target.value))} />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeBed(index)}><X className="h-4 w-4" /></Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Pricing & Availability */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Banknote className="h-5 w-5" /> Pricing & Availability</CardTitle></CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-2">
                        <FormField
                            control={form.control}
                            name="pricing.basePrice"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Price</FormLabel>
                                    <FormControl>
                                        <Input type="number" min="0" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="pricing.unit"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pricing Unit</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select unit" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="nightly">Per Night</SelectItem>
                                            <SelectItem value="monthly">Per Month</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField control={form.control} name="pricing.taxRate" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax Rate (%)</FormLabel>
                                <FormControl><Input type="number" min="0" max="100" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="availability.totalRooms" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Total Units of this type</FormLabel>
                                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="availability.minimumStay" render={({ field }) => (
                            <FormItem>
                                <FormLabel>Min Stay (Nights)</FormLabel>
                                <FormControl><Input type="number" min="1" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </CardContent>
                </Card>

                {/* Amenities */}
                <Card>
                    <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                    <CardContent>
                        {form.formState.errors.amenities && (
                            <p className="text-sm font-medium text-destructive mb-2">{form.formState.errors.amenities.message}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {AMENITIES_LIST.map(amenity => (
                                <div key={amenity} className="flex items-center space-x-2">
                                    <Checkbox id={amenity} checked={selectedAmenities.includes(amenity.toLowerCase().replace(' ', '_'))} onCheckedChange={() => toggleAmenity(amenity)} />
                                    <label htmlFor={amenity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{amenity}</label>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Images */}
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Images</CardTitle></CardHeader>
                    <CardContent>
                        {form.formState.errors.images && (
                            <p className="text-sm font-medium text-destructive mb-2">{form.formState.errors.images.message}</p>
                        )}
                        <div className="flex gap-2 mb-4">
                            <Input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Image URL" />
                            <Button type="button" onClick={handleAddImage} variant="outline"><Upload className="h-4 w-4" /></Button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative aspect-video bg-muted rounded overflow-hidden group">
                                    <img src={img.url} className="w-full h-full object-contain bg-secondary" alt="Room" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button type="button" onClick={() => removeImage(i)} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg">
                    {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                    {defaultValues ? 'Save Changes' : 'Create Room'}
                </Button>
            </form>
        </Form>
    );
}
