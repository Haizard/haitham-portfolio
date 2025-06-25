
"use client";

import { useEffect, useState, useCallback } from 'react';
import { MyProjectsList } from '@/components/jobs/my-projects-list';
import { Loader2, Briefcase } from 'lucide-react';
import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';

// This would come from auth in a real app
const MOCK_FREELANCER_ID = "mockFreelancer456";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<(Proposal & { job?: Job })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals?freelancerId=${MOCK_FREELANCER_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch your projects.');
      }
      const data: (Proposal & { job?: Job })[] = await response.json();
      // Filter for projects where the proposal was accepted
      const acceptedProjects = data.filter(p => p.status === 'accepted');
      setProjects(acceptedProjects);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchMyProjects();
  }, [fetchMyProjects]);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Briefcase className="mr-3 h-10 w-10 text-primary" />
          My Projects
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your active and completed freelance projects.
        </p>
      </header>
      
       <main>
           {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            ) : (
                <MyProjectsList projects={projects} />
            )}
        </main>
    </div>
  );
}
