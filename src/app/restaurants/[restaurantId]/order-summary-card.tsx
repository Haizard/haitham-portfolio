
"use client";

import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

export function OrderSummaryCard({ restaurantId }: { restaurantId: string }) {
    const { cartItems, cartTotal, clearCart } = useCart();
    
    // For this page, we might want to filter items for this specific restaurant if the cart is global
    // For now, let's assume the cart is only for one restaurant at a time.

    return (
        <Card>
            <CardHeader className="bg-gray-200 dark:bg-gray-800 py-3">
                <CardTitle className="text-base flex items-center gap-2">Your Order</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
                {cartItems.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-4">Your order is empty.</p>
                ) : (
                    <>
                         {/* This section could be implemented later to show items in cart */}
                         {/* <div>
                            {cartItems.map(item => (
                                <div key={item.id} className="text-sm">{item.name} x {item.quantity}</div>
                            ))}
                         </div> */}
                         <p className="text-sm text-center text-muted-foreground py-4">
                            You have {cartItems.length} item(s) in your order.
                         </p>
                         <Separator/>
                    </>
                )}
                
                <RadioGroup defaultValue="pickup" className="grid grid-cols-2 gap-4">
                    <div>
                        <RadioGroupItem value="pickup" id="pickup" className="peer sr-only" />
                        <Label htmlFor="pickup" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <ShoppingBag className="mb-2 h-6 w-6" />
                            Pickup
                        </Label>
                    </div>
                     <div>
                        <RadioGroupItem value="delivery" id="delivery" className="peer sr-only" />
                        <Label htmlFor="delivery" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-3 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Clock className="mb-2 h-6 w-6" />
                            Delivery
                        </Label>
                    </div>
                </RadioGroup>

                <div>
                    <p className="text-sm text-muted-foreground mb-1">Pickup Time</p>
                    <div className="flex justify-between items-center border p-2 rounded-md">
                        <span className="text-sm font-medium">{format(new Date(), 'dd-MM-yyyy @ HH:mm')}</span>
                        <Button variant="link" size="sm" className="text-red-600 h-auto p-0">Change</Button>
                    </div>
                </div>

                <Button className="w-full bg-red-600 hover:bg-red-700 h-12 text-base" asChild disabled={cartItems.length === 0}>
                   <Link href="/checkout">
                     CHECKOUT - ${cartTotal.toFixed(2)}
                   </Link>
                </Button>
            </CardContent>
        </Card>
    );
}

