
import { JobList } from '@/components/jobs/job-list';
import { Search } from 'lucide-react';

export default function FindWorkPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <Search className="mr-3 h-10 w-10 text-primary" />
          Find Work
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Browse through the latest job postings and find your next project.
        </p>
      </header>
      <JobList />
    </div>
  );
}
