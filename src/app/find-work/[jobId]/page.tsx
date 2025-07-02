
"use client";

import * as React from 'react';
import { useEffect, useState, useCallback } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, DollarSign, Calendar, Clock, Tag, Briefcase, Send, Users, CheckSquare, PlaySquare, FolderClock, Pause, Star, Shield, Lock, Unlock, Banknote, User } from 'lucide-react';
import type { Job } from '@/lib/jobs-data';
import type { Proposal } from '@/lib/proposals-data';
import type { ClientProfile } from '@/lib/client-profile-data';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { ProposalSubmitDialog } from '@/components/proposals/proposal-submit-dialog';
import { ProposalList } from '@/components/proposals/proposal-list';
import { ReviewSubmitDialog } from '@/components/reviews/ReviewSubmitDialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
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
import { Skeleton } from '@/components/ui/skeleton';

// This is a placeholder until we have real user auth.
const MOCK_CURRENT_USER_AS_CLIENT_ID = "mockClient123";
const MOCK_CURRENT_USER_AS_FREELANCER_ID = "mockFreelancer456";

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProposalDialogOpen, setIsProposalDialogOpen] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  
  const [isReleasing, setIsReleasing] = useState(false);
  const [isReleaseConfirmationOpen, setIsReleaseConfirmationOpen] = useState(false);
  
  const router = useRouter();
  const { toast } = useToast();

  const fetchJobAndProposals = useCallback(async () => {
    if (!params.jobId) {
      setError("Job ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [jobResponse, proposalsResponse] = await Promise.all([
        fetch(`/api/jobs/${params.jobId}`),
        fetch(`/api/jobs/${params.jobId}/proposals`),
      ]);

      if (!jobResponse.ok) {
        if (jobResponse.status === 404) notFound();
        throw new Error(`Failed to fetch job details. Status: ${jobResponse.status}`);
      }
      const jobData: Job = await jobResponse.json();
      setJob(jobData);
      
      if (proposalsResponse.ok) {
        const proposalsData: Proposal[] = await proposalsResponse.json();
        setProposals(proposalsData);
      } else {
         console.warn(`Could not fetch proposals for job ${params.jobId}. Status: ${proposalsResponse.status}`);
         setProposals([]);
      }

    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      console.error("Error fetching job details:", err);
    } finally {
      setIsLoading(false);
    }
  }, [params.jobId, notFound]);

  useEffect(() => {
    fetchJobAndProposals();
  }, [fetchJobAndProposals]);

  useEffect(() => {
    if (job?.clientId) {
      const fetchClientProfile = async () => {
        try {
          const res = await fetch(`/api/client-profiles/${job.clientId}`);
          if (res.ok) {
            const data = await res.json();
            setClientProfile(data);
          } else {
             console.error(`Failed to fetch client profile for ${job.clientId}. Status: ${res.status}`);
          }
        } catch (err) {
          console.error("Failed to fetch client profile", err);
        }
      };
      fetchClientProfile();
    }
  }, [job]);
  
  // This could be determined by a global auth context in a real app
  const isOwner = job?.clientId === MOCK_CURRENT_USER_AS_CLIENT_ID;
  const hasApplied = proposals.some(p => p.freelancerId === MOCK_CURRENT_USER_AS_FREELANCER_ID);
  const acceptedProposal = proposals.find(p => p.status === 'accepted');
  const hiredFreelancerId = acceptedProposal?.freelancerId;
  const amIHiredFreelancer = hiredFreelancerId === MOCK_CURRENT_USER_AS_FREELANCER_ID;

  const handleReleaseEscrow = async () => {
    if (!job?.id) return;
    setIsReleasing(true);
    try {
      const response = await fetch(`/api/jobs/${job.id}/release`, { method: 'PUT' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to release funds');
      toast({ title: "Funds Released!", description: "The escrow payment has been released to the freelancer." });
      fetchJobAndProposals();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setIsReleasing(false);
      setIsReleaseConfirmationOpen(false);
    }
  };

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
  
  const budgetDisplay = job.budgetAmount ? `$${job.budgetAmount.toLocaleString()}` : "Not specified";
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
    switch(status) {
        case "open": return <FolderClock className="h-4 w-4 mr-1.5 text-blue-500"/>;
        case "in-progress": return <PlaySquare className="h-4 w-4 mr-1.5 text-yellow-500"/>;
        case "completed": return <CheckSquare className="h-4 w-4 mr-1.5 text-green-500"/>;
        case "cancelled": return <Pause className="h-4 w-4 mr-1.5 text-red-500"/>;
        default: return null;
    }
  };

  const getEscrowStatusInfo = (status: Job['escrowStatus']) => {
    switch(status) {
      case 'unfunded': return { text: 'Unfunded', icon: Shield, color: 'text-orange-500' };
      case 'funded': return { text: 'Funded', icon: Lock, color: 'text-green-600' };
      case 'released': return { text: 'Released', icon: Unlock, color: 'text-blue-500' };
      default: return { text: 'Unknown', icon: Shield, color: 'text-muted-foreground' };
    }
  };

  const showWorkspaceView = job.status === 'in-progress' || job.status === 'completed';

  const renderPublicView = () => (
    <Card className="shadow-xl">
      <CardHeader>
        <div className="flex justify-between items-start">
            <CardTitle className="text-3xl font-bold font-headline pr-4">{job.title}</CardTitle>
            <Badge variant={getStatusBadgeVariant(job.status)} className="text-sm capitalize flex items-center w-fit shrink-0">
              {getStatusIcon(job.status)}
              {job.status}
            </Badge>
        </div>
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
  );

  const renderWorkspaceView = () => (
    <Card className="shadow-xl">
       <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-3xl font-bold font-headline pr-4">{job.title}</CardTitle>
            <CardDescription className="text-base text-muted-foreground">Project Workspace</CardDescription>
          </div>
          <Badge variant={getStatusBadgeVariant(job.status)} className="text-sm capitalize flex items-center w-fit shrink-0">
            {getStatusIcon(job.status)}
            {job.status}
          </Badge>
        </div>
       </CardHeader>
       <CardContent>
          <Separator className="my-4"/>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-secondary/40">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Hired Freelancer</CardTitle></CardHeader>
              <CardContent>
                <Link href={`/freelancer/${hiredFreelancerId}`} className="flex items-center gap-3 group">
                  <Avatar><AvatarImage src="https://placehold.co/100x100.png" data-ai-hint="freelancer avatar"/><AvatarFallback>FL</AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold group-hover:text-primary">Mock Freelancer</p>
                    <p className="text-xs text-muted-foreground">View Profile</p>
                  </div>
                </Link>
              </CardContent>
            </Card>
            <Card className="bg-secondary/40">
              <CardHeader className="pb-2"><CardTitle className="text-base font-semibold">Agreed Terms</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 font-semibold text-green-600">
                  <DollarSign className="h-5 w-5"/> {acceptedProposal?.proposedRate.toLocaleString()} ({job.budgetType})
                </div>
              </CardContent>
            </Card>
          </div>
          <Separator className="my-6"/>
          <h3 className="font-semibold text-lg mb-3">Project Status & Actions</h3>
          <div className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-medium">Payment Protection</span>
                <Badge variant="outline" className={`text-sm flex items-center gap-1.5 ${getEscrowStatusInfo(job.escrowStatus).color}`}>
                  {React.createElement(getEscrowStatusInfo(job.escrowStatus).icon, { className: 'h-4 w-4' })}
                  {getEscrowStatusInfo(job.escrowStatus).text}
                </Badge>
              </div>
               {isOwner && job.status === 'in-progress' && job.escrowStatus === 'funded' && (
                <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-md text-green-700 dark:text-green-300 text-sm">
                  Project is funded. You can now collaborate with the freelancer.
                </div>
              )}
               {isOwner && job.status === 'completed' && job.escrowStatus === 'funded' && (
                <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => setIsReleaseConfirmationOpen(true)} disabled={isReleasing}>
                  {isReleasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Unlock className="mr-2 h-4 w-4"/>}
                  Release Escrow Payment
                </Button>
              )}
          </div>
       </CardContent>
    </Card>
  );

  return (
    <>
      <div className="container mx-auto py-8">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Jobs
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <main className="lg:col-span-2 space-y-8">
            {showWorkspaceView ? renderWorkspaceView() : renderPublicView()}
            
            {isOwner && job.status === "open" && (
                <Card className="shadow-xl animate-in fade-in-50 duration-300">
                    <CardHeader>
                        <CardTitle className="text-2xl font-headline flex items-center gap-2">
                           <Users className="h-7 w-7 text-primary"/> Proposals Received ({proposals.length})
                        </CardTitle>
                        <CardDescription>Review applications from interested freelancers. Job status is now '<strong>{job.status}</strong>'.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ProposalList 
                            proposals={proposals} 
                            isJobOwner={isOwner}
                            onAcceptSuccess={fetchJobAndProposals}
                        />
                    </CardContent>
                </Card>
            )}
             {isOwner && job.status === 'completed' && !job.clientReviewId && hiredFreelancerId && (
                <Card className="shadow-xl">
                    <CardHeader><CardTitle>Project Complete!</CardTitle></CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">The project is marked as complete. Please leave a review for the freelancer to finalize the process.</p>
                       <Button className="w-full sm:w-auto" onClick={() => setIsReviewDialogOpen(true)}>
                          <Star className="mr-2 h-4 w-4"/> Leave a Review
                      </Button>
                    </CardContent>
                </Card>
             )}
          </main>
          
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {!showWorkspaceView && (
                <>
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
                  {!isOwner && (
                    <CardFooter>
                      <Button 
                          size="lg" 
                          className="w-full bg-primary hover:bg-primary/90"
                          onClick={() => setIsProposalDialogOpen(true)}
                          disabled={job.status !== 'open' || hasApplied}
                        >
                          <Send className="mr-2 h-4 w-4"/>
                          {hasApplied ? "You Have Applied" : job.status !== 'open' ? `Job is ${job.status}` : "Apply for this Job"}
                      </Button>
                    </CardFooter>
                  )}
                </Card>
                
                <Card className="shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2"><User className="h-5 w-5 text-primary"/> About the Client</CardTitle>
                    </CardHeader>
                    <CardContent>
                       {clientProfile ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={clientProfile.avatarUrl} data-ai-hint="client avatar"/>
                                        <AvatarFallback>{clientProfile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold">{clientProfile.name}</p>
                                        <p className="text-xs text-muted-foreground">Joined {formatDistanceToNow(new Date(clientProfile.createdAt), { addSuffix: true })}</p>
                                    </div>
                                </div>
                                <Separator/>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-1.5 text-muted-foreground"><Shield className="h-4 w-4 text-green-500"/><span>Payment Verified</span></div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground"><Star className="h-4 w-4 text-yellow-500"/><span>{clientProfile.averageRating?.toFixed(1)} ({clientProfile.reviewCount} reviews)</span></div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground"><Briefcase className="h-4 w-4"/><span>{clientProfile.projectsPosted} jobs posted</span></div>
                                    <div className="flex items-center gap-1.5 text-muted-foreground"><DollarSign className="h-4 w-4"/><span>${clientProfile.totalSpent.toLocaleString()} spent</span></div>
                                </div>
                            </div>
                        ) : (
                             <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="space-y-1">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-3 w-16" />
                                    </div>
                                </div>
                                <Skeleton className="h-px w-full my-2" />
                                 <div className="grid grid-cols-2 gap-2">
                                     <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-full" />
                                     <Skeleton className="h-4 w-full" />
                                 </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </>
              )}
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
            fetchJobAndProposals();
          }}
        />
      )}
      {job && job.status === 'completed' && hiredFreelancerId && (
        <ReviewSubmitDialog
          isOpen={isReviewDialogOpen}
          onClose={() => setIsReviewDialogOpen(false)}
          jobId={job.id!}
          reviewerId={MOCK_CURRENT_USER_AS_CLIENT_ID}
          revieweeId={hiredFreelancerId}
          jobTitle={job.title}
          revieweeName="Mock Freelancer" // In a real app, fetch freelancer name
          reviewerRole="client"
          onSuccess={() => {
            toast({ title: "Review Submitted!", description: "Thank you for your feedback."});
            fetchJobAndProposals();
          }}
        />
      )}
      <AlertDialog open={isReleaseConfirmationOpen} onOpenChange={setIsReleaseConfirmationOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Fund Release</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to release the payment of <strong>${job.budgetAmount?.toLocaleString()}</strong> to the freelancer for the project "<strong>{job.title}</strong>"? This action is final and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsReleaseConfirmationOpen(false)} disabled={isReleasing}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReleaseEscrow} disabled={isReleasing} className="bg-blue-600 hover:bg-blue-700">
              {isReleasing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Confirm & Release Funds
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
    