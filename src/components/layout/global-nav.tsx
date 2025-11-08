
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingCart, Briefcase, Sparkles, Handshake, UserCircle, LogOut, Utensils, Home, Compass, Newspaper, Store, LayoutDashboard, Plane } from 'lucide-react';
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

const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/restaurants", label: "Restaurants", icon: Utensils },
    { href: "/tours", label: "Tours", icon: Plane },
    { href: "/blog", label: "Blog", icon: Newspaper },
    { href: "/ecommerce", label: "E-commerce", icon: Store },
    { href: "/find-work", label: "Freelancers", icon: Briefcase },
];

const MobileBottomNav = ({ user }: { user: SessionUser | null }) => {
    const pathname = usePathname();
    // A curated list for the bottom nav to prevent overflow
    const mobileNavItems = user 
      ? [
          { href: "/", label: "Home", icon: Home },
          { href: "/tours", label: "Tours", icon: Plane },
          { href: "/shop", label: "Shop", icon: Store },
          { href: "/find-work", label: "Freelancers", icon: Briefcase },
          { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
        ]
      : [
          { href: "/", label: "Home", icon: Home },
          { href: "/restaurants", label: "Eat", icon: Utensils },
          { href: "/tours", label: "Tours", icon: Plane },
          { href: "/blog", label: "Blog", icon: Newspaper },
          { href: "/shop", label: "Shop", icon: Store },
          { href: "/find-work", label: "Hire", icon: Briefcase },
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
      setIsClient(true);
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
              <Link href="/">Home</Link>
            </Button>
             <Button variant="ghost" asChild>
              <Link href="/restaurants">Restaurants</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/tours">Tours</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/ecommerce">E-commerce</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/find-work">Freelancers</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">Showcase <Layers className="ml-1 h-4 w-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/affiliate-showcase">
                    <Sparkles className="mr-2 h-4 w-4 text-primary"/> Affiliate Products
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/showcase">
                    <Handshake className="mr-2 h-4 w-4 text-primary"/> Creator Projects
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                 <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://placehold.co/100x100.png?text=${user.name.substring(0,2)}`} alt={user.name} data-ai-hint="profile avatar" />
                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                     <DropdownMenuItem asChild>
                        <Link href="/profile"><UserCircle className="mr-2 h-4 w-4" />My Profile</Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-1">
                <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
                <Button asChild><Link href="/signup">Sign Up</Link></Button>
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
      {isClient && <MobileBottomNav user={user} />}
      <CartSheet />
    </>
  );
}
