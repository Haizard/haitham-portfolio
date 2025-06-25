
"use client";

import type { Proposal } from '@/lib/proposals-data';
import type { Job } from '@/lib/jobs-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, CheckSquare, Play, FolderClock, Pause, ExternalLink, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface MyProjectListItemProps {
  proposal: Proposal & { job?: Job };
}

export function MyProjectListItem({ proposal }: MyProjectListItemProps) {
    const job = proposal.job;

    if (!job) {
        return (
            <Card className="shadow-md flex flex-col items-center justify-center p-4">
                <CardTitle className="text-base text-destructive">Job Data Missing</CardTitle>
                <CardDescription>Could not load details for this project.</CardDescription>
            </Card>
        );
    }
    
    const getJobStatusBadgeVariant = (status: Job['status']): "default" | "secondary" | "outline" | "destructive" => {
        switch (status) {
            case "open": return "secondary"; // Should not happen for an accepted project
            case "in-progress": return "default";
            case "completed": return "outline";
            case "cancelled": return "destructive";
            default: return "outline";
        }
    };

    const getJobStatusIcon = (status: Job['status']) => {
        switch (status) {
            case "open": return <FolderClock className="h-3 w-3 mr-1" />;
            case "in-progress": return <Play className="h-3 w-3 mr-1" />;
            case "completed": return <CheckSquare className="h-3 w-3 mr-1" />;
            case "cancelled": return <Pause className="h-3 w-3 mr-1" />;
            default: return null;
        }
    };
    
    // In a real app, client details would be fetched.
    const mockClientName = "Mock Client";

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{job.title}</CardTitle>
                <CardDescription>Client: {mockClientName}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm flex-grow">
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Agreed Rate:</span>
                    <span className="font-semibold flex items-center"><DollarSign className="h-4 w-4 mr-1 text-green-600"/> {proposal.proposedRate.toLocaleString()} ({job.budgetType})</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Project Status:</span>
                    <Badge variant={getJobStatusBadgeVariant(job.status)} className="capitalize flex items-center">
                        {getJobStatusIcon(job.status)} {job.status}
                    </Badge>
                </div>
            </CardContent>
            <CardFooter className="border-t pt-4 mt-auto flex justify-between gap-2">
                 <Button variant="outline" size="sm" asChild>
                    <Link href={`/find-work/${job.id}`}>
                        <ExternalLink className="mr-2 h-4 w-4" /> View Job
                    </Link>
                </Button>
                 <Button size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" /> Go to Workspace
                </Button>
            </CardFooter>
        </Card>
    );
}
