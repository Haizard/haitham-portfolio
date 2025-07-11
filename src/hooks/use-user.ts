
"use client";

import { useContext } from 'react';
import { UserContext, type UserContextType } from '@/providers/user-provider';

// This hook now simply provides access to the centrally managed UserContext.
// It no longer performs its own data fetching, which was the source of the redirect loop.
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
