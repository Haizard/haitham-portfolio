
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cart/cart-sheet';

export function GlobalNav() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/landing" className="flex items-center gap-2 group">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg group-hover:bg-primary/90 transition-colors">
              <Layers className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold text-primary group-hover:text-primary/90 transition-colors font-headline">
              CreatorOS
            </h1>
          </Link>
          <div className="flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link href="/landing">Home</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/showcase">Showcase</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/our-services">Our Services</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">Dashboard</Link>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(true)} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                        {cartCount}
                    </span>
                )}
                <span className="sr-only">Open Cart</span>
            </Button>
          </div>
        </div>
      </nav>
      <CartSheet />
    </>
  );
}
