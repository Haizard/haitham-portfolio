
"use client";

import { useContext } from 'react';
import { UserContext, type UserContextType } from '@/providers/user-provider';

// This custom hook remains the same. It simply consumes the context.
// The real logic is now correctly placed in the provider itself.
export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
