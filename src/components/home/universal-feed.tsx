"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hotel,
    MapPin,
    Star,
    Clock,
    Users,
    Car,
    PlaneLanding,
    Compass,
    ArrowRight,
    Loader2,
    Utensils,
    ShoppingBag,
    Briefcase,
    BookOpen,
    UserCheck
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type ServiceType = 'hotel' | 'tour' | 'vehicle' | 'transfer' | 'restaurant' | 'product' | 'job' | 'post' | 'freelancer';

interface FeedItem {
    id: string;
    type: ServiceType;
    title: string;
    description: string;
    image: string;
    price: number;
    currency: string;
    location: string;
    rating?: number;
    reviewCount?: number;
    tags: string[];
    link: string;
}

export default function UniversalFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllServices = async () => {
            try {
                // Fetch in parallel
                const [
                    hotelsRes,
                    toursRes,
                    carsRes,
                    transfersRes,
                    restaurantsRes,
                    productsRes,
                    jobsRes,
                    postsRes,
                    freelancersRes
                ] = await Promise.all([
                    fetch('/api/hotels/properties').then(r => r.json()),
                    fetch('/api/tours').then(r => r.json()),
                    fetch('/api/cars/vehicles').then(r => r.json()),
                    fetch('/api/transfers/vehicles').then(r => r.json()),
                    fetch('/api/restaurants').then(r => r.json()),
                    fetch('/api/products').then(r => r.json()),
                    fetch('/api/jobs').then(r => r.json()),
                    fetch('/api/blog').then(r => r.json()),
                    fetch('/api/freelancers').then(r => r.json())
                ]);

                const hotels: FeedItem[] = (hotelsRes.properties || []).map((h: any) => ({
                    id: h.id,
                    type: 'hotel',
                    title: h.name,
                    description: h.description.substring(0, 100) + '...',
                    image: h.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                    price: 0, // Hotels usually need room lookup, we'll use a placeholder or check rooms
                    currency: 'USD',
                    location: `${h.location.city}, ${h.location.country}`,
                    rating: h.averageRating || 4.5,
                    reviewCount: h.reviewCount || 10,
                    tags: [h.type, ...h.amenities.slice(0, 2)],
                    link: `/hotels/${h.id}`
                }));

                const tours: FeedItem[] = (toursRes.tours || []).map((t: any) => ({
                    id: t.id,
                    type: 'tour',
                    title: t.name,
                    description: t.description.substring(0, 100) + '...',
                    image: t.featuredImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                    price: t.price,
                    currency: 'USD',
                    location: t.location,
                    rating: t.rating || 5,
                    reviewCount: t.reviewCount || 5,
                    tags: ['Tour', t.duration, t.tourType],
                    link: `/tours/${t.slug}`
                }));

                const cars: FeedItem[] = (carsRes.vehicles || []).map((v: any) => ({
                    id: v.id,
                    type: 'vehicle',
                    title: `${v.make} ${v.model}`,
                    description: `Experience the ${v.category} life with this ${v.year} ${v.make}.`,
                    image: v.images.find((i: any) => i.isPrimary)?.url || v.images[0]?.url,
                    price: v.pricing.dailyRate,
                    currency: v.pricing.currency,
                    location: `${v.location.city}, ${v.location.country}`,
                    rating: 4.8,
                    tags: [v.category, v.transmission, v.fuelType],
                    link: `/cars/${v.id}`
                }));

                const transfers: FeedItem[] = (transfersRes.vehicles || []).map((v: any) => ({
                    id: v.id,
                    type: 'transfer',
                    title: `${v.category.toUpperCase()} Transfer`,
                    description: `Reliable ${v.category} transfer in ${v.location.city} with professional driver.`,
                    image: v.images[0]?.url || 'https://images.unsplash.com/photo-1449965072335-64441113239e?w=800',
                    price: v.pricing.basePrice,
                    currency: v.pricing.currency,
                    location: v.location.city,
                    tags: ['Transfer', `${v.capacity.passengers} Pax`, v.location.airport || 'City'],
                    link: `/transfers/${v.id}`
                }));

                const restaurants: FeedItem[] = (Array.isArray(restaurantsRes) ? restaurantsRes : []).map((r: any) => ({
                    id: r.id,
                    type: 'restaurant',
                    title: r.name,
                    description: `Delicious ${r.cuisineTypes.join(', ')} Cuisine at ${r.name}. Check out our deals!`,
                    image: r.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800',
                    price: 0,
                    currency: 'USD',
                    location: r.location,
                    rating: r.rating || 4.2,
                    reviewCount: r.reviewCount || 12,
                    tags: ['Restaurant', ...r.cuisineTypes.slice(0, 2), r.status],
                    link: `/restaurants/${r.id}`
                }));

                const products: FeedItem[] = (Array.isArray(productsRes) ? productsRes : []).map((p: any) => ({
                    id: p.id,
                    type: 'product',
                    title: p.name,
                    description: p.description.substring(0, 100) + '...',
                    image: p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                    price: p.price || 0,
                    currency: 'USD',
                    location: p.vendorName || 'E-store',
                    rating: p.averageRating || 4.0,
                    reviewCount: p.reviewCount || 0,
                    tags: ['Store', p.productType],
                    link: `/products/${p.slug}`
                }));

                const jobs: FeedItem[] = (Array.isArray(jobsRes) ? jobsRes : []).map((j: any) => ({
                    id: j.id,
                    type: 'job',
                    title: j.title,
                    description: j.description.substring(0, 100) + '...',
                    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                    price: j.budgetAmount || 0,
                    currency: 'USD',
                    location: j.clientProfile?.name || 'Client',
                    tags: ['Freelance', j.budgetType, ...j.skillsRequired.slice(0, 1)],
                    link: `/find-work/${j.id}`
                }));

                const posts: FeedItem[] = (Array.isArray(postsRes) ? postsRes : []).map((p: any) => ({
                    id: p.id,
                    type: 'post',
                    title: p.title,
                    description: 'Explore the latest insights and stories from our creative community.',
                    image: p.featuredImageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
                    price: 0,
                    currency: 'FREE',
                    location: `By ${p.author}`,
                    tags: ['Blog', p.originalLanguage || 'English'],
                    link: `/blog/${p.slug}`
                }));

                const freelancers: FeedItem[] = (Array.isArray(freelancersRes) ? freelancersRes : []).map((f: any) => ({
                    id: f.userId,
                    type: 'freelancer',
                    title: f.name,
                    description: f.bio.substring(0, 100) + '...',
                    image: f.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
                    price: f.hourlyRate || 25,
                    currency: 'USD/hr',
                    location: f.occupation,
                    rating: f.averageRating || 4.5,
                    reviewCount: f.reviewCount || 0,
                    tags: ['Freelancer', ...f.skills.slice(0, 2)],
                    link: `/freelancer/${f.userId}`
                }));

                // Combine and shuffle
                const combined = [
                    ...hotels,
                    ...tours,
                    ...cars,
                    ...transfers,
                    ...restaurants,
                    ...products,
                    ...jobs,
                    ...posts,
                    ...freelancers
                ].sort(() => Math.random() - 0.5);

                setItems(combined);
            } catch (error) {
                console.error('Error fetching feed:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllServices();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Curating your experience...</p>
            </div>
        );
    }

    return (
        <section className="py-12 px-4 md:px-0">
            <div className="container mx-auto">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h2 className="text-4xl font-bold tracking-tight mb-2">Explore All Services</h2>
                        <p className="text-muted-foreground text-lg">Handpicked properties, tours, and vehicles just for you.</p>
                    </div>
                    <div className="hidden md:flex gap-2">
                        <Button variant="outline" className="rounded-full">Trending</Button>
                        <Button variant="ghost" className="rounded-full">Latest</Button>
                    </div>
                </div>

                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
                    <AnimatePresence>
                        {items.map((item, index) => (
                            <FeedCard key={`${item.type}-${item.id}`} item={item} index={index} />
                        ))}
                    </AnimatePresence>
                </div>

                <div className="mt-16 text-center">
                    <Button variant="outline" size="lg" className="px-10 rounded-full group">
                        Load More Experiences
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </div>
        </section>
    );
}

function FeedCard({ item, index }: { item: FeedItem; index: number }) {
    const Icon = {
        hotel: Hotel,
        tour: Compass,
        vehicle: Car,
        transfer: PlaneLanding,
        restaurant: Utensils,
        product: ShoppingBag,
        job: Briefcase,
        post: BookOpen,
        freelancer: UserCheck
    }[item.type];

    const typeColor = {
        hotel: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        tour: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
        vehicle: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
        transfer: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        restaurant: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
        product: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-900/20',
        job: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        post: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        freelancer: 'text-teal-500 bg-teal-50 dark:bg-teal-900/20'
    }[item.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="break-inside-avoid"
        >
            <Link href={item.link}>
                <Card className="group overflow-hidden border-none bg-background/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-border/50">
                    <div className="relative overflow-hidden aspect-[4/5] sm:aspect-square md:aspect-auto">
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                        <div className="absolute top-4 left-4 flex gap-2 flex-wrap">
                            <Badge className={`flex items-center gap-1.5 border-none px-3 py-1 ${typeColor}`}>
                                <Icon className="h-3.5 w-3.5" />
                                <span className="capitalize text-[10px] font-bold tracking-wider">{item.type}</span>
                            </Badge>
                        </div>

                        <div className="absolute bottom-4 left-4 right-4">
                            <div className="flex items-center gap-1.5 text-white/90 text-xs mb-1">
                                <MapPin className="h-3 w-3" />
                                {item.location}
                            </div>
                            <h3 className="text-white font-bold text-lg leading-tight line-clamp-2 uppercase tracking-wide">
                                {item.title}
                            </h3>
                        </div>
                    </div>

                    <CardContent className="p-5">
                        <p className="text-muted-foreground text-sm line-clamp-2 mb-4 leading-relaxed">
                            {item.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 mb-5">
                            {item.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="bg-secondary/50 text-[10px] py-0 px-2 font-medium capitalize">
                                    {tag}
                                </Badge>
                            ))}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border/50">
                            <div className="flex items-center gap-1.5">
                                <div className="flex items-center text-yellow-500">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span className="text-sm font-bold ml-1">{item.rating}</span>
                                </div>
                                {item.reviewCount && (
                                    <span className="text-xs text-muted-foreground">({item.reviewCount})</span>
                                )}
                            </div>
                            <div className="text-right">
                                {item.price > 0 ? (
                                    <>
                                        <span className="text-[10px] text-muted-foreground block leading-none mb-0.5">Starting at</span>
                                        <span className="text-lg font-black text-primary">
                                            {item.currency} {item.price}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-sm font-bold text-primary italic">View Details</span>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </Link>
        </motion.div>
    );
}
