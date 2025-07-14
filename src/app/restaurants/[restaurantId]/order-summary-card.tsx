
"use client";

import { useState } from 'react';
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { ShoppingBasket, X, Edit, Calendar as CalendarIcon, Coins, CreditCard } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import type { CartItem } from '@/hooks/use-cart';
import { useRouter } from 'next/navigation'; // Import useRouter

const DELIVERY_FEE = 10.00;
const VAT_RATE = 0.13; // 13%

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(price);
};

function CartItemDisplay({ item, onRemove, onEdit }: { item: CartItem, onRemove: (id: string) => void, onEdit: () => void }) {
    const mainItemPrice = item.price * item.quantity;
    
    // Simple parsing of extras from description. A more robust system might store extras in a structured way.
    const extras = item.description?.split(' | ').map(extra => {
        const parts = extra.split(': ');
        if (parts.length === 2) {
            const priceMatch = parts[1].match(/£([\d.]+)/);
            return { name: parts[0], price: priceMatch ? parseFloat(priceMatch[1]) : 0 };
        }
        return null;
    }).filter(Boolean);

    return (
        <div className="text-sm">
            <div className="flex justify-between font-semibold">
                <span>{item.name} (x{item.quantity})</span>
                <div className="flex items-center gap-2">
                    <span>{formatPrice(mainItemPrice)}</span>
                    <button onClick={() => onRemove(item.id)} className="text-muted-foreground hover:text-destructive"><X className="h-4 w-4"/></button>
                </div>
            </div>
            {extras && extras.length > 0 && (
                <ul className="pl-4 text-xs text-muted-foreground mt-1">
                    {extras.map((extra, index) => (
                         <li key={index} className="flex items-center gap-1">
                            <span className="text-red-500">•</span>
                            <span>{extra!.name}:</span>
                            <span className="font-medium">{formatPrice(extra!.price)}</span>
                        </li>
                    ))}
                </ul>
            )}
             <button onClick={onEdit} className="text-xs text-primary hover:underline mt-1">Edit</button>
        </div>
    )
}


export function OrderSummaryCard({ restaurantId, onEditItem }: { restaurantId: string, onEditItem: (item: CartItem) => void }) {
    const { cartItems, cartTotal, removeFromCart } = useCart();
    const router = useRouter(); // Initialize router
    const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery');
    const [fulfillmentDate, setFulfillmentDate] = useState<Date | undefined>(new Date());
    
    const deliveryCost = orderType === 'delivery' ? DELIVERY_FEE : 0;
    const subtotal = cartTotal;
    const vatAmount = (subtotal + deliveryCost) * VAT_RATE;
    const total = subtotal + deliveryCost + vatAmount;

    const handleCheckout = () => {
        if (!fulfillmentDate) return;
        const queryParams = new URLSearchParams({
            orderType: orderType,
            fulfillmentTime: fulfillmentDate.toISOString(),
        });
        router.push(`/checkout?${queryParams.toString()}`);
    };

    return (
        <Card>
            <CardHeader className="py-4">
                <CardTitle className="text-xl flex items-center gap-2 font-bold">
                    <ShoppingBasket className="h-6 w-6"/> Your Order
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                <p className="text-sm text-red-600 font-semibold">This restaurant allows Pre orders.</p>
                
                <Alert className="bg-muted border-none text-muted-foreground">
                    <AlertDescription className="text-xs">
                        If you have a discount code, you will be able to input it at the payments stage.
                    </AlertDescription>
                </Alert>

                <RadioGroup defaultValue="delivery" onValueChange={(value: 'delivery' | 'pickup') => setOrderType(value)} className="grid grid-cols-2 gap-4">
                    <Label htmlFor="pickup" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center">
                        <RadioGroupItem value="pickup" id="pickup" className="sr-only peer" />
                        <span className="font-semibold text-sm">Pick-Up</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(0)}</span>
                    </Label>
                     <Label htmlFor="delivery" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer text-center">
                        <RadioGroupItem value="delivery" id="delivery" className="sr-only peer" />
                        <span className="font-semibold text-sm">Delivery</span>
                        <span className="text-xs text-muted-foreground">{formatPrice(DELIVERY_FEE)}</span>
                    </Label>
                </RadioGroup>

                <Separator/>
                
                <div className="space-y-3">
                    {cartItems.length === 0 ? (
                        <p className="text-center text-muted-foreground text-sm py-4">Your order is empty.</p>
                    ) : (
                        cartItems.map(item => <CartItemDisplay key={item.id} item={item} onRemove={removeFromCart} onEdit={() => onEditItem(item)}/>)
                    )}
                </div>

                {cartItems.length > 0 && <Separator/>}

                <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex justify-between"><span>Subtotal</span> <span className="font-medium text-foreground">{formatPrice(subtotal)}</span></div>
                    <div className="flex justify-between"><span>Delivery</span> <span className="font-medium text-foreground">{formatPrice(deliveryCost)}</span></div>
                    <div className="flex justify-between"><span>VAT ({VAT_RATE * 100}%)</span> <span className="font-medium text-foreground">{formatPrice(vatAmount)}</span></div>
                </div>

                <div className="bg-muted p-3 rounded-md flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(total)}</span>
                </div>

                <Separator/>
                
                <RadioGroup defaultValue="card" className="grid grid-cols-2 gap-4">
                     <Label htmlFor="cash" className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="cash" id="cash" className="sr-only peer" />
                        <Coins className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-semibold text-sm">Cash</span>
                    </Label>
                     <Label htmlFor="card" className="flex items-center justify-center gap-2 rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                        <RadioGroupItem value="card" id="card" className="sr-only peer" />
                        <CreditCard className="h-5 w-5 text-muted-foreground"/>
                        <span className="font-semibold text-sm">Card</span>
                    </Label>
                </RadioGroup>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !fulfillmentDate && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {fulfillmentDate ? format(fulfillmentDate, "PPP @ p") : <span>Pick a date & time</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                            mode="single"
                            selected={fulfillmentDate}
                            onSelect={setFulfillmentDate}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>

                <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-base font-semibold" onClick={handleCheckout} disabled={cartItems.length === 0}>
                     CONFIRM ORDER
                </Button>
            </CardContent>
        </Card>
    );
}
