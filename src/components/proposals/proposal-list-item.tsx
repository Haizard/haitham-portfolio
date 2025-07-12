
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { useUser } from '@/hooks/use-user';
import { StarRating } from '../reviews/StarRating';

interface ProposalListItemProps {
  proposal: Proposal;
  isJobOwner: boolean;
  onAcceptSuccess: () => void; // Callback to refresh job details on parent
}

export function ProposalListItem({ proposal, isJobOwner, onAcceptSuccess }: ProposalListItemProps) {
  const [isAccepting, setIsAccepting] = useState(false);
  const [isMessaging, setIsMessaging] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useUser();

  const freelancer = proposal.freelancer;

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
        description: `You have hired ${freelancer?.name}. The job is now in progress.`,
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
  
  const handleMessage = async () => {
    if (!user?.id) return;
    setIsMessaging(true);
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentUserId: user.id,
          participantIds: [proposal.freelancerId]
        }),
      });
      const conversation = await response.json();
      if (!response.ok) {
        throw new Error(conversation.message || "Failed to start conversation");
      }
      router.push(`/chat?conversationId=${conversation.id}`);
    } catch (error: any) {
      toast({ title: "Error starting chat", description: error.message, variant: "destructive" });
    } finally {
      setIsMessaging(false);
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
    <Card className="shadow-sm hover:shadow-lg transition-shadow bg-card">
      <div className="p-4 flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <Link href={`/freelancer/${proposal.freelancerId}`}>
            <Avatar className="h-16 w-16">
              <AvatarImage src={freelancer?.avatarUrl} alt={freelancer?.name} data-ai-hint="freelancer avatar"/>
              <AvatarFallback>{freelancer?.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>
        </div>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start">
            <div>
              <CardTitle className="text-lg font-semibold hover:text-primary">
                <Link href={`/freelancer/${proposal.freelancerId}`}>
                  {freelancer?.name || "Unknown Freelancer"}
                </Link>
              </CardTitle>
              {freelancer && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <StarRating rating={freelancer.averageRating || 0} size={14} disabled/>
                  <span>{freelancer.averageRating?.toFixed(1)}</span>
                  <span>({freelancer.reviewCount} reviews)</span>
                </div>
              )}
            </div>
            <div className="text-sm sm:text-right mt-2 sm:mt-0">
              <p className="font-bold text-lg text-primary">${proposal.proposedRate.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">in {formatDistanceToNow(new Date(proposal.createdAt))}</p>
            </div>
          </div>
          <div className="text-sm mt-3 p-3 bg-muted/30 rounded-md border max-h-24 overflow-y-auto">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground/80">{proposal.coverLetter}</p>
          </div>
        </div>
      </div>
      {isJobOwner && (
        <CardFooter className="flex justify-end gap-2 border-t pt-3 pb-3 bg-muted/20">
            <Button variant="outline" size="sm" onClick={handleMessage} disabled={isAccepting || isMessaging}>
                {isMessaging ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <MessageSquare className="mr-2 h-4 w-4"/>} Message
            </Button>
            <Button 
                variant="default" 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                onClick={handleAccept}
                disabled={isAccepting || isMessaging || proposal.status !== 'submitted'}
            >
                {isAccepting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4"/>}
                {proposal.status === 'accepted' ? 'Hired' : 'Hire'}
            </Button>
        </CardFooter>
      )}
    </Card>
  );
}
