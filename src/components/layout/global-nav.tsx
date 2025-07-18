
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Layers, ShoppingCart, Briefcase, Sparkles, Handshake, UserCircle, LogOut, Utensils, Home, Map, Compass, Newspaper, Store, CalendarDays } from 'lucide-react';
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

// Mobile Bottom Navigation Component
const MobileBottomNav = ({ items }: { items: { href: string; label: string; icon: React.ElementType }[] }) => {
    const pathname = usePathname();
    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-40">
            {items.map(item => (
                <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center text-muted-foreground transition-colors hover:text-primary w-full h-full", pathname === item.href && "text-primary")}>
                    <item.icon className="h-6 w-6" />
                    <span className="text-[10px] mt-0.5">{item.label}</span>
                </Link>
            ))}
        </div>
    );
};

export function GlobalNav() {
  const { cartCount, setIsCartOpen } = useCart();
  const { user, logout } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isRestaurantPage = pathname.startsWith('/restaurants');

  // Define nav items for different sections
  const restaurantNavItems = [
    { href: "/restaurants", label: "Explore", icon: Compass },
    { href: "/restaurants/orders", label: "My Orders", icon: ShoppingCart },
    { href: "/restaurants/bookings", label: "Bookings", icon: CalendarDays },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];
  
  const mainNavItems = [
     { href: "/", label: "Home", icon: Home },
     { href: "/restaurants", label: "Restaurants", icon: Utensils },
     { href: "/shop", label: "Shop", icon: Store },
     { href: "/find-work", label: "Freelancers", icon: Briefcase },
     { href: "/blog", label: "Blog", icon: Newspaper },
  ];


  // Specific navigation for the Food Market section
  if (isRestaurantPage) {
    return (
      <>
       <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link href="/restaurants" className="flex items-center gap-2 group">
            <div className="bg-red-600 text-white p-2 rounded-md group-hover:bg-red-700 transition-colors">
              <Utensils className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 group-hover:text-red-700 transition-colors font-headline">
              Food Market
            </h1>
          </Link>
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" className="text-gray-700" asChild><Link href="/">Home</Link></Button>
            <Button variant="ghost" className="text-gray-700" asChild><Link href="/restaurants">Restaurant</Link></Button>
            <Button variant="ghost" className="text-gray-700" asChild><Link href="/our-services">Services</Link></Button>
            <Button variant="ghost" className="text-gray-700" asChild><Link href="/blog">Blogs</Link></Button>
             <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-700">Pages <Layers className="ml-1 h-4 w-4"/></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild><Link href="/shop">Shop</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link href="/find-work">Find Work</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="ghost" className="text-gray-700" asChild><Link href="/login">Login</Link></Button>
             <Button variant="outline" className="border-red-600 text-red-600 hover:bg-red-50" asChild><Link href="/signup">Register</Link></Button>
             <Button className="bg-green-500 hover:bg-green-600" asChild><Link href="#">Post Your Ad</Link></Button>
          </div>
        </div>
      </nav>
      {/* <MobileBottomNav items={restaurantNavItems} /> */}
      </>
    );
  }

  // Default CreatorOS navigation
  return (
    <>
      <nav className="bg-card border-b border-border sticky top-0 z-50">
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
              <Link href="/blog">Blog</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/shop">Shop</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/find-work">Freelancers</Link>
            </Button>
             <Button variant="ghost" asChild>
              <Link href="/our-services">Services</Link>
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
                <Button variant="ghost" asChild className="hidden sm:inline-flex"><Link href="/dashboard">Dashboard</Link></Button>
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" /> Log Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
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
      <MobileBottomNav items={mainNavItems} />
      <CartSheet />
    </>
  );
}
