
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { SidebarNav } from './sidebar-nav';
import { UserNav } from './user-nav';
import { Logo } from './logo';
import { Button } from '../ui/button';
import { Loader2, Moon, Sun, Plus, LayoutDashboard, MessageCircle, ShoppingCart } from 'lucide-react'; 
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { Toaster } from '../ui/toaster';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

gsap.registerPlugin(useGSAP);

// Mock theme toggle functions for now
const useTheme = () => {
  const [theme, setTheme] = React.useState('light');
  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [theme]);

  return { theme, toggleTheme };
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef(null);

  useEffect(() => {
    // This effect's only job is to redirect if, after loading, the user is still not present.
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useGSAP(() => {
    if (mainRef.current) {
        gsap.fromTo(mainRef.current, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
    }
  }, { dependencies: [pathname], scope: mainRef });
  
  if (isLoading || !user) {
    return (
        <div className="flex h-screen w-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary"/>
        </div>
    );
  }

  // At this point, we are guaranteed to have a user object.
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
             <SidebarNav userRoles={user.roles || []} />
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border flex items-center justify-between">
          <UserNav user={user} />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 md:hidden">
          <Logo />
          {/* Hide default trigger on mobile */}
          <div className="hidden">
            <SidebarTrigger />
          </div>
        </header>
        <main 
          key={pathname}
          ref={mainRef}
          className="flex-1 p-4 md:p-6 lg:p-8 pb-24 md:pb-8" // Add padding-bottom for mobile bottom nav
        >
          {children}
        </main>
        {/* Mobile-only Bottom Navigation */}
        <MobileBottomNav userRoles={user.roles || []} />
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}

// New Mobile Bottom Navigation Component
const MobileBottomNav = ({ userRoles }: { userRoles: string[] }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathname = usePathname();
    
    // Define the core navigation items for the floating menu
    const navItems = [
      { href: "/dashboard", label: "Hub", icon: LayoutDashboard },
      { href: "/chat", label: "Chat", icon: MessageCircle },
      { href: "/ecommerce", label: "Shop", icon: ShoppingCart },
    ];

    return (
        <>
        {/* Main Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border flex items-center justify-around z-40">
            {navItems.map(item => (
                <Link key={item.href} href={item.href} className={cn("flex flex-col items-center justify-center text-muted-foreground transition-colors hover:text-primary", pathname === item.href && "text-primary")}>
                    <item.icon className="h-6 w-6" />
                    <span className="text-[10px]">{item.label}</span>
                </Link>
            ))}
        </div>

        {/* Floating Action Button for Menu */}
        <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
             <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72"
                    >
                        <Card className="shadow-2xl">
                            <CardContent className="p-2">
                                <SidebarNav userRoles={userRoles}/>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
            <Button 
                onClick={() => setIsMenuOpen(prev => !prev)}
                className="rounded-full h-16 w-16 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transform-gpu transition-transform hover:scale-105"
            >
                <motion.div
                    animate={{ rotate: isMenuOpen ? 45 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Plus className="h-8 w-8"/>
                </motion.div>
                <span className="sr-only">Toggle Menu</span>
            </Button>
        </div>
        </>
    )
}
