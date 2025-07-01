
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, DollarSign, Star, ShoppingCart, ExternalLink, Heart, Store, MessageSquare, ShieldCheck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';
import { StarRating } from '@/components/reviews/StarRating';
import { ProductReviews } from '@/components/products/ProductReviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { Skeleton } from '@/components/ui/skeleton';


async function getProductData(slug: string): Promise<Product | null> {
    try {
        const response = await fetch(`/api/products/by-identifier/${slug}`);
        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error('Failed to fetch product data');
        }
        return response.json();
    } catch (error) {
        console.error(`Error fetching product ${slug}:`, error);
        return null;
    }
}

export default function ProductDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const router = useRouter();
    const { toast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [bestDeals, setBestDeals] = useState<Product[]>([]);
    const [isLoadingDeals, setIsLoadingDeals] = useState(true);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        if (!slug) {
            notFound();
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setIsLoadingDeals(true);
            setError(null);
            
            const [productData, dealsData] = await Promise.all([
                getProductData(slug as string),
                fetch(`/api/products?limit=4`).then(res => res.ok ? res.json() : []) // Fetch 4, might include current
            ]);

            if (productData) {
                setProduct(productData);
                // Filter the current product out of the deals list and take the first 3
                const deals = (dealsData as Product[]).filter(p => p.id !== productData.id).slice(0, 3);
                setBestDeals(deals);
            } else {
                setError("Product not found.");
                notFound();
            }
            setIsLoading(false);
            setIsLoadingDeals(false);
        }
        fetchData();
    }, [slug]);
    
    if (isLoading) {
        return <div className="flex justify-center items-center h-[calc(100vh-8rem)]"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (error || !product) {
        return (
            <div className="container mx-auto py-12 px-4 text-center">
                <h2 className="text-2xl font-semibold text-destructive mb-4">Product Not Found</h2>
                <p className="text-muted-foreground">{error || "The product you are looking for does not exist."}</p>
                <Button onClick={() => router.back()} className="mt-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
            </div>
        );
    }
    
    const originalPrice = product.price ? product.price * 1.2 : null;
    const isWishlisted = isInWishlist(product.id!);

    return (
        <div className="container mx-auto py-8 px-4">
             <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div>
                     <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg">
                        <Image
                            src={product.imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                            data-ai-hint={product.imageHint || "product image"}
                        />
                         {product.price && originalPrice && product.price < originalPrice && (
                            <Badge variant="destructive" className="absolute top-3 left-3 text-sm z-10 shadow-md">
                                -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
                            </Badge>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        <Badge variant="secondary">{product.category}</Badge>
                        <h1 className="text-3xl md:text-4xl font-bold font-headline mt-2">{product.name}</h1>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center">
                                <StarRating rating={product.averageRating || 0} disabled />
                                <span className="ml-2 text-sm text-muted-foreground">({product.reviewCount} reviews)</span>
                           </div>
                           <Separator orientation="vertical" className="h-4"/>
                           <span className="text-sm text-muted-foreground">{product.sales || 0} sold</span>
                        </div>
                    </div>
                    
                    <p className="text-muted-foreground leading-relaxed">{product.description}</p>
                    
                    {product.productType === 'creator' ? (
                        <div className="flex items-baseline gap-3">
                            {product.price !== undefined && (
                                <span className="text-4xl font-bold text-primary">${product.price.toFixed(2)}</span>
                            )}
                             {originalPrice && (
                                <span className="text-xl text-muted-foreground line-through">${originalPrice.toFixed(2)}</span>
                             )}
                        </div>
                    ) : (
                        product.links?.map(link => (
                             <span key={link.url} className="text-3xl font-bold text-primary">{link.priceDisplay}</span>
                        ))
                    )}
                    
                     <div className="flex flex-col sm:flex-row gap-3">
                        {product.productType === 'creator' && (
                            <Button size="lg" className="flex-1" onClick={() => addToCart(product)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                        )}
                        {product.productType === 'affiliate' && product.links?.[0] && (
                             <Button size="lg" className="flex-1" asChild>
                                <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-5 w-5" /> View Offer at {product.links[0].vendorName}
                                </Link>
                            </Button>
                        )}
                         <Button size="lg" variant="outline" className="flex-1" onClick={() => toggleWishlist(product.id!, product.name)}>
                           <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current text-destructive")} />
                           {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                        </Button>
                    </div>

                    <Card className="bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="text-base">Seller Information</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src="https://placehold.co/100x100.png?text=V" alt={product.vendorName} data-ai-hint="vendor avatar"/>
                                    <AvatarFallback>{product.vendorName?.substring(0,1)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs text-muted-foreground">Sold by</p>
                                    <Link href={`/store/${product.vendorId}`} className="font-semibold hover:text-primary transition-colors">{product.vendorName}</Link>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href={`/store/${product.vendorId}`}><Store className="mr-2 h-4 w-4"/>Visit Shop</Link>
                                </Button>
                                 <Button size="sm" variant="ghost" onClick={() => toast({title: "Coming Soon!", description: "Messaging feature is under development."})}>
                                    <MessageSquare className="mr-2 h-4 w-4"/> Message
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
            
            <Separator className="my-12"/>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2">
                     <ProductReviews productId={product.id!} />
                </div>
                <div className="lg:col-span-1">
                    <Card className="sticky top-24 shadow-lg">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Award className="h-5 w-5 text-yellow-500"/> Best Deals Today</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {isLoadingDeals ? (
                                <div className="space-y-4">
                                    {[...Array(3)].map((_, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <Skeleton className="h-16 w-16 rounded-md" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-4/5" />
                                                <Skeleton className="h-4 w-1/2" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : bestDeals.length > 0 ? (
                                bestDeals.map((deal) => {
                                    const dealOriginalPrice = deal.price ? deal.price * 1.25 : null;
                                    return (
                                        <Link href={`/products/${deal.slug}`} key={deal.id} className="block group">
                                            <div className="flex items-center gap-3 p-2 rounded-md group-hover:bg-secondary/50 transition-colors">
                                                <Image src={deal.imageUrl} alt={deal.name} width={60} height={60} className="rounded-md object-cover" data-ai-hint={deal.imageHint || "product deal"}/>
                                                <div>
                                                    <p className="text-sm font-medium line-clamp-2 group-hover:text-primary">{deal.name}</p>
                                                    <p className="text-xs text-primary font-semibold">
                                                        {deal.price ? `$${deal.price.toFixed(2)}` : 'Check Price'}
                                                        {dealOriginalPrice && (
                                                            <span className="text-muted-foreground line-through ml-1.5">${dealOriginalPrice.toFixed(2)}</span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-4">No other deals available now.</p>
                            )}
                             <Button className="w-full mt-2" variant="outline">View All Deals</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Separator className="my-12"/>
            <RelatedProducts categoryId={product.category} currentProductId={product.id!} />

        </div>
    );
}
