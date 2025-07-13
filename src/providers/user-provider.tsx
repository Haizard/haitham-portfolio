
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
  const [isLoading, setIsLoading] = useState(true); // Always start loading
  const { toast } = useToast();

  const fetchUser = useCallback(async () => {
    // This function will be called on mount and on explicit mutation.
    // It should not set loading to true every time, only on initial mount.
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
      // This is the key: set loading to false *after* the first fetch attempt completes.
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Run the fetch function once on initial component mount.
    fetchUser();
  }, [fetchUser]);

  const login = (userData: SessionUser) => {
    setUser(userData);
  };

  const logout = async () => {
    // Optimistically set user to null before making the API call for a faster UI response.
    setUser(null);
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
        toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
        console.error("Logout failed:", error);
        toast({ title: "Logout Error", description: "Could not log you out. Please try again.", variant: "destructive" });
        // If logout fails, we should probably refetch the user state to ensure consistency.
        fetchUser();
    }
  };
  
  const mutate = useCallback(async () => {
      // This function allows other parts of the app to trigger a re-fetch of the user session.
      // It should not set isLoading to true, as it's a background refresh.
      await fetchUser();
  }, [fetchUser]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    mutate,
  };
  
  // The provider itself now acts as the loading boundary.
  // It shows a full-screen loader ONLY during the initial, critical session check.
  if (isLoading) {
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
