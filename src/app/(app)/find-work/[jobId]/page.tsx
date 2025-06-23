
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, DollarSign, Calendar, Clock, Tag, Briefcase, Send } from 'lucide-react';
import type { Job } from '@/lib/jobs-data';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ProposalSubmitDialog } from '@/components/proposals/proposal-submit-dialog';

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const fetchJobDetails = async () => {
    if (!params.jobId) {
      setError("Job ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/jobs/${params.jobId}`);
      if (!response.ok) {
        if (response.status === 404) {
          notFound();
        }
        throw new Error(`Failed to fetch job details. Status: ${response.status}`);
      }
      const data: Job = await response.json();
      setJob(data);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      console.error("Error fetching job details:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchJobDetails();
  }, [params.jobId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold text-destructive">Error Loading Job</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!job) {
    notFound();
    return null;
  }
  
  const budgetDisplay = job.budgetAmount
    ? `$${job.budgetAmount.toLocaleString()}`
    : "Not specified";

  return (
    <>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2">
            <Card className="shadow-xl">
              <CardHeader>
                <CardTitle className="text-3xl font-bold font-headline">{job.title}</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                  Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="my-4" />
                <h3 className="font-semibold text-lg mb-2">Project Description</h3>
                <p className="text-foreground/80 whitespace-pre-line leading-relaxed">{job.description}</p>
                <Separator className="my-6" />
                <h3 className="font-semibold text-lg mb-3">Required Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map(skill => (
                    <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">
                      <Tag className="mr-1.5 h-4 w-4" /> {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </main>
          
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <Card className="shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-primary" />
                    Job Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 mt-0.5 text-green-600" />
                    <div>
                      <p className="font-semibold text-foreground">{budgetDisplay}</p>
                      <p className="text-xs text-muted-foreground">({job.budgetType} rate)</p>
                    </div>
                  </div>
                  {job.deadline && (
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 mt-0.5 text-red-600" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {new Date(job.deadline).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground">Application Deadline</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-foreground">Posted</p>
                      <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                      size="lg" 
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => setIsProposalDialogOpen(true)}
                    >
                      <Send className="mr-2 h-4 w-4"/>
                      Apply for this Job
                  </Button>
                </CardFooter>
              </Card>
              
              <Card className="shadow-lg">
                  <CardHeader>
                      <CardTitle className="text-lg">About the Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                      <p className="text-sm text-muted-foreground">Client details and history will be displayed here.</p>
                  </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      </div>
      {job && (
        <ProposalSubmitDialog 
          isOpen={isProposalDialogOpen}
          onClose={() => setIsProposalDialogOpen(false)}
          job={job}
          onSuccess={() => {
            toast({ title: "Application Sent!", description: "The client will be notified of your proposal."});
            // Optionally, you could disable the apply button after successful submission
          }}
        />
      )}
    </>
  );
}
