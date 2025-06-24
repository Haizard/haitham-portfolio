
"use client";

import type { Proposal } from '@/lib/proposals-data';
import { ProposalListItem } from './proposal-list-item';

interface ProposalListProps {
  proposals: Proposal[];
  isJobOwner: boolean;
  onAcceptSuccess: () => void;
}


export function ProposalList({ proposals, isJobOwner, onAcceptSuccess }: ProposalListProps) {
  if (proposals.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold">No Proposals Yet</h3>
        <p className="text-muted-foreground mt-1">
          Check back later to see applications from freelancers.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {proposals.map(proposal => (
        <ProposalListItem 
            key={proposal.id} 
            proposal={proposal} 
            isJobOwner={isJobOwner}
            onAcceptSuccess={onAcceptSuccess}
        />
      ))}
    </div>
  );
}
