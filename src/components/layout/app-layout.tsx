
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from "next-themes";
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
import { Loader2, Moon, Sun, Plus, LayoutDashboard, MessageCircle, ShoppingCart, UserCircle, Sparkles, FilePlus2, Store, Briefcase } from 'lucide-react'; 
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { Toaster } from '../ui/toaster';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '../ui/card';

gsap.registerPlugin(useGSAP);

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme, setTheme } = useTheme();
  const { user, isLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const mainRef = useRef(null);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  useGSAP(() => {
    if (mainRef.current && !isLoading) { // Ensure user is loaded before animating
        gsap.fromTo(mainRef.current, 
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
        );
    }
  }, { dependencies: [pathname, isLoading], scope: mainRef });
  
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
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6 md:hidden">
          <Logo />
          {/* Default trigger is used by the Sheet for mobile sidebar */}
          <SidebarTrigger />
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

// Mobile Bottom Navigation Component for App Layout
const MobileBottomNav = ({ userRoles }: { userRoles: string[] }) => {
    const pathname = usePathname();
    
    // Core navigation items for the bottom bar
    const navItems = [
      { href: "/dashboard", label: "Hub", icon: LayoutDashboard },
      { href: "/chat", label: "Chat", icon: MessageCircle },
      { href: "/profile", label: "Profile", icon: UserCircle },
    ];

    // Example logic to add a role-specific primary action
    let primaryAction = { href: "/find-work", label: "Work", icon: Briefcase };
    if (userRoles.includes('vendor')) {
      primaryAction = { href: "/vendor/dashboard", label: "Store", icon: Store };
    } else if (userRoles.includes('client')) {
      primaryAction = { href: "/my-jobs", label: "Jobs", icon: Briefcase };
    } else if (userRoles.includes('creator')) {
       primaryAction = { href: "/content-studio", label: "Create", icon: Sparkles };
    }
    
    const allNavItems = [navItems[0], navItems[1], primaryAction, navItems[2]];

    return (
      <AnimatePresence>
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border grid grid-cols-4 z-40"
        >
          {allNavItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center text-muted-foreground transition-colors hover:text-primary w-full h-full",
                pathname.includes(item.href) && item.href !== "/dashboard" ? "text-primary" : "",
                pathname.endsWith("/dashboard") && item.href === "/dashboard" ? "text-primary" : ""
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </Link>
          ))}
        </motion.div>
      </AnimatePresence>
    );
};
