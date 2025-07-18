
"use client";

import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { MyProjectListItem } from './my-project-list-item';
import { Briefcase } from 'lucide-react';

interface MyProjectsListProps {
  projects: (Proposal & { job?: Job })[];
  onLeaveReview: (project: Proposal & { job?: Job }) => void;
}

export function MyProjectsList({ projects, onLeaveReview }: MyProjectsListProps) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
        <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">You have no active or completed projects.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          When a client accepts your proposal, your project will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map(p => (
        <MyProjectListItem key={p.id} proposal={p} onLeaveReview={onLeaveReview} />
      ))}
    </div>
  );
}
