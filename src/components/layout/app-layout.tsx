
"use client";

import React, { useEffect, useRef } from 'react';
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
import { Loader2, Moon, Sun } from 'lucide-react'; 
import { ScrollArea } from '../ui/scroll-area';
import { useUser } from '@/hooks/use-user';
import { Toaster } from '../ui/toaster';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';

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
          <SidebarTrigger />
        </header>
        <main 
          key={pathname}
          ref={mainRef}
          className="flex-1 p-4 md:p-6 lg:p-8"
        >
          {children}
        </main>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>
  );
}
