
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit3, Trash2, Loader2, PlusCircle, Plane, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TourPackage } from '@/lib/tours-data';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { TourFormDialog } from './tour-form-dialog';


const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function TourListManagement() {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);
  const [tourToDelete, setTourToDelete] = useState<TourPackage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchTours = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use "all=true" to signal we want both active and draft tours
      const response = await fetch('/api/tours?all=true');
      if (!response.ok) throw new Error('Failed to fetch tours');
      const data = await response.json();

      // The API returns { tours: [], filterOptions: {} }
      const tourList = Array.isArray(data.tours) ? data.tours : (Array.isArray(data) ? data : []);
      setTours(tourList);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setTours([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTours();
  }, [fetchTours]);

  const handleCreateTour = () => {
    setEditingTour(null);
    setIsFormOpen(true);
  };

  const handleEditTour = (tour: TourPackage) => {
    setEditingTour(tour);
    setIsFormOpen(true);
  };

  const confirmDeleteTour = (tour: TourPackage) => {
    setTourToDelete(tour);
  };

  const handleDeleteTour = async () => {
    if (!tourToDelete || !tourToDelete.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tours/${tourToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete tour');
      }
      toast({ title: "Tour Deleted", description: `"${tourToDelete.name}" has been removed.` });
      fetchTours();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setTourToDelete(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  return (
    <>
      <Card className="shadow-xl">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>All Tour Packages</CardTitle>
          <Button onClick={handleCreateTour}><PlusCircle className="mr-2 h-4 w-4" /> Create New Tour</Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.isArray(tours) && tours.map(tour => (
                  <TableRow key={tour.id}>
                    <TableCell className="font-medium">{tour.name}</TableCell>
                    <TableCell>{tour.duration}</TableCell>
                    <TableCell>{formatCurrency(tour.price)}</TableCell>
                    <TableCell>
                      <Badge variant={tour.isActive ? 'default' : 'secondary'} className={tour.isActive ? 'bg-success' : ''}>
                        {tour.isActive ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                        {tour.isActive ? 'Active' : 'Draft'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleEditTour(tour)}><Edit3 className="mr-1 h-4 w-4" /> Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDeleteTour(tour)}><Trash2 className="mr-1 h-4 w-4" /> Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      <TourFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tour={editingTour}
        onSuccess={fetchTours}
      />
      <AlertDialog open={!!tourToDelete} onOpenChange={setTourToDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently delete the tour package "{tourToDelete?.name}".</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTour} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
