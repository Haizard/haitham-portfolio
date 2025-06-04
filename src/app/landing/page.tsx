import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Eye, BarChart2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight font-headline mb-6">
          Welcome to <span className="text-primary">CreatorOS</span>
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
          The all-in-one platform designed to empower content creators. Manage, create, and grow your digital presence seamlessly.
        </p>
      </header>

      <section className="grid md:grid-cols-3 gap-8 mb-16">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="h-7 w-7 text-accent" />
              Boost Productivity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Streamline your workflow with AI-powered content generation, scheduling, and analytics.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Eye className="h-7 w-7 text-accent" />
              Showcase Your Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Create beautiful public profiles and project showcases to attract clients and collaborators.
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart2 className="h-7 w-7 text-accent" />
              Manage Your Business
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Handle client interactions, service bookings, and payments all in one integrated dashboard.
            </p>
          </CardContent>
        </Card>
      </section>
      
      <section className="text-center mb-16">
        <Image 
          src="https://placehold.co/800x400.png" 
          alt="CreatorOS Platform Illustration" 
          width={800} 
          height={400} 
          className="rounded-lg mx-auto mb-8 shadow-2xl"
          data-ai-hint="dashboard interface"
        />
        <h2 className="text-3xl font-bold mb-4 font-headline">Ready to Elevate Your Creator Journey?</h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
          Join CreatorOS and unlock tools that help you focus on what you do best: creating.
        </p>
        <div className="space-x-4">
          <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/">Access Dashboard</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/showcase">View Showcase Example</Link>
          </Button>
        </div>
      </section>

      <footer className="text-center text-muted-foreground py-8 border-t">
        <p>&copy; {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
      </footer>
    </div>
  );
}
