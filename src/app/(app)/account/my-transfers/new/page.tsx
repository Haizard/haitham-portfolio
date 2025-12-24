"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Form,
    FormControl,
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
import { Loader2, Upload, X, Plane, Car, User, DollarSign } from 'lucide-react';

const transferFormSchema = z.object({
    category: z.string().min(1, "Category is required"),
    make: z.string().min(2, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1990),
    color: z.string().min(2),
    licensePlate: z.string().min(2),

    // Capacity
    passengers: z.coerce.number().min(1),
    luggage: z.coerce.number().min(0),

    // Location
    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    airport: z.string().optional(),

    // Pricing
    basePrice: z.coerce.number().min(0),
    pricePerKm: z.coerce.number().min(0),
    pricePerHour: z.coerce.number().min(0),
    currency: z.string().default("USD"),
});

const TRANSFER_CATEGORIES = ['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury'];
const FEATURES_LIST = ['WiFi', 'AC', 'Water', 'Child Seat', 'Wheelchair', 'Meet & Greet'];

export default function NewTransferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [featureInput, setFeatureInput] = useState("");

    const form = useForm<z.infer<typeof transferFormSchema>>({
        resolver: zodResolver(transferFormSchema),
        defaultValues: {
            category: "sedan",
            year: 2024,
            passengers: 4,
            luggage: 2,
            basePrice: 50,
            pricePerKm: 2,
            pricePerHour: 30,
            currency: "USD",
        } as any,
    });

    const handleAddImage = () => {
        if (imageInput && !images.includes(imageInput)) {
            setImages([...images, imageInput]);
            setImageInput("");
        }
    };

    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    const addCustomFeature = () => {
        if (featureInput && !selectedFeatures.includes(featureInput)) {
            setSelectedFeatures([...selectedFeatures, featureInput]);
            setFeatureInput("");
        }
    };

    async function onSubmit(values: z.infer<typeof transferFormSchema>) {
        if (images.length === 0) {
            toast({ title: "Image Required", description: "Please add at least one image.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...values,
                capacity: {
                    passengers: values.passengers,
                    luggage: values.luggage,
                },
                features: selectedFeatures,
                location: {
                    city: values.city,
                    state: values.state,
                    country: values.country,
                    airport: values.airport || undefined,
                    coordinates: { lat: 0, lng: 0 }
                },
                pricing: {
                    basePrice: values.basePrice,
                    pricePerKm: values.pricePerKm,
                    pricePerHour: values.pricePerHour,
                    currency: values.currency,
                    waitingTimeFee: 0,
                    nightSurcharge: 0,
                    airportSurcharge: 0,
                },
                images: images.map((url, i) => ({ url, isPrimary: i === 0, caption: "" })),
                // minimal driver info mock if required by strict schema, else optional
            };

            const response = await fetch('/api/transfers/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create transfer vehicle');

            toast({ title: "Success", description: "Transfer vehicle listed!" });
            router.push('/account/my-transfers');
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
                <h1 className="text-3xl font-bold mb-2">New Transfer Vehicle</h1>
                <p className="text-muted-foreground">List a vehicle for airport transfers and city rides.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Car className="h-5 w-5" /> Vehicle Info</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="category" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Category</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {TRANSFER_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="make" render={({ field }) => (
                                <FormItem><FormLabel>Make</FormLabel><FormControl><Input placeholder="Mercedes" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="model" render={({ field }) => (
                                <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="V-Class" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="year" render={({ field }) => (
                                <FormItem><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="color" render={({ field }) => (
                                <FormItem><FormLabel>Color</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="licensePlate" render={({ field }) => (
                                <FormItem><FormLabel>License Plate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" /> Capacity & Features</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="passengers" render={({ field }) => (
                                <FormItem><FormLabel>Passengers</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="luggage" render={({ field }) => (
                                <FormItem><FormLabel>Luggage Bags</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />

                            <div className="col-span-2 space-y-2">
                                <FormLabel>Features</FormLabel>
                                <div className="flex flex-wrap gap-4">
                                    {FEATURES_LIST.map(feature => (
                                        <div key={feature} className="flex items-center space-x-2">
                                            <Checkbox id={feature} checked={selectedFeatures.includes(feature)} onCheckedChange={() => toggleFeature(feature)} />
                                            <label htmlFor={feature} className="text-sm font-medium leading-none">{feature}</label>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2 mt-2">
                                    <Input value={featureInput} onChange={(e) => setFeatureInput(e.target.value)} placeholder="Add custom feature..." />
                                    <Button type="button" onClick={addCustomFeature} variant="outline" size="sm">Add</Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Map className="h-5 w-5" /> Base Location</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="city" render={({ field }) => (
                                <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="airport" render={({ field }) => (
                                <FormItem><FormLabel>Airport Code (Optional)</FormLabel><FormControl><Input placeholder="Jfk" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="country" render={({ field }) => (
                                <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="state" render={({ field }) => (
                                <FormItem><FormLabel>State/Province</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Pricing</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-3">
                            <FormField control={form.control} name="basePrice" render={({ field }) => (
                                <FormItem><FormLabel>Base Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="pricePerKm" render={({ field }) => (
                                <FormItem><FormLabel>Price / Km</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="pricePerHour" render={({ field }) => (
                                <FormItem><FormLabel>Hourly Rate</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </CardContent>
                    </Card>

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

                    <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}List Vehicle</Button>
                </form>
            </Form>
        </div>
    );
}
