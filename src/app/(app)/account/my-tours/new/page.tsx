"use client";

import { useState } from 'react';
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
import { Loader2, Upload, Plus, X, Map, Calendar, DollarSign } from 'lucide-react';

const tourFormSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    duration: z.string().min(2, "Duration is required (e.g. 3 Days)"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    location: z.string().min(3, "Location is required"),
    tourType: z.string().min(3, "Tour type is required"),
    price: z.coerce.number().positive("Price must be positive"),
    isActive: z.boolean().default(true),
});

export default function NewTourPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [featuredImage, setFeaturedImage] = useState("");

    // Lists
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const [itinerary, setItinerary] = useState<string[]>([]);
    const [itineraryInput, setItineraryInput] = useState("");

    const [inclusions, setInclusions] = useState<string[]>([]);
    const [inclusionInput, setInclusionInput] = useState("");

    const [exclusions, setExclusions] = useState<string[]>([]);
    const [exclusionInput, setExclusionInput] = useState("");

    const form = useForm<z.infer<typeof tourFormSchema>>({
        resolver: zodResolver(tourFormSchema),
        defaultValues: {
            tourType: "Adventure",
            price: 0,
            isActive: true,
        },
    });

    const addItem = (item: string, setItem: (s: string) => void, list: string[], setList: (l: string[]) => void) => {
        if (item && !list.includes(item)) {
            setList([...list, item]);
            setItem("");
        }
    };

    const removeItem = (index: number, list: string[], setList: (l: string[]) => void) => {
        setList(list.filter((_, i) => i !== index));
    };

    async function onSubmit(values: z.infer<typeof tourFormSchema>) {
        if (!featuredImage) {
            toast({ title: "Image Required", description: "Please add a featured image URL.", variant: "destructive" });
            return;
        }
        if (itinerary.length === 0) {
            toast({ title: "Itinerary Required", description: "Please add at least one itinerary item.", variant: "destructive" });
            return;
        }

        setIsLoading(true);
        try {
            const payload = {
                ...values,
                tags,
                itinerary,
                inclusions,
                exclusions,
                featuredImageUrl: featuredImage,
                galleryImages: [], // Simplified for now
                highlights: [],
                faqs: []
            };

            const response = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to create tour');

            toast({ title: "Success", description: "Tour created successfully!" });
            router.push('/account/my-tours');
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
                <h1 className="text-3xl font-bold mb-2">Create a New Tour</h1>
                <p className="text-muted-foreground">Design an unforgettable experience for travelers.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <Card>
                        <CardHeader><CardTitle>Tour Details</CardTitle></CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem className="col-span-2">
                                    <FormLabel>Tour Name</FormLabel>
                                    <FormControl><Input placeholder="Safari Adventure" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="location" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Location</FormLabel>
                                    <FormControl><Input placeholder="Nairobi, Kenya" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="tourType" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl><Input placeholder="Adventure, Cultural, etc." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="duration" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Duration</FormLabel>
                                    <FormControl><Input placeholder="3 Days" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Price (USD)</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
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
                        </CardContent>
                    </Card>

                    {/* Itinerary */}
                    <Card>
                        <CardHeader><CardTitle>Itinerary & Details</CardTitle></CardHeader>
                        <CardContent className="space-y-6">

                            {/* Itinerary List */}
                            <div className="space-y-2">
                                <FormLabel>Itinerary Items (Day-by-Day)</FormLabel>
                                <div className="flex gap-2">
                                    <Input value={itineraryInput} onChange={(e) => setItineraryInput(e.target.value)} placeholder="Day 1: Arrival..." />
                                    <Button type="button" onClick={() => addItem(itineraryInput, setItineraryInput, itinerary, setItinerary)} variant="outline">Add</Button>
                                </div>
                                <div className="space-y-1">
                                    {itinerary.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center bg-muted p-2 rounded text-sm">
                                            <span>{item}</span>
                                            <button type="button" onClick={() => removeItem(i, itinerary, setItinerary)}><X className="h-4 w-4" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Inclusions */}
                            <div className="space-y-2">
                                <FormLabel>Inclusions (What's included)</FormLabel>
                                <div className="flex gap-2">
                                    <Input value={inclusionInput} onChange={(e) => setInclusionInput(e.target.value)} placeholder="Airport Transfer" />
                                    <Button type="button" onClick={() => addItem(inclusionInput, setInclusionInput, inclusions, setInclusions)} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {inclusions.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                            {item}
                                            <button type="button" onClick={() => removeItem(i, inclusions, setInclusions)}><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Exclusions */}
                            <div className="space-y-2">
                                <FormLabel>Exclusions (What's NOT included)</FormLabel>
                                <div className="flex gap-2">
                                    <Input value={exclusionInput} onChange={(e) => setExclusionInput(e.target.value)} placeholder="Flights" />
                                    <Button type="button" onClick={() => addItem(exclusionInput, setExclusionInput, exclusions, setExclusions)} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {exclusions.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                            {item}
                                            <button type="button" onClick={() => removeItem(i, exclusions, setExclusions)}><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <FormLabel>Tags</FormLabel>
                                <div className="flex gap-2">
                                    <Input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Beach, Safari..." />
                                    <Button type="button" onClick={() => addItem(tagInput, setTagInput, tags, setTags)} variant="outline">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {tags.map((item, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                            {item}
                                            <button type="button" onClick={() => removeItem(i, tags, setTags)}><X className="h-3 w-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </CardContent>
                    </Card>

                    {/* Media */}
                    <Card>
                        <CardHeader><CardTitle>Featured Image</CardTitle></CardHeader>
                        <CardContent>
                            <div className="flex gap-2 mb-4">
                                <Input value={featuredImage} onChange={(e) => setFeaturedImage(e.target.value)} placeholder="Featured Image URL" />
                            </div>
                            {featuredImage && (
                                <div className="aspect-video bg-muted rounded overflow-hidden">
                                    <img src={featuredImage} className="w-full h-full object-cover" />
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button type="submit" disabled={isLoading} className="w-full">{isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Tour</Button>
                </form>
            </Form>
        </div>
    );
}
