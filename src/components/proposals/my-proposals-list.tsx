
"use client";

import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { MyProposalListItem } from './my-proposal-list-item';

interface MyProposalsListProps {
  proposals: (Proposal & { job?: Job })[];
}

export function MyProposalsList({ proposals }: MyProposalsListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold">You haven't submitted any proposals yet.</h3>
        <p className="text-muted-foreground mt-1">
          Find work and start applying to projects.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {proposals.map(p => (
        <MyProposalListItem key={p.id} proposal={p} />
      ))}
    </div>
  );
}
