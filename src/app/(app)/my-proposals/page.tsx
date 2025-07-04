
"use client";

import { useEffect, useState, useCallback } from 'react';
import { MyProposalsList } from '@/components/proposals/my-proposals-list';
import { Loader2, FileText } from 'lucide-react';
import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { useUser } from '@/hooks/use-user';

export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<(Proposal & { job?: Job })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useUser();

  const fetchMyProposals = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      // Pass the freelancer ID to the API
      const response = await fetch(`/api/proposals?freelancerId=${user.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch your proposals.');
      }
      const data: (Proposal & { job?: Job })[] = await response.json();
      setProposals(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, user?.id]);

  // Initial fetch
  useEffect(() => {
    if (user) {
        fetchMyProposals();
    }
  }, [fetchMyProposals, user]);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <FileText className="mr-3 h-10 w-10 text-primary" />
          My Proposals
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Track the status of all your submitted job applications.
        </p>
      </header>
      
       <main>
           {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            ) : (
                <MyProposalsList proposals={proposals} />
            )}
        </main>
    </div>
  );
}
