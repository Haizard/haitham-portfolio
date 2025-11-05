
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
import { Loader2, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/hooks/use-user';

const loginFormSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login, mutate } = useUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: "", password: "" },
  });

  const handleLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to log in.");
      }
      
      // Call the login function from the context to update the user state.
      // This is now a synchronous operation on the client.
      login(result);
      
      // After setting the user in the context, we can redirect.
      // The router.refresh() is good practice to ensure server components re-render with new auth state if needed.
      router.push('/dashboard');
      router.refresh(); 

      toast({
          title: "Login Successful!",
          description: "Welcome back! Redirecting you..."
      });
      
    } catch (error: any) {
      toast({
        title: "Login Failed",
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
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-headline">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to access your CreatorOS dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
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
                      <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <LogIn className="mr-2 h-5 w-5" />}
                  {isSubmitting ? "Signing In..." : "Sign In"}
                 </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p className="text-muted-foreground">Don't have an account?&nbsp;</p>
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign Up
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
