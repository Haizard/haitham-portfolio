
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Search, Star, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const categories = [
    "Website Design", "Mobile Apps", "SEO", "Illustration",
    "Data Entry", "Video Editing", "Copywriting", "Social Media",
    "Content Writing", "Voice Talent", "Logo Design", "Translation"
];

const features = [
    {
        title: "The Best Talent",
        description: "Discover reliable professionals for any skill imaginable.",
    },
    {
        title: "Quality Work",
        description: "Choose from a vast pool of specialized experts and agencies.",
    },
    {
        title: "Track Progress",
        description: "Use our desktop and mobile apps to work and communicate on the go.",
    },
];

const talentNetworkFeatures = [
    {
        title: "Post a Job",
        description: "Simply post a job you need completed and receive competitive bids from freelancers within minutes.",
    },
    {
        title: "Choose Freelancers",
        description: "Whatever your needs, there will be a freelancer to get it done: from web design, mobile app development, virtual assistants, and thousands of other projects.",
    },
    {
        title: "Pay Safely",
        description: "With protected payments and thousands of reviewed professionals to choose from, CreatorOS is the simplest and safest way to get work done online.",
    },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white font-body">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center overflow-hidden">
          <div className="absolute inset-0 bg-gray-900">
             <Image src="https://placehold.co/1920x1080.png" alt="Abstract background" layout="fill" objectFit="cover" className="opacity-20" data-ai-hint="abstract geometric" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight font-headline mb-6">
              Hire the best freelancers for any job, online.
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Millions of people use CreatorOS to turn their ideas into reality.
            </p>
            <div className="flex justify-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base">
                <Link href="/find-work">Hire a Freelancer</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 rounded-full px-8 text-base">
                <Link href="/my-proposals">Earn Money Freelancing</Link>
              </Button>
            </div>
          </div>
        </section>
        
        {/* Make it real with CreatorOS */}
        <section className="py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold font-headline text-primary">Make it real with CreatorOS</h2>
                    {features.map(feature => (
                        <div key={feature.title}>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                    <Button variant="link" className="text-primary p-0 h-auto">
                        Make your dreams real by hiring on CreatorOS <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
                <div>
                    <Image src="https://placehold.co/800x600.png" alt="Colorful abstract design with phones" width={800} height={600} className="rounded-lg shadow-2xl" data-ai-hint="abstract colorful" />
                </div>
            </div>
        </section>

        {/* Image Grid */}
        <section className="py-16 bg-gray-800/50">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <Image src="https://placehold.co/600x600.png" alt="Smartwatches" width={600} height={600} className="rounded-lg shadow-lg" data-ai-hint="smartwatch product"/>
                <div className="grid grid-cols-2 gap-6">
                    <Image src="https://placehold.co/400x400.png" alt="House" width={400} height={400} className="rounded-lg shadow-lg" data-ai-hint="modern house"/>
                    <Image src="https://placehold.co/400x400.png" alt="Art prints" width={400} height={400} className="rounded-lg shadow-lg" data-ai-hint="art prints"/>
                    <Image src="https://placehold.co/400x400.png" alt="Packaging design" width={400} height={400} className="rounded-lg shadow-lg" data-ai-hint="packaging design"/>
                    <Image src="https://placehold.co/400x400.png" alt="Architectural model" width={400} height={400} className="rounded-lg shadow-lg" data-ai-hint="architectural model"/>
                </div>
            </div>
        </section>

        {/* Global Talent Network */}
        <section className="py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                 <div>
                    <Image src="https://placehold.co/800x600.png" alt="Global network" width={800} height={600} className="rounded-lg shadow-2xl" data-ai-hint="network community" />
                </div>
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold font-headline text-primary">Tap into a global talent network</h2>
                    {talentNetworkFeatures.map(feature => (
                        <div key={feature.title}>
                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                            <p className="text-gray-400">{feature.description}</p>
                        </div>
                    ))}
                     <Button variant="link" className="text-primary p-0 h-auto">
                        Explore more ways to use CreatorOS <ArrowRight className="ml-2 h-4 w-4"/>
                    </Button>
                </div>
            </div>
        </section>

        {/* Categories Section */}
         <section className="py-16 bg-gray-800/50">
            <div className="container mx-auto px-4">
                 <h2 className="text-3xl font-bold font-headline mb-8 text-center">Get work done in over 2700 different categories</h2>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4">
                    {categories.map(cat => (
                        <Link key={cat} href="#" className="text-gray-300 hover:text-primary transition-colors">{cat}</Link>
                    ))}
                 </div>
            </div>
        </section>

        {/* AI Agents */}
        <section className="py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4">
                <Card className="bg-gray-800 border-primary/50 shadow-2xl grid md:grid-cols-2 overflow-hidden">
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold font-headline mb-4">Automate your tasks with AI Agents</h2>
                        <p className="text-gray-400 mb-6">Let our team of expert AI agents find you the right freelancer for your job, or allow them to automate your tasks and workflows. Free up your time for what's important.</p>
                        <Button variant="link" className="text-primary p-0 h-auto self-start">
                            Explore AI Agents <ArrowRight className="ml-2 h-4 w-4"/>
                        </Button>
                    </div>
                    <div>
                         <Image src="https://placehold.co/800x600.png" alt="AI development" width={800} height={600} className="object-cover h-full" data-ai-hint="AI development abstract" />
                    </div>
                </Card>
            </div>
        </section>

         {/* Power your Organization */}
        <section className="py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-8">
                    <h2 className="text-4xl font-bold font-headline text-primary">Power your organization's competitive advantage</h2>
                     <div className="space-y-6">
                        <div>
                            <h3 className="text-xl font-semibold mb-2">Freelancer Enterprise</h3>
                            <p className="text-gray-400">Get your own private talent cloud and manage your freelance workforce with our advanced SaaS platform.</p>
                        </div>
                         <div>
                            <h3 className="text-xl font-semibold mb-2">Innovation Challenges</h3>
                            <p className="text-gray-400">Crowdsource ideas from our global community of 60m+ problem solvers.</p>
                        </div>
                     </div>
                </div>
                <div>
                    <Image src="https://placehold.co/800x600.png" alt="Abstract hummingbird and globe" width={800} height={600} className="rounded-lg" data-ai-hint="hummingbird globe" />
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-gray-900 border-t border-gray-700 py-12">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} CreatorOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

