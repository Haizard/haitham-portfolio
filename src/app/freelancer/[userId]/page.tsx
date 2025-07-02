
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, Mail, Briefcase, Link as LinkIcon, DollarSign, Settings2, Info, Star, MessageSquare, ExternalLink, Globe } from 'lucide-react';
import type { FreelancerProfile } from '@/lib/user-profile-data';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { StarRating } from '@/components/reviews/StarRating';

export default function FreelancerProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const { userId } = params;

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Freelancer ID is missing.");
      setIsLoading(false);
      return;
    }

    async function fetchProfile() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/freelancers/${userId}`);
        if (!response.ok) {
          if (response.status === 404) notFound();
          throw new Error('Failed to fetch freelancer profile.');
        }
        const data: FreelancerProfile = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching freelancer profile:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

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
        <h2 className="text-xl font-semibold text-destructive">Error Loading Profile</h2>
        <p className="text-muted-foreground mt-2">{error}</p>
        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }
  
  if (!profile) {
    notFound();
    return null;
  }

  const getAvailabilityColor = (status: FreelancerProfile['availabilityStatus']) => {
    switch(status) {
      case 'available': return 'bg-green-500';
      case 'busy': return 'bg-yellow-500';
      case 'not_available': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
      </Button>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
            <Card className="shadow-xl sticky top-24">
                <CardHeader className="items-center text-center">
                    <Avatar className="h-28 w-28 mb-3 ring-4 ring-primary ring-offset-2">
                        <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="freelancer avatar"/>
                        <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl font-bold font-headline">{profile.name}</CardTitle>
                    <CardDescription className="text-md">{profile.occupation}</CardDescription>
                     <div className="flex items-center gap-2 pt-2">
                        <span className={cn("h-3 w-3 rounded-full", getAvailabilityColor(profile.availabilityStatus))}></span>
                        <span className="text-sm text-muted-foreground capitalize">{profile.availabilityStatus.replace('_', ' ')}</span>
                    </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <Button className="w-full bg-primary hover:bg-primary/90">
                        <MessageSquare className="mr-2 h-4 w-4"/> Contact {profile.name.split(' ')[0]}
                    </Button>
                     {profile.hourlyRate && (
                         <div className="flex items-center justify-center gap-2 text-lg">
                            <DollarSign className="h-5 w-5 text-green-600"/>
                            <span className="font-semibold">${profile.hourlyRate}</span>
                            <span className="text-muted-foreground text-sm">/ hour</span>
                         </div>
                     )}
                </CardContent>
            </Card>
        </div>
        <main className="lg:col-span-2 space-y-8">
          <Card className="shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Info className="h-5 w-5 text-primary"/>About Me</CardTitle></CardHeader>
            <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">{profile.bio}</p>
            </CardContent>
          </Card>
           <Card className="shadow-xl">
            <CardHeader><CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-primary"/>Skills</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-sm px-3 py-1">{skill}</Badge>
              ))}
            </CardContent>
          </Card>
          {profile.portfolioLinks && profile.portfolioLinks.length > 0 && (
              <Card className="shadow-xl">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase className="h-5 w-5 text-primary"/>Portfolio</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.portfolioLinks.map(link => (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="block border rounded-lg p-3 hover:bg-muted/50 hover:border-primary transition-all group">
                          <p className="font-semibold text-sm truncate group-hover:text-primary">{link.title}</p>
                          <p className="text-xs text-blue-500 truncate flex items-center gap-1">
                              <ExternalLink className="h-3 w-3"/>
                              {link.url}
                          </p>
                      </a>
                    ))}
                  </CardContent>
              </Card>
          )}

           <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Client Reviews ({profile.reviewCount})</CardTitle>
                    <div className="flex items-center gap-2 pt-1">
                        <StarRating rating={profile.averageRating || 0} disabled/>
                        <span className="font-bold text-lg">{profile.averageRating?.toFixed(1)}</span>
                        <span className="text-sm text-muted-foreground">average rating</span>
                    </div>
                </CardHeader>
                <CardContent>
                    <ReviewsList freelancerId={userId} />
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  )
}

    