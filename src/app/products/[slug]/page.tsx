
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2, ArrowLeft, DollarSign, Star, ShoppingCart, ExternalLink, Heart, Store, MessageSquare, ShieldCheck, Award, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import type { Product, GalleryImage, ColorOption } from '@/lib/products-data';
import { StarRating } from '@/components/reviews/StarRating';
import { ProductReviews } from '@/components/products/ProductReviews';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useCart } from '@/hooks/use-cart';
import { useWishlist } from '@/hooks/use-wishlist';
import { RelatedProducts } from '@/components/products/RelatedProducts';
import { Skeleton } from '@/components/ui/skeleton';


async function getProductData(slug: string): Promise<Product | null> {
    const response = await fetch(`/api/products/by-identifier/${slug}`);
    if (!response.ok) {
        if (response.status === 404) return null;
        let errorMsg = 'Failed to fetch product data';
        try {
            const errorData = await response.json();
            errorMsg = errorData.message || errorMsg;
        } catch (e) {
            // Ignore if response is not JSON
        }
        throw new Error(errorMsg);
    }
    return response.json();
}

export default function ProductDetailPage() {
    const params = useParams<{ slug: string }>();
    const slug = params.slug;
    const router = useRouter();
    const { toast } = useToast();

    const [product, setProduct] = useState<Product | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [isLoadingRelated, setIsLoadingRelated] = useState(true);

    const [selectedImage, setSelectedImage] = useState<string>('');
    const [selectedColor, setSelectedColor] = useState<ColorOption | null>(null);
    const [quantity, setQuantity] = useState(1);

    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    useEffect(() => {
        if (!slug) {
            notFound();
            return;
        }

        async function fetchData() {
            setIsLoading(true);
            setError(null);
            
            try {
                const productData = await getProductData(slug as string);

                if (productData) {
                    setProduct(productData);
                    setSelectedImage(productData.imageUrl); // Set initial image
                    if (productData.colorOptions && productData.colorOptions.length > 0) {
                        setSelectedColor(productData.colorOptions[0]); // Set initial color
                    }
                    
                    // Fetch related products
                    setIsLoadingRelated(true);
                    const relatedRes = await fetch(`/api/products?categoryId=${productData.categoryId}&limit=5`);
                    if (relatedRes.ok) {
                        const relatedData: Product[] = await relatedRes.json();
                        setRelatedProducts(relatedData.filter(p => p.id !== productData.id).slice(0, 4));
                    }
                    setIsLoadingRelated(false);

                } else {
                    setError("Product not found.");
                    notFound();
                }
            } catch (err: any) {
                console.error("Error fetching product page data:", err);
                setError(err.message || "An unknown error occurred.");
            } finally {
                setIsLoading(false);
            }
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
    const allImages: GalleryImage[] = [{ url: product.imageUrl, hint: product.imageHint }, ...(product.galleryImages || [])];


    return (
        <div className="container mx-auto py-8 px-4">
             <Button variant="outline" onClick={() => router.back()} className="mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
            </Button>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {/* Image Gallery */}
                <div>
                     <div className="relative aspect-square w-full overflow-hidden rounded-lg shadow-lg mb-4">
                        <Image
                            key={selectedImage} // Use key to force re-render on image change
                            src={selectedImage}
                            alt={product.name}
                            fill
                            className="object-contain animate-in fade-in-50 duration-300"
                            priority
                            data-ai-hint={product.imageHint || "product image"}
                        />
                         {product.price && originalPrice && product.price < originalPrice && (
                            <Badge variant="destructive" className="absolute top-3 left-3 text-sm z-10 shadow-md">
                                -{Math.round(((originalPrice - product.price) / originalPrice) * 100)}%
                            </Badge>
                        )}
                    </div>
                     <div className="grid grid-cols-5 gap-2">
                        {allImages.map((image, index) => (
                            <button 
                                key={index} 
                                className={cn(
                                    "relative aspect-square w-full overflow-hidden rounded-md border-2 transition-all",
                                    selectedImage === image.url ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border hover:border-primary/50"
                                )}
                                onClick={() => setSelectedImage(image.url)}
                            >
                                <Image
                                    src={image.url}
                                    alt={`${product.name} thumbnail ${index + 1}`}
                                    fill
                                    className="object-contain"
                                    data-ai-hint={image.hint || "product thumbnail"}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                    <div>
                        {product.categoryName && <Badge variant="secondary">{product.categoryName}</Badge>}
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

                     {product.colorOptions && product.colorOptions.length > 0 && (
                        <div>
                            <p className="text-sm font-medium mb-2">Color: <span className="font-bold">{selectedColor?.name}</span></p>
                            <div className="flex flex-wrap gap-2">
                                {product.colorOptions.map((color) => (
                                    <button 
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={cn(
                                            "h-8 w-8 rounded-full border-2 transition-all",
                                            selectedColor?.name === color.name ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                                        )}
                                        style={{ backgroundColor: color.hex }}
                                        aria-label={`Select color ${color.name}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    
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
                            <>
                             <div className="flex items-center border rounded-md p-1">
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => Math.max(1, q-1))}><Minus className="h-4 w-4"/></Button>
                                <span className="w-12 text-center font-bold">{quantity}</span>
                                <Button variant="ghost" size="icon" onClick={() => setQuantity(q => q+1)}><Plus className="h-4 w-4"/></Button>
                            </div>
                            <Button size="lg" className="flex-1" onClick={() => addToCart(product, quantity)}>
                                <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
                            </Button>
                            </>
                        )}
                        {product.productType === 'affiliate' && product.links?.[0] && (
                             <Button size="lg" className="flex-1" asChild>
                                <Link href={product.links[0].url} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="mr-2 h-5 w-5" /> View Offer at {product.links[0].vendorName}
                                </Link>
                            </Button>
                        )}
                         <Button size="lg" variant="outline" onClick={() => toggleWishlist(product.id!, product.name)}>
                           <Heart className={cn("mr-2 h-5 w-5", isWishlisted && "fill-current text-destructive")} />
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
                           {isLoadingRelated ? (
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
                            ) : relatedProducts.length > 0 ? (
                                relatedProducts.map((deal) => {
                                    const dealOriginalPrice = deal.price ? deal.price * 1.25 : null;
                                    return (
                                        <Link href={`/products/${deal.slug}`} key={deal.id} className="block group">
                                            <div className="flex items-center gap-3 p-2 rounded-md group-hover:bg-secondary/50 transition-colors">
                                                <Image src={deal.imageUrl} alt={deal.name} width={60} height={60} className="rounded-md object-contain" data-ai-hint={deal.imageHint || "product deal"}/>
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
            <RelatedProducts categoryId={product.categoryId!} currentProductId={product.id!} />

        </div>
    );
}
