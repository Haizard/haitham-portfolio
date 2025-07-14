
"use client";

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Edit3, Trash2, Loader2, Leaf } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { FoodType } from '@/lib/food-types-data';
import { FoodTypeFormDialog } from './food-type-form-dialog';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function FoodTypeManagement() {
  const [foodTypes, setFoodTypes] = useState<FoodType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFoodType, setEditingFoodType] = useState<FoodType | null>(null);
  const [foodTypeToDelete, setFoodTypeToDelete] = useState<FoodType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { toast } = useToast();

  const fetchFoodTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/food-types');
      if (!response.ok) throw new Error('Failed to fetch food types');
      const data: FoodType[] = await response.json();
      setFoodTypes(data);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Could not load food types.", variant: "destructive" });
      setFoodTypes([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFoodTypes();
  }, [fetchFoodTypes]);

  const handleCreateFoodType = () => {
    setEditingFoodType(null);
    setIsFormOpen(true);
  };

  const handleEditFoodType = (foodType: FoodType) => {
    setEditingFoodType(foodType);
    setIsFormOpen(true);
  };

  const confirmDeleteFoodType = (foodType: FoodType) => {
    setFoodTypeToDelete(foodType);
  };

  const handleDeleteFoodType = async () => {
    if (!foodTypeToDelete || !foodTypeToDelete.id) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/food-types/${foodTypeToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete food type`);
      }
      toast({ title: `Food Type Deleted`, description: `"${foodTypeToDelete.name}" has been removed.` });
      fetchFoodTypes(); 
    } catch (error: any) {
      toast({ title: "Error", description: error.message || `Could not delete food type.`, variant: "destructive" });
    } finally {
      setIsDeleting(false);
      setFoodTypeToDelete(null);
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
    <TooltipProvider>
      <Card className="shadow-xl mb-8">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl font-headline flex items-center"><Leaf className="mr-2 h-6 w-6 text-primary"/>Food Type List</CardTitle>
            <CardDescription>Manage all food types used for filtering restaurants and menus.</CardDescription>
          </div>
          <Button onClick={handleCreateFoodType} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
            <PlusCircle className="mr-2 h-5 w-5" /> Create New Food Type
          </Button>
        </CardHeader>
        <CardContent>
          {foodTypes.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No food types found. Get started by creating one!</p>
          ) : (
            <div className="border rounded-lg overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">Name</TableHead>
                    <TableHead className="min-w-[150px]">Slug</TableHead>
                    <TableHead className="min-w-[250px]">Description</TableHead>
                    <TableHead className="text-right min-w-[220px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {foodTypes.map(tag => (
                    <TableRow key={tag.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{tag.name}</TableCell>
                      <TableCell><code className="text-xs bg-muted/50 p-1 rounded">{tag.slug}</code></TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                        {tag.description && tag.description.length > 70 ? (
                            <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <span className="cursor-help">{tag.description.substring(0, 70)}...</span>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs text-xs p-2 bg-popover text-popover-foreground border rounded-md shadow-sm">
                                    {tag.description}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            tag.description || '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-1">
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button variant="outline" size="sm" onClick={() => handleEditFoodType(tag)}>
                                <Edit3 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Edit</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-1 bg-popover text-popover-foreground border rounded-md shadow-sm">Edit Food Type</TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={100}>
                            <TooltipTrigger asChild>
                                <Button variant="destructive" size="sm" onClick={() => confirmDeleteFoodType(tag)}>
                                <Trash2 className="mr-1 h-4 w-4" /> <span className="hidden sm:inline">Delete</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent className="text-xs p-1 bg-popover text-popover-foreground border rounded-md shadow-sm">Delete Food Type</TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <FoodTypeFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        foodType={editingFoodType}
        onSuccess={() => {
          fetchFoodTypes();
          setIsFormOpen(false);
          setEditingFoodType(null);
        }}
      />
      
      <AlertDialog open={!!foodTypeToDelete} onOpenChange={(open) => !open && setFoodTypeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the food type "<strong>{foodTypeToDelete?.name}</strong>".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFoodTypeToDelete(null)} disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteFoodType} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </TooltipProvider>
  );
}
