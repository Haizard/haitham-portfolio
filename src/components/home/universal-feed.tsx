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
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Heart,
    Zap,
    Award,
    TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import { useFormatPrice } from '@/contexts/currency-context';

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

interface FeedSection {
    id: string;
    title: string;
    subtitle?: string;
    type: 'hero' | 'slider' | 'grid' | 'interstitial';
    items?: FeedItem[];
    category?: ServiceType;
}

export default function UniversalFeed() {
    const [sections, setSections] = useState<FeedSection[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);

    const fetchAllServices = async (isInitial = true) => {
        try {
            if (isInitial) setIsLoading(true);
            else setIsFetchingMore(true);

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

            const mapItems = (res: any, type: ServiceType): FeedItem[] => {
                if (!res) return [];
                const list = Array.isArray(res) ? res : (res.properties || res.tours || res.vehicles || []);
                return list.map((item: any) => {
                    if (type === 'hotel') return {
                        id: item.id, type, title: item.name, description: item.description.substring(0, 100) + '...',
                        image: item.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        price: 0, currency: 'USD', location: `${item.location.city}, ${item.location.country}`,
                        rating: item.averageRating || 4.5, reviewCount: item.reviewCount || 10,
                        tags: [item.type, ...item.amenities.slice(0, 2)], link: `/hotels/${item.id}`
                    };
                    if (type === 'tour') return {
                        id: item.id, type, title: item.name, description: item.description.substring(0, 100) + '...',
                        image: item.featuredImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                        price: item.price, currency: 'USD', location: item.location,
                        rating: item.rating || 5, reviewCount: item.reviewCount || 5,
                        tags: ['Tour', item.duration, item.tourType], link: `/tours/${item.slug}`
                    };
                    if (type === 'vehicle') return {
                        id: item.id, type, title: `${item.make} ${item.model}`, description: `Experience the ${item.category} life.`,
                        image: item.images.find((i: any) => i.isPrimary)?.url || item.images[0]?.url,
                        price: item.pricing.dailyRate, currency: item.pricing.currency,
                        location: `${item.location.city}, ${item.location.country}`, rating: 4.8,
                        tags: [item.category, item.transmission, item.fuelType], link: `/cars/${item.id}`
                    };
                    if (type === 'transfer') return {
                        id: item.id, type, title: `${item.category.toUpperCase()} Transfer`, description: `Reliable ${item.category} transfer in ${item.location.city}.`,
                        image: item.images[0]?.url || 'https://images.unsplash.com/photo-1449965072335-64441113239e?w=800',
                        price: item.pricing.basePrice, currency: item.pricing.currency,
                        location: item.location.city, tags: ['Transfer', `${item.capacity.passengers} Pax`], link: `/transfers/${item.id}`
                    };
                    if (type === 'restaurant') return {
                        id: item.id, type, title: item.name, description: `Delicious ${item.cuisineTypes.join(', ')} Cuisine.`,
                        image: item.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800',
                        price: 0, currency: 'USD', location: item.location, rating: item.rating || 4.2,
                        reviewCount: item.reviewCount || 12, tags: ['Restaurant', ...item.cuisineTypes.slice(0, 2)], link: `/restaurants/${item.id}`
                    };
                    if (type === 'product') return {
                        id: item.id, type, title: item.name, description: item.description.substring(0, 100) + '...',
                        image: item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                        price: item.price || 0, currency: 'USD', location: item.vendorName || 'E-store',
                        rating: item.averageRating || 4.0, tags: ['Store', item.productType], link: `/products/${item.slug}`
                    };
                    if (type === 'job') return {
                        id: item.id, type, title: item.title, description: item.description.substring(0, 100) + '...',
                        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
                        price: item.budgetAmount || 0, currency: 'USD', location: item.clientProfile?.name || 'Client',
                        tags: ['Freelance', item.budgetType], link: `/find-work/${item.id}`
                    };
                    if (type === 'post') return {
                        id: item.id, type, title: item.title, description: 'Explore the latest insights from our creative community.',
                        image: item.featuredImageUrl || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
                        price: 0, currency: 'FREE', location: `By ${item.author}`,
                        tags: ['Blog', item.originalLanguage || 'English'], link: `/blog/${item.slug}`
                    };
                    if (type === 'freelancer') return {
                        id: item.userId, type, title: item.name, description: item.bio.substring(0, 100) + '...',
                        image: item.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800',
                        price: item.hourlyRate || 25, currency: 'USD/hr', location: item.occupation,
                        rating: item.averageRating || 4.5, tags: ['Freelancer', ...item.skills.slice(0, 2)], link: `/freelancer/${item.userId}`
                    };
                    return null;
                }).filter(Boolean);
            };

            const allItemsByType = {
                hotel: mapItems(hotelsRes, 'hotel'),
                tour: mapItems(toursRes, 'tour'),
                vehicle: mapItems(carsRes, 'vehicle'),
                transfer: mapItems(transfersRes, 'transfer'),
                restaurant: mapItems(restaurantsRes, 'restaurant'),
                product: mapItems(productsRes, 'product'),
                job: mapItems(jobsRes, 'job'),
                post: mapItems(postsRes, 'post'),
                freelancer: mapItems(freelancersRes, 'freelancer'),
            };

            const builtSections: FeedSection[] = [];

            if (isInitial) {
                // Initial Page Layout
                if (allItemsByType.tour.length > 0) {
                    builtSections.push({
                        id: 'featured-tours',
                        title: 'Adventure Awaits',
                        subtitle: 'Most popular tours and experiences selected for you.',
                        type: 'hero',
                        items: [allItemsByType.tour[0]],
                    });
                }

                if (allItemsByType.freelancer.length > 0) {
                    builtSections.push({
                        id: 'top-freelancers',
                        title: 'Expert Creatives',
                        subtitle: 'Connect with top-rated freelancers and specialists.',
                        type: 'slider',
                        items: allItemsByType.freelancer,
                        category: 'freelancer'
                    });
                }

                builtSections.push({
                    id: 'trending-hotels',
                    title: 'Luxury Stays',
                    subtitle: 'Exquisite hotels for your next comfortable journey.',
                    type: 'grid',
                    items: allItemsByType.hotel.slice(0, 4),
                    category: 'hotel'
                });

                builtSections.push({
                    id: 'community-cta',
                    title: 'Join Our Community',
                    type: 'interstitial',
                });
            } else {
                // More blocks for "Endless Scroll" - Diversify based on page
                const currentPage = page + 1;

                if (currentPage % 2 === 0 && allItemsByType.product.length > 0) {
                    builtSections.push({
                        id: `more-products-${currentPage}`,
                        title: 'Trending Gear',
                        subtitle: 'Most loved products from our global community.',
                        type: 'slider',
                        items: allItemsByType.product.slice(0, 6)
                    });
                }

                if (currentPage % 3 === 0 && allItemsByType.freelancer.length > 0) {
                    builtSections.push({
                        id: `more-freelancers-${currentPage}`,
                        title: 'Top Talent',
                        subtitle: 'Newly joined specialists ready to help.',
                        type: 'slider',
                        items: allItemsByType.freelancer.slice(2, 8)
                    });
                }

                const mixed = [
                    ...allItemsByType.vehicle,
                    ...allItemsByType.transfer,
                    ...allItemsByType.restaurant,
                    ...allItemsByType.job,
                    ...allItemsByType.post,
                    ...allItemsByType.hotel.slice(4),
                    ...allItemsByType.tour.slice(1)
                ].sort(() => Math.random() - 0.5);

                builtSections.push({
                    id: `discovery-grid-${currentPage}`,
                    title: currentPage === 2 ? 'Local Favorites' : 'Keep Exploring',
                    subtitle: 'There is always something new to find.',
                    type: 'grid',
                    items: mixed.slice(0, 8)
                });
            }

            if (isInitial) setSections(builtSections);
            else setSections(prev => [...prev, ...builtSections]);

        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchAllServices();
    }, []);

    const handleLoadMore = () => {
        setPage(prev => prev + 1);
        fetchAllServices(false);
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse font-medium">Curating your customized feed...</p>
            </div>
        );
    }

    return (
        <section className="py-12 px-4 md:px-0 bg-slate-50/50 dark:bg-slate-900/10">
            <div className="container mx-auto">
                <AnimatePresence>
                    {sections.map((section, idx) => (
                        <div key={section.id} className="mb-24 last:mb-0">
                            <SectionHeader title={section.title} subtitle={section.subtitle} type={section.type} />

                            {section.type === 'hero' && section.items && (
                                <FeedHero item={section.items[0]} />
                            )}

                            {section.type === 'slider' && section.items && (
                                <FeedSlider items={section.items} />
                            )}

                            {section.type === 'grid' && section.items && (
                                <FeedGrid items={section.items} />
                            )}

                            {section.type === 'interstitial' && (
                                <InterstitialBlock />
                            )}
                        </div>
                    ))}
                </AnimatePresence>

                <div className="mt-16 text-center">
                    <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        size="lg"
                        className="px-10 rounded-full group h-14 bg-white dark:bg-slate-900 border-2 hover:border-primary transition-all duration-300"
                        disabled={isFetchingMore}
                    >
                        {isFetchingMore ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                Keep Discovering
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </section>
    );
}

function SectionHeader({ title, subtitle, type }: { title: string, subtitle?: string, type: string }) {
    return (
        <div className="flex items-end justify-between mb-8">
            <div className="max-w-2xl px-4 md:px-0">
                <div className="flex items-center gap-2 text-primary font-bold mb-2 uppercase tracking-[0.2em] text-xs">
                    {type === 'slider' ? <TrendingUp className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    <span>{type} Spotlight</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-3 text-slate-900 dark:text-white uppercase leading-none italic">
                    {title}
                </h2>
                {subtitle && <p className="text-slate-500 dark:text-slate-400 text-lg font-medium">{subtitle}</p>}
            </div>
            <div className="hidden md:flex gap-4 mb-2">
                <Button variant="ghost" size="sm" className="rounded-full group hover:text-primary">
                    View All <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-all" />
                </Button>
            </div>
        </div>
    );
}

function FeedHero({ item }: { item: FeedItem }) {
    const formatPrice = useFormatPrice();
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="group relative h-[400px] md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl mx-4 md:mx-0"
        >
            <Link href={item.link}>
                <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                <div className="absolute top-8 left-8">
                    <Badge className="bg-white/20 backdrop-blur-md border-none text-white px-4 py-2 rounded-full font-bold uppercase tracking-widest text-xs">
                        {item.type} of the day
                    </Badge>
                </div>

                <div className="absolute bottom-12 left-8 md:left-12 right-8 md:right-12">
                    <div className="flex items-center gap-2 text-primary font-bold mb-3 uppercase tracking-widest text-sm">
                        <MapPin className="w-4 h-4" />
                        {item.location}
                    </div>
                    <h3 className="text-4xl md:text-7xl font-black text-white mb-4 uppercase leading-none tracking-tighter">
                        {item.title}
                    </h3>
                    <p className="text-lg md:text-xl text-white/70 max-w-2xl font-medium mb-8">
                        {item.description}
                    </p>
                    <div className="flex items-center gap-6">
                        <Button className="h-14 px-10 rounded-full font-bold text-lg shadow-xl shadow-primary/20">
                            Explore Now
                        </Button>
                        <div className="text-white">
                            <span className="text-white/50 text-sm block uppercase tracking-widest font-bold">Starts from</span>
                            <span className="text-3xl font-black">{formatPrice(item.price, item.currency)}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

function FeedSlider({ items }: { items: FeedItem[] }) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <div className="relative group/slider px-4 md:px-0">
            <div className="absolute top-1/2 -left-4 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                <Button onClick={() => scroll('left')} variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-xl bg-white dark:bg-slate-800 border-none">
                    <ChevronLeft className="h-6 w-6" />
                </Button>
            </div>

            <div
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-10"
            >
                {items.map((item, idx) => (
                    <div key={item.id} className="flex-none w-[300px] md:w-[400px]">
                        <FeedCard item={item} index={idx} isCompact />
                    </div>
                ))}
            </div>

            <div className="absolute top-1/2 -right-4 -translate-y-1/2 z-10 opacity-0 group-hover/slider:opacity-100 transition-opacity">
                <Button onClick={() => scroll('right')} variant="secondary" size="icon" className="h-12 w-12 rounded-full shadow-xl bg-white dark:bg-slate-800 border-none">
                    <ChevronRight className="h-6 w-6" />
                </Button>
            </div>
        </div>
    );
}

function FeedGrid({ items }: { items: FeedItem[] }) {
    return (
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6 px-4 md:px-0">
            {items.map((item, idx) => (
                <FeedCard key={item.id} item={item} index={idx} />
            ))}
        </div>
    );
}

function InterstitialBlock() {
    return (
        <motion.div
            whileHover={{ scale: 1.01 }}
            className="bg-indigo-600 rounded-[2.5rem] p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 text-white relative overflow-hidden mx-4 md:mx-0 shadow-2xl shadow-indigo-500/20"
        >
            <div className="absolute top-10 right-10 opacity-10">
                <Heart className="w-64 h-64" />
            </div>

            <div className="relative z-10 max-w-xl text-center md:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.2em] mb-6">
                    <Award className="w-4 h-4" />
                    <span>Partner Program</span>
                </div>
                <h3 className="text-4xl md:text-6xl font-black mb-6 uppercase tracking-tight italic leading-none">
                    Become a Part of our Ecosystem
                </h3>
                <p className="text-indigo-100 text-lg md:text-xl font-medium mb-8">
                    List your services, products, or professional skills and reach thousands of explorers daily.
                </p>
                <Button variant="secondary" size="lg" className="h-14 px-10 rounded-full font-bold text-lg text-indigo-600 bg-white hover:bg-indigo-50">
                    Get Started Today
                </Button>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-2">
                <div className="flex -space-x-4 mb-4">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="w-16 h-16 rounded-full border-4 border-indigo-600 overflow-hidden bg-slate-200">
                            <img src={`https://i.pravatar.cc/100?img=${i + 20}`} alt="user" />
                        </div>
                    ))}
                </div>
                <p className="font-bold text-lg uppercase tracking-widest">Join 500+ professionals</p>
            </div>
        </motion.div>
    );
}

function FeedCard({ item, index, isCompact = false }: { item: FeedItem; index: number, isCompact?: boolean }) {
    const formatPrice = useFormatPrice();
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
            className={cn(
                "break-inside-avoid",
                isCompact ? "" : "mb-6"
            )}
        >
            <Link href={item.link}>
                <Card className="group overflow-hidden border-none bg-background/50 backdrop-blur-sm hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 border border-border/50">
                    <div className={cn(
                        "relative overflow-hidden",
                        isCompact ? "aspect-[16/10]" : "aspect-[4/5] sm:aspect-square md:aspect-auto"
                    )}>
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
                                            {formatPrice(item.price, item.currency)}
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
