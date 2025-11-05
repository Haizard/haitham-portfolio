
"use client";

import { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Briefcase, ShoppingCart, Utensils, Plane, Newspaper } from "lucide-react";
import { HeroAnimation } from '@/components/animations/hero-animation';
import Link from 'next/link';

const featureCards = [
  {
    icon: Briefcase,
    title: "Freelance Marketplace",
    description: "Connect with talented freelancers or find your next project. Secure payments and project management tools included.",
    link: "/find-work",
    cta: "Find Work"
  },
  {
    icon: ShoppingCart,
    title: "E-commerce Storefronts",
    description: "Launch your own store, sell digital or physical products, and reach a dedicated community of creators.",
    link: "/ecommerce",
    cta: "Shop Now"
  },
  {
    icon: Sparkles,
    title: "AI Content Studio",
    description: "Leverage cutting-edge AI to generate blog posts, social media content, and inspire new ideas effortlessly.",
    link: "/content-studio",
    cta: "Start Creating"
  },
   {
    icon: Utensils,
    title: "Restaurant Discovery",
    description: "Find the best local restaurants, browse menus, and order food for delivery or pickup.",
    link: "/restaurants",
    cta: "Find Food"
  },
  {
    icon: Plane,
    title: "Tour Packages",
    description: "Explore curated tour packages from trusted operators for your next adventure.",
    link: "/tours",
    cta: "Explore Tours"
  },
   {
    icon: Newspaper,
    title: "Creator's Blog",
    description: "Read the latest articles, tutorials, and insights from the creator community.",
    link: "/blog",
    cta: "Read Blog"
  },
];

export default function HomePage() {
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-secondary/20 text-foreground -mt-16">
      <main className="container mx-auto px-4 py-12 text-center">
        <section className="py-20">
            <div className="bg-primary text-primary-foreground rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary/30">
                <Sparkles className="h-12 w-12" />
            </div>
            <HeroAnimation />
            <div className="flex justify-center gap-4 mt-8">
                <Button asChild size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg">
                    <Link href="/signup">
                        Get Started for Free
                    </Link>
                </Button>
                 <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                    <Link href="/dashboard">
                        Explore Features
                    </Link>
                </Button>
            </div>
        </section>

        <section className="py-20">
            <h2 className="text-3xl font-bold font-headline mb-4">The Ultimate Toolkit for Creators & Entrepreneurs</h2>
            <p className="text-muted-foreground mb-12 max-w-2xl mx-auto">
                CreatorOS combines everything you need to freelance, sell products, manage services, and create amazing content in one seamless platform.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featureCards.map((feature, index) => (
                    <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow text-left flex flex-col">
                        <CardHeader>
                            <div className="bg-primary/10 text-primary rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                                <feature.icon className="h-6 w-6" />
                            </div>
                             <CardTitle>{feature.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{feature.description}</p>
                        </CardContent>
                         <CardFooter>
                            <Button asChild variant="link" className="p-0">
                                <Link href={feature.link}>
                                    {feature.cta} →
                                </Link>
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </section>
      </main>
    </div>
  );
}
