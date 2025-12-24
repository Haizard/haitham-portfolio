
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingCart, Briefcase, Sparkles, Handshake, UserCircle, LogOut, Utensils, Home, Compass, Newspaper, Store, LayoutDashboard, Plane, Hotel, Car, Bus } from 'lucide-react';
import { useCart } from '@/hooks/use-cart';
import { CartSheet } from '@/components/cart/cart-sheet';
import { Logo } from './logo';
import { useUser } from '@/hooks/use-user';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import type { SessionUser } from '@/providers/user-provider';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/language-switcher';
import { CurrencySwitcher } from '@/components/currency-switcher';

const MobileBottomNav = ({ user }: { user: SessionUser | null }) => {
  const pathname = usePathname();
  const t = useTranslations('navigation');

  // A curated list for the bottom nav to prevent overflow
  const mobileNavItems = user
    ? [
      { href: "/", label: t('home'), icon: Home },
      { href: "/hotels", label: t('hotels'), icon: Hotel },
      { href: "/tours", label: t('tours'), icon: Plane },
      { href: "/shop", label: t('shop'), icon: Store },
      { href: "/find-work", label: t('freelancers'), icon: Briefcase },
      { href: "/dashboard", label: t('dashboard'), icon: LayoutDashboard }
    ]
    : [
      { href: "/", label: t('home'), icon: Home },
      { href: "/restaurants", label: t('restaurants'), icon: Utensils },
      { href: "/hotels", label: t('hotels'), icon: Hotel },
      { href: "/tours", label: t('tours'), icon: Plane },
      { href: "/blog", label: t('blog'), icon: Newspaper },
      { href: "/shop", label: t('shop'), icon: Store },
      { href: "/find-work", label: t('freelancers'), icon: Briefcase },
    ];

  const gridColsClass = user ? 'grid-cols-5' : 'grid-cols-6';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border grid z-40",
          gridColsClass
        )}
      >
        {mobileNavItems.map(item => (
          <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center text-muted-foreground transition-colors hover:text-primary w-full h-full", pathname === item.href && "text-primary")}>
            <item.icon className="h-6 w-6" />
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </Link>
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export function GlobalNav() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const t = useTranslations('navigation');
  const tCommon = useTranslations('common');

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleLogout = async () => {
    await logout();
    router.push('/');
    router.refresh();
  };

  return (
    <>
      <nav className="bg-card/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild>
              <Link href="/">{isMounted ? t('home') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/restaurants">{isMounted ? t('restaurants') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/hotels">{isMounted ? t('hotels') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/flights">{isMounted ? t('flights') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/cars">{isMounted ? t('cars') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/tours">{isMounted ? t('tours') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">{isMounted ? t('blog') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ecommerce">{isMounted ? t('ecommerce') : ''}</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/find-work">{isMounted ? t('freelancers') : ''}</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">{isMounted ? t('showcase') : ''} <Layers className="ml-1 h-4 w-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/affiliate-showcase">
                    <Sparkles className="mr-2 h-4 w-4 text-primary" /> {isMounted ? t('affiliateProducts') : ''}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/showcase">
                    <Handshake className="mr-2 h-4 w-4 text-primary" /> {isMounted ? t('creatorProjects') : ''}
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1">
              <LanguageSwitcher />
              <CurrencySwitcher />
            </div>
            {user ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${(user.name || 'User').substring(0, 2)}`} alt={user.name || 'User'} data-ai-hint="profile avatar" />
                        <AvatarFallback>{(user.name || 'User').substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                      <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" />{isMounted ? t('myProfile') : ''}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{isMounted ? t('dashboard') : ''}</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> {isMounted ? tCommon('signOut') : ''}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" asChild><Link href="/login">{isMounted ? tCommon('signIn') : ''}</Link></Button>
                <Button asChild><Link href="/signup">{isMounted ? tCommon('signUp') : ''}</Link></Button>
              </div>
            )}
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
      {isMounted && <MobileBottomNav user={user} />}
      <CartSheet />
    </>
  );
}
