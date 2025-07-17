
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, UserPlus, Briefcase, Store, UserCheck, Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useUser } from '@/hooks/use-user';

const roleOptions = [
  { id: 'client', label: 'I want to hire talent', icon: UserCheck },
  { id: 'freelancer', label: 'I want to work as a freelancer', icon: Briefcase },
  { id: 'vendor', label: 'I want to sell products', icon: Store },
  { id: 'delivery_agent', label: 'I want to be a delivery agent', icon: Truck },
] as const;

const roleEnum = z.enum(['client', 'freelancer', 'vendor', 'delivery_agent'], {
    required_error: "You must select a role."
});

const signupFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: roleEnum,
});

type SignupFormValues = z.infer<typeof signupFormSchema>;

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login } = useUser();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: { name: "", email: "", password: "", role: "client" },
  });

  const handleSignup = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to sign up.");
      }
      
      login(result);

      toast({
          title: "Account Created!",
          description: "Welcome! Redirecting you to your dashboard..."
      });
      
      router.push('/dashboard');
      router.refresh(); 

    } catch (error: any) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-lg shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Create Your Account</CardTitle>
            <CardDescription>
              Join CreatorOS and start your journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSignup)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl><Input placeholder="Your Name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl><Input type="email" placeholder="you@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl><Input type="password" placeholder="•••••••• (8+ characters)" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>How will you use CreatorOS?</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="grid grid-cols-1 md:grid-cols-2 gap-2"
                        >
                          {roleOptions.map((item) => (
                             <FormItem key={item.id} className="flex items-center space-x-3 space-y-0 p-3 border rounded-md hover:shadow-sm has-[input:checked]:bg-primary/10 has-[input:checked]:border-primary">
                              <FormControl>
                                <RadioGroupItem value={item.id} />
                              </FormControl>
                              <FormLabel className="font-normal flex items-center gap-2 cursor-pointer">
                                  <item.icon className="h-5 w-5 text-primary"/>
                                  {item.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">Already have an account?&nbsp;</p>
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
