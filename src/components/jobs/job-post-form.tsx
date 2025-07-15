
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Loader2, FilePlus2, DollarSign, CalendarIcon, Shield, Phone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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


const jobPostFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters.").max(150),
  description: z.string().min(50, "Description must be at least 50 characters.").max(5000),
  skillsRequired: z.string().min(1, "Please list at least one skill."),
  budgetType: z.enum(['fixed', 'hourly'], { required_error: "You must select a budget type." }),
  budgetAmount: z.preprocess(
    (val) => (val === "" || val === null || val === undefined || Number.isNaN(parseFloat(String(val)))) ? undefined : parseFloat(String(val)),
    z.number({required_error: "A budget amount is required."}).min(1, "Budget must be at least $1.")
  ),
  deadline: z.date().optional().nullable(),
});

type JobPostFormValues = z.infer<typeof jobPostFormSchema>;

const phoneFormSchema = z.object({
    phoneNumber: z.string().regex(/^[0-9]{9,12}$/, "Please enter a valid phone number (e.g., 255712345678)."),
});
type PhoneFormValues = z.infer<typeof phoneFormSchema>;


export function JobPostForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobData, setJobData] = useState<any | null>(null); // Store the created job data
  const { toast } = useToast();
  const router = useRouter();

  const jobForm = useForm<JobPostFormValues>({
    resolver: zodResolver(jobPostFormSchema),
    defaultValues: {
      title: "",
      description: "",
      skillsRequired: "",
      budgetType: "fixed",
      budgetAmount: undefined,
      deadline: null,
    },
  });
  
  const phoneForm = useForm<PhoneFormValues>({
      resolver: zodResolver(phoneFormSchema),
      defaultValues: { phoneNumber: "" }
  });

  const handleCreateJob = async (values: JobPostFormValues) => {
    setIsSubmitting(true);
    const payload = {
        ...values,
        skillsRequired: values.skillsRequired.split(',').map(skill => skill.trim()).filter(Boolean),
        deadline: values.deadline ? values.deadline.toISOString() : null,
    };
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to create job.');
      }
      setJobData(result); // Open the payment dialog with the created job data
      toast({ title: "Job Created Successfully", description: "Please fund the project to make it public."});
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const handleFundJob = async (values: PhoneFormValues) => {
    if (!jobData || !jobData.id) return;
    setIsSubmitting(true);
    try {
        const response = await fetch('/api/payments/azampay/pay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobId: jobData.id, phoneNumber: values.phoneNumber }),
        });
        const result = await response.json();
        if (!response.ok) {
            throw new Error(result.message || 'Payment initiation failed.');
        }
        toast({
            title: "Payment Initiated",
            description: "Please check your phone to approve the payment.",
        });
        setJobData(null); // Close dialog
        router.push('/find-work'); // Redirect to job list page
    } catch (error: any) {
        toast({ title: "Error", description: error.message, variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <>
      <Card className="shadow-xl max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl font-headline">
            <FilePlus2 className="h-7 w-7 text-primary" />
            Post a New Job
          </CardTitle>
          <CardDescription>
            Fill out the details below to find the perfect freelancer for your project.
          </CardDescription>
        </CardHeader>
        <Form {...jobForm}>
          <form onSubmit={jobForm.handleSubmit(handleCreateJob)}>
            <CardContent className="space-y-6">
              <FormField control={jobForm.control} name="title" render={({ field }) => (
                <FormItem><FormLabel>Job Title</FormLabel><Input placeholder="e.g., Need a Logo for my new SaaS Startup" {...field} /><FormMessage /></FormItem>
              )}/>
              <FormField control={jobForm.control} name="description" render={({ field }) => (
                <FormItem><FormLabel>Project Description</FormLabel><Textarea placeholder="Describe your project in detail..." className="min-h-[150px]" {...field} /><FormMessage /></FormItem>
              )}/>
              <FormField control={jobForm.control} name="skillsRequired" render={({ field }) => (
                <FormItem><FormLabel>Required Skills (comma-separated)</FormLabel><Input placeholder="e.g., UI/UX, Figma, Webflow" {...field} /><FormMessage /></FormItem>
              )}/>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={jobForm.control} name="budgetType" render={({ field }) => (
                  <FormItem><FormLabel>Budget Type</FormLabel>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4 pt-2">
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="fixed" /></FormControl><FormLabel className="font-normal">Fixed Price</FormLabel></FormItem>
                        <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="hourly" /></FormControl><FormLabel className="font-normal">Hourly Rate</FormLabel></FormItem>
                      </RadioGroup>
                    </FormControl><FormMessage />
                  </FormItem>
                )}/>
                <FormField control={jobForm.control} name="budgetAmount" render={({ field }) => (
                  <FormItem><FormLabel>Budget Amount ($)</FormLabel>
                      <div className="relative"><DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" /><Input type="number" placeholder="e.g., 500" className="pl-8" {...field} /></div>
                      <FormMessage />
                  </FormItem>
                )}/>
              </div>
              <FormField control={jobForm.control} name="deadline" render={({ field }) => (
                  <FormItem className="flex flex-col"><FormLabel>Application Deadline (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={field.value || undefined} onSelect={field.onChange} disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} initialFocus />
                      </PopoverContent>
                    </Popover><FormMessage />
                  </FormItem>
                )}/>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isSubmitting} size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Shield className="mr-2 h-5 w-5" />}
                Proceed to Fund Job
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
      
      <AlertDialog open={!!jobData} onOpenChange={(open) => !open && setJobData(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Fund Project via AzamPay</AlertDialogTitle>
            <AlertDialogDescription>
              To make your job "{jobData?.title}" public, please fund the escrow amount of <strong>${jobData?.budgetAmount?.toLocaleString() || 0}</strong>. Enter your phone number to receive a payment prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
           <Form {...phoneForm}>
             <form onSubmit={phoneForm.handleSubmit(handleFundJob)} className="space-y-4">
               <FormField
                control={phoneForm.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem><FormLabel>Phone Number</FormLabel>
                    <div className="relative">
                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground"/>
                        <Input placeholder="e.g., 255712345678" className="pl-10" {...field}/>
                    </div>
                    <FormMessage/>
                  </FormItem>
                )}
               />
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setJobData(null)} disabled={isSubmitting}>Cancel</AlertDialogCancel>
                  <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Pay ${jobData?.budgetAmount?.toLocaleString() || 0}
                  </Button>
                </AlertDialogFooter>
             </form>
           </Form>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
