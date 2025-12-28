"use client";

import { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Eye, PlusCircle, Trash2, Loader2, DollarSign, Clock, Briefcase } from "lucide-react";
import Link from 'next/link';
import { useToast } from "@/hooks/use-toast";
import type { Service } from '@/lib/services-data';
import { ServiceFormDialog } from '@/components/services/service-form-dialog';
import { useUser } from '@/hooks/use-user';
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

export default function MyServicesPage() {
  const { user } = useUser();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchServices = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/services?freelancerId=${user.id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch services. Status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setServices(data as Service[]);
      } else {
        console.error("API returned non-array data for services:", data);
        toast({
          title: "Data Error",
          description: "Received unexpected data format for your services.",
          variant: "destructive",
        });
        setServices([]);
      }
    } catch (error: any) {
      console.error("Error in fetchServices:", error);
      toast({
        title: "Error",
        description: error.message || "Could not load your services.",
        variant: "destructive",
      });
      setServices([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, toast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

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
    if (!serviceToDelete || !serviceToDelete.id) return;
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

  return (
    <div className="container mx-auto py-8">
      <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-headline flex items-center">
            <Briefcase className="mr-3 h-10 w-10 text-primary" />
            Manage My Services
          </h1>
          <p className="text-xl text-muted-foreground mt-2">
            Create, manage, and offer your unique services to clients.
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
            <CardTitle>You haven't created any services yet.</CardTitle>
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
                  <Clock className="h-4 w-4 text-blue-600" /> {service.duration}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-sm text-muted-foreground line-clamp-3">{service.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 border-t pt-4">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/our-services/${service.slug}`} target="_blank">
                    <Eye className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">View Public</span>
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditService(service)}>
                  <Edit3 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button variant="destructive" size="sm" onClick={() => confirmDeleteService(service)}>
                  <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Delete</span>
                </Button>
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

    </div>
  );
}
