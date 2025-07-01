
"use client";

import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { CartItem } from './cart-item';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';

export function CartSheet() {
  const { cartItems, cartTotal, isCartOpen, setIsCartOpen, clearCart } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="flex w-full flex-col pr-0 sm:max-w-lg">
        <SheetHeader className="px-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6" />
            My Cart ({cartItems.length})
          </SheetTitle>
          <Separator className="my-2" />
        </SheetHeader>

        {cartItems.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-6">
              <div className="flex flex-col divide-y">
                {cartItems.map(item => (
                  <CartItem key={item.id} item={item} />
                ))}
              </div>
            </ScrollArea>
            <SheetFooter className="px-6 py-4 bg-secondary/50 mt-auto">
              <div className="w-full space-y-4">
                <div className="flex justify-between text-base font-medium">
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between">
                    <Button variant="outline" onClick={clearCart}>Clear Cart</Button>
                    <SheetClose asChild>
                      <Button asChild className="w-full max-w-xs bg-primary text-primary-foreground hover:bg-primary/90">
                          <Link href="/checkout">Proceed to Checkout</Link>
                      </Button>
                    </SheetClose>
                </div>
              </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center px-6">
            <div
              aria-hidden="true"
              className="relative mb-4 h-20 w-20 text-muted-foreground"
            >
              <ShoppingCart className="absolute h-full w-full" />
            </div>
            <h3 className="text-xl font-semibold">Your cart is empty</h3>
            <p className="text-sm text-muted-foreground">
              Add some products to get started!
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
