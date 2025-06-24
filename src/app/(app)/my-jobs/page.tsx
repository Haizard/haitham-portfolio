
"use client";

import { useEffect, useState, useCallback } from 'react';
import { MyJobsList } from '@/components/jobs/my-jobs-list';
import { Loader2, ClipboardList } from 'lucide-react';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

// This would come from auth in a real app
const MOCK_CLIENT_ID = "mockClient123";

export default function MyJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchMyJobs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/jobs?clientId=${MOCK_CLIENT_ID}`);
      if (!response.ok) {
        throw new Error('Failed to fetch your jobs.');
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
  }, [toast]);

  useEffect(() => {
    fetchMyJobs();
  }, [fetchMyJobs]);

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
            <ClipboardList className="mr-3 h-10 w-10 text-primary" />
            Manage My Jobs
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
            Track and manage all the jobs you've posted.
            </p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <Link href="/post-job">
                <PlusCircle className="mr-2 h-5 w-5"/> Post a New Job
            </Link>
        </Button>
      </header>
      
       <main>
           {isLoading ? (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            ) : (
                <MyJobsList jobs={jobs} />
            )}
        </main>
    </div>
  );
}
