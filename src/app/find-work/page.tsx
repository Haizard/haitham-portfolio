
"use client";

import { useEffect, useState, useCallback } from 'react';
import { JobList } from '@/components/jobs/job-list';
import { JobFilters, type JobFilterValues } from '@/components/jobs/job-filters';
import { Search, Loader2, Filter } from 'lucide-react';
import type { Job } from '@/lib/jobs-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FreelancerHeader } from '@/components/freelancers/freelancer-header';

export default function FindWorkPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const fetchJobs = useCallback(async (filters: JobFilterValues = {}) => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.minBudget) queryParams.append('minBudget', filters.minBudget.toString());
      if (filters.maxBudget) queryParams.append('maxBudget', filters.maxBudget.toString());
      if (filters.budgetType) queryParams.append('budgetType', filters.budgetType);
      if (filters.skills) queryParams.append('skills', filters.skills.split(',').map(s => s.trim()).filter(Boolean).join(','));

      const response = await fetch(`/api/jobs?${queryParams.toString()}`);
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
      setIsFilterSheetOpen(false); // Close sheet after applying filters
    }
  }, [toast]);

  // Initial fetch
  useEffect(() => {
    fetchJobs({});
  }, [fetchJobs]);
  
  return (
    <>
      <FreelancerHeader />
      <div className="container mx-auto py-8">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight font-headline">
            Find Your Next Opportunity
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Browse, search, and filter through thousands of jobs to find your perfect match.
          </p>
        </header>
        
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-4">
          <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Show Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full max-w-sm">
               <SheetHeader className="pb-4">
                  <SheetTitle>Filter Jobs</SheetTitle>
               </SheetHeader>
               <JobFilters onFilterChange={fetchJobs} />
            </SheetContent>
          </Sheet>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <JobFilters onFilterChange={fetchJobs} />
            </div>
          </aside>
          <main className="lg:col-span-3">
             {isLoading ? (
              <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              ) : (
                  <JobList jobs={jobs} />
              )}
          </main>
        </div>
      </div>
    </>
  );
}
