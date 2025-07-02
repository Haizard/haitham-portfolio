
"use client";

import { useEffect, useState } from 'react';
import { useParams, notFound, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Loader2, DollarSign, Clock, CalendarPlus, CheckCircle, Shield, MessageSquare, ThumbsUp, ListChecks, Gift, Info, ArrowLeft, PackageCheck, RefreshCw } from 'lucide-react';
import type { Service, Testimonial } from '@/lib/services-data';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { BookingRequestDialog } from '@/components/bookings/booking-request-dialog';

async function getServiceData(slug: string): Promise<Service | null> {
  try {
    const response = await fetch(`/api/services/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      const errorText = await response.text().catch(() => "Failed to read error response");
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }
    const service = await response.json();
    return service || null;
  } catch (error) {
    console.error(`Error fetching service ${slug} from API:`, error);
    throw error; 
  }
}

export default function ServiceDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { toast } = useToast();

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);

  useEffect(() => {
    if (!slug) {
      setError("No service slug provided.");
      setIsLoading(false);
      notFound();
      return;
    }

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedService = await getServiceData(slug);
        if (fetchedService) {
          setService(fetchedService);
        } else {
          notFound();
        }
      } catch (fetchError: any) {
        setError(fetchError.message || "An unknown error occurred while fetching the service.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-12 px-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-semibold text-destructive mb-4">Error Loading Service</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => router.push('/our-services')} className="mt-6">
          <ArrowLeft className="mr-2 h-4 w-4"/> Back to Services
        </Button>
      </div>
    );
  }

  if (!service) {
    notFound();
    return null;
  }

  const renderListSection = (title: string, items: string[] | undefined, icon?: React.ElementType) => {
    if (!items || items.length === 0) return null;
    const IconComponent = icon;
    return (
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 font-headline flex items-center">
          {IconComponent && <IconComponent className="h-6 w-6 mr-2 text-primary" />}
          {title}
        </h2>
        <ul className="space-y-2 list-inside">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">{item}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  return (
    <>
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Services
        </Button>

        <article className="bg-card shadow-xl rounded-lg overflow-hidden">
          {service.imageUrl && (
            <div className="relative w-full h-64 md:h-96">
              <Image
                src={service.imageUrl}
                alt={service.name}
                fill
                className="object-cover"
                data-ai-hint={service.imageHint || "service details"}
              />
               <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
               <div className="absolute bottom-0 left-0 p-6 md:p-8">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline text-primary-foreground shadow-black [text-shadow:_0_2px_4px_var(--tw-shadow-color)]">{service.name}</h1>
               </div>
            </div>
          )}
          
          <div className="p-6 md:p-8 space-y-8">
              {!service.imageUrl && (
                   <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-headline text-primary">{service.name}</h1>
              )}

            <Card className="bg-secondary/30">
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-center sm:text-left">
                <div className="flex flex-col items-center sm:items-start">
                  <DollarSign className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="text-xl font-semibold text-foreground">{service.price ? `$${service.price}` : 'Contact for Price'}</p>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <Clock className="h-8 w-8 text-primary mb-2" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="text-xl font-semibold text-foreground">{service.duration}</p>
                </div>
                 <div className="flex flex-col items-center sm:items-start">
                  <Button 
                      className="w-full sm:w-auto bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3 px-6 mt-3 sm:mt-0 lg:col-span-1"
                      onClick={() => setIsBookingDialogOpen(true)}
                  >
                      <CalendarPlus className="mr-2 h-5 w-5" /> Book This Service
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(service.deliveryTime || service.revisionsIncluded) && (
                <Card className="bg-secondary/30">
                    <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6 text-center sm:text-left">
                        {service.deliveryTime && (
                            <div className="flex flex-col items-center sm:items-start">
                                <PackageCheck className="h-8 w-8 text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Delivery Time</p>
                                <p className="text-xl font-semibold text-foreground">{service.deliveryTime}</p>
                            </div>
                        )}
                        {service.revisionsIncluded && (
                            <div className="flex flex-col items-center sm:items-start">
                                <RefreshCw className="h-8 w-8 text-primary mb-2" />
                                <p className="text-sm text-muted-foreground">Revisions Included</p>
                                <p className="text-xl font-semibold text-foreground">{service.revisionsIncluded}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            
            <section>
              <h2 className="text-2xl font-semibold mb-3 font-headline flex items-center"><Info className="h-6 w-6 mr-2 text-primary"/>Service Overview</h2>
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{service.description}</p>
              {service.detailedDescription && (
                <div className="mt-4 prose dark:prose-invert max-w-none prose-sm sm:prose-base text-muted-foreground" dangerouslySetInnerHTML={{ __html: service.detailedDescription.replace(/\n/g, '<br />') }} />
              )}
            </section>

            {renderListSection("How It Works", service.howItWorks, ListChecks)}
            {renderListSection("Key Benefits", service.benefits, ThumbsUp)}
            {renderListSection("What We Offer", service.offers, Gift)}

            {service.securityInfo && (
              <section>
                <h2 className="text-2xl font-semibold mb-3 font-headline flex items-center">
                  <Shield className="h-6 w-6 mr-2 text-primary" /> Security & Confidentiality
                </h2>
                <p className="text-muted-foreground whitespace-pre-wrap">{service.securityInfo}</p>
              </section>
            )}

            {service.testimonials && service.testimonials.length > 0 && (
              <section>
                <Separator className="my-8"/>
                <h2 className="text-2xl font-semibold mb-6 font-headline flex items-center">
                  <MessageSquare className="h-6 w-6 mr-2 text-primary" /> Client Testimonials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.testimonials.map((testimonial) => (
                    <Card key={testimonial.id} className="bg-secondary/40 shadow-md">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={testimonial.customerAvatar || `https://placehold.co/100x100.png?text=${testimonial.customerName.substring(0,1)}`} alt={testimonial.customerName} data-ai-hint="avatar person"/>
                            <AvatarFallback>{testimonial.customerName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.customerName}</p>
                            {testimonial.rating && (
                              <div className="flex items-center mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <ThumbsUp key={i} className={`h-4 w-4 ${i < testimonial.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground/50'}`} />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 italic">"{testimonial.comment}"</p>
                         {testimonial.date && <p className="text-xs text-muted-foreground/80 mt-2 text-right">{new Date(testimonial.date).toLocaleDateString()}</p>}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            )}
          </div>
        </article>
      </div>
      {service && service.id && (
        <BookingRequestDialog
          isOpen={isBookingDialogOpen}
          onClose={() => setIsBookingDialogOpen(false)}
          serviceId={service.id}
          serviceName={service.name}
        />
      )}
    </>
  );
}

    