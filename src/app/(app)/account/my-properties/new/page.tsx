"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, Building, MapPin, Clock } from 'lucide-react';

const propertyFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    type: z.string().min(1, "Property type is required"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    starRating: z.coerce.number().min(1).max(5),
    totalRooms: z.coerce.number().min(1),

    // Location
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    country: z.string().min(2, "Country is required"),
    postalCode: z.string().optional(),

    // Policies
    checkInTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM"),
    checkOutTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM"),
    cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'non_refundable']),
    childrenAllowed: z.boolean().default(true),
    petsAllowed: z.boolean().default(false),
    smokingAllowed: z.boolean().default(false),
    partiesAllowed: z.boolean().default(false),

    // Contact
    phone: z.string().min(5, "Phone is required"),
    email: z.string().email("Invalid email"),
    website: z.string().url().optional().or(z.literal("")),
    videoUrl: z.string().url().optional().or(z.literal("")),
});

const PROPERTY_TYPES = ['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse'];
const AMENITIES_LIST = ['WiFi', 'Pool', 'Parking', 'Gym', 'Restaurant', 'Bar', 'Spa', 'AC', 'TV'];

export default function NewPropertyPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
    const [slug, setSlug] = useState("");

    const form = useForm<z.infer<typeof propertyFormSchema>>({
        resolver: zodResolver(propertyFormSchema),
        defaultValues: {
            type: "hotel",
            starRating: 3,
            totalRooms: 1,
            checkInTime: "14:00",
            checkOutTime: "11:00",
            cancellationPolicy: "moderate",
            childrenAllowed: true,
            petsAllowed: false,
            smokingAllowed: false,
            partiesAllowed: false,
            videoUrl: "",
        } as any,
    });

    const propertyName = form.watch("name");

    useEffect(() => {
        if (propertyName) {
            setSlug(propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [propertyName]);

    const handleAddImage = () => {
        if (imageInput && !images.includes(imageInput)) {
            setImages([...images, imageInput]);
            setImageInput("");
        }
    };

    const toggleAmenity = (amenity: string) => {
        if (selectedAmenities.includes(amenity)) {
            setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
        } else {
            setSelectedAmenities([...selectedAmenities, amenity]);
        }
    };

    async function onSubmit(values: z.infer<typeof propertyFormSchema>) {
        if (images.length === 0) {
            toast({ title: "Images Required", description: "Add at least one image.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...values,
                slug,
                amenities: selectedAmenities,
                location: {
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    country: values.country,
                    postalCode: values.postalCode,
                    coordinates: { lat: 0, lng: 0 },
                },
                policies: {
                    checkInTime: values.checkInTime,
                    checkOutTime: values.checkOutTime,
                    cancellationPolicy: values.cancellationPolicy,
                    childrenAllowed: values.childrenAllowed,
                    petsAllowed: values.petsAllowed,
                    smokingAllowed: values.smokingAllowed,
                    partiesAllowed: values.partiesAllowed,
                },
                contactInfo: {
                    phone: values.phone,
                    email: values.email,
                    website: values.website || undefined,
                },
                images: images.map((url, i) => ({ url, order: i, caption: "" })),
            };

            const response = await fetch('/api/hotels/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create property');

            toast({ title: "Success", description: "Property created successfully!" });
            router.push('/account/my-properties');
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">List a New Property</h1>
                <p className="text-muted-foreground">Add your hotel, apartment, or villa to the platform.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Basic Details */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" /> Basic Details</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Property Name</FormLabel>
                                    <FormControl><Input placeholder="Seaside Resort" {...field} /></FormControl>
                                    <FormDescription>Slug: {slug}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="type" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="starRating" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Star Rating (1-5)</FormLabel>
                                    <FormControl><Input type="number" min="1" max="5" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="description" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Description</FormLabel>
                                    <FormControl><Textarea className="h-32" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Location</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Address</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="postalCode" render={({ field }) => (
                                <FormItem><FormLabel>Postal Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Amenities */}
                    <Card>
                        <CardHeader><CardTitle>Amenities</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {AMENITIES_LIST.map(amenity => (
                                    <div key={amenity} className="flex items-center space-x-2">
                                        <Checkbox id={amenity} checked={selectedAmenities.includes(amenity)} onCheckedChange={() => toggleAmenity(amenity)} />
                                        <label htmlFor={amenity} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{amenity}</label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Policies */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Policies</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="checkInTime" render={({ field }) => (
                                <FormItem><FormLabel>Check-In Time</FormLabel><FormControl><Input {...field} placeholder="14:00" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="checkOutTime" render={({ field }) => (
                                <FormItem><FormLabel>Check-Out Time</FormLabel><FormControl><Input {...field} placeholder="11:00" /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="cancellationPolicy" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Cancellation Policy</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="flexible">Flexible</SelectItem>
                                            <SelectItem value="moderate">Moderate</SelectItem>
                                            <SelectItem value="strict">Strict</SelectItem>
                                            <SelectItem value="non_refundable">Non Refundable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="childrenAllowed" render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>Children Allowed</FormLabel>
                                    </div>
                                </FormItem>
                            )}
                            />
                        </CardContent>
                    </Card>

                    {/* Contact */}
                    <Card>
                        <CardHeader><CardTitle>Contact Info</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="phone" render={({ field }) => (
                                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="email" render={({ field }) => (
                                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="website" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Website (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Video URL (YouTube or TikTok)</FormLabel>
                                    <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                                    <FormDescription>If provided, this video will replace the main image in the social feed.</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader><CardTitle>Images</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input value={imageInput} onChange={(e) => setImageInput(e.target.value)} placeholder="Image URL" />
                                <Button type="button" onClick={handleAddImage} variant="outline"><Upload className="h-4 w-4" /></Button>
                            </div>
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((url, i) => (
                                    <div key={i} className="relative aspect-video bg-muted rounded overflow-hidden group">
                                        <img src={url} className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100"><X className="h-4 w-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Property</Button>
                </form>
            </Form>
        </div>
    );
}
