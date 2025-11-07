"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { RoleDashboard } from '@/components/profile/role-dashboard';
import { useUser } from '@/hooks/use-user';
import type { User } from '@/lib/auth-data';

export default function AccountDashboard() {
  const { user: sessionUser, isLoading: isSessionLoading } = useUser();
  const [fullUser, setFullUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isSessionLoading && !sessionUser) {
      router.push('/login');
      return;
    }

    if (sessionUser) {
      fetchFullProfile();
    }
  }, [sessionUser, isSessionLoading, router]);

  const fetchFullProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (!response.ok) {
        throw new Error('Failed to fetch profile');
      }
      const data = await response.json();
      setFullUser(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isSessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fullUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Failed to load dashboard</p>
      </div>
    );
  }

  return <RoleDashboard roles={fullUser.roles} userName={fullUser.name} />;
}

