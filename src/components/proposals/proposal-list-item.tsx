
"use client";

import { useState } from 'react';
import type { Proposal } from '@/lib/proposals-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, User, DollarSign, Calendar, Check, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';

interface ProposalListItemProps {
  proposal: Proposal;
  isJobOwner: boolean;
  onAcceptSuccess: () => void; // Callback to refresh job details on parent
}


export function ProposalListItem({ proposal, isJobOwner, onAcceptSuccess }: ProposalListItemProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const { toast } = useToast();

  // In a real app, we'd fetch freelancer details from the DB using proposal.freelancerId
  const mockFreelancer = {
    name: "Mock Freelancer",
    avatarUrl: `https://placehold.co/100x100.png?text=MF`,
  };
  
  const handleAccept = async () => {
    if (!isJobOwner) return;
    setIsAccepting(true);
    try {
      const response = await fetch(`/api/proposals/${proposal.id}/accept`, {
        method: 'PUT',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to accept proposal.');
      }
      toast({
        title: "Proposal Accepted!",
        description: `You have hired ${mockFreelancer.name}. The job is now in progress.`,
      });
      onAcceptSuccess(); // Trigger parent component to re-fetch data
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsAccepting(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case 'submitted': return 'secondary';
      case 'shortlisted': return 'default';
      case 'accepted': return 'default'; // Using primary color for accepted
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };
  
  const getStatusIcon = (status: Proposal['status']) => {
    switch(status) {
        case 'accepted': return <Check className="h-4 w-4 mr-1.5"/>;
        case 'rejected': return <X className="h-4 w-4 mr-1.5"/>;
        default: return null;
    }
  };


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Link href={`/freelancer/${proposal.freelancerId}`}>
            <Avatar className="h-12 w-12">
              <AvatarImage src={mockFreelancer.avatarUrl} alt={mockFreelancer.name} data-ai-hint="freelancer avatar"/>
              <AvatarFallback>{mockFreelancer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
          <div>
            <CardTitle className="text-lg font-semibold hover:text-primary">
              <Link href={`/freelancer/${proposal.freelancerId}`}>
                {mockFreelancer.name}
              </Link>
            </CardTitle>
            <CardDescription className="text-xs">Submitted {formatDistanceToNow(new Date(proposal.createdAt), { addSuffix: true })}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm p-4 bg-muted/50 rounded-lg border max-h-48 overflow-y-auto">
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
          <Badge variant={getStatusBadgeVariant(proposal.status)} className="capitalize flex items-center">
            {getStatusIcon(proposal.status)}
            {proposal.status}
          </Badge>
        </div>
      </CardContent>
      {isJobOwner && (
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" size="sm"><MessageSquare className="mr-2 h-4 w-4"/> Message</Button>
            <Button 
                variant="default" 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleAccept}
                disabled={isAccepting || proposal.status !== 'submitted'}
            >
                {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Check className="mr-2 h-4 w-4"/>}
                {proposal.status === 'accepted' ? 'Accepted' : 'Accept Proposal'}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
