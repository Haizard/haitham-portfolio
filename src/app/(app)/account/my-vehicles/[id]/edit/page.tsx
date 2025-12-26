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
import { Loader2, Upload, X, Star, MapPin, Sliders, ArrowLeft } from 'lucide-react';

const vehicleFormSchema = z.object({
    make: z.string().min(2, "Make must be at least 2 characters"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
    category: z.string().min(1, "Category is required"),
    transmission: z.string().min(1, "Transmission is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    seats: z.coerce.number().min(2).max(15),
    doors: z.coerce.number().min(2).max(5),
    luggage: z.coerce.number().min(0).max(10),
    color: z.string().min(2, "Color is required"),
    licensePlate: z.string().min(2, "License plate is required"),
    vin: z.string().optional(),

    // Location
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    country: z.string().min(2, "Country is required"),
    pickupInstructions: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90).default(0),
    lng: z.coerce.number().min(-180).max(180).default(0),

    // Pricing
    dailyRate: z.coerce.number().positive("Rate must be positive"),
    currency: z.string().default("USD"),
    deposit: z.coerce.number().min(0),
    status: z.enum(['available', 'rented', 'maintenance', 'inactive']).default('available'),
});

const CAR_FEATURES = [
    "Air Conditioning", "Bluetooth", "Cruise Control", "Navigation System",
    "Heated Seats", "Sunroof", "Backup Camera", "Parking Sensors",
    "Apple CarPlay", "Android Auto", "Leather Seats", "4WD/AWD",
    "USB Port", "Keyless Entry", "Child Seat Compatible"
];

interface ImageItem {
    url: string;
    caption: string;
    isPrimary: boolean;
}

export default function EditVehiclePage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Extended state
    const [images, setImages] = useState<ImageItem[]>([]);
    const [imageInput, setImageInput] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    const form = useForm<z.infer<typeof vehicleFormSchema>>({
        resolver: zodResolver(vehicleFormSchema),
        defaultValues: {
            year: 2024,
            seats: 5,
            doors: 4,
            luggage: 2,
            currency: "USD",
            dailyRate: 0,
            deposit: 0,
            lat: 0,
            lng: 0,
        } as any,
    });

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await fetch(`/api/cars/vehicles/${id}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle details');

                const data = await response.json();
                const vehicle = data.vehicle;

                if (!vehicle) throw new Error('Vehicle not found');

                // Populate form
                form.reset({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    category: vehicle.category,
                    transmission: vehicle.transmission,
                    fuelType: vehicle.fuelType,
                    seats: vehicle.seats,
                    doors: vehicle.doors,
                    luggage: vehicle.luggage,
                    color: vehicle.color,
                    licensePlate: vehicle.licensePlate,
                    vin: vehicle.vin,
                    address: vehicle.location.address,
                    city: vehicle.location.city,
                    state: vehicle.location.state,
                    country: vehicle.location.country,
                    pickupInstructions: vehicle.location.pickupInstructions,
                    lat: vehicle.location.coordinates.lat,
                    lng: vehicle.location.coordinates.lng,
                    dailyRate: vehicle.pricing.dailyRate,
                    currency: vehicle.pricing.currency,
                    deposit: vehicle.pricing.deposit,
                    status: vehicle.status || 'available',
                });

                setImages(vehicle.images || []);
                setSelectedFeatures(vehicle.features || []);

            } catch (error: any) {
                console.error('Error loading vehicle:', error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to load vehicle details",
                    variant: "destructive",
                });
                router.push('/account/my-vehicles');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVehicle();
    }, [id, form, router, toast]);

    const handleAddImage = () => {
        if (imageInput) {
            setImages([...images, { url: imageInput, caption: "", isPrimary: images.length === 0 }]);
            setImageInput("");
        }
    };

    const updateImageCaption = (index: number, caption: string) => {
        const newImages = [...images];
        newImages[index].caption = caption;
        setImages(newImages);
    };

    const setPrimaryImage = (index: number) => {
        const newImages = images.map((img, i) => ({ ...img, isPrimary: i === index }));
        setImages(newImages);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        if (images[index].isPrimary && newImages.length > 0) {
            newImages[0].isPrimary = true;
        }
        setImages(newImages);
    };

    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    async function onSubmit(values: z.infer<typeof vehicleFormSchema>) {
        if (images.length === 0) {
            toast({
                title: "Images Required",
                description: "Please add at least one image URL for your vehicle.",
                variant: "destructive",
            });
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                ...values,
                features: selectedFeatures,
                location: {
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    country: values.country,
                    coordinates: { lat: values.lat, lng: values.lng },
                    pickupInstructions: values.pickupInstructions,
                },
                pricing: {
                    dailyRate: values.dailyRate,
                    currency: values.currency,
                    deposit: values.deposit,
                },
                images: images.map((img, index) => ({
                    url: img.url,
                    caption: img.caption,
                    isPrimary: img.isPrimary,
                    order: index,
                })),
            };

            const response = await fetch(`/api/cars/vehicles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update vehicle');
            }

            toast({
                title: "Success",
                description: "Vehicle updated successfully!",
            });

            router.push('/account/my-vehicles');
        } catch (error: any) {
            console.error('Error updating vehicle:', error);
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
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
            <div className="mb-8 flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold mb-2">Edit Vehicle</h1>
                    <p className="text-muted-foreground">
                        Update your vehicle details and pricing.
                    </p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Detailed Info */}
                    <Card>
                        <CardHeader><CardTitle>Vehicle Information</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="make" render={({ field }) => (
                                <FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="Toyota" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="Camry" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="status" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Status</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="available">Available</SelectItem>
                                            <SelectItem value="rented">Rented</SelectItem>
                                            <SelectItem value="maintenance">Maintenance</SelectItem>
                                            <SelectItem value="inactive">Inactive</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="year" render={({ field }) => (
                                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="licensePlate" render={({ field }) => (
                                <FormItem><FormLabel>License Plate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="vin" render={({ field }) => (
                                <FormItem><FormLabel>VIN (Optional)</FormLabel><FormControl><Input placeholder="Vehicle Identification Number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {['economy', 'compact', 'midsize', 'fullsize', 'suv', 'luxury', 'van'].map(c =>
                                                <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="transmission" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transmission</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="automatic">Automatic</SelectItem>
                                            <SelectItem value="manual">Manual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="fuelType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Fuel Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="petrol">Petrol</SelectItem>
                                            <SelectItem value="diesel">Diesel</SelectItem>
                                            <SelectItem value="electric">Electric</SelectItem>
                                            <SelectItem value="hybrid">Hybrid</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel>Color</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Features Checklist */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Sliders className="h-5 w-5" /> Features</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {CAR_FEATURES.map(feature => (
                                    <div key={feature} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={feature}
                                            checked={selectedFeatures.includes(feature)}
                                            onCheckedChange={() => toggleFeature(feature)}
                                        />
                                        <label htmlFor={feature} className="text-sm font-medium leading-none cursor-pointer">
                                            {feature}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Specs */}
                    <Card>
                        <CardHeader><CardTitle>Specifications</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-3">
                            <FormField control={form.control} name="seats" render={({ field }) => (
                                <FormItem><FormLabel>Seats</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="doors" render={({ field }) => (
                                <FormItem><FormLabel>Doors</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="luggage" render={({ field }) => (
                                <FormItem><FormLabel>Luggage Bags</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Detailed Location */}
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><MapPin className="h-5 w-5" /> Location</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem><FormLabel>State/Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="pickupInstructions" render={({ field }) => (
                                <FormItem className="col-span-2"><FormLabel>Pickup Instructions</FormLabel><FormControl><Textarea {...field} placeholder="E.g. Call upon arrival..." /></FormControl><FormMessage /></FormItem>
                            )} />
                            {/* Optional Coordinates */}
                            <FormField control={form.control} name="lat" render={({ field }) => (
                                <FormItem><FormLabel>Latitude (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="lng" render={({ field }) => (
                                <FormItem><FormLabel>Longitude (Optional)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader><CardTitle>Pricing</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="dailyRate" render={({ field }) => (
                                <FormItem><FormLabel>Daily Rate ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="deposit" render={({ field }) => (
                                <FormItem><FormLabel>Security Deposit ($)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Advanced Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Gallery</CardTitle>
                            <CardDescription>Add high-quality images. Select the star to mark as cover image.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    placeholder="https://example.com/image.jpg"
                                />
                                <Button type="button" onClick={handleAddImage} variant="outline">
                                    <Upload className="h-4 w-4 mr-2" /> Add
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="border rounded-lg overflow-hidden bg-muted">
                                        <div className="relative aspect-video">
                                            <img src={img.url} alt={`Vehicle ${idx}`} className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setPrimaryImage(idx)}
                                                className={`absolute bottom-1 right-1 p-1 rounded-full ${img.isPrimary ? 'bg-yellow-400 text-white' : 'bg-black/50 text-white hover:bg-yellow-400'}`}
                                            >
                                                <Star className={`h-4 w-4 ${img.isPrimary ? 'fill-current' : ''}`} />
                                            </button>
                                        </div>
                                        <div className="p-2">
                                            <Input
                                                placeholder="Caption (e.g. Interior view)"
                                                value={img.caption || ""}
                                                onChange={(e) => updateImageCaption(idx, e.target.value)}
                                                className="text-xs h-8"
                                            />
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
