"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, UserCircle, Mail, Briefcase, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  avatarUrl: string;
  occupation: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Could not load your profile data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!profile) return;
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Saving profile:", profile); 
    // In a real app, you would make a POST/PUT request to your API here:
    // try {
    //   const response = await fetch('/api/profile', {
    //     method: 'POST', // or 'PUT'
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(profile),
    //   });
    //   if (!response.ok) throw new Error('Failed to save profile');
    //   toast({ title: "Success", description: "Profile updated successfully!" });
    // } catch (error) {
    //   toast({ title: "Error", description: "Could not save profile.", variant: "destructive" });
    // }
    toast({ title: "Profile Saved (Simulated)", description: "Your profile changes have been 'saved'." });
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-10">
        <p className="text-xl text-muted-foreground">Could not load profile data.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <UserCircle className="mr-3 h-10 w-10 text-primary" /> Your Profile
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your personal information and preferences.
        </p>
      </header>

      <Card className="shadow-xl max-w-3xl mx-auto">
        <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:space-x-6">
          <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 mb-4 sm:mb-0">
            <AvatarImage src={profile.avatarUrl} alt={profile.name} data-ai-hint="user avatar" />
            <AvatarFallback>{profile.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-3xl font-headline">{profile.name}</CardTitle>
            <CardDescription className="text-lg">{profile.occupation}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />Full Name</Label>
              <Input id="name" name="name" value={profile.name} onChange={handleInputChange} className="text-base p-3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Email Address</Label>
              <Input id="email" name="email" type="email" value={profile.email} onChange={handleInputChange} className="text-base p-3" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupation" className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Occupation / Title</Label>
            <Input id="occupation" name="occupation" value={profile.occupation} onChange={handleInputChange} className="text-base p-3" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />Bio / About Me</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio}
              onChange={handleInputChange}
              placeholder="Tell us a little about yourself..."
              className="min-h-[120px] text-base p-3"
            />
          </div>
          <div className="border-t pt-6 flex justify-end">
            <Button onClick={handleSaveProfile} disabled={isSaving || isLoading} size="lg" className="bg-primary hover:bg-primary/90">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-5 w-5" /> Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
