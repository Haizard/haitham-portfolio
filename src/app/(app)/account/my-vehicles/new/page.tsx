"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { carPropulsionTypes, carTransmissions, carCategories } from '@/lib/cars-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';

// Schema matching the API requirements
const vehicleFormSchema = z.object({
    make: z.string().min(2, "Make must be at least 2 characters"),
    model: z.string().min(1, "Model is required"),
    year: z.string().transform(val => parseInt(val)).pipe(z.number().min(1990).max(new Date().getFullYear() + 1)),
    category: z.string().min(1, "Category is required"),
    transmission: z.string().min(1, "Transmission is required"),
    fuelType: z.string().min(1, "Fuel type is required"),
    seats: z.string().transform(val => parseInt(val)).pipe(z.number().min(2).max(15)),
    doors: z.string().transform(val => parseInt(val)).pipe(z.number().min(2).max(5)),
    luggage: z.string().transform(val => parseInt(val)).pipe(z.number().min(0).max(10)),
    color: z.string().min(2, "Color is required"),
    licensePlate: z.string().min(2, "License plate is required"),
    description: z.string().optional(),

    // Location
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    country: z.string().min(2, "Country is required"),

    // Pricing
    dailyRate: z.string().transform(val => parseFloat(val)).pipe(z.number().positive("Rate must be positive")),
    currency: z.string().default("USD"),
    deposit: z.string().transform(val => parseFloat(val)).pipe(z.number().min(0)),

    // Custom image handling in component, not in form validation directly
});

export default function NewVehiclePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");

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
        } as any,
    });

    const handleAddImage = () => {
        if (imageInput && !images.includes(imageInput)) {
            setImages([...images, imageInput]);
            setImageInput("");
        }
    };

    const removeImage = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
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

        setIsLoading(true);
        try {
            // Construct the payload matching the API expectation
            const payload = {
                ...values,
                location: {
                    address: values.address,
                    city: values.city,
                    state: values.state,
                    country: values.country,
                    coordinates: { lat: 0, lng: 0 }, // Mock coordinates for now
                    pickupInstructions: "Please contact owner for specific pickup location.",
                },
                pricing: {
                    dailyRate: values.dailyRate,
                    currency: values.currency,
                    deposit: values.deposit,
                },
                images: images.map((url, index) => ({
                    url,
                    isPrimary: index === 0,
                    order: index,
                })),
                features: [], // Can be added later
                vin: "UNKNOWN", // Optional in backend schema but might be needed
            };

            const response = await fetch('/api/cars/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create vehicle');
            }

            toast({
                title: "Success",
                description: "Your vehicle has been listed successfully!",
            });

            router.push('/account/my-vehicles');
        } catch (error: any) {
            console.error('Error creating vehicle:', error);
            toast({
                title: "Error",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">List a New Vehicle</h1>
                <p className="text-muted-foreground">
                    Enter the details below to add a new vehicle to your fleet.
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    {/* Vehicle Details */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Vehicle Details</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="make"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Make</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Toyota, Honda, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="model"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Model</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Camry, Civic, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="licensePlate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>License Plate</FormLabel>
                                        <FormControl>
                                            <Input placeholder="ABC-1234" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="economy">Economy</SelectItem>
                                                <SelectItem value="compact">Compact</SelectItem>
                                                <SelectItem value="midsize">Midsize</SelectItem>
                                                <SelectItem value="fullsize">Fullsize</SelectItem>
                                                <SelectItem value="suv">SUV</SelectItem>
                                                <SelectItem value="luxury">Luxury</SelectItem>
                                                <SelectItem value="van">Van</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="transmission"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Transmission</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="automatic">Automatic</SelectItem>
                                                <SelectItem value="manual">Manual</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="fuelType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fuel Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select fuel" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="petrol">Petrol</SelectItem>
                                                <SelectItem value="diesel">Diesel</SelectItem>
                                                <SelectItem value="electric">Electric</SelectItem>
                                                <SelectItem value="hybrid">Hybrid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="color"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Color</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Black, White, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Specs */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Specifications</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-3">
                            <FormField control={form.control} name="seats" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Seats</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="doors" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Doors</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="luggage" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Luggage Bags</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Location */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Location</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="address" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Pickup Address</FormLabel>
                                    <FormControl><Input placeholder="123 Street Name" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="City" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State/Province</FormLabel>
                                    <FormControl><Input placeholder="State" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Country</FormLabel>
                                    <FormControl><Input placeholder="Country" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Pricing */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pricing</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="dailyRate" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Daily Rate</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5">$</span>
                                            <Input type="number" className="pl-7" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="deposit" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Security Deposit</FormLabel>
                                    <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2.5">$</span>
                                            <Input type="number" className="pl-7" {...field} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    {/* Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Images</CardTitle>
                            <CardDescription>Add image URLs for your vehicle. Pro tip: Use public URLs from Unsplash or specialized hosting.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-2">
                                <Input
                                    value={imageInput}
                                    onChange={(e) => setImageInput(e.target.value)}
                                    placeholder="https://example.com/car-image.jpg"
                                />
                                <Button type="button" onClick={handleAddImage} variant="outline">
                                    <Upload className="h-4 w-4 mr-2" />
                                    Add
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {images.map((url, idx) => (
                                    <div key={idx} className="relative group aspect-video bg-muted rounded-md overflow-hidden">
                                        <img src={url} alt={`Vehicle ${idx + 1}`} className="object-cover w-full h-full" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {images.length === 0 && (
                                    <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed rounded-md text-muted-foreground">
                                        No images added yet
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex gap-4 justify-end">
                        <Button variant="outline" type="button" onClick={() => router.back()}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            List Vehicle
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
