
"use client";

import type { Job } from '@/lib/jobs-data';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { CheckSquare, PlaySquare, Pause, FolderClock, Users, Eye, ClipboardList } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface MyJobsListProps {
  jobs: Job[];
}

export function MyJobsList({ jobs }: MyJobsListProps) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-10 border rounded-lg shadow-sm bg-card">
        <ClipboardList className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">You haven't posted any jobs yet.</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Click the "Post a New Job" button to get started.
        </p>
      </div>
    );
  }

  const getStatusBadgeVariant = (status: Job['status']): "default" | "secondary" | "outline" | "destructive" => {
    switch (status) {
      case "open": return "secondary";
      case "in-progress": return "default";
      case "completed": return "outline";
      case "cancelled": return "destructive";
      default: return "outline";
    }
  };

  const getStatusIcon = (status: Job['status']) => {
    switch (status) {
      case "open": return <FolderClock className="h-3 w-3 mr-1.5" />;
      case "in-progress": return <PlaySquare className="h-3 w-3 mr-1.5" />;
      case "completed": return <CheckSquare className="h-3 w-3 mr-1.5" />;
      case "cancelled": return <Pause className="h-3 w-3 mr-1.5" />;
      default: return null;
    }
  };

  return (
    <Card className="shadow-xl">
        <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="min-w-[250px]">Job Title</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Proposals</TableHead>
                    <TableHead>Date Posted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {jobs.map(job => (
                    <TableRow key={job.id}>
                    <TableCell className="font-medium">
                        <Link href={`/find-work/${job.id}`} className="hover:text-primary hover:underline">
                            {job.title}
                        </Link>
                    </TableCell>
                    <TableCell>
                        <Badge variant={getStatusBadgeVariant(job.status)} className="capitalize text-xs flex items-center">
                        {getStatusIcon(job.status)} {job.status}
                        </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-1.5 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground"/>
                            <span className="font-medium">{job.proposalCount || 0}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm">
                        <Link href={`/find-work/${job.id}`}>
                            <Eye className="mr-2 h-4 w-4" /> View Proposals
                        </Link>
                        </Button>
                    </TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
            </div>
      </CardContent>
    </Card>
  );
}
