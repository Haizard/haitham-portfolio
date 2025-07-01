
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, DollarSign, Star, Package, Rss, User, ExternalLink, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Product } from '@/lib/products-data';
import { StarRating } from '@/components/reviews/StarRating';
import { ProductReviews } from '@/components/products/ProductReviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';


async function getProductData(slug: string): Promise<Product | null> {
    try {
        const response = await fetch(`/api/products/${slug}`); // Assuming API can fetch by slug, if not change to ID
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

    useEffect(() => {
        if (!slug) {
            notFound();
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            const data = await getProductBySlug(slug as string);
            if (data) {
                setProduct(data);
            } else {
                setError("Product not found.");
                notFound();
            }
            setIsLoading(false);
        }
        fetchData();
    }, [slug]);
    
    // getProductBySlug needs to be defined or imported
    async function getProductBySlug(slug: string): Promise<Product | null> {
        // This is a placeholder for your actual data fetching logic
        const response = await fetch(`/api/products?slug=${slug}`); // Fictional API endpoint
        if (!response.ok) return null;
        const products: Product[] = await response.json();
        return products.length > 0 ? products[0] : null;
    }

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
                    {/* TODO: Add thumbnails for multiple images */}
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
                    
                    <Card className="bg-secondary/50">
                        <CardContent className="p-4">
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
                        </CardContent>
                    </Card>

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
                            <Button size="lg" className="flex-1" onClick={() => toast({ title: "Added to Cart (Mock)" })}>
                                <ThumbsUp className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                        )}
                        {product.productType === 'affiliate' && product.links?.[0] && (
                             <Button size="lg" className="flex-1" asChild>
                                <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-5 w-5" /> View Offer at {product.links[0].vendorName}
                                </Link>
                            </Button>
                        )}
                         <Button size="lg" variant="outline" className="flex-1" onClick={() => toast({ title: "Added to Wishlist (Mock)" })}>
                           <ThumbsUp className="mr-2 h-5 w-5"/> Add to Wishlist
                        </Button>
                    </div>

                </div>
            </div>
            
            <Separator className="my-12"/>

            {/* Reviews Section */}
            <ProductReviews productId={product.id!} />

        </div>
    );
}

