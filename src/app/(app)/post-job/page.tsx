
import { JobPostForm } from '@/components/jobs/job-post-form';

export default function PostJobPage() {
  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight font-headline">
          Create a New Job Posting
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Detail your project needs and find the perfect freelance talent.
        </p>
      </header>
      <JobPostForm />
    </div>
  );
}
