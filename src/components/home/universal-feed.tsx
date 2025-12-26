"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Hotel,
    MapPin,
    Star,
    Car,
    PlaneLanding,
    Compass,
    Loader2,
    Utensils,
    ShoppingBag,
    UserCheck,
    Heart,
    Zap,
    MessageCircle,
    Send,
    MoreHorizontal,
    Camera,
    Search,
    Mail,
    Plus,
    Bookmark
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    author: {
        name: string;
        avatar: string;
        location?: string;
    };
    likedBy: string[];
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

            // Fetching from API
            const [
                hotelsRes,
                toursRes,
                carsRes,
                transfersRes,
                restaurantsRes,
                productsRes,
            ] = await Promise.all([
                fetch('/api/hotels/properties').then(r => r.json()),
                fetch('/api/tours').then(r => r.json()),
                fetch('/api/cars/vehicles').then(r => r.json()),
                fetch('/api/transfers/vehicles').then(r => r.json()),
                fetch('/api/restaurants').then(r => r.json()),
                fetch('/api/products').then(r => r.json()),
            ]);

            const mapItems = (res: any, type: ServiceType): FeedItem[] => {
                if (!res) return [];
                const list = Array.isArray(res) ? res : (res.properties || res.tours || res.vehicles || []);
                return list.map((item: any) => {
                    const baseItem = {
                        id: item.id || Math.random().toString(),
                        type,
                        title: item.name || item.title || 'Untitled',
                        location: item.location?.city ? `${item.location.city}, ${item.location.country}` : (item.location || 'Global'),
                        rating: item.averageRating || item.rating || 4.5,
                        reviewCount: item.reviewCount || 12,
                        author: {
                            name: item.vendorName || item.author || 'Creator',
                            avatar: `https://i.pravatar.cc/150?u=${item.id || item.userId}`,
                            location: item.location?.city || 'Global'
                        },
                        likedBy: ['Pamela', 'Hayes', 'Adams']
                    };

                    if (type === 'hotel') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        price: 0, currency: 'USD', tags: [item.type || 'Hotel', ...(item.amenities || []).slice(0, 2)], link: `/hotels/${item.id}`
                    };
                    if (type === 'tour') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.featuredImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                        price: item.price || 0, currency: 'USD', tags: [item.duration || 'Day Trip', item.tourType || 'Leisure'], link: `/tours/${item.slug}`
                    };
                    if (type === 'vehicle') return {
                        ...baseItem,
                        title: `${item.make || 'Luxury'} ${item.model || 'Vehicle'}`,
                        description: item.description || `Luxury ${item.category || 'car'} available for rent.`,
                        image: item.images?.find((i: any) => i.isPrimary)?.url || item.images?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
                        price: item.pricing?.dailyRate || 0, currency: item.pricing?.currency || 'USD',
                        tags: [item.category || 'Car', item.transmission || 'Auto'], link: `/cars/${item.id}`
                    };
                    if (type === 'transfer') return {
                        ...baseItem,
                        title: `${item.category?.toUpperCase() || 'Luxury'} Transfer`,
                        description: item.description || `Professional transfer service.`,
                        image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1449965072335-64441113239e?w=800',
                        price: item.pricing?.basePrice || 0, currency: item.pricing?.currency || 'USD',
                        tags: ['Transfer', `${item.capacity?.passengers || 4} Pax`], link: `/transfers/${item.id}`
                    }
                    if (type === 'restaurant') return {
                        ...baseItem,
                        description: item.description || `Experience the finest ${item.cuisineTypes?.join(', ') || 'Dining'} in the city.`,
                        image: item.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800',
                        price: 0, currency: 'USD', tags: item.cuisineTypes?.slice(0, 2) || ['Dining'], link: `/restaurants/${item.id}`
                    };
                    if (type === 'product') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                        price: item.price || 0, currency: 'USD', tags: [item.productType || item.status || 'Shop'], link: `/products/${item.slug}`
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
        <div className="max-w-7xl mx-auto pb-20 bg-background min-h-screen">
            {/* Discover Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex gap-4">
                        <Camera className="w-6 h-6 text-slate-700" />
                        <Search className="w-6 h-6 text-slate-700" />
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">Discover</h1>
                    <Mail className="w-6 h-6 text-slate-700" />
                </div>
            </header>

            {/* Stories Bar */}
            <div className="bg-background border-b border-border/40">
                <div className="max-w-5xl mx-auto py-6 px-6 overflow-x-auto no-scrollbar flex gap-6">
                    {/* My Story / Plus */}
                    <div className="flex flex-col items-center gap-2 flex-none">
                        <div className="w-16 h-16 rounded-3xl border-2 border-dashed border-border flex items-center justify-center bg-slate-50 relative">
                            <Plus className="w-8 h-8 text-border" />
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Post</span>
                    </div>

                    {CATEGORIES.filter(c => c.id !== 'all').map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className="flex flex-col items-center gap-2 flex-none group"
                        >
                            <div className={cn(
                                "w-16 h-16 rounded-3xl p-0.5 border-2 transition-all duration-300",
                                activeCategory === cat.id ? "border-primary shadow-lg shadow-primary/10" : "border-border group-hover:border-primary/50"
                            )}>
                                <div className={cn(
                                    "w-full h-full rounded-[1.25rem] flex items-center justify-center text-white",
                                    cat.color || "bg-slate-200"
                                )}>
                                    <cat.icon className="w-8 h-8" />
                                </div>
                            </div>
                            <span className={cn(
                                "text-[10px] font-bold uppercase tracking-widest transition-colors",
                                activeCategory === cat.id ? "text-primary font-black" : "text-slate-500"
                            )}>
                                {cat.name}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Feed List - Optimized Grid */}
            <div className="max-w-6xl mx-auto px-6 pt-10 pb-24">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
                    <AnimatePresence>
                        {items.map((item, idx) => (
                            <motion.div
                                key={`${item.id}-${idx}`}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                ref={idx === items.length - 1 ? lastItemRef : null}
                                className="w-full"
                            >
                                <PostCard item={item} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {(isLoading || isFetchingMore) && (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Loading Stories
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

function PostCard({ item }: { item: FeedItem }) {
    const formatPrice = useFormatPrice();
    const [isLiked, setIsLiked] = useState(false);

    return (
        <Card className="border-none shadow-none bg-background mb-8 overflow-visible">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-slate-100 p-0.5">
                        <img src={item.author.avatar} alt={item.author.name} className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div>
                        <h4 className="font-black text-sm text-slate-900 leading-none">{item.author.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{item.author.location || 'Global Explorer'}</p>
                    </div>
                </div>
                <MoreHorizontal className="w-6 h-6 text-slate-400" />
            </div>

            {/* Image & Side Actions */}
            <div className="relative group">
                <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200">
                    <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                </div>

                {/* Vertical Action Bar on Right */}
                <div className="absolute top-1/2 -right-4 -translate-y-1/2 flex flex-col gap-4 z-10">
                    <button
                        onClick={() => setIsLiked(!isLiked)}
                        className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transition-all hover:scale-110",
                            isLiked ? "bg-rose-500 text-white" : "bg-white text-slate-900"
                        )}
                    >
                        <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-xl transition-all hover:scale-110">
                        <MessageCircle className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-xl transition-all hover:scale-110">
                        <Send className="w-6 h-6" />
                    </button>
                    <button className="w-12 h-12 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-xl transition-all hover:scale-110">
                        <Bookmark className="w-6 h-6" />
                    </button>
                </div>

                {/* Floating Tags/Price */}
                {item.price > 0 && (
                    <div className="absolute top-6 left-6">
                        <Badge className="bg-black/60 backdrop-blur-xl border border-white/20 text-white px-4 py-2 rounded-2xl font-black text-sm">
                            {formatPrice(item.price, item.currency)}
                        </Badge>
                    </div>
                )}
            </div>

            {/* Caption & Social Proof */}
            <div className="mt-6 px-2">
                <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    <span className="font-black text-slate-900 mr-2">{item.title}</span>
                    {item.description}
                </p>

                <div className="flex items-center gap-2">
                    <div className="flex -space-x-3">
                        {item.likedBy?.map((name, i) => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                <img src={`https://i.pravatar.cc/100?u=${name}`} alt={name} />
                            </div>
                        ))}
                    </div>
                    {item.likedBy && item.likedBy.length > 0 && (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">
                            Liked by {item.likedBy[0]} and 10K others
                        </span>
                    )}
                </div>
            </div>
        </Card>
    );
}
