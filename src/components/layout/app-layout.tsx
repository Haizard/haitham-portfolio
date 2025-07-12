
"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const { user, isLoading } = useUser(); // isLoading now comes from the central provider
  const router = useRouter();

  useEffect(() => {
    // If loading is finished and there's no user, redirect to login
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);
  
  // This is the critical fix. We must wait for the initial loading to complete.
  // While isLoading is true, we show a full-screen loader.
  // The user object might be null briefly during the initial check.
  // By waiting for isLoading to be false, we ensure we have the definitive user state.
  if (isLoading) {
    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary"/>
        </div>
    );
  }

  // If loading is done and there's still no user, the useEffect will handle the redirect.
  // Rendering null here prevents a brief flash of the dashboard layout.
  if (!user) {
    return null;
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
             <SidebarNav userRoles={user?.roles || []} />
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
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
