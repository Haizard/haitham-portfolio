
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
import { CheckSquare, PlaySquare, Pause, FolderClock, Users, Eye, ClipboardList, CheckCircle, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '../ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface MyJobsListProps {
  jobs: Job[];
  onJobUpdate: () => void;
}

export function MyJobsList({ jobs, onJobUpdate }: MyJobsListProps) {
  const [jobToUpdate, setJobToUpdate] = useState<{ job: Job; newStatus: 'completed' | 'cancelled' } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

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

  const handleUpdateStatus = async () => {
    if (!jobToUpdate) return;
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/jobs/${jobToUpdate.job.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: jobToUpdate.newStatus }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update job status.');
      }
      toast({
        title: "Job Status Updated!",
        description: `The job "${jobToUpdate.job.title}" has been marked as ${jobToUpdate.newStatus}.`,
      });
      onJobUpdate(); // Refresh the list via callback
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
      setJobToUpdate(null);
    }
  };


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
    <>
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
                      <TableCell className="text-right space-x-1">
                          <Button asChild variant="outline" size="sm">
                          <Link href={`/find-work/${job.id}`}>
                              <Eye className="mr-2 h-4 w-4" /> View Job
                          </Link>
                          </Button>
                          {job.status === 'in-progress' && (
                            <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setJobToUpdate({ job, newStatus: 'completed' })}>
                              <CheckCircle className="mr-2 h-4 w-4" /> Mark Complete
                            </Button>
                          )}
                      </TableCell>
                      </TableRow>
                  ))}
                  </TableBody>
              </Table>
              </div>
        </CardContent>
      </Card>
      <AlertDialog open={!!jobToUpdate} onOpenChange={(open) => !open && setJobToUpdate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark the job "<strong>{jobToUpdate?.job.title}</strong>" as {jobToUpdate?.newStatus}? This will allow you and the freelancer to leave reviews.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToUpdate(null)} disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateStatus} disabled={isUpdating} className="bg-primary hover:bg-primary/90">
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
