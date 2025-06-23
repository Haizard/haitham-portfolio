
"use client";

import type { Proposal } from '@/lib/proposals-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, DollarSign, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

export function ProposalListItem({ proposal }: { proposal: Proposal }) {

  // In a real app, we'd fetch freelancer details from the DB using proposal.freelancerId
  const mockFreelancer = {
    name: "Mock Freelancer",
    avatarUrl: `https://placehold.co/100x100.png?text=MF`,
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={mockFreelancer.avatarUrl} alt={mockFreelancer.name} data-ai-hint="freelancer avatar"/>
            <AvatarFallback>{mockFreelancer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-lg font-semibold">{mockFreelancer.name}</CardTitle>
            <CardDescription className="text-xs">Submitted {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm p-4 bg-muted/50 rounded-lg border">
          <p className="whitespace-pre-wrap leading-relaxed">{proposal.coverLetter}</p>
        </div>
        <Separator/>
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Proposed Rate:</span>
          <span className="flex items-center gap-1.5 font-bold text-green-600">
            <DollarSign className="h-4 w-4" /> {proposal.proposedRate.toLocaleString()}
          </span>
        </div>
         <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="font-semibold">Status:</span>
          <Badge variant={proposal.status === 'submitted' ? 'secondary' : 'default'} className="capitalize">{proposal.status}</Badge>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 border-t pt-4">
        <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4"/> Message</Button>
        <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90">Accept Proposal</Button>
      </CardFooter>
    </Card>
  );
}
