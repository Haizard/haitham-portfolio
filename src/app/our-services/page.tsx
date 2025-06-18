
"use client";

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link'; // Import Link
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, DollarSign, Clock, Eye, CheckCircle, Briefcase, ExternalLink } from "lucide-react"; // Added Eye
import type { Service } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export default function OurServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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

      <main className="container mx-auto py-12 px-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={service.id || `service-${index}`} className="shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col bg-card group">
                <Link href={`/our-services/${service.slug}`} className="flex flex-col h-full">
                  <CardHeader className="pb-4">
                    <div className="mb-3 aspect-[16/9] overflow-hidden rounded-t-lg">
                       <Image 
                          src={service.imageUrl || `https://placehold.co/600x400.png?text=${encodeURIComponent(service.name.substring(0,15))}`} 
                          alt={service.name} 
                          width={600} 
                          height={400} 
                          className="rounded-t-lg object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                          data-ai-hint={service.imageHint || "service offering"}
                        />
                    </div>
                    <CardTitle className="text-2xl font-bold text-primary font-headline group-hover:text-primary/80 transition-colors">{service.name}</CardTitle>
                    <CardDescription className="text-sm text-muted-foreground line-clamp-3 h-[3.75rem]">{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="flex items-center text-lg">
                      <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                      <span className="font-semibold text-foreground">{service.price ? `$${service.price}` : 'Inquire'}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Duration: {service.duration}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="mt-auto border-t pt-4">
                    <Button 
                      variant="outline"
                      className="w-full text-base py-3" 
                    >
                      <Eye className="mr-2 h-5 w-5" /> View Details
                       <ExternalLink className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary/80 transition-colors" />
                    </Button>
                  </CardFooter>
                </Link>
              </Card>
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

    