
"use client";

import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, Check, X, FileText, ExternalLink, CalendarClock, Play, CheckSquare, Pause } from 'lucide-react';
import Link from 'next/link';

interface MyProposalListItemProps {
  proposal: Proposal & { job?: Job };
}

export function MyProposalListItem({ proposal }: MyProposalListItemProps) {
    const job = proposal.job;

    const getProposalStatusBadgeVariant = (status: Proposal['status']): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case 'submitted': return 'secondary';
            case 'shortlisted': return 'default';
            case 'accepted': return 'default';
            case 'rejected': return 'destructive';
            default: return 'outline';
        }
    };
    const getJobStatusIcon = (status: Job['status']) => {
        switch (status) {
            case "open": return <CalendarClock className="h-3 w-3 mr-1" />;
            case "in-progress": return <Play className="h-3 w-3 mr-1" />;
            case "completed": return <CheckSquare className="h-3 w-3 mr-1" />;
            case "cancelled": return <Pause className="h-3 w-3 mr-1" />;
            default: return null;
        }
    };

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
                {job ? (
                     <CardTitle className="text-lg font-semibold hover:text-primary transition-colors">
                        <Link href={`/find-work/${job.id}`}>{job.title}</Link>
                    </CardTitle>
                ) : (
                    <CardTitle className="text-lg font-semibold text-muted-foreground">Job details not available</CardTitle>
                )}
                <CardDescription>
                    Proposal Submitted on {new Date(proposal.createdAt).toLocaleDateString()}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm flex-grow">
                <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Your Proposed Rate:</span>
                    <span className="font-semibold flex items-center"><DollarSign className="h-4 w-4 mr-1 text-green-600"/> {proposal.proposedRate.toLocaleString()} ({job?.budgetType})</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proposal Status:</span>
                    <Badge variant={getProposalStatusBadgeVariant(proposal.status)} className="capitalize">
                        {proposal.status}
                    </Badge>
                </div>
                {job && (
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">Job Status:</span>
                        <Badge variant="outline" className="capitalize flex items-center">
                            {getJobStatusIcon(job.status)} {job.status}
                        </Badge>
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t pt-4 mt-auto">
                <Button variant="outline" size="sm" asChild className="w-full">
                    <Link href={`/find-work/${proposal.jobId}`}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Original Job
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
