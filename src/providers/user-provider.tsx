
"use client";

import { createContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/auth-data';
import { Loader2 } from 'lucide-react';

export type SessionUser = Omit<User, 'password' | '_id'>;

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
    // Only set loading to true when explicitly fetching, not on initial load.
    // setIsLoading(true); 
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setUser(data.user || null);
    } catch (error) {
      console.error('Failed to fetch user session', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Fetch user on initial load
    fetchUser();
  }, [fetchUser]);

  const login = (userData: SessionUser) => {
    // This is the key change: Directly set the user, don't re-fetch.
    // This eliminates the race condition after login.
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after login.
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

  // Render a loading state for the initial check to prevent layout shifts
  // This is important for the very first page load of the app.
  if (isLoading && user === null) {
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

// Re-export useToast to be used within the provider if needed
import { useToast } from '@/hooks/use-toast';
