
"use client";

import { useEffect, useState, useCallback } from 'react';
import { MyProjectsList } from '@/components/jobs/my-projects-list';
import { Loader2, Briefcase } from 'lucide-react';
import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { ReviewSubmitDialog } from '@/components/reviews/ReviewSubmitDialog';
import { useUser } from '@/hooks/use-user';


interface ReviewDialogState {
  isOpen: boolean;
  jobId: string;
  jobTitle: string;
  revieweeId: string; // This will be the client's ID
  revieweeName: string; // The client's name
}

export default function MyProjectsPage() {
  const [projects, setProjects] = useState<(Proposal & { job?: Job })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [reviewState, setReviewState] = useState<ReviewDialogState | null>(null);
  const { user } = useUser();

  const fetchMyProjects = useCallback(async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/proposals?freelancerId=${user.id}`);
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
  }, [toast, user?.id]);

  useEffect(() => {
    if (user) {
        fetchMyProjects();
    }
  }, [fetchMyProjects, user]);

  const handleOpenReviewDialog = (project: Proposal & { job?: Job }) => {
    if (!project.job || !project.job.clientProfile) return;
    setReviewState({
      isOpen: true,
      jobId: project.job.id!,
      jobTitle: project.job.title,
      revieweeId: project.job.clientId, // The client is being reviewed
      revieweeName: project.job.clientProfile.name, // Use real client name
    });
  };

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
                <MyProjectsList 
                    projects={projects} 
                    onLeaveReview={handleOpenReviewDialog}
                />
            )}
        </main>

        {reviewState?.isOpen && user && (
            <ReviewSubmitDialog
                isOpen={reviewState.isOpen}
                onClose={() => setReviewState(null)}
                jobId={reviewState.jobId}
                jobTitle={reviewState.jobTitle}
                reviewerId={user.id}
                revieweeId={reviewState.revieweeId}
                revieweeName={reviewState.revieweeName}
                reviewerRole="freelancer"
                onSuccess={() => {
                    toast({ title: "Review Submitted!", description: "Thank you for your feedback." });
                    fetchMyProjects(); // Re-fetch to update button state
                    setReviewState(null);
                }}
            />
        )}
    </div>
  );
}
