"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
import { Loader2, Upload, X, Building, MapPin, Clock, ArrowLeft, Bed } from 'lucide-react';

const propertyFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    type: z.string().min(1, "Property type is required"),
    description: z.string().min(50, "Description must be at least 50 characters"),
    starRating: z.coerce.number().min(1).max(5),
    totalRooms: z.coerce.number().min(1),
    status: z.enum(['active', 'inactive', 'pending_approval']).default('active'),

    // Location
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    country: z.string().min(1, "Country is required"),
    postalCode: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90).default(0),
    lng: z.coerce.number().min(-180).max(180).default(0),

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
});

const PROPERTY_TYPES = ['hotel', 'apartment', 'resort', 'villa', 'hostel', 'guesthouse'];
const AMENITIES_LIST = ['WiFi', 'Pool', 'Parking', 'Gym', 'Restaurant', 'Bar', 'Spa', 'AC', 'TV'];

export default function EditPropertyPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [images, setImages] = useState<{ url: string; order: number; caption: string }[]>([]);
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
            status: "active",
            lat: 0,
            lng: 0,
        } as any,
    });

    const propertyName = form.watch("name");

    useEffect(() => {
        if (propertyName) {
            setSlug(propertyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''));
        }
    }, [propertyName]);

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const response = await fetch(`/api/hotels/properties/${id}`);
                if (!response.ok) throw new Error('Failed to fetch property details');

                const data = await response.json();
                const property = data.property;

                if (!property) throw new Error('Property not found');

                // Populate form
                form.reset({
                    name: property.name,
                    type: property.type,
                    description: property.description,
                    starRating: property.starRating,
                    totalRooms: property.totalRooms,
                    status: property.status || 'active',
                    address: property.location.address,
                    city: property.location.city,
                    state: property.location.state,
                    country: property.location.country,
                    postalCode: property.location.postalCode,
                    lat: property.location.coordinates.lat,
                    lng: property.location.coordinates.lng,
                    checkInTime: property.policies.checkInTime,
                    checkOutTime: property.policies.checkOutTime,
                    cancellationPolicy: property.policies.cancellationPolicy,
                    childrenAllowed: property.policies.childrenAllowed,
                    petsAllowed: property.policies.petsAllowed,
                    smokingAllowed: property.policies.smokingAllowed,
                    partiesAllowed: property.policies.partiesAllowed,
                    phone: property.contactInfo.phone,
                    email: property.contactInfo.email,
                    website: property.contactInfo.website || "",
                });

                setImages(property.images || []);
                setSelectedAmenities(property.amenities || []);
                setSlug(property.slug);

            } catch (error: any) {
                console.error('Error loading property:', error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to load property details",
                    variant: "destructive",
                });
                router.push('/account/my-properties');
            } finally {
                setIsLoading(false);
            }
        };

        fetchProperty();
    }, [id, form, router, toast]);

    const handleAddImage = () => {
        if (imageInput) {
            setImages([...images, { url: imageInput, order: images.length, caption: "" }]);
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

        setIsSaving(true);
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
                    coordinates: { lat: values.lat, lng: values.lng },
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
                images: images.map((img, i) => ({ url: img.url, order: i, caption: img.caption || "" })),
            };

            const response = await fetch(`/api/hotels/properties/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update property');

            toast({ title: "Success", description: "Property updated successfully!" });
            router.push('/account/my-properties');
        } catch (error: any) {
            console.error(error);
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Edit Property</h1>
                        <p className="text-muted-foreground">Manage your property details and availability.</p>
                    </div>
                </div>
                <Button onClick={() => router.push(`/account/my-properties/${id}/rooms`)} variant="outline">
                    <Bed className="mr-2 h-4 w-4" /> Manage Rooms
                </Button>
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
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="active">Active (Visible)</SelectItem>
                                            <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                                            <SelectItem value="pending_approval">Pending Approval</SelectItem>
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
                            <FormField control={form.control} name="totalRooms" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Rooms</FormLabel>
                                    <FormControl><Input type="number" min="1" {...field} /></FormControl>
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
                            <div className="grid grid-cols-2 gap-4 col-span-2">
                                <FormField control={form.control} name="lat" render={({ field }) => (
                                    <FormItem><FormLabel>Latitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="lng" render={({ field }) => (
                                    <FormItem><FormLabel>Longitude</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
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
                            <div className="space-y-4">
                                <FormField control={form.control} name="childrenAllowed" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="leading-none"><FormLabel>Children Allowed</FormLabel></div>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="petsAllowed" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="leading-none"><FormLabel>Pets Allowed</FormLabel></div>
                                    </FormItem>
                                )} />
                            </div>
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
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((img, i) => (
                                    <div key={i} className="relative aspect-video bg-muted rounded overflow-hidden group">
                                        <img src={img.url} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="bg-red-500 text-white p-1 rounded-full"><X className="h-4 w-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={isSaving} className="w-full h-12 text-lg">
                        {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
