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
    MessageCircleOff,
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
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { getVideoEmbedUrl } from '@/lib/video-utils';

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
    videoUrl?: string; // Video URL
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

// VIDEO UTILITY MOVED TO @/lib/video-utils.ts

export default function UniversalFeed() {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
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
                servicesRes,
            ] = await Promise.all([
                fetch('/api/hotels/properties').then(r => r.json()),
                fetch('/api/tours').then(r => r.json()),
                fetch('/api/cars/vehicles').then(r => r.json()),
                fetch('/api/transfers/vehicles').then(r => r.json()),
                fetch('/api/restaurants').then(r => r.json()),
                fetch('/api/products').then(r => r.json()),
                fetch('/api/services').then(r => r.json()),
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
                            name: item.authorName || item.vendorName || item.author || 'Creator',
                            avatar: item.authorAvatar || `https://i.pravatar.cc/150?u=${item.id || item.userId}`,
                            location: item.location?.city || 'Global'
                        },
                        likedBy: ['Pamela', 'Hayes', 'Adams']
                    };

                    if (type === 'hotel') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
                        price: 0, currency: 'USD', tags: [item.type || 'Hotel', ...(item.amenities || []).slice(0, 2)], link: `/hotels/${item.id}`,
                        videoUrl: item.videoUrl
                    };
                    if (type === 'tour') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.featuredImageUrl || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800',
                        price: item.price || 0, currency: 'USD', tags: [item.duration || 'Day Trip', item.tourType || 'Leisure'], link: `/tours/${item.slug}`,
                        videoUrl: item.videoUrl
                    };
                    if (type === 'vehicle') return {
                        ...baseItem,
                        title: `${item.make || 'Luxury'} ${item.model || 'Vehicle'}`,
                        description: item.description || `Luxury ${item.category || 'car'} available for rent.`,
                        image: item.images?.find((i: any) => i.isPrimary)?.url || item.images?.[0]?.url || 'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800',
                        price: item.pricing?.dailyRate || 0, currency: item.pricing?.currency || 'USD',
                        tags: [item.category || 'Car', item.transmission || 'Auto'], link: `/cars/${item.id}`,
                        videoUrl: item.videoUrl
                    };
                    if (type === 'transfer') return {
                        ...baseItem,
                        title: `${item.category?.toUpperCase() || 'Luxury'} Transfer`,
                        description: item.description || `Professional transfer service.`,
                        image: item.images?.[0]?.url || 'https://images.unsplash.com/photo-1449965072335-64441113239e?w=800',
                        price: item.pricing?.basePrice || 0, currency: item.pricing?.currency || 'USD',
                        tags: ['Transfer', `${item.capacity?.passengers || 4} Pax`], link: `/transfers/${item.id}`,
                        videoUrl: item.videoUrl
                    }
                    if (type === 'restaurant') return {
                        ...baseItem,
                        description: item.description || `Experience the finest ${item.cuisineTypes?.join(', ') || 'Dining'} in the city.`,
                        image: item.logoUrl || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42177?w=800',
                        price: 0, currency: 'USD', tags: item.cuisineTypes?.slice(0, 2) || ['Dining'], link: `/restaurants/${item.id}`,
                        videoUrl: item.videoUrl
                    };
                    if (type === 'product') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
                        price: item.price || 0, currency: 'USD', tags: [item.productType || item.status || 'Shop'], link: `/products/${item.slug}`,
                        videoUrl: item.videoUrl // Map video URL
                    };
                    if (type === 'freelancer') return {
                        ...baseItem,
                        description: item.description || '',
                        image: item.imageUrl || 'https://images.unsplash.com/photo-1522071823914-7ad2488f2882?w=800',
                        price: parseFloat(item.price) || 0, currency: 'USD', tags: ['Service', ...(item.categoryIds || []).slice(0, 1)], link: `/our-services`,
                        videoUrl: item.videoUrl
                    };
                    return null;
                }).filter(Boolean);
            };

            const allRaw = [
                ...mapItems(hotelsRes, 'hotel'),
                ...mapItems(toursRes, 'tour'),
                ...mapItems(carsRes, 'vehicle'),
                ...mapItems(transfersRes, 'transfer'),
                ...mapItems(restaurantsRes, 'restaurant'),
                ...mapItems(productsRes, 'product'),
                ...mapItems(servicesRes, 'freelancer'),
            ].sort(() => Math.random() - 0.5);

            let filteredItems = allRaw;

            // Search Filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                filteredItems = filteredItems.filter(item =>
                    item.title.toLowerCase().includes(q) ||
                    item.description.toLowerCase().includes(q) ||
                    item.type.toLowerCase().includes(q)
                );
            }

            setItems(prev => {
                const combined = isInitial ? filteredItems : [...prev, ...filteredItems];
                // Duplicate Prevention (Unique by ID)
                const seen = new Set();
                return combined.filter(item => {
                    if (seen.has(item.id)) return false;
                    seen.add(item.id);
                    return true;
                });
            });

        } catch (error) {
            console.error('Error fetching feed:', error);
        } finally {
            setIsLoading(false);
            setIsFetchingMore(false);
        }
    };

    useEffect(() => {
        setItems([]);
        setPage(1);
        fetchItems(true);
    }, [searchQuery]);

    useEffect(() => {
        if (page > 1) {
            fetchItems(false);
        }
    }, [page]);

    return (
        <div className="max-w-7xl mx-auto pb-20 bg-background min-h-screen">
            {/* Discover Header */}
            <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex gap-4 items-center">
                        <Camera className="w-6 h-6 text-slate-700" />
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search Discover..."
                                className="pl-9 pr-4 py-1.5 rounded-full border border-border bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-64"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 hidden md:block">Discover</h1>
                    <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-slate-700" />
                    </div>
                </div>
            </header>

            {/* Main Content Area with Sidebar */}
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row px-6 gap-10 mt-10">
                {/* Feed List - Optimized Grid */}
                <div className="flex-1 pb-24">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
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

                    {!isLoading && items.length === 0 && (
                        <div className="text-center py-20 px-6">
                            <MessageCircleOff className="w-16 h-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                            <h3 className="text-lg font-bold text-slate-900">No stories found</h3>
                            <p className="text-sm text-slate-500 mt-2">Try adjusting your filters or search query.</p>
                            <Button variant="outline" className="mt-6 rounded-full" onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}>
                                Reset Filters
                            </Button>
                        </div>
                    )}
                </div>

                {/* Sidebar - Categories & Navigation (Left on Desktop) */}
                <aside className="w-full lg:w-80 flex-none space-y-10 order-first lg:order-first">
                    <div className="sticky top-28 bg-white/50 backdrop-blur-md rounded-[2.5rem] border border-border/40 p-8 shadow-2xl shadow-slate-100">
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Categories</h3>
                        <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-2 gap-y-8 gap-x-6">
                            {CATEGORIES.map((cat) => {
                                const hrefMap: Record<string, string> = {
                                    'all': '#',
                                    'hotels': '/hotels',
                                    'tours': '/tours',
                                    'cars': '/cars',
                                    'transfers': '/transfers',
                                    'restaurants': '/restaurants',
                                    'products': '/ecommerce',
                                    'freelancers': '/our-services'
                                };
                                return (
                                    <Link
                                        key={cat.id}
                                        href={hrefMap[cat.id]}
                                        className="flex flex-col items-center gap-3 transition-transform hover:scale-105 active:scale-95"
                                    >
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl p-0.5 border-2 transition-all duration-300",
                                            activeCategory === cat.id ? "border-primary shadow-lg shadow-primary/10 scale-110" : "border-border hover:border-primary/50"
                                        )}>
                                            <div className={cn(
                                                "w-full h-full rounded-[0.9rem] flex items-center justify-center text-white",
                                                cat.color || "bg-slate-200"
                                            )}>
                                                <cat.icon className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <span
                                            className={cn(
                                                "text-[9px] font-black uppercase tracking-widest text-center hover:text-primary transition-colors",
                                                activeCategory === cat.id ? "text-primary" : "text-slate-500"
                                            )}
                                        >
                                            {cat.name}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-8 border-t border-border/40">
                            <div className="flex flex-col gap-4">
                                <Button className="w-full rounded-2xl bg-slate-900 hover:bg-black text-white py-6">
                                    <Plus className="w-5 h-5 mr-3" /> Create Story
                                </Button>
                                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest leading-loose px-4">
                                    Become a partner to start sharing your stories
                                </p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

function PostCard({ item }: { item: FeedItem }) {
    const formatPrice = useFormatPrice();
    const router = useRouter();
    const { toast } = useToast();
    const [isLiked, setIsLiked] = useState(false);

    // Pseudo-counts for real-time feel
    const [counts] = useState({
        likes: Math.floor(Math.random() * 500) + 10,
        comments: Math.floor(Math.random() * 50) + 5,
        shares: Math.floor(Math.random() * 20) + 2
    });

    const categoryColor = CATEGORIES.find(c =>
        c.id === (item.type === 'vehicle' ? 'cars' :
            item.type === 'property' ? 'hotels' :
                item.type + 's'))?.color || 'bg-slate-600';

    const handleShare = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(window.location.origin + item.link);
        toast({
            title: "Link Copied!",
            description: "The story link has been copied to your clipboard.",
        });
    };

    return (
        <Card
            className="group border-none shadow-none bg-background mb-12 overflow-visible cursor-pointer"
            onClick={() => router.push(item.link)}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-5 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl overflow-hidden border-2 border-primary/10 bg-slate-100 p-0.5 shadow-sm">
                        <img src={item.author.avatar} alt={item.author.name} className="w-full h-full rounded-[0.9rem] object-cover" />
                    </div>
                    <div>
                        <h4 className="font-extrabold text-[15px] text-slate-950 leading-tight group-hover:text-primary transition-colors">
                            {item.author.name}
                        </h4>
                        <p className="text-[10px] font-black text-slate-500 mt-0.5 uppercase tracking-[0.15em] flex items-center">
                            <MapPin className="w-3 h-3 mr-1 text-primary/60" />
                            {item.author.location || 'Global Explorer'}
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="rounded-full text-slate-400 hover:text-slate-900 transition-colors">
                    <MoreHorizontal className="w-6 h-6" />
                </Button>
            </div>

            {/* Image & Side Actions */}
            <div className="relative">
                <div className="aspect-[4/5] overflow-hidden rounded-[2.8rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative bg-slate-50">
                    {item.videoUrl && getVideoEmbedUrl(item.videoUrl) ? (
                        <iframe
                            src={getVideoEmbedUrl(item.videoUrl)!}
                            className="w-full h-full object-cover"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title={item.title}
                            loading="lazy"
                        />
                    ) : (
                        <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        />
                    )}

                    {/* Category Label Overlay */}
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                        <div className={cn(
                            "px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-lg backdrop-blur-md bg-opacity-80",
                            categoryColor
                        )}>
                            {item.type}
                        </div>
                    </div>
                </div>

                {/* Vertical Action Bar on Right */}
                <div className="absolute top-1/2 -right-3 md:-right-5 -translate-y-1/2 flex flex-col gap-4 z-20">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked); }}
                        className={cn(
                            "w-14 h-14 rounded-2xl flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95",
                            isLiked ? "bg-rose-500 text-white" : "bg-white text-slate-900"
                        )}
                    >
                        <Heart className={cn("w-6 h-6", isLiked && "fill-current")} />
                        <span className="text-[9px] font-black mt-1 opacity-80">{counts.likes + (isLiked ? 1 : 0)}</span>
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border border-slate-50">
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-[9px] font-black mt-1 text-slate-500">{counts.comments}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex flex-col items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border border-slate-50"
                    >
                        <Send className="w-6 h-6" />
                        <span className="text-[9px] font-black mt-1 text-slate-500">{counts.shares}</span>
                    </button>
                    <button className="w-14 h-14 rounded-2xl bg-white text-slate-900 flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 border border-slate-50">
                        <Bookmark className="w-6 h-6" />
                    </button>
                </div>

                {/* Floating Price */}
                {item.price > 0 && (
                    <div className="absolute top-6 right-16">
                        <div className="bg-black/80 backdrop-blur-xl border border-white/20 text-white px-5 py-2.5 rounded-[1.2rem] font-extrabold text-sm shadow-xl flex items-center gap-2">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            {formatPrice(item.price, item.currency)}
                        </div>
                    </div>
                )}
            </div>

            {/* Caption & Social Proof */}
            <div className="mt-8 px-2">
                <h3 className="text-lg font-black text-slate-950 mb-2 leading-tight tracking-tight">
                    {item.title}
                </h3>
                <p className="text-[15px] font-medium text-slate-700 leading-relaxed line-clamp-2 mb-6 opacity-90">
                    {item.description}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-3">
                            {item.likedBy?.map((name, i) => (
                                <div key={i} className="w-9 h-9 rounded-xl border-2 border-white bg-slate-200 overflow-hidden shadow-sm">
                                    <img src={`https://i.pravatar.cc/100?u=${name}`} alt={name} />
                                </div>
                            ))}
                        </div>
                        {item.likedBy && item.likedBy.length > 0 && (
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest pl-1">
                                <span className="text-slate-950 font-black">{item.likedBy[0]}</span> and {counts.likes} others
                            </span>
                        )}
                    </div>

                    <Button variant="link" className="text-primary font-black text-xs uppercase tracking-widest p-0 flex items-center gap-2 group/btn">
                        Explore <Send className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
}
