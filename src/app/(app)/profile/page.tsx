

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCircle, Mail, Briefcase, Save, PlusCircle, Trash2, Link as LinkIcon, DollarSign, Settings2, Palette, Info, Star, MessageSquare, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FreelancerProfile, PortfolioLink } from '@/lib/user-profile-data';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ReviewsList } from '@/components/reviews/ReviewsList';
import { cn } from "@/lib/utils";
import { StarRating } from '@/components/reviews/StarRating';
import { useUser } from '@/hooks/use-user';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const portfolioLinkSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required.").max(100),
  url: z.string().url("Must be a valid URL.").min(1),
});

const profileFormSchema = z.object({
  name: z.string().min(1, "Name is required.").max(100),
  email: z.string().email("Invalid email address."),
  avatarUrl: z.string().url("Avatar URL must be valid.").or(z.literal("")),
  occupation: z.string().min(1, "Occupation is required.").max(100),
  bio: z.string().max(1000, "Bio cannot exceed 1000 characters.").optional().default(""),
  skills: z.string().optional().transform(val => val ? val.split(',').map(skill => skill.trim()).filter(Boolean) : []),
  portfolioLinks: z.array(portfolioLinkSchema).optional().default([]),
  hourlyRate: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number.isNaN(parseFloat(String(val)))) ? null : parseFloat(String(val)),
    z.number().min(0, "Hourly rate must be non-negative.").nullable().optional()
  ),
  availabilityStatus: z.enum(['available', 'busy', 'not_available']),
  payoutPhoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Please enter a valid phone number (e.g., 255712345678).").or(z.literal("")).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  // The user hook now provides the full, reliable profile data.
  const { user: profileData, isLoading: isUserLoading, mutate } = useUser();
  const router = useRouter();

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "", email: "", avatarUrl: "", occupation: "", bio: "",
      skills: [], portfolioLinks: [], hourlyRate: null, availabilityStatus: "available",
      payoutPhoneNumber: "",
    },
  });
  
  const { fields: portfolioFields, append: appendPortfolioLink, remove: removePortfolioLink } = useFieldArray({
    control: form.control,
    name: "portfolioLinks",
  });

  // This effect now simply syncs the form state with the reliable user data from the context.
  useEffect(() => {
    if (profileData) {
      form.reset({
        name: profileData.name || "",
        email: profileData.email || "",
        avatarUrl: profileData.avatarUrl || "",
        occupation: profileData.occupation || "",
        bio: profileData.bio || "",
        skills: profileData.skills?.join(', ') || '',
        hourlyRate: profileData.hourlyRate ?? null,
        portfolioLinks: profileData.portfolioLinks || [],
        availabilityStatus: profileData.availabilityStatus || 'available',
        payoutPhoneNumber: profileData.payoutPhoneNumber || '',
      });
    }
  }, [profileData, form]);


  const handleSaveProfile = async (values: ProfileFormValues) => {
    setIsSaving(true);
    const dataToSave = {
      ...values,
      hourlyRate: values.hourlyRate,
    };

    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save profile');
      }
      
      await mutate(); // Re-fetch user data from the provider
      
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: error.message || "Could not save profile.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isUserLoading || !profileData) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-10rem)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const currentAvatar = form.watch("avatarUrl") || profileData.avatarUrl;
  const currentName = form.watch("name") || profileData.name;
  const currentOccupation = form.watch("occupation") || profileData.occupation;
  const canEarnMoney = profileData.roles.some(r => ['freelancer', 'vendor', 'delivery_agent'].includes(r));

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
          <UserCircle className="mr-3 h-10 w-10 text-primary" /> Your Profile
        </h1>
        <p className="text-xl text-muted-foreground mt-2">
          Manage your professional information that others will see.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <main className="lg:col-span-2 space-y-8">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSaveProfile)}>
                <Card className="shadow-xl">
                    <CardHeader className="flex flex-col items-center text-center sm:flex-row sm:text-left sm:space-x-6">
                    <Avatar className="h-24 w-24 ring-2 ring-primary ring-offset-2 mb-4 sm:mb-0">
                        <AvatarImage src={currentAvatar} alt={currentName} data-ai-hint="user avatar large" />
                        <AvatarFallback>{currentName.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-3xl font-headline">{currentName}</CardTitle>
                        <CardDescription className="text-lg">{currentOccupation}</CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                    <ScrollArea className="h-[calc(100vh-28rem)] pr-3">
                    <div className="space-y-6">
                    {/* --- General User Info --- */}
                    <FormField control={form.control} name="avatarUrl" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Palette className="mr-2 h-4 w-4 text-muted-foreground" />Avatar URL</FormLabel><Input {...field} placeholder="https://example.com/avatar.png" className="text-base p-3" /></FormItem>
                    )}/>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><UserCircle className="mr-2 h-4 w-4 text-muted-foreground" />Full Name</FormLabel><Input {...field} className="text-base p-3" /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Mail className="mr-2 h-4 w-4 text-muted-foreground" />Email Address</FormLabel><Input type="email" {...field} className="text-base p-3" /><FormMessage /></FormItem>
                        )}/>
                    </div>
                    <FormField control={form.control} name="occupation" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Briefcase className="mr-2 h-4 w-4 text-muted-foreground" />Occupation / Title</FormLabel><Input {...field} className="text-base p-3" /><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="bio" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><Info className="mr-2 h-4 w-4 text-muted-foreground" />Bio / About Me</FormLabel><Textarea {...field} placeholder="Tell us a little about yourself..." className="min-h-[120px] text-base p-3" /><FormMessage /></FormItem>
                    )}/>
                    {/* --- Freelancer-Specific Info --- */}
                    <div className="border-t pt-6 space-y-6">
                        <h3 className="text-lg font-semibold text-primary flex items-center"><Settings2 className="mr-2 h-5 w-5"/>Professional Details</h3>
                        <FormField control={form.control} name="availabilityStatus" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Availability Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="text-base p-3"><SelectValue placeholder="Set availability" /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="available">Available</SelectItem>
                                <SelectItem value="busy">Busy</SelectItem>
                                <SelectItem value="not_available">Not Available</SelectItem>
                                </SelectContent>
                            </Select><FormMessage />
                            </FormItem>
                        )}/>
                        <FormField control={form.control} name="skills" render={({ field }) => (
                            <FormItem><FormLabel>Skills (comma-separated)</FormLabel><Input placeholder="e.g., React, Figma, Copywriting" {...field} className="text-base p-3" /><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name="hourlyRate" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center"><DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />Hourly Rate ($) (Optional)</FormLabel><Input type="number" step="0.01" placeholder="e.g., 50" {...field} value={field.value ?? ""} onChange={e => field.onChange(e.target.value === "" ? null : parseFloat(e.target.value))} className="text-base p-3" /><FormMessage /></FormItem>
                        )}/>
                        
                        <div>
                        <FormLabel className="text-base block mb-2">Portfolio Links</FormLabel>
                        {portfolioFields.map((item, index) => (
                            <Card key={item.id} className="p-3 mb-3 space-y-2 bg-secondary/50 relative">
                            <FormField control={form.control} name={`portfolioLinks.${index}.title`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">Title</FormLabel><Input placeholder="Project Title" {...field} className="text-sm p-2" /><FormMessage /></FormItem>
                            )}/>
                            <FormField control={form.control} name={`portfolioLinks.${index}.url`} render={({ field }) => (
                                <FormItem><FormLabel className="text-xs">URL</FormLabel><Input type="url" placeholder="https://example.com/project" {...field} className="text-sm p-2" /><FormMessage /></FormItem>
                            )}/>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removePortfolioLink(index)} className="absolute top-1 right-1 h-7 w-7 text-destructive hover:text-destructive/80"><Trash2 className="h-4 w-4" /></Button>
                            </Card>
                        ))}
                        <Button type="button" variant="outline" size="sm" onClick={() => appendPortfolioLink({ id: `new-${Date.now()}`, title: "", url: "" })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Portfolio Link
                        </Button>
                        </div>
                    </div>
                     {canEarnMoney && (
                        <div className="border-t pt-6 space-y-4">
                            <h3 className="text-lg font-semibold text-primary flex items-center"><DollarSign className="mr-2 h-5 w-5"/>Payout Information</h3>
                            <Alert>
                                <Phone className="h-4 w-4"/>
                                <AlertTitle>AzamPay Payouts</AlertTitle>
                                <AlertDescription>
                                   We use AzamPay for all payouts. Please enter the phone number associated with your mobile money account.
                                </AlertDescription>
                            </Alert>
                             <FormField
                                control={form.control}
                                name="payoutPhoneNumber"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payout Phone Number</FormLabel>
                                    <Input type="tel" placeholder="e.g., 255712345678" {...field} value={field.value ?? ""} className="text-base p-3"/>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>
                     )}
                    </div>
                    </ScrollArea>
                    </CardContent>
                    <CardFooter className="border-t pt-6 flex justify-end">
                    <Button type="submit" disabled={isSaving || isUserLoading} size="lg" className="bg-primary hover:bg-primary/90">
                        {isSaving ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Saving...</> : <><Save className="mr-2 h-5 w-5" /> Save Changes</>}
                    </Button>
                    </CardFooter>
                </Card>
                </form>
            </Form>
        </main>
        <aside className="lg:col-span-1 space-y-8">
            <Card className="shadow-xl">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Star className="h-5 w-5 text-yellow-400"/>Rating & Reviews</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-4xl font-bold">{profileData.averageRating?.toFixed(1) ?? '0.0'}</p>
                    <div className="flex justify-center items-center my-1">
                        <StarRating rating={profileData.averageRating || 0} disabled />
                    </div>
                    <p className="text-sm text-muted-foreground">from {profileData.reviewCount} reviews</p>
                </CardContent>
            </Card>

            <Card className="shadow-xl">
                 <CardHeader>
                    <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-primary"/>Client Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                    {profileData?.userId && <ReviewsList freelancerId={profileData.userId} />}
                </CardContent>
            </Card>
        </aside>
      </div>
    </div>
  );
}
