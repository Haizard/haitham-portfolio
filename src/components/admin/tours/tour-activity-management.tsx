
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Loader2, MountainSnow } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { TourActivity } from '@/lib/tour-activities-data';
import { TourActivityFormDialog } from './tour-activity-form-dialog';
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

export function TourActivityManagement() {
  const [activities, setActivities] = useState<TourActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<TourActivity | null>(null);
  const [activityToDelete, setActivityToDelete] = useState<TourActivity | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tour-activities');
      if (!response.ok) throw new Error('Failed to fetch activities');
      const data: TourActivity[] = await response.json();
      setActivities(data);
    } catch (error: any) {
      toast({ title: "Error", description: "Could not load tour activities.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const handleCreate = () => {
    setEditingActivity(null);
    setIsFormOpen(true);
  };

  const handleEdit = (activity: TourActivity) => {
    setEditingActivity(activity);
    setIsFormOpen(true);
  };

  const confirmDelete = (activity: TourActivity) => {
    setActivityToDelete(activity);
  };

  const handleDelete = async () => {
    if (!activityToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/tour-activities/${activityToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete activity`);
      }
      toast({ title: `Activity Deleted`, description: `"${activityToDelete.name}" has been removed.` });
      fetchActivities(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setActivityToDelete(null);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><MountainSnow className="mr-2 h-6 w-6 text-primary"/>Activity List</CardTitle>
            <CardDescription>Manage all tour activities.</CardDescription>
          </div>
          <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Activity
          </Button>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities.map(activity => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.name}</TableCell>
                    <TableCell><code>{activity.slug}</code></TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(activity)}>
                        <Edit3 className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => confirmDelete(activity)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <TourActivityFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        activity={editingActivity}
        onSuccess={() => {
          fetchActivities();
          setIsFormOpen(false);
        }}
      />
      
      <AlertDialog open={!!activityToDelete} onOpenChange={setActivityToDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the activity "<strong>{activityToDelete?.name}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
