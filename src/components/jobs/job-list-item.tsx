
"use client";

import type { Job } from '@/lib/jobs-data';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tag, Clock, Calendar, DollarSign, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link'; // Import Link

export function JobListItem({ job }: { job: Job }) {
  const budgetDisplay = job.budgetAmount
    ? `$${job.budgetAmount.toLocaleString()}`
    : "Not specified";

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-semibold hover:text-primary transition-colors">
          <Link href={`/find-work/${job.id}`}>{job.title}</Link>
        </CardTitle>
        <CardDescription className="text-sm">
          Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-muted-foreground line-clamp-3 text-sm">{job.description}</p>
        <div className="flex flex-wrap gap-2">
          {job.skillsRequired.slice(0, 5).map(skill => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
          {job.skillsRequired.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{job.skillsRequired.length - 5} more
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-4 sm:flex-row sm:justify-between sm:items-center border-t pt-4">
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5 font-medium text-green-600">
            <DollarSign className="h-4 w-4" /> {budgetDisplay} {job.budgetType === 'hourly' && '/ hour'}
          </span>
          {job.deadline && (
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> 
              Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/find-work/${job.id}`}>
            View Details <ExternalLink className="ml-2 h-4 w-4"/>
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
