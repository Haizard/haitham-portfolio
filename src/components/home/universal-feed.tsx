"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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
    TrendingUp,
    Share2,
    MessageCircle,
    Bookmark,
    MoreHorizontal
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
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
    author?: {
        name: string;
        avatar: string;
    };
}

const CATEGORIES = [
    { id: 'all', name: 'For You', icon: Zap, color: 'bg-primary' },
    { id: 'hotels', name: 'Hotels', icon: Hotel, color: 'bg-blue-600' },
    { id: 'tours', name: 'Tours', icon: Compass, color: 'bg-orange-600' },
    { id: 'cars', name: 'Cars', icon: Car, color: 'bg-purple-600' },
    { id: 'transfers', name: 'Transfers', icon: PlaneLanding, color: 'bg-emerald-600' },
    { id: 'restaurants', name: 'Dining', icon: Utensils, color: 'bg-rose-600' },
    { id: 'products', name: 'Shop', icon: ShoppingBag, color: 'bg-cyan-600' },
    { id: 'freelancers', name: 'Talent', icon: UserCheck, color: 'bg-indigo-600' },
];

export default function UniversalFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const observer = useRef<IntersectionObserver | null>(null);

    const lastItemRef = useCallback((node: HTMLDivElement) => {
        if (isLoading || isFetchingMore) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isLoading, isFetchingMore]);

    const fetchItems = async (isInitial = true) => {
        try {
            if (isInitial) setIsLoading(true);
            else setIsFetchingMore(true);

            // In a real app, this would be a single paginated API call
            // For now, we fetch from various endpoints and mix them
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
                    const baseItem = {
                        id: item.id || item.userId || Math.random().toString(),
                        type,
                        title: item.name || item.title || 'Untitled',
                        location: item.location?.city ? `${item.location.city}, ${item.location.country}` : (item.location || 'Global'),
                        rating: item.averageRating || item.rating || 4.5,
                        reviewCount: item.reviewCount || 12,
                        author: {
                            name: item.vendorName || item.author || 'Creator',
                            avatar: `https://i.pravatar.cc/150?u=${item.id || item.userId}`
                        }
                    };

                    if (type === 'hotel') return {
                        ...baseItem,
                        description: item.description,
                        image: item.images[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        price: 0, currency: 'USD', tags: [item.type, ...item.amenities.slice(0, 2)], link: `/hotels/${item.id}`
                    };
                    if (type === 'tour') return {
                        ...baseItem,
                        description: item.description,
                        image: item.featuredImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                        price: item.price, currency: 'USD', tags: [item.duration, item.tourType], link: `/tours/${item.slug}`
                    };
                    if (type === 'vehicle') return {
                        ...baseItem,
                        title: `${item.make} ${item.model}`,
                        description: `Luxury ${item.category} available for rent. ${item.transmission} transmission.`,
                        image: item.images.find((i: any) => i.isPrimary)?.url || item.images[0]?.url,
                        price: item.pricing.dailyRate, currency: item.pricing.currency,
                        tags: [item.category, item.transmission], link: `/cars/${item.id}`
                    };
                    if (type === 'transfer') return {
                        ...baseItem,
                        title: `${item.category.toUpperCase()} Transfer`,
                        description: `Professional transfer service in ${item.location.city}.`,
                        image: item.images[0]?.url || 'https://images.unsplash.com/photo-1449965072335-64441113239e?w=800',
                        price: item.pricing.basePrice, currency: item.pricing.currency,
                        tags: ['Transfer', `${item.capacity.passengers} Pax`], link: `/transfers/${item.id}`
                    }
                    if (type === 'restaurant') return {
                        ...baseItem,
                        description: `Experience the finest ${item.cuisineTypes.join(', ')} in the city.`,
                        image: item.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800',
                        price: 0, currency: 'USD', tags: item.cuisineTypes.slice(0, 2), link: `/restaurants/${item.id}`
                    };
                    if (type === 'product') return {
                        ...baseItem,
                        description: item.description,
                        image: item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                        price: item.price || 0, currency: 'USD', tags: [item.productType], link: `/products/${item.slug}`
                    };
                    return null;
                }).filter(Boolean);
            };

            const allFetched = [
                ...mapItems(hotelsRes, 'hotel'),
                ...mapItems(toursRes, 'tour'),
                ...mapItems(carsRes, 'vehicle'),
                ...mapItems(transfersRes, 'transfer'),
                ...mapItems(restaurantsRes, 'restaurant'),
                ...mapItems(productsRes, 'product'),
            ].sort(() => Math.random() - 0.5);

            setItems(prev => isInitial ? allFetched : [...prev, ...allFetched]);

        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        fetchItems(true);
    }, [activeCategory]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(false);
        }
    }, [page]);

    return (
        <div className="max-w-2xl mx-auto pb-20">
            {/* Stories/Categories Bar */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/50 py-4 px-4 mb-6">
                <div className="flex gap-4 overflow-x-auto no-scrollbar">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="flex flex-col items-center gap-1.5 flex-none group"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-full p-0.5 border-2 transition-all duration-300",
                                activeCategory === cat.id ? "border-primary" : "border-border group-hover:border-primary/50"
                            )}>
                                <div className={cn(
                                    "w-full h-full rounded-full flex items-center justify-center text-white",
                                    cat.color || "bg-slate-200"
                                )}>
                                    <cat.icon className="w-7 h-7" />
                                </div>
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-wider transition-colors",
                                activeCategory === cat.id ? "text-primary" : "text-muted-foreground"
                            )}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed Container */}
            <div className="space-y-8 px-4 md:px-0">
                <AnimatePresence>
                    {items.map((item, idx) => (
                        <motion.div
                            key={`${item.id}-${idx}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            ref={idx === items.length - 1 ? lastItemRef : null}
                        >
                            <SocialCard item={item} />
                        </motion.div>
                    ))}
                </AnimatePresence>

                {(isLoading || isFetchingMore) && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                            Discovering more magic...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SocialCard({ item }: { item: FeedItem }) {
    const formatPrice = useFormatPrice();
    const [isLiked, setIsLiked] = useState(false);
    const [isSaved, setIsSaved] = useState(false);

    return (
        <div className="bg-background border border-border/50 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-slate-100">
                        <img src={item.author?.avatar} alt={item.author?.name} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-sm">{item.author?.name}</span>
                            <Badge variant="secondary" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter bg-primary/10 text-primary border-none">
                                {item.type}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-medium">
                            <MapPin className="w-3 h-3" />
                            {item.location}
                        </div>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <MoreHorizontal className="w-5 h-5" />
                </Button>
            </div>

            {/* Media */}
            <Link href={item.link} className="block relative aspect-[4/5] overflow-hidden group">
                <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {item.price > 0 && (
                    <div className="absolute top-4 right-4 z-10">
                        <Badge className="bg-black/40 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-xl font-black text-xs">
                            Starts {formatPrice(item.price, item.currency)}
                        </Badge>
                    </div>
                )}

                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
                    <h3 className="text-white text-2xl font-black uppercase tracking-tight leading-none mb-1">
                        {item.title}
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-bold ml-1 text-white">{item.rating}</span>
                        </div>
                        <span className="text-white/60 text-[10px] uppercase font-bold tracking-widest">
                            {item.reviewCount} reviews
                        </span>
                    </div>
                </div>
            </Link>

            {/* Action Bar */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={cn("transition-colors", isLiked ? "text-rose-500" : "text-slate-900 dark:text-white")}
                    >
                        <Heart className={cn("w-7 h-7", isLiked && "fill-current")} />
                    </button>
                    <button className="text-slate-900 dark:text-white">
                        <MessageCircle className="w-7 h-7" />
                    </button>
                    <button className="text-slate-900 dark:text-white">
                        <Share2 className="w-7 h-7" />
                    </button>
                </div>
                <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={cn("transition-colors", isSaved ? "text-primary" : "text-slate-900 dark:text-white")}
                >
                    <Bookmark className={cn("w-7 h-7", isSaved && "fill-current")} />
                </button>
            </div>

            {/* Caption Area */}
            <div className="px-4 pb-4">
                <div className="flex items-center gap-2 mb-2">
                    {item.tags.map(tag => (
                        <span key={tag} className="text-[10px] font-bold text-primary uppercase tracking-widest">
                            #{tag.replace(/\s+/g, '')}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    <span className="font-bold text-foreground mr-1 uppercase">{item.author?.name}</span>
                    {item.description}
                </p>
                <Link href={item.link} className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 block hover:text-primary transition-colors">
                    View full details
                </Link>
            </div>
        </div>
    );
}
