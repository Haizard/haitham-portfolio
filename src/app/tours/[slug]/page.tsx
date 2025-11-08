
"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, notFound } from 'next/navigation';
import type { TourPackage, Highlight } from '@/lib/tours-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plane, Clock, DollarSign, Check, X, GalleryHorizontal, CalendarCheck, User, Star, MapPin, ChevronDown, MessageSquare, Heart } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RelatedTours } from '@/components/tours/related-tours';
import { TourBookingCard } from '@/components/tours/tour-booking-card';
import { BookingReviewsList } from '@/components/bookings/booking-reviews-list';
import { PriceAlertButton } from '@/components/price-alerts/price-alert-button';
import * as LucideIcons from 'lucide-react';

const DynamicIcon = ({ name }: { name: string }) => {
    const IconComponent = (LucideIcons as any)[name];
    if (!IconComponent) {
        return <Star className="h-5 w-5 text-amber-500" />;
    }
    return <IconComponent className="h-5 w-5 text-amber-500" />;
};


export default function TourDetailPage() {
    const [tour, setTour] = useState<TourPackage | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();
    const params = useParams<{ slug: string }>();
    const { slug } = params;

    const fetchTour = useCallback(async () => {
        if (!slug) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/tours/${slug}`);
            if (!response.ok) {
                if (response.status === 404) notFound();
                throw new Error("Failed to fetch tour package");
            }
            const data: TourPackage = await response.json();
            setTour(data);
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }, [slug, toast]);

    useEffect(() => {
        fetchTour();
    }, [fetchTour]);

    const imageGallery = useMemo(() => {
        if (!tour) return { mainImage: null, thumbnails: [] };
        const allImages = [
            { url: tour.featuredImageUrl },
             ...(tour.galleryImages || [])
        ];
        return {
            mainImage: allImages[0] || { url: 'https://placehold.co/800x600.png' },
            thumbnails: allImages.slice(1, 4)
        };
    }, [tour]);

    if (isLoading) {
        return (
            <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!tour) {
        notFound();
        return null;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Image Gallery Header */}
            <section className="mb-8 grid grid-cols-2 grid-rows-2 gap-2 h-[50vh] max-h-[500px]">
                <div className="col-span-1 row-span-2 relative rounded-lg overflow-hidden">
                   {imageGallery.mainImage && <Image src={imageGallery.mainImage.url} alt={tour.name} fill className="object-cover" priority data-ai-hint="tour elephant landscape"/>}
                </div>
                {imageGallery.thumbnails[0] && (
                    <div className="col-span-1 row-span-1 relative rounded-lg overflow-hidden">
                       <Image src={imageGallery.thumbnails[0].url} alt={tour.name} fill className="object-cover" data-ai-hint="jeep safari"/>
                    </div>
                )}
                <div className="col-span-1 row-span-1 grid grid-cols-2 gap-2">
                    {imageGallery.thumbnails[1] && (
                         <div className="relative rounded-lg overflow-hidden">
                            <Image src={imageGallery.thumbnails[1].url} alt={tour.name} fill className="object-cover" data-ai-hint="jet ski water"/>
                         </div>
                    )}
                    {imageGallery.thumbnails[2] && (
                        <div className="relative rounded-lg overflow-hidden">
                            <Image src={imageGallery.thumbnails[2].url} alt={tour.name} fill className="object-cover" data-ai-hint="coastal cliff"/>
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Button variant="secondary"><GalleryHorizontal className="mr-2 h-4 w-4"/>Show all photos</Button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                {/* Main Content */}
                <div className="lg:col-span-8 space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold font-headline">{tour.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                            {tour.rating && tour.reviewCount ? (
                                <span className="flex items-center gap-1">
                                    <Star className="h-4 w-4 text-amber-400 fill-amber-400"/>
                                    {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
                                </span>
                            ) : (
                                <span className="text-sm text-muted-foreground">No reviews yet</span>
                            )}
                            <span className="flex items-center gap-1"><MapPin className="h-4 w-4"/> {tour.location}</span>
                        </div>

                        {/* Price Alert Button */}
                        <div className="mt-4">
                            <PriceAlertButton
                                alertType="tour"
                                targetId={tour.id || ''}
                                targetName={tour.name}
                                currentPrice={tour.price || 0}
                                searchCriteria={{
                                    participants: 1,
                                }}
                                variant="outline"
                            />
                        </div>
                    </div>

                    <Separator/>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(tour.highlights || []).map((highlight, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <DynamicIcon name={highlight.icon || 'Star'}/>
                                <span className="text-sm font-medium">{highlight.text}</span>
                            </div>
                        ))}
                    </div>

                    <Separator/>

                    <div>
                        <h2 className="text-2xl font-bold font-headline mb-4">Overview</h2>
                        <p className="text-muted-foreground leading-relaxed">{tour.description}</p>
                    </div>
                    
                    <div>
                        <h2 className="text-2xl font-bold font-headline mb-4">Itinerary</h2>
                        <div className="space-y-6 border-l-2 border-primary/20 pl-6">
                            {tour.itinerary.map((item, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[33px] top-1 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-background">{index + 1}</div>
                                    <h3 className="font-semibold">Day {index+1}</h3>
                                    <p className="text-muted-foreground text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-xl font-bold font-headline mb-3 flex items-center gap-2"><Check className="h-6 w-6 text-green-500"/> What's Included</h3>
                            <ul className="space-y-2 list-inside text-muted-foreground text-sm">
                                {tour.inclusions.map((item, index) => <li key={index} className="flex items-start"><Check className="h-4 w-4 text-green-500 mr-2 mt-1 shrink-0"/>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold font-headline mb-3 flex items-center gap-2"><X className="h-6 w-6 text-red-500"/> What's Excluded</h3>
                            <ul className="space-y-2 list-inside text-muted-foreground text-sm">
                                {tour.exclusions.map((item, index) => <li key={index} className="flex items-start"><X className="h-4 w-4 text-red-500 mr-2 mt-1 shrink-0"/>{item}</li>)}
                            </ul>
                        </div>
                    </div>
                    
                    {tour.faqs && tour.faqs.length > 0 && (
                         <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">FAQs</h2>
                            <Accordion type="single" collapsible className="w-full">
                                {tour.faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>{faq.question}</AccordionTrigger>
                                        <AccordionContent>{faq.answer}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                         </div>
                    )}
                    
                    {tour.mapEmbedUrl && (
                         <div>
                            <h2 className="text-2xl font-bold font-headline mb-4">Map</h2>
                            <div className="aspect-video rounded-lg overflow-hidden border">
                                 <iframe src={tour.mapEmbedUrl} width="100%" height="100%" style={{border:0}} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
                            </div>
                        </div>
                    )}

                </div>
                
                {/* Sticky Sidebar */}
                <aside className="lg:col-span-4">
                    <div className="space-y-6">
                        {/* Booking Card */}
                        <TourBookingCard
                            tourId={tour.id!}
                            tourName={tour.name}
                            basePrice={tour.price}
                            duration={tour.duration}
                        />

                        {/* Tour Guide Card */}
                        {tour.guide && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Tour Guide</CardTitle>
                                </CardHeader>
                                <CardContent className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={tour.guide.avatarUrl || `https://placehold.co/100x100.png?text=${tour.guide.name.split(' ').map(n => n[0]).join('')}`} />
                                        <AvatarFallback>{tour.guide.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{tour.guide.name}</p>
                                        {tour.guide.joinedYear && (
                                            <p className="text-xs text-muted-foreground">Joined in {tour.guide.joinedYear}</p>
                                        )}
                                        {tour.guide.bio && (
                                            <p className="text-xs text-muted-foreground mt-1">{tour.guide.bio}</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </aside>
            </div>

            <Separator className="my-12"/>

            {/* Reviews Section */}
            <div className="mb-12">
                <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
                <BookingReviewsList
                    reviewType="tour"
                    targetId={tour.id!}
                    limit={10}
                />
            </div>

            <Separator className="my-12"/>

            <RelatedTours currentTourSlug={tour.slug} />

        </div>
    );
}
