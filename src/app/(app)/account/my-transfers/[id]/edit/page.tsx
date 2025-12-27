"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
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
    FormField,
    FormDescription
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
import { Loader2, Upload, X, UserCheck, Banknote, ArrowLeft, MapPin, Car } from 'lucide-react';

const transferFormSchema = z.object({
    category: z.string().min(1, "Category is required"),
    make: z.string().min(2, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z.coerce.number().min(1990),
    color: z.string().min(2),
    licensePlate: z.string().min(2),
    videoUrl: z.string().url().optional().or(z.literal("")),
    status: z.enum(['available', 'in_service', 'maintenance', 'inactive']).default('available'),

    passengers: z.coerce.number().min(1),
    luggage: z.coerce.number().min(0),

    city: z.string().min(2),
    state: z.string().min(2),
    country: z.string().min(2),
    airport: z.string().optional(),
    lat: z.coerce.number().min(-90).max(90).default(0),
    lng: z.coerce.number().min(-180).max(180).default(0),

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

export default function EditTransferPage({ params: paramsPromise }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();
    const [isFetching, setIsFetching] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const [images, setImages] = useState<{ url: string; isPrimary: boolean; caption: string }[]>([]);
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
            status: "available",
            lat: 0,
            lng: 0,
            videoUrl: "",
        } as any,
    });

    useEffect(() => {
        const fetchVehicle = async () => {
            try {
                const response = await fetch(`/api/transfers/vehicles/${id}`);
                const data = await response.json();

                if (!response.ok) throw new Error(data.message || 'Failed to fetch vehicle details');

                const vehicle = data.vehicle;

                form.reset({
                    category: vehicle.category,
                    make: vehicle.make,
                    model: vehicle.model,
                    year: vehicle.year,
                    color: vehicle.color,
                    licensePlate: vehicle.licensePlate,
                    status: vehicle.status || 'available',
                    passengers: vehicle.capacity.passengers,
                    luggage: vehicle.capacity.luggage,
                    city: vehicle.location.city,
                    state: vehicle.location.state,
                    country: vehicle.location.country,
                    airport: vehicle.location.airport || "",
                    lat: vehicle.location.coordinates?.lat || 0,
                    lng: vehicle.location.coordinates?.lng || 0,
                    basePrice: vehicle.pricing.basePrice,
                    pricePerKm: vehicle.pricing.pricePerKm,
                    pricePerHour: vehicle.pricing.pricePerHour,
                    currency: vehicle.pricing.currency,
                    airportSurcharge: vehicle.pricing.airportSurcharge,
                    nightSurcharge: vehicle.pricing.nightSurcharge,
                    waitingTimeFee: vehicle.pricing.waitingTimeFee,
                    driverName: vehicle.driverInfo.name,
                    driverPhone: vehicle.driverInfo.phone,
                    driverLicense: vehicle.driverInfo.licenseNumber,
                    driverExperience: vehicle.driverInfo.yearsOfExperience,
                    videoUrl: vehicle.videoUrl || "",
                });

                setImages(vehicle.images || []);
                setSelectedFeatures(vehicle.features || []);
                setLanguages(vehicle.driverInfo.languages || ["English"]);

            } catch (error: any) {
                console.error('Error loading vehicle:', error);
                toast({
                    title: "Error",
                    description: error.message || "Failed to load vehicle details",
                    variant: "destructive",
                });
                router.push('/account/my-transfers');
            } finally {
                setIsFetching(false);
            }
        };

        fetchVehicle();
    }, [id, form, router, toast]);

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
            toast({ title: "Image Required", variant: "destructive", description: "At least one image is required." });
            return;
        }

        setIsSaving(true);
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
                    coordinates: { lat: values.lat, lng: values.lng }
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
                images: images.map((img, i) => ({ url: img.url, isPrimary: i === 0, caption: img.caption || "" })),
            };

            const response = await fetch(`/api/transfers/vehicles/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to update transfer vehicle');

            toast({ title: "Success", description: "Transfer vehicle updated successfully!" });
            router.push('/account/my-transfers');
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    }

    if (isFetching) {
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
                    <h1 className="text-3xl font-bold mb-2">Edit Transfer Vehicle</h1>
                    <p className="text-muted-foreground">Manage vehicle details and driver information.</p>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Vehicle Configuration */}
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2 items-center"><Car className="h-5 w-5" /> Vehicle</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="category" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>{TRANSFER_CATEGORIES.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
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
                                                <SelectItem value="available">Available (Searchable)</SelectItem>
                                                <SelectItem value="in_service">In Service</SelectItem>
                                                <SelectItem value="maintenance">Maintenance</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
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

                        {/* Driver Info */}
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2 items-center"><UserCheck className="w-5 h-5" /> Driver Info</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <FormField control={form.control} name="driverName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverPhone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverLicense" render={({ field }) => (<FormItem><FormLabel>License Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="driverExperience" render={({ field }) => (<FormItem><FormLabel>Experience (Years)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <div>
                                    <FormLabel>Languages</FormLabel>
                                    <div className="flex gap-2 mb-2">
                                        <Input value={langInput} onChange={e => setLangInput(e.target.value)} placeholder="Add Language" className="h-8" />
                                        <Button type="button" onClick={addLanguage} size="sm" variant="outline">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {languages.map(l => (
                                            <span key={l} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded flex items-center gap-1 border border-primary/20">
                                                {l}
                                                <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setLanguages(languages.filter(lang => lang !== l))} />
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Pricing Configuration */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle className="flex gap-2 items-center"><Banknote className="w-5 h-5" /> Pricing Config</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-3 gap-6">
                                <FormField control={form.control} name="basePrice" render={({ field }) => (<FormItem><FormLabel>Base Price</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pricePerKm" render={({ field }) => (<FormItem><FormLabel>Per Km</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="pricePerHour" render={({ field }) => (<FormItem><FormLabel>Hourly</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="airportSurcharge" render={({ field }) => (<FormItem><FormLabel>Airport Fee</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="nightSurcharge" render={({ field }) => (<FormItem><FormLabel>Night Fee</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={form.control} name="waitingTimeFee" render={({ field }) => (<FormItem><FormLabel>Waiting Fee (Hour)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            </CardContent>
                        </Card>

                        {/* Location & Specifications */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle className="flex gap-2 items-center"><MapPin className="h-5 w-5" /> Location & Specs</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="state" render={({ field }) => (<FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="country" render={({ field }) => (<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="airport" render={({ field }) => (<FormItem><FormLabel>Base Airport</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField control={form.control} name="lat" render={({ field }) => (<FormItem><FormLabel>Lat</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="lng" render={({ field }) => (<FormItem><FormLabel>Lng</FormLabel><FormControl><Input type="number" step="any" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <FormField control={form.control} name="passengers" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Pax Capacity</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                        <FormField control={form.control} name="luggage" render={({ field }) => (<FormItem className="flex-1"><FormLabel>Luggage Cap</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    </div>
                                    <div className="space-y-2">
                                        <FormLabel>Features</FormLabel>
                                        <div className="grid grid-cols-2 gap-2">
                                            {FEATURES_LIST.map(f => (
                                                <div key={f} className="flex items-center space-x-2">
                                                    <Checkbox id={f} checked={selectedFeatures.includes(f)} onCheckedChange={() => toggleFeature(f)} />
                                                    <label htmlFor={f} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">{f}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <FormLabel>Images</FormLabel>
                                        <div className="flex gap-2">
                                            <Input value={imageInput} onChange={e => setImageInput(e.target.value)} placeholder="URL..." />
                                            <Button type="button" onClick={() => { if (imageInput) { setImages([...images, { url: imageInput, isPrimary: images.length === 0, caption: "" }]); setImageInput(""); } }} size="sm" variant="outline">Add</Button>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {images.map((img, i) => (
                                                <div key={i} className="relative aspect-square border rounded overflow-hidden group">
                                                    <img src={img.url} className="w-full h-full object-cover" />
                                                    <button type="button" onClick={() => setImages(images.filter((_, idx) => idx !== i))} className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="pt-4">
                                            <FormLabel>Video URL (YouTube or TikTok)</FormLabel>
                                            <FormField control={form.control} name="videoUrl" render={({ field }) => (
                                                <FormItem>
                                                    <FormControl><Input placeholder="https://www.youtube.com/watch?v=..." {...field} /></FormControl>
                                                    <FormDescription>If provided, this video will replace the primary image in the social feed.</FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )} />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    <Button type="submit" disabled={isSaving} className="w-full h-12 text-lg">
                        {isSaving && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Save Changes
                    </Button>
                </form>
            </Form>
        </div>
    );
}
