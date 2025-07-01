
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingCart } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cart/cart-sheet';
import { Logo } from './logo';

export function GlobalNav() {
  const { cartCount, setIsCartOpen } = useCart();

  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link href="/">Home</Link>
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
              <Link href="/dashboard">Dashboard</Link>
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
