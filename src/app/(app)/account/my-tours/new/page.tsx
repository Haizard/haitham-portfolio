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
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, Plus, X, Star, HelpCircle, Map, Lightbulb } from 'lucide-react';

const tourFormSchema = z.object({
    name: z.string().min(3),
    duration: z.string().min(2),
    description: z.string().min(10),
    location: z.string().min(3),
    tourType: z.string().min(3),
    price: z.coerce.number().positive(),
    mapEmbedUrl: z.string().url().optional().or(z.literal("")),
    isActive: z.boolean().default(true),
});

interface HighlightItem {
    text: string;
    icon?: string;
}

interface FaqItem {
    question: string;
    answer: string;
}

interface GalleryItem {
    url: string;
    caption: string;
}

export default function NewTourPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    // Rich Data States
    const [featuredImage, setFeaturedImage] = useState("");
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [galleryInput, setGalleryInput] = useState("");

    const [highlights, setHighlights] = useState<HighlightItem[]>([]);
    const [highlightInput, setHighlightInput] = useState("");

    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [faqQ, setFaqQ] = useState("");
    const [faqA, setFaqA] = useState("");

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
            mapEmbedUrl: ""
        },
    });

    // Helpers
    const addGalleryItem = () => {
        if (galleryInput) {
            setGallery([...gallery, { url: galleryInput, caption: "" }]);
            setGalleryInput("");
        }
    };

    const addHighlight = () => {
        if (highlightInput) {
            setHighlights([...highlights, { text: highlightInput }]);
            setHighlightInput("");
        }
    };

    const addFaq = () => {
        if (faqQ && faqA) {
            setFaqs([...faqs, { question: faqQ, answer: faqA }]);
            setFaqQ("");
            setFaqA("");
        }
    };

    const addItem = (item: string, setItem: (s: string) => void, list: string[], setList: (l: string[]) => void) => {
        if (item && !list.includes(item)) {
            setList([...list, item]);
            setItem("");
        }
    };

    async function onSubmit(values: z.infer<typeof tourFormSchema>) {
        if (!featuredImage) {
            toast({ title: "Featured Image Required", variant: "destructive" });
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
                galleryImages: gallery,
                highlights,
                faqs,
                mapEmbedUrl: values.mapEmbedUrl || undefined
            };

            const response = await fetch('/api/tours', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) throw new Error('Failed to create tour');

            toast({ title: "Success", description: "Tour created successfully!" });
            router.push('/account/my-tours');
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="container max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Create New Tour Package</h1>
                <p className="text-muted-foreground">Design a comprehensive travel experience.</p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                    <div className="grid gap-6 md:grid-cols-2">
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Basic Detail</CardTitle></CardHeader>
                            <CardContent className="grid gap-6 md:grid-cols-2">
                                <FormField control={form.control} name="name" render={({ field }) => (
                                    <FormItem className="col-span-2"><FormLabel>Tour Name</FormLabel><FormControl><Input placeholder="Awesome Safari" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="location" render={({ field }) => (
                                    <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="City, Country" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="tourType" render={({ field }) => (
                                    <FormItem><FormLabel>Type</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="duration" render={({ field }) => (
                                    <FormItem><FormLabel>Duration</FormLabel><FormControl><Input placeholder="5 Days" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="price" render={({ field }) => (
                                    <FormItem><FormLabel>Price USD</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="mapEmbedUrl" render={({ field }) => (
                                    <FormItem><FormLabel>Map Embed URL (Optional)</FormLabel><FormControl><Input placeholder="https://maps.google.com/..." {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem className="col-span-2"><FormLabel>Description</FormLabel><FormControl><Textarea className="h-32" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        {/* Highlights */}
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><Lightbulb className="w-5 h-5" /> Highlights</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-2">
                                    <Input value={highlightInput} onChange={e => setHighlightInput(e.target.value)} placeholder="Add a highlight point..." />
                                    <Button type="button" onClick={addHighlight} size="sm"><Plus className="w-4 h-4" /></Button>
                                </div>
                                <ul className="list-disc pl-5 space-y-1">
                                    {highlights.map((h, i) => (
                                        <li key={i} className="text-sm flex justify-between">
                                            {h.text}
                                            <X className="w-4 h-4 cursor-pointer text-red-500" onClick={() => setHighlights(highlights.filter((_, idx) => idx !== i))} />
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* FAQs */}
                        <Card>
                            <CardHeader><CardTitle className="flex gap-2"><HelpCircle className="w-5 h-5" /> FAQs</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2 border p-3 rounded">
                                    <Input value={faqQ} onChange={e => setFaqQ(e.target.value)} placeholder="Question" className="text-sm" />
                                    <Textarea value={faqA} onChange={e => setFaqA(e.target.value)} placeholder="Answer" className="text-sm h-16" />
                                    <Button type="button" onClick={addFaq} size="sm" variant="secondary" className="w-full">Add FAQ</Button>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {faqs.map((f, i) => (
                                        <div key={i} className="bg-muted p-2 rounded relative group">
                                            <p className="font-semibold text-xs">{f.question}</p>
                                            <p className="text-xs text-muted-foreground">{f.answer}</p>
                                            <X className="w-4 h-4 absolute top-1 right-1 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => setFaqs(faqs.filter((_, idx) => idx !== i))} />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Itinerary */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Itinerary & Logistics</CardTitle></CardHeader>
                            <CardContent className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <FormLabel>Daily Itinerary</FormLabel>
                                    <div className="flex gap-2">
                                        <Textarea value={itineraryInput} onChange={e => setItineraryInput(e.target.value)} placeholder="Day 1 details..." className="h-20" />
                                        <Button type="button" onClick={() => addItem(itineraryInput, setItineraryInput, itinerary, setItinerary)} className="h-20">Add</Button>
                                    </div>
                                    <div className="space-y-2">
                                        {itinerary.map((item, i) => (
                                            <div key={i} className="bg-muted p-2 rounded text-sm relative group">
                                                <span className="font-bold mr-2">Step {i + 1}:</span> {item}
                                                <X className="w-4 h-4 absolute top-1 right-1 cursor-pointer opacity-0 group-hover:opacity-100" onClick={() => setItinerary(itinerary.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <FormLabel>Inclusions</FormLabel>
                                        <div className="flex gap-2 mt-1">
                                            <Input value={inclusionInput} onChange={e => setInclusionInput(e.target.value)} placeholder="Item..." />
                                            <Button type="button" onClick={() => addItem(inclusionInput, setInclusionInput, inclusions, setInclusions)}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {inclusions.map((item, i) => (
                                                <span key={i} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    {item} <X className="w-3 h-3 cursor-pointer" onClick={() => setInclusions(inclusions.filter((_, idx) => idx !== i))} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <FormLabel>Exclusions</FormLabel>
                                        <div className="flex gap-2 mt-1">
                                            <Input value={exclusionInput} onChange={e => setExclusionInput(e.target.value)} placeholder="Item..." />
                                            <Button type="button" onClick={() => addItem(exclusionInput, setExclusionInput, exclusions, setExclusions)}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {exclusions.map((item, i) => (
                                                <span key={i} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    {item} <X className="w-3 h-3 cursor-pointer" onClick={() => setExclusions(exclusions.filter((_, idx) => idx !== i))} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <FormLabel>Tags</FormLabel>
                                        <div className="flex gap-2 mt-1">
                                            <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag..." />
                                            <Button type="button" onClick={() => addItem(tagInput, setTagInput, tags, setTags)}>Add</Button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {tags.map((item, i) => (
                                                <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
                                                    {item} <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter((_, idx) => idx !== i))} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Gallery */}
                        <Card className="col-span-2">
                            <CardHeader><CardTitle>Media Gallery</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-2">
                                    <FormLabel>Featured Image (Cover)</FormLabel>
                                    <Input value={featuredImage} onChange={e => setFeaturedImage(e.target.value)} placeholder="Main Cover Image URL" />
                                    {featuredImage && <img src={featuredImage} className="h-48 object-cover rounded mt-2" />}
                                </div>

                                <div className="space-y-2">
                                    <FormLabel>Gallery Images</FormLabel>
                                    <div className="flex gap-2">
                                        <Input value={galleryInput} onChange={e => setGalleryInput(e.target.value)} placeholder="Additional Image URL" />
                                        <Button type="button" onClick={addGalleryItem}><Upload className="w-4 h-4 mr-2" /> Add</Button>
                                    </div>
                                    <div className="grid grid-cols-4 gap-4 mt-2">
                                        {gallery.map((img, i) => (
                                            <div key={i} className="relative group border rounded p-2">
                                                <img src={img.url} className="w-full h-24 object-cover rounded" />
                                                <Input
                                                    value={img.caption}
                                                    onChange={(e) => {
                                                        const newG = [...gallery];
                                                        newG[i].caption = e.target.value;
                                                        setGallery(newG);
                                                    }}
                                                    placeholder="Caption..."
                                                    className="mt-1 h-6 text-xs"
                                                />
                                                <X className="w-5 h-5 absolute top-0 right-0 bg-white rounded-full cursor-pointer text-red-500 border" onClick={() => setGallery(gallery.filter((_, idx) => idx !== i))} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg">
                        {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        Publish Tour Package
                    </Button>
                </form>
            </Form>
        </div>
    );
}
