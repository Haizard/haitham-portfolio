
"use client";

import React from 'react';
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
import { Moon, Sun } from 'lucide-react'; 
import { ScrollArea } from '../ui/scroll-area';

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

// --- MOCK USER AND ROLE SIMULATION ---
// To see different dashboards, change the `roles` array for the mockUser.
// - For Admin View: roles: ['admin', 'creator']
// - For Vendor View: roles: ['vendor', 'creator']
// - For Freelancer View: roles: ['freelancer', 'creator']
// - For Client View: roles: ['client']
// A user can have multiple roles, e.g., ['freelancer', 'vendor', 'client']
const mockUsers = {
  admin: { name: 'Admin User', email: 'admin@creatoros.app', roles: ['admin', 'creator'] },
  vendor: { name: 'Vendor User', email: 'vendor@creatoros.app', roles: ['vendor', 'creator'] },
  freelancer: { name: 'Freelancer User', email: 'freelancer@creatoros.app', roles: ['freelancer', 'client', 'creator'] },
};
// -- CHANGE THE CURRENT ROLE HERE --
const currentUserRole: 'admin' | 'vendor' | 'freelancer' = 'admin';
const mockUser = mockUsers[currentUserRole];
// --- END MOCK USER ---


export function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="p-4 border-b border-sidebar-border">
          <Logo />
        </SidebarHeader>
        <SidebarContent className="p-0">
          <ScrollArea className="h-full">
            <div className="p-4">
             <SidebarNav userRoles={mockUser.roles} />
            </div>
          </ScrollArea>
        </SidebarContent>
        <SidebarFooter className="p-4 border-t border-sidebar-border flex items-center justify-between">
          <UserNav user={mockUser} />
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
