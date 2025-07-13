
"use client";

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
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
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Track initial client-side load
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) {
        throw new Error(`Session check failed with status ${sessionRes.status}`);
      }
      const sessionData = await sessionRes.json();
      setUser(sessionData.user || null);
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser().then(() => {
      // After the first fetch completes, we are no longer in the initial load state.
      setIsInitialLoad(false);
    });
  }, [fetchUser]);

  const login = (userData: SessionUser) => {
    setUser(userData);
  };

  const logout = async () => {
    setUser(null);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Error", description: "Could not log you out. Please try again.", variant: "destructive" });
      fetchUser();
    }
  };

  const mutate = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    isLoading: isInitialLoad || isLoading, // Loading is true during initial load OR subsequent fetches
    login,
    logout,
    mutate,
  };

  // During the very first render on the client, isInitialLoad is true,
  // and we render the children to match the server output, preventing hydration error.
  if (isInitialLoad) {
    return (
      <UserContext.Provider value={value}>
        {children}
      </UserContext.Provider>
    );
  }

  // After the initial load, if we are still fetching (e.g., re-validating) or have no user,
  // we can safely show a loader. This part now only runs on the client after hydration.
  if (isLoading && !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

// Custom hook remains the same
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
