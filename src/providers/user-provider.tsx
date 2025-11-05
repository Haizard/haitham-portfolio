
"use client";

import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserRole } from '@/lib/auth-data';
import type { FreelancerProfile } from '@/lib/user-profile-data';

// This is the shape of the user object we get from the secure session.
// It is lightweight and available immediately after login.
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  createdAt: string;
}

// The context now provides the simple SessionUser.
export interface UserContextType {
  user: SessionUser | null;
  isLoading: boolean;
  login: (userData: SessionUser) => void;
  logout: () => Promise<void>;
  mutate: () => Promise<void>; // This function re-fetches the session data
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // This function ONLY checks the session. It does NOT fetch the detailed profile anymore.
  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) throw new Error('Session check failed');
      const sessionData = await sessionRes.json();
      
      setUser(sessionData.user || null); // Set user to session data or null
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // The login function now directly sets the user state from the data returned by the login API.
  const login = useCallback((userData: SessionUser) => {
    setUser(userData);
  }, []);

  const logout = async () => {
    setUser(null); // Optimistically log out on the client
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error) {
      console.error("Logout failed:", error);
      toast({ title: "Logout Error", description: "Could not log you out.", variant: "destructive" });
    }
  };
  
  // The mutate function is an alias for checkSession to re-validate the user.
  const mutate = useCallback(async () => {
    await checkSession();
  }, [checkSession]);

  const value = {
    user,
    isLoading,
    login,
    logout,
    mutate,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}
