
"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarPlus, DollarSign, Edit3, Eye, PlusCircle, Trash2, Loader2, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import Image from "next/image";
import type { Service } from '@/lib/services-data'; 
import { useToast } from '@/hooks/use-toast';
import { ServiceFormDialog } from '@/components/services/service-form-dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Helper function to simulate an API call
const simulateApiCall = (duration = 1000) => new Promise(resolve => setTimeout(resolve, duration));

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
  const [isConnectingGoogleCalendar, setIsConnectingGoogleCalendar] = useState(false);

  const { toast } = useToast();

  const fetchServices = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/services');
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data: Service[] = await response.json();
      setServices(data);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Could not load services.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    // In a real app, you'd fetch the connection status from your backend
    // For now, we'll assume it's disconnected on load
    setIsGoogleCalendarConnected(false); 
  }, []);

  const handleCreateNewService = () => {
    setEditingService(null);
    setIsFormOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsFormOpen(true);
  };
  
  const confirmDeleteService = (service: Service) => {
    setServiceToDelete(service);
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete service');
      }
      toast({ title: "Service Deleted", description: `"${serviceToDelete.name}" has been removed.` });
      fetchServices(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Could not delete service.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setServiceToDelete(null); 
    }
  };

  const handleGoogleCalendarConnect = async () => {
    setIsConnectingGoogleCalendar(true);
    try {
      // In a real app, this would redirect the user or open a popup to Google OAuth
      // For now, we simulate the API call to our backend /api/auth/google/connect
      const response = await fetch('/api/auth/google/connect');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to initiate Google Calendar connection.');
      }
      // const data = await response.json(); 
      // If the connect endpoint redirects, you wouldn't get JSON back directly here.
      // For simulation, we assume success and that the backend handles the redirect
      // and the callback will eventually update the user's status.
      // Here, we just simulate the frontend change.
      await simulateApiCall(); // Simulate time taken for OAuth flow
      setIsGoogleCalendarConnected(true);
      toast({ title: "Google Calendar Connected (Simulated)", description: "You can now manage bookings with Google Calendar." });
    } catch (error: any) {
      toast({ title: "Connection Error", description: error.message, variant: "destructive" });
    } finally {
      setIsConnectingGoogleCalendar(false);
    }
  };

  const handleGoogleCalendarDisconnect = async () => {
    setIsConnectingGoogleCalendar(true); // Use the same loading state
    try {
      // Call your backend to invalidate tokens/session
      const response = await fetch('/api/auth/google/disconnect');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to disconnect Google Calendar.');
      }
      await simulateApiCall();
      setIsGoogleCalendarConnected(false);
      toast({ title: "Google Calendar Disconnected (Simulated)", description: "Bookings will no longer sync with Google Calendar." });
    } catch (error: any) {
      toast({ title: "Disconnection Error", description: error.message, variant: "destructive" });
    } finally {
      setIsConnectingGoogleCalendar(false);
    }
  };


  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline">Service Management</h1>
          <p className="text-xl text-muted-foreground mt-2">
            Create, manage, and book your services seamlessly.
          </p>
        </div>
        <Button size="lg" className="mt-4 md:mt-0 bg-primary hover:bg-primary/90" onClick={handleCreateNewService}>
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Service
        </Button>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : services.length === 0 ? (
        <Card className="shadow-lg text-center">
            <CardHeader>
                <CardTitle>No Services Yet</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Click "Create New Service" to add your first service offering.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map(service => (
              <Card key={service.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
                  <CardHeader>
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2 pt-1">
                          <DollarSign className="h-4 w-4 text-green-600" /> ${service.price}
                          <span className="text-muted-foreground/50">|</span>
                          <CalendarPlus className="h-4 w-4 text-blue-600" /> {service.duration}
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast({ title: "Coming Soon!", description: "Viewing details will be here."})}><Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">View</span></Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditService(service)}><Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span></Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDeleteService(service)}><Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span></Button>
                  </CardFooter>
              </Card>
          ))}
        </div>
      )}
      
      <ServiceFormDialog 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        service={editingService}
        onSuccess={() => {
          fetchServices(); 
          setIsFormOpen(false); 
        }}
      />

      <AlertDialog open={!!serviceToDelete} onOpenChange={(open) => !open && setServiceToDelete(null)}>
          <AlertDialogContent>
              <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the service "{serviceToDelete?.name}".
              </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setServiceToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteService} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                  {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Delete
              </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>

      <Card className="shadow-xl mt-12">
        <CardHeader>
          <CardTitle className="text-2xl font-headline">Integrate Your Calendar</CardTitle>
          <CardDescription>Connect your calendar to manage bookings and availability effortlessly.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-8 p-8">
          <Image src="https://placehold.co/400x300.png" alt="Calendar Integration Illustration" width={400} height={300} className="rounded-lg" data-ai-hint="calendar schedule" />
          <div className="space-y-6 flex-1">
            <p className="text-muted-foreground">
              CreatorOS will soon allow you to link Google Calendar, Outlook Calendar, and other popular calendar apps. 
              This will enable automated booking confirmations, availability checks, and reminders for you and your clients.
            </p>
            <div className="space-y-3">
                {isGoogleCalendarConnected ? (
                    <div className="flex items-center justify-between p-3 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-500">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-700 dark:text-green-300">Google Calendar Connected</span>
                        </div>
                        <Button 
                            variant="outline" 
                            size="sm"
                            onClick={handleGoogleCalendarDisconnect}
                            disabled={isConnectingGoogleCalendar}
                        >
                            {isConnectingGoogleCalendar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Disconnect
                        </Button>
                    </div>
                ) : (
                    <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={handleGoogleCalendarConnect}
                        disabled={isConnectingGoogleCalendar}
                    >
                        {isConnectingGoogleCalendar ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LinkIcon className="mr-2 h-5 w-5 text-primary" />}
                        Connect Google Calendar
                    </Button>
                )}
                <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => toast({ title: "Coming Soon!", description: "Outlook Calendar integration is on the way."})}
                    disabled // Placeholder
                >
                  <LinkIcon className="mr-2 h-5 w-5 text-primary" /> Connect Outlook Calendar
                </Button>
                 <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => toast({ title: "Coming Soon!", description: "Apple Calendar integration is on the way."})}
                    disabled // Placeholder
                >
                  <LinkIcon className="mr-2 h-5 w-5 text-primary" /> Connect Apple Calendar
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

