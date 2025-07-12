
"use client";

import { createContext, useState, useEffect, useCallback } from 'react';
import type { FreelancerProfile } from '@/lib/user-profile-data'; // Use the more specific profile type
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// The SessionUser is now the full FreelancerProfile, as we will fetch it.
export type SessionUser = FreelancerProfile;

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
    setIsLoading(true); 
    try {
      // First, check for a basic session.
      const sessionRes = await fetch('/api/auth/session');
      const sessionData = await sessionRes.json();
      
      if (sessionData.user) {
        // If a session exists, fetch the full profile data.
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        } else {
          // If profile fetch fails, clear the session.
          setUser(null);
          await fetch('/api/auth/logout', { method: 'POST' });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user session', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (userData: SessionUser) => {
    // When login happens, we receive the full user object (now including profile data)
    // and set it directly. No need for an immediate re-fetch.
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
