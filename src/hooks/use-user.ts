
"use client";

import { useEffect, useState } from 'react';
import type { User } from '@/lib/auth-data';

// The user object from the session will not have a password.
type SessionUser = Omit<User, 'password'>;

interface UseUserResult {
  user: SessionUser | null;
  isLoading: boolean;
  mutate: () => void; // Function to trigger a re-fetch
}

export function useUser(): UseUserResult {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/session');
      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('Failed to fetch user session', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, isLoading, mutate: fetchUser };
}
