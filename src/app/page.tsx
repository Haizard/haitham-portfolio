"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, PenSquare, Briefcase, Store } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      // Auto-redirect authenticated users to dashboard
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading CreatorOS...</p>
        </div>
      </div>
    );
  }

  if (user) {
    // This will be briefly shown before redirect
    return null;
  }

  // Landing page for unauthenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold font-headline mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Welcome to CreatorOS
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The all-in-one platform for content creators, freelancers, and entrepreneurs. 
            Manage your content, grow your audience, and scale your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button asChild size="lg" className="text-lg px-8">
              <Link href="/signup">
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8">
              <Link href="/login">
                Sign In
              </Link>
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-lg bg-card border">
              <PenSquare className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">AI Content Studio</h3>
              <p className="text-muted-foreground">Create amazing content with AI-powered tools and personalized brand voices.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <Briefcase className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Freelance Hub</h3>
              <p className="text-muted-foreground">Find projects, manage clients, and grow your freelance business.</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card border">
              <Store className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">E-commerce Suite</h3>
              <p className="text-muted-foreground">Sell products, manage inventory, and track your online store performance.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}