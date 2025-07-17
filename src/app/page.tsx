
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle, Search, Star, Zap, Briefcase, Users, ShieldCheck, DollarSign, Award, Check, ShoppingCart, Gem, Code, Palette, PenSquare, Package } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import type { Product } from "@/lib/products-data";
import { ProductCard } from "@/components/products/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroAnimation } from "@/components/animations/hero-animation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

const workCategories = [
    { title: "Development & IT", skills: "1,853 skills" },
    { title: "Design & Creative", skills: "968 skills" },
    { title: "Sales & Marketing", skills: "392 skills" },
    { title: "Writing & Translation", skills: "505 skills" },
    { title: "Admin & Customer Support", skills: "508 skills" },
    { title: "Finance & Accounting", skills: "214 skills" },
    { title: "Engineering & Architecture", skills: "650 skills" },
    { title: "Legal", skills: "125 skills" }
];

const howItWorksSteps = [
    {
        icon: Briefcase,
        title: "Post a job (it’s free)",
        description: "Tell us about your project. CreatorOS connects you with top talent and agencies around the world, or right in your city."
    },
    {
        icon: Users,
        title: "Freelancers come to you",
        description: "Get qualified proposals within 24 hours. Compare bids, reviews, and prior work. Interview favorites and hire the best fit."
    },
    {
        icon: ShieldCheck,
        title: "Collaborate easily and securely",
        description: "Use CreatorOS to chat, share files, and track project milestones from your desktop or mobile."
    },
    {
        icon: DollarSign,
        title: "Payment simplified",
        description: "Pay hourly or a fixed-price and receive invoices through CreatorOS. Pay for work you authorize."
    }
];

const eCommerceCategories = [
    { title: "Digital Assets", icon: Gem },
    { title: "Software", icon: Code },
    { title: "Templates", icon: PenSquare },
    { title: "Merchandise", icon: Package },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const mainRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoadingProducts(true);
      try {
        const response = await fetch('/api/products?limit=8');
        if (response.ok) {
          const data: Product[] = await response.json();
          setFeaturedProducts(data);
        } else {
          console.error("Failed to fetch featured products");
        }
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

   useGSAP(() => {
    const sections = gsap.utils.toArray('.animated-section');
    sections.forEach((section: any) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });

    gsap.from('#hero-background', {
        scale: 1.1,
        duration: 1.5,
        ease: 'power2.out',
    })

  }, { scope: mainRef, dependencies: [isLoadingProducts] });

  return (
    <div ref={mainRef} className="flex flex-col min-h-screen bg-gray-900 text-white font-body">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center overflow-hidden">
          <div id="hero-background" className="absolute inset-0 bg-gray-900">
             <Image src="https://placehold.co/1920x1080.png" alt="Abstract background" fill className="object-cover opacity-20" data-ai-hint="abstract geometric" />
          </div>
          <div className="container mx-auto px-4 relative z-10">
            <HeroAnimation />
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 text-base">
                <Link href="/find-work">Hire a Freelancer</Link>
              </Button>
               <Button size="lg" variant="secondary" asChild className="bg-white/90 text-primary hover:bg-white rounded-full px-8 text-base">
                <Link href="/ecommerce">Explore the Store</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 rounded-full px-8 text-base">
                <Link href="/my-proposals">Earn Money Freelancing</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="animated-section py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold font-headline">Featured Products from our Store</h2>
                    <p className="text-lg text-gray-400 mt-2">Discover quality products from our top creators.</p>
                </div>
                {isLoadingProducts ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => <Skeleton key={i} className="aspect-[3/4] bg-gray-800" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {featuredProducts.map(product => (
                            <ProductCard key={product.id} product={product} className="bg-gray-800 border-gray-700 hover:border-primary text-white" />
                        ))}
                    </div>
                )}
                <div className="text-center mt-12">
                    <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-full px-8 text-base">
                        <Link href="/ecommerce">Shop All Products <ArrowRight className="ml-2 h-4 w-4"/></Link>
                    </Button>
                </div>
            </div>
        </section>

        {/* Shop by Category Section */}
        <section className="animated-section py-16 md:py-24 bg-gray-800/50">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold font-headline text-center mb-12">Shop by Category</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {eCommerceCategories.map(category => (
                        <Link href="/ecommerce" key={category.title}>
                            <Card className="bg-gray-800 border-gray-700 hover:border-primary hover:-translate-y-2 transition-all text-center p-8 group h-full">
                                <category.icon className="h-12 w-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                                <CardTitle className="text-xl font-semibold text-white">{category.title}</CardTitle>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </section>

        {/* New "Need something done?" section */}
        <section className="animated-section py-16 md:py-24 bg-gray-900">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold font-headline text-center mb-12">Need a Service?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {workCategories.map((category) => (
                        <Card key={category.title} className="bg-gray-800 border-gray-700 hover:border-primary transition-colors text-center p-6 group">
                            <CardTitle className="text-lg font-semibold text-primary mb-2 group-hover:text-primary/90">{category.title}</CardTitle>
                            <p className="text-gray-400 text-sm">{category.skills}</p>
                        </Card>
                    ))}
                </div>
            </div>
        </section>

        {/* How It Works Section */}
        <section className="animated-section py-16 md:py-24 bg-gray-800/50">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold font-headline text-center mb-16">How CreatorOS Freelancing Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {howItWorksSteps.map((step) => (
                        <div key={step.title} className="text-center">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                                <step.icon className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                            <p className="text-gray-400">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>

        {/* Make it real with CreatorOS */}
        <section className="animated-section py-16 md:py-24 bg-gray-900">
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
        <section className="animated-section py-16 bg-gray-800/50">
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
        <section className="animated-section py-16 md:py-24 bg-gray-900">
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

        {/* AI Agents */}
        <section className="animated-section py-16 md:py-24 bg-gray-900">
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
        <section className="animated-section py-16 md:py-24 bg-gray-900">
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
