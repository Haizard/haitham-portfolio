
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link'; // Import Link
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Clock, Eye, CheckCircle, Briefcase, ExternalLink } from "lucide-react"; // Added Eye
import type { Service } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function OurServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const containerRef = useRef(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch services');
      }
      const data: Service[] = await response.json();
      setServices(data);
    } catch (error: any) {
      console.error("Error fetching services:", error);
      toast({
        title: "Error",
        description: error.message || "Could not load services.",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  
  useGSAP(() => {
    if (!isLoading && containerRef.current) {
         const cards = gsap.utils.toArray('.service-card');
         cards.forEach((card: any, index) => {
            gsap.from(card, {
                duration: 0.6,
                opacity: 0,
                x: index % 2 === 0 ? -50 : 50, // Animate from left for even, right for odd
                ease: "power3.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 90%",
                    toggleActions: "play none none none"
                }
            });
         });
    }
  }, { scope: containerRef, dependencies: [isLoading, services] });

  return (
    <div className="bg-gradient-to-b from-background to-secondary/30 min-h-screen">
      <header className="py-16 text-center bg-primary/10 border-b border-primary/20">
        <div className="container mx-auto px-4">
          <Briefcase className="h-16 w-16 text-primary mx-auto mb-4" />
          <h1 className="text-5xl font-bold tracking-tight font-headline text-primary">Our Services</h1>
          <p className="text-xl text-muted-foreground mt-3 max-w-2xl mx-auto">
            Discover the range of professional services we offer to help you achieve your goals.
          </p>
        </div>
      </header>

      <main ref={containerRef} className="container mx-auto py-12 px-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : services.length === 0 ? (
          <Card className="shadow-lg text-center col-span-full">
            <CardHeader>
              <CardTitle>No Services Available</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                We are currently updating our service offerings. Please check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div key={service.id || `service-${index}`} className="service-card">
              <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col bg-card group h-full">
                <Link href={`/our-services/${service.slug}`} className="flex flex-col h-full">
                  <CardHeader className="pb-4 p-4">
                    <div className="mb-3 aspect-[16/10] overflow-hidden rounded-lg">
                       <Image 
                          src={service.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(service.name.substring(0,15))}`} 
                          alt={service.name} 
                          width={600} 
                          height={400} 
                          className="rounded-lg object-contain w-full h-full group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={service.imageHint || "service offering"}
                        />
                    </div>
                    <CardTitle className="text-lg font-bold text-primary font-headline group-hover:text-primary/80 transition-colors line-clamp-2">{service.name}</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground line-clamp-2 h-[2.5rem]">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 flex-grow space-y-2">
                    <div className="flex items-center text-base">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      <span className="font-semibold text-foreground">{service.price ? `$${service.price}` : 'Inquire'}</span>
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {service.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto border-t p-3">
                    <Button 
                      variant="outline"
                      className="w-full text-sm py-2" 
                    >
                      <Eye className="mr-2 h-4 w-4" /> View Details
                       <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary/80 transition-colors" />
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
              </div>
            ))}
          </div>
        )}
         <section className="mt-16 py-12 bg-secondary/50 rounded-lg text-center">
            <div className="container mx-auto px-4">
                <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4"/>
                <h2 className="text-3xl font-bold font-headline mb-3">Ready to Get Started?</h2>
                <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                    If you have any questions about our services or need a custom quote, feel free to reach out.
                </p>
                <Button size="lg" variant="default" className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Contact Us
                </Button>
            </div>
        </section>
      </main>
    </div>
  );
}
