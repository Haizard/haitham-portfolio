
"use client";

import { createContext, useState, useEffect, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/auth-data';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
}

export interface UserContextType {
  user: SessionUser | null;
  isLoading: boolean;
  login: (userData: SessionUser) => void;
  logout: () => Promise<void>;
  mutate: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    // Only set loading to true on the very first fetch
    if (user === null && !isLoading) {
      setIsLoading(true);
    }
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) { 
          throw new Error(`Session check failed with status ${sessionRes.status}`);
      }
      const sessionData = await sessionRes.json();
      
      if (sessionData.user) {
        setUser(sessionData.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, user]);

  useEffect(() => {
    fetchUser();
    // This effect should only run once on mount to get the initial session state.
    // Subsequent updates will be handled by the `login`, `logout`, and `mutate` functions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (userData: SessionUser) => {
    setUser(userData);
    setIsLoading(false); 
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    mutate: fetchUser, 
  };
  
  // The UserProvider itself now handles the initial loading screen.
  // This ensures no child component (like AppLayout) can render prematurely.
  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
