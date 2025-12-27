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
    FormMessage,
    FormField
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, X, UserCheck, Banknote } from 'lucide-react';

const transferFormSchema = z.object({
    category: z.string().min(1, "Category is required"),
    make: z.string().min(2, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1990),
    color: z.string().min(2),
    licensePlate: z.string().min(2),
    videoUrl: z.string().url().optional().or(z.literal("")),

    passengers: z.coerce.number().min(1),
    luggage: z.coerce.number().min(0),

    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    airport: z.string().optional(),

    // Pricing
    basePrice: z.coerce.number().min(0),
    pricePerKm: z.coerce.number().min(0),
    pricePerHour: z.coerce.number().min(0),
    currency: z.string().default("USD"),
    airportSurcharge: z.coerce.number().min(0).default(0),
    nightSurcharge: z.coerce.number().min(0).default(0),
    waitingTimeFee: z.coerce.number().min(0).default(0),

    // Driver
    driverName: z.string().min(2, "Driver name is required"),
    driverPhone: z.string().min(5, "Driver phone is required"),
    driverLicense: z.string().min(5, "License number is required"),
    driverExperience: z.coerce.number().min(0),
});

const TRANSFER_CATEGORIES = ['sedan', 'suv', 'van', 'minibus', 'bus', 'luxury'];
const FEATURES_LIST = ['WiFi', 'AC', 'Water', 'Child Seat', 'Wheelchair', 'Meet & Greet', 'Newspaper', 'Tablet'];

export default function NewTransferPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [images, setImages] = useState<string[]>([]);
    const [imageInput, setImageInput] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    const [languages, setLanguages] = useState<string[]>(["English"]);
    const [langInput, setLangInput] = useState("");

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
            airportSurcharge: 10,
            driverExperience: 5,
            videoUrl: "",
        } as any,
    });

    const addLanguage = () => {
        if (langInput && !languages.includes(langInput)) {
            setLanguages([...languages, langInput]);
            setLangInput("");
        }
    };

    const toggleFeature = (feature: string) => {
        if (selectedFeatures.includes(feature)) {
            setSelectedFeatures(selectedFeatures.filter(f => f !== feature));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
    };

    async function onSubmit(values: z.infer<typeof transferFormSchema>) {
        if (images.length === 0) {
            toast({ title: "Image Required", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...values,
                capacity: { passengers: values.passengers, luggage: values.luggage },
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
                    waitingTimeFee: values.waitingTimeFee,
                    nightSurcharge: values.nightSurcharge,
                    airportSurcharge: values.airportSurcharge,
                },
                driverInfo: {
                    name: values.driverName,
                    phone: values.driverPhone,
                    licenseNumber: values.driverLicense,
                    yearsOfExperience: values.driverExperience,
                    languages: languages
                },
                images: images.map((url, i) => ({ url, isPrimary: i === 0, caption: "" })),
            };

            const response = await fetch('/api/transfers/vehicles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to create transfer vehicle');

            toast({ title: "Success", description: "Transfer vehicle listed!" });
            router.push('/account/my-transfers');
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-4xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">New Transfer Vehicle</h1>
                <p className="text-muted-foreground">List a vehicle for airport transfers with driver info.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader><CardTitle>Vehicle</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{TRANSFER_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                                )} />
                                <div className="flex gap-4">
                                    <FormField control={form.control} name="make" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Make</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="model" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Model</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="flex gap-4">
                                    <FormField control={form.control} name="year" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Year</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="licensePlate" render={({ field }) => (<FormItem className="flex-1"><FormLabel>License</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={form.control} name="color" render={({ field }) => (<FormItem><FormLabel>Color</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><UserCheck className="w-5 h-5" /> Driver Info</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="driverName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverLicense" render={({ field }) => (<FormItem><FormLabel>License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverExperience" render={({ field }) => (<FormItem><FormLabel>Experience (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div>
                                    <FormLabel>Languages</FormLabel>
                                    <div className="flex gap-2 mb-2">
                                        <Input value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="Add Language" className="h-8" />
                                        <Button type="button" onClick={addLanguage} size="sm">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {languages.map(l => <span key={l} className="bg-secondary text-xs px-2 py-1 rounded">{l}</span>)}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Section */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle className="flex gap-2"><Banknote className="w-5 h-5" /> Pricing Config</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pricePerKm" render={({ field }) => (<FormItem><FormLabel>Per Km</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pricePerHour" render={({ field }) => (<FormItem><FormLabel>Hourly</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="airportSurcharge" render={({ field }) => (<FormItem><FormLabel>Airport Fee</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="nightSurcharge" render={({ field }) => (<FormItem><FormLabel>Night Fee</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="waitingTimeFee" render={({ field }) => (<FormItem><FormLabel>Waiting Fee (Hour)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        {/* Location & Specs */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Location & Specs</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="airport" render={({ field }) => (<FormItem><FormLabel>Base Airport</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <FormField control={form.control} name="passengers" render={({ field }) => (<FormItem><FormLabel>Pax Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="luggage" render={({ field }) => (<FormItem><FormLabel>Luggage Cap</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Features</FormLabel>
                                        <div className="flex flex-wrap gap-4">
                                            {FEATURES_LIST.map(f => (
                                                <div key={f} className="flex items-center space-x-2">
                                                    <Checkbox id={f} checked={selectedFeatures.includes(f)} onCheckedChange={() => toggleFeature(f)} />
                                                    <label htmlFor={f} className="text-sm">{f}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Image Upload Simplified */}
                                    <div className="space-y-2">
                                        <FormLabel>Images</FormLabel>
                                        <div className="flex gap-2">
                                            <Input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="URL..." />
                                            <Button type="button" onClick={() => { if (imageInput) { setImages([...images, imageInput]); setImageInput(""); } }} size="sm">Add</Button>
                                        </div>
                                        <div className="pt-2">
                                            <FormLabel>Video URL (YouTube or TikTok)</FormLabel>
                                            <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            {images.map((url, i) => <img key={i} src={url} className="w-full h-12 object-cover rounded" />)}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-12">
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Publish Transfer Vehicle
                    </Button>
                </form>
            </Form>
        </div>
    );
}
