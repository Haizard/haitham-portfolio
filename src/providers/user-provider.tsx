
"use client";

import { createContext, useState, useEffect, useCallback } from 'react';
import type { FreelancerProfile } from '@/lib/user-profile-data';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// The SessionUser is the full FreelancerProfile, which is what the app components expect.
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
    // No need to set isLoading(true) here, as it's handled by the initial load state.
    // This function is mainly for re-validation (mutate).
    try {
      // First, check for a basic session. This is very fast.
      const sessionRes = await fetch('/api/auth/session');
      if (!sessionRes.ok) { // Handle network or server errors
          throw new Error(`Session check failed with status ${sessionRes.status}`);
      }
      const sessionData = await sessionRes.json();
      
      if (sessionData.user) {
        // If a session exists, fetch the full, up-to-date profile data.
        const profileRes = await fetch('/api/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser(profileData);
        } else {
          // If profile fetch fails, the session is stale. Log the user out.
          setUser(null);
          await fetch('/api/auth/logout', { method: 'POST' });
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error);
      setUser(null);
    } finally {
      // Only set loading to false after the entire check is complete.
      setIsLoading(false);
    }
  }, []);

  // The initial fetch on component mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = (userData: SessionUser) => {
    // When login/signup happens, the API returns the full profile.
    // We set it directly, and the session cookie has already been set by the API.
    setUser(userData);
    setIsLoading(false); // Ensure loading is false after a direct login.
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
    mutate: fetchUser, // Expose fetchUser as mutate for re-validation.
  };

  // While the initial fetch is happening, show a full-screen loader.
  // This prevents layout shifts or flashes of content that shouldn't be visible.
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
