
"use client";

import type { Job } from '@/lib/jobs-data';
import { JobListItem } from './job-list-item';

export function JobList({ jobs }: { jobs: Job[] }) {
  return (
    <div className="space-y-6">
      {jobs.map(job => (
        <JobListItem key={job.id} job={job} />
      ))}
    </div>
  );
}
