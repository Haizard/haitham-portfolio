
"use client";

import type { Job } from '@/lib/jobs-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Clock, Calendar, DollarSign, ExternalLink, ShieldCheck, UserCircle, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link'; // Import Link

export function JobListItem({ job }: { job: Job }) {
  const budgetDisplay = job.budgetAmount
    ? `$${job.budgetAmount.toLocaleString()}`
    : "Not specified";
  const clientName = job.clientProfile?.name || 'Client';
  const clientRating = job.clientProfile?.averageRating?.toFixed(1) || 'N/A';
  const clientReviews = job.clientProfile?.reviewCount || 0;

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow flex flex-col group">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-semibold group-hover:text-primary transition-colors">
                <Link href={`/find-work/${job.id}`}>{job.title}</Link>
            </CardTitle>
            <Button asChild variant="default" size="sm" className="shrink-0 bg-primary hover:bg-primary/90">
                 <Link href={`/find-work/${job.id}`}>
                    Apply Now
                </Link>
            </Button>
        </div>
        <CardDescription className="text-sm flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-green-600">
            <DollarSign className="h-4 w-4" /> {budgetDisplay} ({job.budgetType === 'hourly' ? 'Hourly' : 'Fixed Price'})
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
          </span>
           <span className="flex items-center gap-1.5">
            <UserCircle className="h-4 w-4" /> Proposals: {job.proposalCount || 0}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-foreground/80 line-clamp-2 text-sm">{job.description}</p>
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired.slice(0, 7).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs font-normal">
              {skill}
            </Badge>
          ))}
          {job.skillsRequired.length > 7 && (
            <Badge variant="outline" className="text-xs font-normal">
              +{job.skillsRequired.length - 7} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground border-t pt-3 pb-3">
         <div className="flex items-center gap-1 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600"/> Payment Verified
        </div>
        <div className="flex items-center gap-1">
            <Star className="h-3.5 w-3.5 text-yellow-500"/>
            <span className="font-medium">{clientRating}</span>
            <span>({clientReviews} reviews)</span>
        </div>
        <div className="font-medium">
            {job.clientProfile?.totalSpent ? `$${job.clientProfile.totalSpent.toLocaleString()}+ spent` : '$0 spent'}
        </div>
         <div className="font-medium">
            {job.clientProfile?.location || 'Unknown Location'}
        </div>
      </CardFooter>
    </Card>
  );
}
