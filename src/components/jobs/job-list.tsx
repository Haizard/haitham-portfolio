
"use client";

import { useEffect, useState } from 'react';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { JobListItem } from './job-list-item';

export function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchJobs() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/jobs');
        if (!response.ok) {
          throw new Error('Failed to fetch available jobs.');
        }
        const data: Job[] = await response.json();
        setJobs(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchJobs();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-10">
        No open jobs found at the moment. Check back later!
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {jobs.map(job => (
        <JobListItem key={job.id} job={job} />
      ))}
    </div>
  );
}
