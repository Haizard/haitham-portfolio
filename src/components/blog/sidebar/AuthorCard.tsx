
"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Loader2, Twitter, UserCircle } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  occupation: string;
}

export function AuthorCard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data: UserProfile = await response.json();
          setProfile(data);
        } else {
          console.log('Could not fetch logged-in user profile, showing default author card.');
          setProfile({
            name: "Ajira Online User",
            email: "user@ajira.online",
            bio: "Welcome to the Ajira Online blog! Discover insights, tutorials, and updates.",
            avatarUrl: "https://placehold.co/100x100.png?text=AO",
            occupation: "Traveler"
          });
        }
      } catch (error) {
        console.error("Network error fetching profile:", error);
        setProfile({
          name: "Ajira Online User",
          email: "user@ajira.online",
          bio: "Welcome to the Ajira Online blog! Discover insights, tutorials, and updates.",
          avatarUrl: "https://placehold.co/100x100.png?text=AO",
          occupation: "Traveler"
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  if (isLoading) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" /> About Author</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary my-4" />
          <p className="text-muted-foreground text-sm">Loading author details...</p>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null; // Or some error display
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center"><UserCircle className="mr-2 h-5 w-5 text-primary" /> About Author</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center text-center">
        <Avatar className="h-24 w-24 mb-4 ring-2 ring-primary ring-offset-2">
          <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="author portrait" />
          <AvatarFallback>{profile.name?.substring(0, 2)?.toUpperCase() || 'CO'}</AvatarFallback>
        </Avatar>
        <h3 className="text-xl font-semibold font-headline">{profile.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">{profile.occupation}</p>
        <p className="text-xs text-muted-foreground px-2 mb-4">{(profile.bio || "").substring(0, 150)}{(profile.bio?.length || 0) > 150 ? '...' : ''}</p>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" asChild>
            <Link href="#" aria-label="Twitter">
              <Twitter className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" aria-label="LinkedIn">
              <Linkedin className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" aria-label="GitHub">
              <Github className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
